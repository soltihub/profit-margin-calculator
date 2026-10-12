# MarginMetric — E-Commerce Profit & Margin Calculator

A lightweight, mobile-first profit & margin calculator for e-commerce sellers. This repository now contains a working browser app, formula unit tests, live/exchange-rate helpers, and localStorage persistence.

## What I added

- Mobile-first responsive UI (Tailwind CSS CDN)
- Separate `calc.js` module with the financial formulas
- `app.js` (ES module) that wires the UI to `calc.js`, saves inputs to `localStorage`, and supports currency display conversion
- `package.json` and tests in `tests/run-tests.mjs` (Node) to verify the financial formulas
- Live exchange-rate fetch (uses https://api.exchangerate.host/) with safe fallback to built-in rates

## Run locally

Option A — Open in browser
1. Clone the repo or download the files.
2. Open `index.html` directly in a browser. (Some browsers restrict `fetch` from file:// — for full features use Option B.)

Option B — Simple static server (recommended)

Using Python:

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

Using Node (serve package):

```bash
npx serve .
# or use any static file server
```

## Run the tests

Node (requires no dependencies):

```bash
npm test
```

This runs `tests/run-tests.mjs` which imports `calc.js` and performs basic assertions on the core formulas.

## Notes on currency conversion

- Inputs are taken as base USD values. Display values are converted to the selected currency.
- Click "Fetch live rates" to pull USD→EUR/GBP live rates from exchangerate.host. If the fetch fails, the app uses built-in default rates.

## Screenshots

(Replace these placeholders by adding images to the repository and updating the paths.)

![screenshot-mobile](.github/screenshots/mobile.png)

![screenshot-desktop](.github/screenshots/desktop.png)

## Next improvements you can ask me to add

- Persist exchange-rate preferences or auto-refresh schedule
- Dark mode and theming
- More payment gateways and custom fee rules
- CI to run the tests on push (GitHub Actions)

---

Built by soltihub — feel free to open issues or PRs.
