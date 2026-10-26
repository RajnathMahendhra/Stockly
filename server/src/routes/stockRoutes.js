const express = require('express');
const router = express.Router();
const {
  searchStocks,
  getStockProfile,
  getStockHistory,
  getStockIndicators,
} = require('../controllers/stockController');

router.get('/search', searchStocks);
router.get('/:symbol', getStockProfile);
router.get('/:symbol/history', getStockHistory);
router.get('/:symbol/indicators', getStockIndicators);

module.exports = router;
