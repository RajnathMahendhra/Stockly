const mongoose = require('mongoose');

const forecastPointSchema = new mongoose.Schema(
  {
    step: { type: Number, required: true },
    date: { type: String, required: true },
    predictedClose: { type: Number, required: true },
    lowerBound: { type: Number, required: true },
    upperBound: { type: Number, required: true },
    observedClose: { type: Number, default: null }, // filled later when actual market data arrives
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    modelName: {
      type: String,
      required: true,
      enum: ['naive_baseline', 'linear_regression', 'random_forest', 'xgboost', 'lstm'],
      default: 'random_forest',
    },
    modelDisplayName: {
      type: String,
      default: 'Random Forest Regressor',
    },
    modelVersion: {
      type: String,
      default: '1.2.0-prod',
    },
    forecastOriginDate: {
      type: String,
      required: true,
    },
    originClose: {
      type: Number,
      required: true,
    },
    horizon: {
      type: Number,
      required: true,
      enum: [1, 5, 20],
      default: 5,
    },
    forecasts: [forecastPointSchema],
    metrics: {
      mae: { type: Number, default: 0.0 },
      rmse: { type: Number, default: 0.0 },
      directionalAccuracy: { type: Number, default: 50.0 },
      mape: { type: Number, default: 0.0 },
      r2: { type: Number, default: 0.0 },
      sampleCount: { type: Number, default: 0 },
      testStart: { type: String, default: '' },
      testEnd: { type: String, default: '' },
    },
    featureImportance: [
      {
        feature: String,
        importance: Number,
        percentage: Number,
      },
    ],
    explanation: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'verified'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Prediction', predictionSchema);
