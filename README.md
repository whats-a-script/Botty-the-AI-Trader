# Botty the AI Trader 🧠📈

> **Builders welcome.**  
> This is an open playground for building an AI-powered trading simulator in public.  
> If you’re into AI agents, trading systems, or pro-grade UIs, **come build with us** – open an issue, suggest ideas, or ship a PR.

**Pure AI trading simulator – first public build.**  
Botty is an experimental, AI-powered trading sandbox where multiple AI agents simulate trading crypto markets with professional-style risk management and analytics.

> **Status:** Early-stage, work-in-progress prototype.  
> The full vision is outlined in [`PRD.md`](./PRD.md).

---

## 🖥️ System Requirements (Recs)

To run the local dev environment smoothly, you’ll generally want:

- **OS:** macOS, Linux, or Windows
- **Node.js:** v18+ (LTS recommended)
- **Package manager:** `npm` (bundled with Node), or `pnpm` / `yarn`
- **Browser:** Any modern Chromium-based browser (Chrome, Edge, Brave) or latest Firefox/Safari

Performance-wise, for a comfortable experience:

- **CPU:** Recent 4-core CPU or better
- **RAM:** 8 GB minimum (16 GB recommended if you’re running multiple tools/IDEs)
- **Disk:** A few hundred MB free for dependencies

> Note: Today Botty is a local **simulator**. If/when remote AI APIs or live exchange data are wired up, you may also need:
> - API keys for selected AI providers
> - API key(s) for Coinbase or other data providers  
> Those will be documented when they’re actually used.

---

## ⚠️ Legal & Safety

- **Educational use only.**
- **No financial advice.**
- **No real money.** This project is a **simulation**.
- You are solely responsible for how you use this code or any ideas derived from it.
- **Use at your own risk;** no warranties or liability for any gains or losses.

Licensing:

- Code is provided under **MIT** (see [`LICENSE`](./LICENSE)).
- Some phrasing in early drafts referenced Apache-style terms; the canonical license for this repo is the MIT license file.

---

## ✨ What Botty Aims to Do

The long-term goal (see [`PRD.md`](./PRD.md)) is:

> An advanced AI-powered autonomous trading simulator with multiple intelligent agents, comprehensive risk management, and professional-grade trading features using live Coinbase cryptocurrency data.

High-level experience goals:

1. **Professional** – Feels like a native, pro trading terminal (leverage, SL/TP, analytics).
2. **Intelligent** – Multiple AI agents making autonomous decisions with confidence thresholds.
3. **Educational** – Transparent AI reasoning, trade journaling, and risk insights.

This repo is the **playground** where that vision is being built in public.

---

## 🧩 Core Features (Vision)

Botty is being built around the following pillars:

### Unified Auto-Trading Mode

- One-click **Auto-Trade** mode where enabled AI agents:
  - Scan markets every N seconds
  - Reach consensus
  - Execute trades automatically within risk limits
- Stops trading automatically after a configured drawdown (e.g. 15%).

### Multi-Agent AI Trading System

- Multiple independent AI agents with different:
  - Models (e.g. GPT-4o, GPT-4o-mini, DeepSeek, Qwen, etc.)
  - Trading modes (conservative / moderate / aggressive)
  - Risk profiles and leverage settings
- Compare how different AI setups behave in the same market.

### Agent Communication & Consensus

- Agents can:
  - Discuss opportunities
  - Share reasoning
  - Agree/disagree on trades
- Consensus is used to decide whether to execute trades.

### Custom Trading Pairs

- Add custom Coinbase pairs beyond a default list.
- Useful for testing emerging coins, meme coins, or new listings.

### Autonomous Position Management

- AI agents:
  - Open/close long and short positions
  - Use configurable leverage
  - Set dynamic SL/TP based on volatility and risk

### Intelligent Risk Management

- Real-time:
  - Drawdown monitoring
  - Exposure & leverage checks
  - Volatility-aware adjustments
- Automatic safety mechanisms (e.g. pause trading after major drawdown).

### Multi-Model Analysis

- Different models focus on:
  - News/sentiment
  - Technical indicators
  - Risk management
- Signals are combined into a consensus decision.

### AI Strategy Auto-Adjustment

