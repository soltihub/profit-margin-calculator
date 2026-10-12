import assert from 'assert/strict';
import { calculateTotals } from '../calc.js';

function approxEqual(a, b, eps = 1e-6) {
  return Math.abs(a - b) < eps;
}

function run() {
  // Test 1: simple known values
  const t1 = calculateTotals({ cost:10, sell:20, shipping:3, qty:1, gatewayPercent:0.029, gatewayFixed:0.3 });
  // expected values computed by hand
  assert.ok(approxEqual(t1.totalSell, 20));
  assert.ok(approxEqual(t1.totalCost, 10));
  assert.ok(approxEqual(t1.grossProfit, 10));
  // gateway: 20*0.029 + 0.3 = 0.58 + 0.3 = 0.88
  assert.ok(approxEqual(t1.gatewayFeePerTransaction, 0.58 + 0.3));
  assert.ok(approxEqual(t1.totalGateway, 0.88));
  // net: 20 - 10 - 3 - 0.88 = 6.12
  assert.ok(approxEqual(t1.netProfit, 6.12));
  assert.ok(approxEqual(t1.marginPercent, (6.12/20)*100));
  assert.ok(approxEqual(t1.markupPercent, 100));

  // Test 2: quantity >1
  const t2 = calculateTotals({ cost:5, sell:8, shipping:2, qty:3, gatewayPercent:0.03, gatewayFixed:0.25 });
  // basic checks
  assert.ok(t2.qty === 3);
  assert.ok(approxEqual(t2.totalSell, 24));
  assert.ok(approxEqual(t2.totalCost, 15));

  // edge cases
  const t3 = calculateTotals({ cost:0, sell:0, shipping:0, qty:1 });
  assert.ok(approxEqual(t3.grossProfit, 0));
  assert.ok(approxEqual(t3.netProfit, 0));

  console.log('All tests passed');
}

run();
