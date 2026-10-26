const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    exchange: {
      type: String,
      required: true,
      enum: ['NASDAQ', 'NYSE', 'NSE', 'BSE', 'INDEX', 'GLOBAL'],
      default: 'NASDAQ',
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    sector: {
      type: String,
      default: 'General',
    },
    country: {
      type: String,
      default: 'USA',
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    lastPrice: {
      type: Number,
      default: 0.0,
    },
    change: {
      type: Number,
      default: 0.0,
    },
    changePct: {
      type: Number,
      default: 0.0,
    },
    lastRefreshed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Stock', stockSchema);
