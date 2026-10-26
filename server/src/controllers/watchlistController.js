const Watchlist = require('../models/Watchlist');
const MarketDataService = require('../services/marketDataService');

// @desc    Get user's watchlist with latest prices
// @route   GET /api/watchlist
// @access  Private
exports.getWatchlist = async (req, res, next) => {
  try {
    const items = await Watchlist.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Enrich each stock with latest price metadata
    const enriched = await Promise.all(
      items.map(async (item) => {
        try {
          const stock = await MarketDataService.getStock(item.symbol);
          return {
            _id: item._id,
            symbol: item.symbol,
            notes: item.notes,
            addedAt: item.createdAt,
            name: stock.name,
            exchange: stock.exchange,
            currency: stock.currency,
            price: stock.lastPrice || 0.0,
            change: stock.change || 0.0,
            changePct: stock.changePct || 0.0,
          };
        } catch (e) {
          return {
            _id: item._id,
            symbol: item.symbol,
            notes: item.notes,
            addedAt: item.createdAt,
            name: item.symbol,
            price: 0,
            change: 0,
            changePct: 0,
          };
        }
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Add symbol to watchlist
// @route   POST /api/watchlist
// @access  Private
exports.addToWatchlist = async (req, res, next) => {
  try {
    const { symbol, notes = '' } = req.body;
    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Stock symbol is required' });
    }

    const sym = symbol.toUpperCase().trim();

    // Check if already in watchlist
    const existing = await Watchlist.findOne({ user: req.user._id, symbol: sym });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `${sym} is already in your watchlist.`,
      });
    }

    const item = await Watchlist.create({
      user: req.user._id,
      symbol: sym,
      notes,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove symbol from watchlist
// @route   DELETE /api/watchlist/:symbol
// @access  Private
exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const sym = req.params.symbol.toUpperCase().trim();
    const result = await Watchlist.findOneAndDelete({
      user: req.user._id,
      symbol: sym,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: `${sym} was not found in your watchlist.`,
      });
    }

    res.status(200).json({ success: true, message: `${sym} removed from watchlist.` });
  } catch (error) {
    next(error);
  }
};
