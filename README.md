# ⚽ PitchAleph (ℵ)

> **Quantitative sports simulation & live predictive market engine.**  
> Transforming discrete on-pitch event data into real-time predictive probability models.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-pitchaleph.com-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://pitchaleph.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![RepNix](https://img.shields.io/badge/Guardrails-RepNix-emerald?style=for-the-badge)](https://github.com/zakaihamilton/repnix)

---

## 🚀 Live Demo

Experience the full interactive simulation directly in your browser:

### 🔗 **[https://pitchaleph.com](https://pitchaleph.com)**

*Tested and optimized for desktop, tablet, and mobile handheld devices.*

---

## 📌 Overview

**PitchAleph** models high-frequency spatial soccer match events into continuous predictive probability states, highlighting market inefficiencies and identifying positive expected value (+EV) betting windows before sportsbooks adjust.

Traditional models look at box scores and lagged match stats. PitchAleph consumes granular, real-time event streams—passes, shots, defensive blocks, spatial threat (xT)—and projects continuous win probabilities to exploit odds distortions in real time.

---

## 🧪 Interactive Case Studies

Explore four backtested World Cup match scenarios directly inside the engine:

1. **TEST 01: Alpha Generation — ARG vs FRA (2022 Final)**
   - *The 25% Backtest*: Blinding the model to detect territorial imbalances before market awareness, locking in a +25.0% EV buy order before Argentina's breakthrough.
2. **TEST 02: Tail Risk & Variance — GER vs KOR (2018 Group Stage)**
   - *Managing Inevitable Outliers*: Extreme sustained siege pressure creates a statistical edge that fails on black-swan counter-attacks. Surviving downside risk via Fractional Kelly Criterion sizing (capped at 2%).
3. **TEST 03: Underdog Inefficiency — KSA vs ARG (2022 Group Stage)**
   - *Neutralizing Spatial Threat*: Identifying tactical anomalies where Saudi Arabia's synchronized high defensive line dismantled spatial threat, buying massive +1200 underdog undervaluation.
4. **TEST 04: Dynamic Hedging — NED vs ARG (2022 Quarter-Final)**
   - *Regime Change Detection*: When long-ball aerial chaos nullified predictive models at minute 75, PitchAleph triggered an automated cash-out hedge, locking in +8.5 Units of profit before the 90+11' equalizer.

---

## ⚡ Key Features

- **🎮 2D Canvas Pitch Visualizer**: High-performance real-time simulation rendering discrete player events, threat paths, shot trajectories, and rolling xT momentum.
- **⏱️ Match Timeline Scrubber**: Scrub back and forth across every minute of the match or resume automatic simulation playback with a single tap.
- **📱 Fully Responsive UI**: Seamlessly adapts to handheld devices and wide monitors, featuring dedicated mobile analysis/pitch views and reactive touch feedback.
- **💡 PitchAleph Edge Calculator**: Interactive stake-sizing tool comparing conventional bettor outcomes vs. PitchAleph mathematical bankroll outcomes.
- **🛡️ Guardrails with RepNix**: Enforced repository health verification including zero-dead-code checks (Knip), code duplication detection (jscpd), and strict linting.
- **🔌 Public RESTful API & OpenAPI/Swagger**: Programmatic access to Data Vault match scenarios, backtest performance ledger, and the mathematical bet simulation engine secured with API key authentication.

---

## 🔌 Public RESTful API & Swagger Documentation

Pitch Aleph exposes a public RESTful API powered by Next.js Serverless Route Handlers.

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/docs` | Interactive Swagger UI API documentation | No |
| `GET` | `/api/openapi.json` | OpenAPI 3.0.3 specification document | No |
| `GET` | `/api/v1/matches` | List Data Vault matches with optional status/search filters | Yes |
| `POST` | `/api/v1/matches` | Register a new match scenario | Yes |
| `GET` | `/api/v1/matches/:id` | Retrieve detailed tactical match analysis | Yes |
| `PUT` | `/api/v1/matches/:id` | Update an existing match scenario | Yes |
| `DELETE` | `/api/v1/matches/:id` | Remove a match scenario | Yes |
| `GET` | `/api/v1/backtest` | Retrieve trade-by-trade P&L performance ledger | Yes |
| `POST` | `/api/v1/simulate` | Run mathematical bet simulator against Pitch Aleph models | Yes |

### Authentication
Authenticate requests using the `x-api-key` header or standard HTTP `Authorization: Bearer <token>`:
```bash
# Using x-api-key header
curl -H "x-api-key: aleph_demo_key_2026" https://pitchaleph.com/api/v1/matches

# Using Authorization Bearer header
curl -H "Authorization: Bearer aleph_demo_key_2026" https://pitchaleph.com/api/v1/matches
```

Demo Key: `aleph_demo_key_2026` (or set custom key via `PITCH_ALEPH_API_KEY` environment variable).

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router & Serverless Route Handlers)
- **Frontend**: React 19, Tailwind CSS
- **Visualization**: HTML5 2D Canvas Engine & Recharts
- **API & Docs**: OpenAPI 3.0.3 Specification & Swagger UI
- **Quality & Guardrails**: [RepNix](https://github.com/zakaihamilton/repnix), ESLint, Knip, jscpd
- **Hosting & CI/CD**: [Vercel](https://pitchaleph.com)

---

## 💻 Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/yperez83/pitch-aleph.git
cd pitch-aleph
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Run repository health checks (RepNix guardrails):

```bash
npm run health
```

Build for production:

```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.
