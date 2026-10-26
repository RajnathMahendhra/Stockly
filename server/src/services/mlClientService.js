const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT = 30000; // 30s timeout for model training/inference

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: ML_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

class MLClientService {
  /**
   * Health check for ML Microservice
   */
  static async checkHealth() {
    try {
      const response = await mlClient.get('/health');
      return response.data;
    } catch (error) {
      console.warn(`[ML Service] Health check failed: ${error.message}`);
      return { status: 'unreachable', error: error.message };
    }
  }

  /**
   * List available ML models
   */
  static async listModels() {
    try {
      const response = await mlClient.get('/models');
      return response.data.models;
    } catch (error) {
      console.warn(`[ML Service] Error listing models: ${error.message}`);
      return [
        { id: 'naive_baseline', name: 'Naive Baseline', status: 'ready' },
        { id: 'linear_regression', name: 'Linear Regression', status: 'ready' },
        { id: 'random_forest', name: 'Random Forest', status: 'ready' },
        { id: 'xgboost', name: 'XGBoost', status: 'ready' },
        { id: 'lstm', name: 'LSTM Neural Network', status: 'ready' },
      ];
    }
  }

  /**
   * Get out-of-sample metrics for a model
   */
  static async getModelMetrics(modelName, symbol = 'AAPL') {
    try {
      const response = await mlClient.get(`/models/${modelName}/metrics`, {
        params: { symbol },
      });
      return response.data;
    } catch (error) {
      console.error(`[ML Service] Error getting metrics: ${error.message}`);
      throw new Error(error.response?.data?.detail || error.message);
    }
  }

  /**
   * Request multi-step future price forecast
   */
  static async predict(symbol, modelName = 'random_forest', horizon = 5) {
    try {
      const response = await mlClient.post('/predict', {
        symbol: symbol.toUpperCase(),
        model_name: modelName,
        horizon: parseInt(horizon, 10),
      });
      return response.data;
    } catch (error) {
      console.error(`[ML Service] Prediction failed: ${error.message}`);
      throw new Error(error.response?.data?.detail || error.message);
    }
  }

  /**
   * Trigger model training and holdout evaluation
   */
  static async train(symbol, period = '2y', testSize = 0.2, forceRetrain = false) {
    try {
      const response = await mlClient.post('/train', {
        symbol: symbol.toUpperCase(),
        period,
        test_size: testSize,
        force_retrain: forceRetrain,
      });
      return response.data;
    } catch (error) {
      console.error(`[ML Service] Training failed: ${error.message}`);
      throw new Error(error.response?.data?.detail || error.message);
    }
  }

  /**
   * Fetch historical bar data from ML microservice feed
   */
  static async fetchHistory(symbol, period = '1y') {
    try {
      const response = await mlClient.get(`/stocks/${symbol.toUpperCase()}/history`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      console.error(`[ML Service] Historical fetch failed: ${error.message}`);
      throw new Error(error.response?.data?.detail || error.message);
    }
  }
}

module.exports = MLClientService;
