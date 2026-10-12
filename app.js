import { calculateTotals } from './calc.js';

const $ = id => document.getElementById(id);
const storageKey = 'marginMetricInputs_v1';

const defaultRates = { USD: 1, EUR: 0.92, GBP: 0.79 };
let exchangeRates = { ...defaultRates };
let lastRatesUpdate = null;

function formatCurrency(value, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch (e) {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function parseFloatOrZero(el) {
  if (!el) return 0;
  const v = parseFloat(el.value);
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

function loadStoredInputs() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const obj = JSON.parse(raw);
    ['costPrice','sellingPrice','shipping','quantity','gatewayPercent','gatewayFixed','currency'].forEach(k => {
      if (obj[k] !== undefined && $(k)) $(k).value = obj[k];
    });
  } catch (e) {
    // ignore
  }
}

function saveInputs() {
  const obj = {};
  ['costPrice','sellingPrice','shipping','quantity','gatewayPercent','gatewayFixed','currency'].forEach(k => {
    const el = $(k);
    if (!el) return;
    obj[k] = el.value;
  });
  try { localStorage.setItem(storageKey, JSON.stringify(obj)); } catch (e) {}
}

async function fetchLiveRates() {
  const info = $('ratesInfo');
  if (info) info.textContent = 'Fetching live rates...';
  try {
    const resp = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=USD,EUR,GBP');
    if (!resp.ok) throw new Error('Network response not ok');
    const j = await resp.json();
    exchangeRates = { USD: 1, EUR: j.rates.EUR, GBP: j.rates.GBP };
    lastRatesUpdate = new Date().toISOString();
    if (info) info.textContent = `Live rates loaded (base USD) — updated ${new Date(lastRatesUpdate).toLocaleString()}`;
    calculate();
  } catch (e) {
    exchangeRates = { ...defaultRates };
    if (info) info.textContent = 'Failed to fetch live rates — using built-in rates';
    calculate();
  }
}

function calculate() {
  const cost = parseFloatOrZero($('costPrice'));
  const sell = parseFloatOrZero($('sellingPrice'));
  const shipping = parseFloatOrZero($('shipping'));
  const qtyVal = parseFloatOrZero($('quantity'));
  const qty = Math.max(1, Math.floor(qtyVal || 1));
  const gatewayPercent = parseFloatOrZero($('gatewayPercent')) / 100;
  const gatewayFixed = parseFloatOrZero($('gatewayFixed'));
  const currencyEl = $('currency');
  const currency = (currencyEl && currencyEl.value) ? currencyEl.value : 'USD';

  // Convert values from base (assume USD inputs) to selected currency for display
  const rate = exchangeRates[currency] || 1;

  // Use the calculation function (operate in base currency USD then convert outputs)
  const out = calculateTotals({ cost, sell, shipping, qty, gatewayPercent, gatewayFixed });

  // Convert monetary outputs for display
  const grossProfitEl = $('grossProfit');
  const gatewayFeeEl = $('gatewayFee');
  const netProfitEl = $('netProfit');
  const marginPercentEl = $('marginPercent');
  const markupPercentEl = $('markupPercent');
  const netPerUnitEl = $('netPerUnit');

  if (grossProfitEl) grossProfitEl.textContent = formatCurrency(out.grossProfit * rate, currency);
  if (gatewayFeeEl) gatewayFeeEl.textContent = formatCurrency(out.totalGateway * rate, currency);
  if (netProfitEl) netProfitEl.textContent = formatCurrency(out.netProfit * rate, currency);
  if (marginPercentEl) marginPercentEl.textContent = out.marginPercent.toFixed(2) + ' %';
  if (markupPercentEl) markupPercentEl.textContent = out.markupPercent.toFixed(2) + ' %';
  if (netPerUnitEl) netPerUnitEl.textContent = formatCurrency(out.netPerUnit * rate, currency);

  // save inputs
  saveInputs();

  // keep last summary available
  window.__marginMetricSummary = { ...out, currency, rate };
}

function copySummary() {
  const s = window.__marginMetricSummary;
  if (!s) return;
  const lines = [];
  lines.push(`MarginMetric summary (${s.currency})`);
  lines.push(`Quantity: ${s.qty}`);
  lines.push(`Selling price (per unit): ${s.currency} ${s.sell.toFixed(2)}`);
  lines.push(`Cost price (per unit): ${s.currency} ${s.cost.toFixed(2)}`);
  lines.push(`Shipping (total): ${s.currency} ${(s.shipping * s.qty).toFixed(2)}`);
  lines.push(`Gateway fees (total): ${s.currency} ${s.totalGateway.toFixed(2)} (${(s.gatewayPercent*100).toFixed(2)}% + ${s.gatewayFixed.toFixed(2)} per tx)`);
  lines.push(`Gross profit: ${s.currency} ${s.grossProfit.toFixed(2)}`);
  lines.push(`Net profit: ${s.currency} ${s.netProfit.toFixed(2)}`);
  lines.push(`Net per unit: ${s.currency} ${s.netPerUnit.toFixed(2)}`);
  lines.push(`Margin: ${s.marginPercent.toFixed(2)}%`);
  lines.push(`Markup: ${s.markupPercent.toFixed(2)}%`);
  lines.push('---');
  lines.push('Note: numeric inputs are interpreted as base USD amounts; displayed values are converted using current exchange rates.');

  const text = lines.join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => flashButton('Copied!')).catch(() => flashButton('Copy failed'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); flashButton('Copied!'); } catch (e) { flashButton('Copy failed'); }
    ta.remove();
  }
}

function flashButton(msg) {
  const btn = $('copyBtn');
  if (!btn) return;
  const orig = btn.textContent;
  btn.textContent = msg;
  btn.disabled = true;
  setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
}

// Wire up
function init() {
  loadStoredInputs();

  const elementIds = ['costPrice','sellingPrice','shipping','quantity','gatewayPercent','gatewayFixed','currency'];
  const eventTypes = ['input', 'change', 'keyup', 'paste'];

  elementIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    eventTypes.forEach(eventType => {
      el.addEventListener(eventType, calculate);
    });
  });

  const copyBtn = $('copyBtn');
  if (copyBtn) copyBtn.addEventListener('click', copySummary);

  const fetchRatesBtn = $('fetchRates');
  if (fetchRatesBtn) fetchRatesBtn.addEventListener('click', fetchLiveRates);

  // initial calculation
  calculate();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
