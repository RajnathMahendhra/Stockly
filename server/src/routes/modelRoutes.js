const express = require('express');
const router = express.Router();
const {
  getModels,
  getModelMetrics,
  triggerTrain,
} = require('../controllers/modelController');

router.get('/', getModels);
router.get('/:name/metrics', getModelMetrics);
router.post('/train', triggerTrain);

module.exports = router;
