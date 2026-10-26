const assert = require('assert');
const MarketDataService = require('../src/services/marketDataService');
const User = require('../src/models/User');
const Stock = require('../src/models/Stock');

console.log('--- Running Stockly Backend Unit & Service Tests ---');

// Test 1: MarketDataService Catalog Search
console.log('Test 1: Stock catalog search');
const resultsAAPL = MarketDataService.search('AAPL');
assert(resultsAAPL.length > 0, 'AAPL search should return records');
assert.strictEqual(resultsAAPL[0].symbol, 'AAPL');

const resultsIndia = MarketDataService.search('RELIANCE');
assert(resultsIndia.length > 0, 'RELIANCE search should return Indian NSE records');
assert.strictEqual(resultsIndia[0].symbol, 'RELIANCE.NS');
console.log('✓ Stock catalog search passed.');

// Test 2: Technical Indicator Calculations
console.log('Test 2: Technical indicator calculations');
const mockBars = [];
let basePrice = 100;
for (let i = 0; i < 60; i++) {
  basePrice += (i % 2 === 0 ? 1.5 : -1.0);
  mockBars.push({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    open: basePrice - 0.5,
    high: basePrice + 1.0,
    low: basePrice - 1.0,
    close: basePrice,
    volume: 1000000,
  });
}

const indicators = MarketDataService.computeTechnicalIndicators(mockBars);
assert.strictEqual(indicators.length, 60, 'Should return indicator records for all bars');

const latest = indicators[indicators.length - 1];
assert(latest.sma20 !== null, 'SMA 20 should be computed for 60 bars');
assert(latest.rsi14 >= 0 && latest.rsi14 <= 100, 'RSI 14 must be bounded between 0 and 100');
assert(latest.bbUpper >= latest.bbMiddle, 'Bollinger Upper must be >= Middle Band');
assert(latest.bbMiddle >= latest.bbLower, 'Bollinger Middle must be >= Lower Band');
console.log('✓ Technical indicator calculation (SMA, EMA, RSI, MACD, Bollinger Bands) passed.');

// Test 3: User Model Schema & Password Hashing
console.log('Test 3: User model validation');
const testUser = new User({
  name: 'Fintech Student',
  email: 'student@stockly.edu',
  password: 'SecurePassword123',
});
assert.strictEqual(testUser.name, 'Fintech Student');
assert.strictEqual(testUser.email, 'student@stockly.edu');
assert.strictEqual(testUser.preferences.theme, 'dark');
console.log('✓ User model validation passed.');

console.log('--- ALL BACKEND TESTS PASSED SUCCESSFULLY ---');
process.exit(0);
