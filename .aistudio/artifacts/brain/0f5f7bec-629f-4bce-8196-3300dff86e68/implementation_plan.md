# Real-Time Automatic Calculation Event Listeners

Provide immediate, real-time recalculation of profit margins, gross profit, and gateway deductions as users type or adjust any input in MarginMetric, eliminating any manual triggers and ensuring results update live.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during clarification and will guide the implementation:

- **Confirmed Decision 1**: **Instant Keystroke Reactivity** — Numeric inputs will trigger recalculation synchronously on every keystroke (`input` event) without debouncing delays, delivering instant feedback.
- **Confirmed Decision 2**: **Graceful Blank/Invalid Handling** — Temporarily empty or invalid fields during typing will default gracefully to `0` (or `1` for minimum quantity), keeping metrics live and preventing calculation errors.

### 1. Overview & Core Concept

- **What It Does**: Automatically updates all profit, margin, markup, and per-unit calculations immediately whenever any input field (cost, selling price, shipping fee, quantity, gateway fee percentages, fixed gateway fee, or currency) changes.
- **Target Audience / Persona**: E-commerce merchants, sellers, and analysts comparing product pricing strategies on desktop and mobile.
- **Key Value**: Frictionless user experience with zero manual steps, continuous visual feedback, and instant calculation synchronization with local persistence.

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. User focuses on any numeric input (e.g., selling price or cost).
  2. With each keystroke, the results section updates instantly in the selected currency.
  3. Selecting a different currency dropdown or altering gateway fee inputs recalculates the entire summary board instantly.
  4. Values automatically persist to `localStorage` so refresh maintains current state.
- **Visual Identity & Theme**:
  - Clean, utilitarian card interface with responsive Tailwind styling matching the existing design system.
  - Results card values update smoothly without layout shift.
- **Interactive Feedback & Motion**:
  - Live metric values format with appropriate currency signs immediately.
  - Zero-state and clear-field interactions show valid numbers ($0.00 / 0.00%) rather than NaN or broken layouts.

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual Event Handling (`input` + `change`)**
  - *Chosen Approach*: Bind both `input` (for real-time keystroke reactivity across text/number inputs) and `change` (for select dropdowns and completed input commits) to the recalculation pipeline.
  - *Why*: Ensures smooth live updates while typing as well as instant reaction when selecting values via spinners, arrows, copy-paste, or mobile virtual keyboard inputs.
  - *Alternatives Considered*: Only `change` (too slow, requires losing focus) or only `blur` (requires manual navigation).
- **Decision 2: Resilient Input Parsing**
  - *Chosen Approach*: Normalize inputs via `parseFloatOrZero` with quantity clamped to minimum 1, allowing user backspaces without UI crashes.
  - *Why*: Guarantees continuous live calculations without intermediate `NaN` display when users backspace a number to type a new one.
  - *Alternatives Considered*: Throwing errors or freezing calculation on blank inputs.

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                      DOM Inputs                        │
│  [costPrice, sellingPrice, shipping, quantity, ...]    │
└──────────────────────────┬─────────────────────────────┘
                           │ 'input' / 'change' events
                           ▼
┌────────────────────────────────────────────────────────┐
│             Event Dispatch & Parsing                   │
│   • parseFloatOrZero()                                 │
│   • quantity clamping (min: 1)                         │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Financial Engine (calc.js)                 │
│   • calculateTotals({ cost, sell, shipping, ... })     │
└──────────────────────────┬─────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
┌──────────────────────┐      ┌─────────────────────────┐
│     DOM Update       │      │   State Persistence     │
│  Update gross profit,│      │   localStorage.setItem  │
│  net, margin, markup │      │   window.__summary      │
└──────────────────────┘      └─────────────────────────┘
```

- **Data Model & State**: Input state mapped to `marginMetricInputs_v1` in `localStorage`, in-memory `exchangeRates`, and active calculation object `window.__marginMetricSummary`.
- **Interactive Component & State Mapping**:
  - `costPrice`, `sellingPrice`, `shipping`, `quantity`, `gatewayPercent`, `gatewayFixed`: Real-time `input` + `change` events -> `calculate()` -> DOM updates & storage save.
  - `currency`: `change` event -> `calculate()` with live exchange rates -> DOM updates.
