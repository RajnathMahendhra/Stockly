const Stock = require('../models/Stock');
const HistoricalPrice = require('../models/HistoricalPrice');
const MLClientService = require('./mlClientService');

// Stock Catalog with US and Indian NSE/BSE securities
const CURATED_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', currency: 'USD', sector: 'Technology', country: 'USA' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', currency: 'USD', sector: 'Technology', country: 'USA' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', currency: 'USD', sector: 'Technology', country: 'USA' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', currency: 'USD', sector: 'Semiconductors', country: 'USA' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', currency: 'USD', sector: 'Automotive', country: 'USA' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', currency: 'USD', sector: 'Consumer Cyclical', country: 'USA' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', currency: 'USD', sector: 'Communication Services', country: 'USA' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', exchange: 'NSE', currency: 'INR', sector: 'Energy & Retail', country: 'India' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', currency: 'INR', sector: 'IT Services', country: 'India' },
  { symbol: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE', currency: 'INR', sector: 'IT Services', country: 'India' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE', currency: 'INR', sector: 'Banking', country: 'India' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', exchange: 'NSE', currency: 'INR', sector: 'Banking', country: 'India' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', exchange: 'NSE', currency: 'INR', sector: 'Automotive', country: 'India' },
];

class MarketDataService {
  /**
   * Search stock catalog
   */
  static search(query) {
    if (!query) return CURATED_STOCKS.slice(0, 8);
    const q = query.toUpperCase().trim();
    return CURATED_STOCKS.filter(
      (s) => s.symbol.includes(q) || s.name.toUpperCase().includes(q)
    );
  }

  /**
   * Get or initialize stock record in MongoDB
   */
  static async getStock(symbol) {
    const sym = symbol.toUpperCase().trim();
    let stock = await Stock.findOne({ symbol: sym });

    if (!stock) {
      const match = CURATED_STOCKS.find((s) => s.symbol === sym) || {
        symbol: sym,
        name: `${sym} Corporation`,
        exchange: sym.endsWith('.NS') ? 'NSE' : sym.endsWith('.BO') ? 'BSE' : 'NASDAQ',
        currency: sym.endsWith('.NS') || sym.endsWith('.BO') ? 'INR' : 'USD',
        sector: 'Equities',
        country: sym.endsWith('.NS') || sym.endsWith('.BO') ? 'India' : 'USA',
      };

      stock = await Stock.create({
        symbol: match.symbol,
        name: match.name,
        exchange: match.exchange,
        currency: match.currency,
        sector: match.sector,
        country: match.country,
      });
    }

    return stock;
  }

  /**
   * Fetch historical bars from MongoDB cache or ML service feed
   */
  static async getHistory(symbol, period = '1y') {
    const sym = symbol.toUpperCase().trim();
    const normPeriod = period.toLowerCase() === '1m' ? '1mo' : period;
    const stock = await this.getStock(sym);

    // Call ML service data feed to get normalized and cleaned OHLCV data
    let data;
    try {
      data = await MLClientService.fetchHistory(sym, normPeriod);
    } catch (error) {
      console.warn(`[MarketDataService] ML service fetch failed, querying MongoDB cache: ${error.message}`);
      // Fallback: Query MongoDB HistoricalPrice collection
      const dbBars = await HistoricalPrice.find({ symbol: sym })
        .sort({ date: 1 })
        .limit(250);

      if (dbBars.length > 0) {
        return {
          symbol: sym,
          profile: stock,
          period,
          latest: {
            close: dbBars[dbBars.length - 1].close,
            date: dbBars[dbBars.length - 1].date,
            change: 0.0,
            changePct: 0.0,
          },
          history: dbBars,
        };
      }
      throw error;
    }

    // Persist latest bars to MongoDB HistoricalPrice collection (asynchronously in background)
    if (data && data.history && data.history.length > 0) {
      this.syncBarsToMongo(sym, data.history).catch((e) =>
        console.warn(`[MarketDataService] Mongo sync error: ${e.message}`)
      );

      // Update Stock metadata with latest price
      if (data.latest) {
        await Stock.updateOne(
          { symbol: sym },
          {
            lastPrice: data.latest.close,
            change: data.latest.change,
            changePct: data.latest.change_pct,
            lastRefreshed: new Date(),
          }
        );
      }
    }

    return data;
  }

