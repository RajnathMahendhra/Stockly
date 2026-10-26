const MLClientService = require('../services/mlClientService');

// @desc    Get all available models
// @route   GET /api/models
// @access  Public
exports.getModels = async (req, res, next) => {
  try {
    const models = await MLClientService.listModels();
    res.status(200).json({ success: true, count: models.length, data: models });
  } catch (error) {
    next(error);
  }
};

// @desc    Get holdout metrics for a model
// @route   GET /api/models/:name/metrics
// @access  Public
exports.getModelMetrics = async (req, res, next) => {
  try {
    const { name } = req.params;
    const { symbol = 'AAPL' } = req.query;
    const metrics = await MLClientService.getModelMetrics(name, symbol);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger model retraining pipeline
// @route   POST /api/models/train
// @access  Public (or Admin)
exports.triggerTrain = async (req, res, next) => {
  try {
    const { symbol = 'AAPL', period = '2y', testSize = 0.2, forceRetrain = true } = req.body;
    const result = await MLClientService.train(symbol, period, testSize, forceRetrain);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
