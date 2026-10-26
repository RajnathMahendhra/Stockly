const mongoose = require('mongoose');

const historicalPriceSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    adjClose: {
      type: Number,
    },
    volume: {
      type: Number,
      default: 0,
    },
    dataSource: {
      type: String,
      default: 'Yahoo Finance Feed',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee unique bar per symbol and date
historicalPriceSchema.index({ symbol: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HistoricalPrice', historicalPriceSchema);