  /**
   * Synchronize historical bars into MongoDB with upsert
   */
  static async syncBarsToMongo(symbol, bars) {
    const operations = bars.map((bar) => ({
      updateOne: {
        filter: { symbol, date: bar.date },
        update: {
          $set: {
            symbol,
            date: bar.date,
            open: bar.open,
            high: bar.high,
            low: bar.low,
            close: bar.close,
            adjClose: bar.adj_close || bar.close,
            volume: bar.volume,
            dataSource: 'Yahoo Finance & ML Cache',
          },
        },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await HistoricalPrice.bulkWrite(operations, { ordered: false });
    }
  }

  /**
   * Compute comprehensive technical indicators from raw historical bars
   */
  static computeTechnicalIndicators(historyBars) {
    if (!historyBars || historyBars.length < 5) {
      return [];
    }

    const closes = historyBars.map((b) => b.close);
    const n = closes.length;

    // Helper functions
    const calcSMA = (period, idx) => {
      if (idx < period - 1) return null;
      let sum = 0;
      for (let i = 0; i < period; i++) sum += closes[idx - i];
      return round(sum / period, 2);
    };

    const calcEMA = (period, prevEMA, close) => {
      if (prevEMA === null) return close;
      const k = 2 / (period + 1);
      return close * k + prevEMA * (1 - k);
    };

    // Calculate EMA series
    const ema12 = [];
    const ema26 = [];
    const ema20 = [];
    const ema50 = [];

    let pEMA12 = null;
    let pEMA26 = null;
    let pEMA20 = null;
    let pEMA50 = null;

    for (let i = 0; i < n; i++) {
      pEMA12 = calcEMA(12, pEMA12, closes[i]);
      pEMA26 = calcEMA(26, pEMA26, closes[i]);
      pEMA20 = calcEMA(20, pEMA20, closes[i]);
      pEMA50 = calcEMA(50, pEMA50, closes[i]);

      ema12.push(pEMA12);
      ema26.push(pEMA26);
      ema20.push(round(pEMA20, 2));
      ema50.push(round(pEMA50, 2));
    }

    // MACD Line & Signal
    const macdLine = [];
    for (let i = 0; i < n; i++) {
      macdLine.push(ema12[i] - ema26[i]);
    }
    const macdSignal = [];
    let pSignal = null;
    for (let i = 0; i < n; i++) {
      pSignal = calcEMA(9, pSignal, macdLine[i]);
      macdSignal.push(pSignal);
    }

    // RSI (14 period)
    const rsi = [];
    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 0; i < n; i++) {
      if (i < 14) {
        rsi.push(50.0);
        continue;
      }
      if (i === 14) {
        let gainSum = 0;
        let lossSum = 0;
        for (let j = 1; j <= 14; j++) {
          const diff = closes[j] - closes[j - 1];
          if (diff >= 0) gainSum += diff;
          else lossSum -= diff;
        }
        avgGain = gainSum / 14;
        avgLoss = lossSum / 14;
      } else {
        const diff = closes[i] - closes[i - 1];
        const gain = diff > 0 ? diff : 0;
        const loss = diff < 0 ? -diff : 0;
        avgGain = (avgGain * 13 + gain) / 14;
        avgLoss = (avgLoss * 13 + loss) / 14;
      }
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsiVal = 100 - 100 / (1 + rs);
      rsi.push(round(rsiVal, 2));
    }

    // Bollinger Bands (20 period, 2 std dev)
    const bbUpper = [];
    const bbLower = [];
    const bbMiddle = [];
    for (let i = 0; i < n; i++) {
      const sma = calcSMA(20, i);
      bbMiddle.push(sma);
      if (sma === null) {
        bbUpper.push(null);
        bbLower.push(null);
        continue;
      }
      let varianceSum = 0;
      for (let j = 0; j < 20; j++) {
        varianceSum += Math.pow(closes[i - j] - sma, 2);
      }
      const stdDev = Math.sqrt(varianceSum / 20);
      bbUpper.push(round(sma + 2 * stdDev, 2));
      bbLower.push(round(sma - 2 * stdDev, 2));
    }

    // Assemble unified indicator dataset
    return historyBars.map((bar, i) => ({
      date: bar.date,
      close: bar.close,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      volume: bar.volume,
      sma20: calcSMA(20, i),
      sma50: calcSMA(50, i),
      ema20: ema20[i],
      ema50: ema50[i],
      rsi14: rsi[i],
      macd: round(macdLine[i], 3),
      macdSignal: round(macdSignal[i], 3),
      macdHist: round(macdLine[i] - macdSignal[i], 3),
      bbUpper: bbUpper[i],
      bbMiddle: bbMiddle[i],
      bbLower: bbLower[i],
    }));
  }
}

function round(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return null;
  return Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);
}

module.exports = MarketDataService;
