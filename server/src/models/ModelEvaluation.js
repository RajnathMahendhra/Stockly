const mongoose = require('mongoose');

const modelEvaluationSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    modelVersion: {
      type: String,
      default: '1.2.0-prod',
    },
    trainRange: {
      start: String,
      end: String,
    },
    testRange: {
      start: String,
      end: String,
    },
    metrics: {
      mae: Number,
      rmse: Number,
      directionalAccuracy: Number,
      mape: Number,
      r2: Number,
    },
    sampleCount: {
      train: Number,
      test: Number,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

modelEvaluationSchema.index({ modelName: 1, symbol: 1, evaluatedAt: -1 });

module.exports = mongoose.model('ModelEvaluation', modelEvaluationSchema);
