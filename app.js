// MarginMetric calculator logic
(function(){
  const $ = id => document.getElementById(id);

  const inputs = [
    'costPrice', 'sellingPrice', 'shipping', 'quantity',
    'gatewayPercent', 'gatewayFixed', 'currency'
  ].map(id => $(id));

  const formatCurrency = (value, currency = 'USD') => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
    } catch (e) {
      return value.toFixed(2);
    }
  };

  function parseFloatOrZero(el) {
    const v = parseFloat(el.value);
    return Number.isFinite(v) ? v : 0;
  }

  function calculate() {
    const cost = parseFloatOrZero($('costPrice'));
    const sell = parseFloatOrZero($('sellingPrice'));
    const shipping = parseFloatOrZero($('shipping'));
    const qty = Math.max(1, Math.floor(parseFloatOrZero($('quantity')) || 1));
    const gatewayPercent = parseFloatOrZero($('gatewayPercent')) / 100;
    const gatewayFixed = parseFloatOrZero($('gatewayFixed'));
    const currency = $('currency').value || 'USD';

    // Totals based on quantity
    const totalSell = sell * qty;
    const totalCost = cost * qty;
    const totalShipping = shipping * qty;

    // Gateway fees are usually percent of the transaction amount plus fixed fee per transaction
    const gatewayFeePerTransaction = (sell * gatewayPercent) + gatewayFixed;
    const totalGateway = gatewayFeePerTransaction * qty;

    const grossProfit = totalSell - totalCost; // before shipping & fees
    const netProfit = totalSell - totalCost - totalShipping - totalGateway;

    const marginPercent = totalSell > 0 ? (netProfit / totalSell) * 100 : 0;
    const markupPercent = cost > 0 ? ((sell - cost) / cost) * 100 : 0;
    const netPerUnit = netProfit / qty;

    // Update UI
    $('grossProfit').textContent = formatCurrency(grossProfit, currency);
    $('gatewayFee').textContent = formatCurrency(totalGateway, currency);
    $('netProfit').textContent = formatCurrency(netProfit, currency);
    $('marginPercent').textContent = marginPercent.toFixed(2) + ' %';
    $('markupPercent').textContent = markupPercent.toFixed(2) + ' %';
    $('netPerUnit').textContent = formatCurrency(netPerUnit, currency);

    // Store last summary for copy
    window.__marginMetricSummary = {
      cost, sell, shipping, qty, gatewayPercent: gatewayPercent * 100, gatewayFixed, currency,
      grossProfit, totalGateway, netProfit, marginPercent, markupPercent, netPerUnit
    };
  }

  function copySummary() {
    const s = window.__marginMetricSummary;
    if (!s) return;
    const lines = [];
    lines.push(`MarginMetric summary (${s.currency})`);
    lines.push(`Quantity: ${s.qty}`);
    lines.push(`Selling price: ${s.currency} ${s.sell.toFixed(2)}`);
    lines.push(`Cost price: ${s.currency} ${s.cost.toFixed(2)}`);
    lines.push(`Shipping (total): ${s.currency} ${(s.shipping * s.qty).toFixed(2)}`);
    lines.push(`Gateway fees (total): ${s.currency} ${s.totalGateway.toFixed(2)} (${s.gatewayPercent.toFixed(2)}% + ${s.gatewayFixed.toFixed(2)} per tx)`);
    lines.push(`Gross profit: ${s.currency} ${s.grossProfit.toFixed(2)}`);
    lines.push(`Net profit: ${s.currency} ${s.netProfit.toFixed(2)}`);
    lines.push(`Net per unit: ${s.currency} ${s.netPerUnit.toFixed(2)}`);
    lines.push(`Margin: ${s.marginPercent.toFixed(2)}%`);
    lines.push(`Markup: ${s.markupPercent.toFixed(2)}%`);

    const text = lines.join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        flashButton('Copied!');
      }).catch(() => {
        flashButton('Copy failed');
      });
    } else {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        flashButton('Copied!');
      } catch (e) {
        flashButton('Copy failed');
      }
      ta.remove();
    }
  }

  function flashButton(msg) {
    const btn = $('copyBtn');
    const orig = btn.textContent;
    btn.textContent = msg;
    btn.disabled = true;
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // attach listeners
    const elements = ['costPrice','sellingPrice','shipping','quantity','gatewayPercent','gatewayFixed','currency'];
    elements.forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', calculate);
      el.addEventListener('change', calculate);
    });

    $('copyBtn').addEventListener('click', copySummary);

    // initial calculation
    calculate();
  });
})();