- Strategies auto-adjust based on performance:
  - Reduce leverage after poor performance
  - Scale up cautiously after strong performance
  - Adjust parameters based on win rate and drawdown.

### Comprehensive Trade Journal

- Every trade logged with:
  - Entry/exit details
  - AI reasoning
  - P&L, win rate, Sharpe-like metrics
- Designed to persist across sessions and support deep analysis.

### Real-Time Notifications

- Desktop or in-app notifications for:
  - Trade execution
  - Position closes
  - Drawdown alerts
  - Daily P&L summaries

### Live Market Data (Planned)

- Live Coinbase spot prices for a set of crypto assets.
- Regular updates, price history tracking, and volatility calculations.

For full detail, see the full [Product Requirements Document (`PRD.md`)](./PRD.md).

---

## 🛠 Tech Stack

- **Language:** TypeScript
- **Frontend tooling:** Vite
- **UI:** Modern, system-style design (macOS/Windows-like), using:
  - Cards, tables, sliders, tabs, dialogs, alerts, etc.
- **Styling:** CSS & Tailwind-style configuration
- **Design direction:**
  - Clean, minimal, native-app feel
  - System blue/green/red palette with strong contrast
  - Native system font stack (e.g., `-apple-system`, `Segoe UI`)

---

## 🚀 Getting Started

> Note: First public build – expect rough edges, missing features, and frequent changes.

### 1. Prerequisites

- **System recs:** See [System Requirements](#️-system-requirements-recs)
- **Node.js:** v18+ (LTS recommended)
- **npm** or **pnpm** / **yarn**

### 2. Install

```bash
git clone https://github.com/whats-a-script/Botty-the-AI-Trader.git
cd Botty-the-AI-Trader
npm install
```

### 3. Run Dev Server

```bash
npm run dev
```

Then open the printed `localhost` URL in your browser (typically [http://localhost:5173](http://localhost:5173)).

---

## 🧪 Current State vs. Future State

This repo is in **active development**. Not all PRD features are implemented yet.

Rough guide:

- ✅ Basic scaffolding, UI structure, and configuration
- 🧱 Early simulation and agent logic (work-in-progress)
- 🔜 Multi-agent collaboration and consensus
- 🔜 Full risk engine and trade journal
- 🔜 Live Coinbase data integration
- 🔜 AI model integrations (configurable per agent)

Check the issues and commits for the latest reality of what’s working.

---

## 🤖 Built with GitHub Spark

GitHub Spark was used to:

- Bootstrap parts of the codebase
- Fix issues and iterate quickly on early builds
- Assist with refactors and documentation

This repository is also an experiment in **building an AI trader using AI developer tools**.

---

## 🤝 Contributing

This is an early-stage, experimental project – contributions and ideas are welcome.

Ways to build with us:

- Implement pieces of the PRD (risk engine, journal, notifications, etc.)
- Improve UI/UX and visualizations
- Add new agent strategies or model integrations
- Harden edge-case handling and resilience

If you’re interested:

1. Open an issue to propose a feature or improvement.
2. Or fork the repo and open a PR.
3. Or just start a discussion and bounce ideas.

---

## 🧾 Roadmap (High-Level)

1. **Stabilize core simulation**
   - Deterministic, testable state transitions
   - Basic P&L and position tracking
2. **Single-agent AI loop**
   - Simple strategy and reasoning display
3. **Multi-agent framework**
   - Basic communication and consensus scaffolding
4. **Risk & leverage engine**
   - Drawdown limits, leverage caps, and auto-pausing
5. **Trade journal & analytics**
   - Persistent logs, summary metrics, charts
6. **Live market data integration**
   - Coinbase spot data, controlled update cadence

---

## 🧾 Disclaimer

This project is:

- A **technical and educational sandbox**, not a signal service.
- Not affiliated with Coinbase, OpenAI, or any specific exchange or model provider.
- Provided **as-is**, with **no guarantees** of performance, correctness, or suitability.

Enjoy the experiment, and **trade only in the simulator.**

---

Enjoy,  
**W‑A‑S (whats-a-script)**  
“Botty the AI Trader” – building an AI trader in public.  
**Builders welcome.**
