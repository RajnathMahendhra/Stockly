const Prediction = require('../models/Prediction');
const MLClientService = require('../services/mlClientService');

// @desc    Generate and save a price prediction
// @route   POST /api/predictions
// @access  Public (Optionally authenticated to save to user history)
exports.createPrediction = async (req, res, next) => {
  try {
    const { symbol = 'AAPL', modelName = 'random_forest', horizon = 5, save = true } = req.body;

    const sym = symbol.toUpperCase().trim();
    const horizonInt = parseInt(horizon, 10);

    if (![1, 5, 20].includes(horizonInt)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid forecast horizon. Allowed horizons are 1, 5, or 20 trading days.',
      });
    }

    // Call ML Microservice
    const mlResponse = await MLClientService.predict(sym, modelName, horizonInt);

    let savedRecord = null;
    if (save) {
      savedRecord = await Prediction.create({
        user: req.user ? req.user._id : null,
        symbol: mlResponse.symbol,
        companyName: mlResponse.company_name,
        modelName: mlResponse.model_name,
        modelDisplayName: mlResponse.model_display_name,
        modelVersion: mlResponse.model_version,
        forecastOriginDate: mlResponse.forecast_origin_date,
        originClose: mlResponse.origin_close,
        horizon: mlResponse.horizon_days,
        forecasts: mlResponse.forecasts.map((f) => ({
          step: f.step,
          date: f.date,
          predictedClose: f.predicted_close,
          lowerBound: f.lower_bound,
          upperBound: f.upper_bound,
        })),
        metrics: {
          mae: mlResponse.metrics.mae,
          rmse: mlResponse.metrics.rmse,
          directionalAccuracy: mlResponse.metrics.directional_accuracy,
          mape: mlResponse.metrics.mape,
          r2: mlResponse.metrics.r2,
          sampleCount: mlResponse.metrics.sample_count,
          testStart: mlResponse.metrics.test_start,
          testEnd: mlResponse.metrics.test_end,
        },
        featureImportance: mlResponse.feature_importance,
        explanation: mlResponse.explanation,
        status: 'completed',
      });
    }

    res.status(201).json({
      success: true,
      predictionId: savedRecord ? savedRecord._id : null,
      data: mlResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prediction history
// @route   GET /api/predictions/history
// @access  Public (Optionally filters to current user if logged in)
exports.getPredictionHistory = async (req, res, next) => {
  try {
    const query = {};
    if (req.user) {
      query.$or = [{ user: req.user._id }, { user: null }];
    }
    if (req.query.symbol) {
      query.symbol = req.query.symbol.toUpperCase();
    }

    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single prediction by ID
// @route   GET /api/predictions/:id
// @access  Public
exports.getPredictionById = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }
    res.status(200).json({ success: true, data: prediction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a prediction record
// @route   DELETE /api/predictions/:id
// @access  Private
exports.deletePrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id);
    if (!prediction) {
      return res.status(404).json({ success: false, error: 'Prediction not found' });
    }

    if (prediction.user && prediction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this prediction' });
    }

    await prediction.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
