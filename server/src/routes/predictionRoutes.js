const express = require('express');
const router = express.Router();
const {
  createPrediction,
  getPredictionHistory,
  getPredictionById,
  deletePrediction,
} = require('../controllers/predictionController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createPrediction);
router.get('/history', optionalAuth, getPredictionHistory);
router.get('/:id', getPredictionById);
router.delete('/:id', protect, deletePrediction);

module.exports = router;
