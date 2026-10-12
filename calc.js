// calc.js
// Reusable financial calculation functions for MarginMetric

export function calculateTotals({ cost = 0, sell = 0, shipping = 0, qty = 1, gatewayPercent = 0.029, gatewayFixed = 0.3 } = {}) {
  qty = Math.max(1, Math.floor(qty || 1));
  const totalSell = sell * qty;
  const totalCost = cost * qty;
  const totalShipping = shipping * qty;

  const gatewayFeePerTransaction = (sell * gatewayPercent) + gatewayFixed;
  const totalGateway = gatewayFeePerTransaction * qty;

  const grossProfit = totalSell - totalCost;
  const netProfit = totalSell - totalCost - totalShipping - totalGateway;

  const marginPercent = totalSell > 0 ? (netProfit / totalSell) * 100 : 0;
  const markupPercent = totalCost > 0 ? ((sell - cost) / cost) * 100 : 0;
  const netPerUnit = netProfit / qty;

  return {
    qty,
    sell,
    cost,
    shipping,
    totalSell,
    totalCost,
    totalShipping,
    gatewayFeePerTransaction,
    totalGateway,
    grossProfit,
    netProfit,
    marginPercent,
    markupPercent,
    netPerUnit
  };
}
