const MarketDataService = require('../services/marketDataService');

// @desc    Search securities
// @route   GET /api/stocks/search
// @access  Public
exports.searchStocks = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = MarketDataService.search(q);
    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock profile details
// @route   GET /api/stocks/:symbol
// @access  Public
exports.getStockProfile = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const stock = await MarketDataService.getStock(symbol);
    res.status(200).json({ success: true, data: stock });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical OHLCV series
// @route   GET /api/stocks/:symbol/history
// @access  Public
exports.getStockHistory = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period = '1y' } = req.query;
    const data = await MarketDataService.getHistory(symbol, period);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get calculated technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
// @route   GET /api/stocks/:symbol/indicators
// @access  Public
exports.getStockIndicators = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period = '6mo' } = req.query;
    const historyData = await MarketDataService.getHistory(symbol, period);

    const indicators = MarketDataService.computeTechnicalIndicators(historyData.history);

    res.status(200).json({
      success: true,
      symbol: symbol.toUpperCase(),
      period,
      count: indicators.length,
      data: indicators,
    });
  } catch (error) {
    next(error);
  }
};
