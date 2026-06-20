# BuildShield_AI — Devpost Submission

## 🔗 Important Links

*   **YouTube Demo Video:** [https://youtu.be/rraT7IvRdU0](https://youtu.be/rraT7IvRdU0)
*   **GitHub Repository:** [https://github.com/GaveneshB/BuildShield-NexusOp](https://github.com/GaveneshB/BuildShield-NexusOp)
*   **Live Web App (Vercel):** [https://build-shield-nexus-op.vercel.app/](https://build-shield-nexus-op.vercel.app/)
*   **Pitch Deck (Canva):** [https://www.canva.com/design/DAHNCp2CtPI/IIrTsxLrHA5Lvc8UaWCP4Q/edit](https://www.canva.com/design/DAHNCp2CtPI/IIrTsxLrHA5Lvc8UaWCP4Q/edit)

---

## 🚀 Inspiration

Cloud infrastructure is quietly bleeding organisations dry — not through dramatic breaches, but through silent waste, zombie resources, and mounting carbon debt that no one notices until it's too late.

We were inspired by the reality that **most cloud teams spend more time reacting than acting**. An idle staging server burns electricity and emits CO₂ at 3 AM. A rogue cryptominer runs undetected for weeks, costing thousands. A legitimate incident takes 47 minutes on average to remediate — a window in which real financial damage accumulates every second.

We asked: **what if the cloud could defend, clean, and heal itself — in real time, with zero human lag?**

BuildShield AI is our answer.

---

## ⚡ What It Does

BuildShield AI is a three-pillar intelligent cloud security and sustainability platform built for enterprise operations teams:

### 🔴 Pillar 1 — Phantom Auto-Reaper
A live cloud resource governance engine connected to **Firebase Firestore** in real time.

- **Ingests all cloud projects and their resources** (VMs, containers, databases, CDN nodes, staging envs) from a central registry.
- Visualises every resource with its live status: `ACTIVE`, `IDLE`, `UNDER ATTACK`, or `TERMINATED`.
- Allows operators to trigger a **Live Threat Sweep** — a dramatic 5-second countdown during which each resource is dynamically tagged with plain-English vulnerability warnings (e.g. *"Critical: Unpatched CVE-2023-4863"*, *"Warning: Open Port 22 (0.0.0.0/0)"*, *"Threat: Suspicious Outbound Traffic"*).
- After the countdown, the platform executes a **batch termination** of all idle or compromised resources and writes the full audit trail to Firestore.
- Every termination calculates and accumulates real **financial savings (MYR/USD)**, **energy savings (kWh)**, and **carbon savings (kg CO₂)** using EPA eGRID national grid averages (0.417 kg CO₂/kWh).
- An animated **slot-machine counter** shows the savings climbing in real time after each sweep, reinforcing the impact on stage.
- A **"Inject Zero-Day Exploit"** button simulates a live attack, turning targeted resources red with blinking critical alerts — so judges can watch the Reaper detect and eliminate the threat live.
- A **Projected 1-Year Burn** metric shows how much financial disaster was averted if the rogue resource had been left running.

---

### 🌿 Pillar 2 — Carbon Operations Centre
A full sustainability intelligence dashboard powered by **Gemini AI** (with a seamless local fallback).

- Monitors **10 real production servers** across US-East, EU-West, EU-Central, US-West, and AP-Southeast regions — each with live CPU load, RAM usage, grid carbon intensity (gCO₂e/kWh), power draw (W), CVE count, firewall status, and security grade (A–D).
- Calculates **daily CO₂ emissions per server** using the formula: `powerW × 24h × gridIntensity ÷ 1,000,000 kg`.
- When a server row is expanded, the platform calls a **Gemini-powered backend** to run a deep AI security & carbon audit. If the backend is unavailable, a rule-based local fallback generates the recommendation instantly — zero downtime.
- Each AI recommendation includes: **why** the server is flagging, a specific **remediation action** (e.g. *"Migrate analytics-wkr-1 to EU-West low-carbon region"*), and the exact **carbon saved (kg/day)** and **cost saved (USD/day)** if the action is applied.
- Clicking **"Apply Action"** marks the server as healthy (CVEs cleared, firewall activated, grade set to A) and logs the action to a persistent **Action History** tab — sorted by recency, carbon impact, or cost savings.
- The **Summary** tab aggregates savings across the last 7 days, this month, or a custom date range.
- All server state and history are persisted to **localStorage**, so data survives page refreshes.
- Carbon savings methodology footnote: *"Carbon savings calculated at 0.417 kg CO₂ per kWh based on EPA eGRID national averages."*

---

### 🔥 Pillar 3 — Chaos & Cure AI Demo Engine
A state-machine incident-response simulator — fully self-contained and deployable on Vercel with zero backend.

- Operators select from **12 real-world threat scenarios** including:
  - Cryptojacking Energy Spike
  - Mass Data Exfiltration
  - DDoS Botnet Attack
  - Ransomware Staging Indicators
  - Log4Shell RCE (CVE-2021-44228)
  - EternalBlue / WannaCry Lateral Movement (CVE-2017-0144)
  - Palo Alto PAN-OS Zero-Day (CVE-2024-3400)
  - …and 5 more
- Operators choose an **Org Policy Profile**: Conservative, Balanced, or Aggressive — which determines how the AI classifies the risk tier and whether it needs human sign-off.
- Clicking **"Trigger Incident"** fires a full incident state machine:
  1. `incident:started` — logs the threat, begins a live cost-of-inaction counter ($0.00 → climbing)
  2. `incident:risk-assessed` — shows AI confidence score (%), reversibility (%), and blast radius (%) as animated progress bars
  3. `incident:approval-needed` OR `incident:cure-executed` — Aggressive policy auto-resolves; Conservative/Balanced escalates for human approval
  4. Human can **Approve** or **Deny** the AI's proposed action live on stage
  5. **Rollback** is available post-cure to reverse the remediation
- A **dark terminal window** (colour-coded by event type) logs every step in real time with timestamps.
- Two live telemetry charts — **CPU Load** and **Network I/O** — are pre-populated with 30 rolling data points. During an active incident, CPU spikes to 75–97% and network to 600–850 Mb/s in real time. After cure, they settle back down instantly.
- **Reset Demo** clears all state, resets telemetry to healthy baselines, and stops all running timers.

---

## 🛠️ How We Built It

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4 |
| **Charts** | Recharts (AreaChart, BarChart) |
| **Database** | Firebase Firestore (Phantom Reaper), localStorage (Carbon Ops) |
| **AI** | Google Gemini (`@google/genai`) via Express backend |
| **Deployment** | Vercel (frontend), custom `vercel.json` root config |
| **State** | React hooks only (no Redux) |
| **Incident Engine** | Fully local `useChaosSocket` simulator — no WebSocket or backend needed |

Key engineering decisions:
- **No backend dependency for the demo**: The Chaos & Cure engine uses `setTimeout`/`setInterval` to simulate a full WebSocket-style event loop locally, guaranteeing zero failures on Vercel.
- **Firebase Firestore batch writes**: The Phantom Reaper terminates N resources in a single atomic batch, preventing partial states.
- **Graceful AI degradation**: If the Gemini backend is unreachable, the Carbon Ops engine falls back to deterministic heuristic rules instantly — the UI never shows an error to the user.
- **Rolling telemetry window**: The charts maintain a 30-point sliding window updated every second, giving a genuine "live monitoring" feel without unbounded memory growth.

---

## 🧗 Challenges We Ran Into

1. **Vercel 404 on deployment** — The project is a React sub-app inside a monorepo root. We had to configure a root `vercel.json` and `package.json` with a `vercel-build` script pointing to `hilti-siteguard/` to correctly serve `dist/`.
2. **Vite stripping env variables in production** — `import.meta.env` fallbacks were aggressively tree-shaken by Vite during the build, causing Firebase to receive `undefined` keys. Fixed by hardcoding the public Firebase config values directly.
3. **Git merge conflicts across team branches** — We had three simultaneous branches making conflicting edits to `ChaosCurePage.jsx`. Resolved using `git rebase` + manual conflict resolution while preserving each teammate's intended UI contributions.
4. **Recharts graphs invisible** — `ResponsiveContainer` with `h-16` inside a `bg-slate-50` container made the chart curves invisible (white on white). Fixed with explicit pixel heights, a dark `bg-slate-900` chart background, correct `YAxis` domains, and `isAnimationActive={false}` for live-streaming data.
5. **Telemetry data shape mismatch** — Our telemetry data used `{ t, cpu, net }` keys but Recharts `dataKey` was pointing to `"network"`. Unified to the teammate's `{ time, cpu, network }` schema.

---

## 🏆 Accomplishments We're Proud Of

- **Zero errors in production** on Vercel — every feature works end-to-end including the full Chaos & Cure incident state machine, telemetry charts, and the Phantom Reaper Firebase integration.
- Built a **fully working AI-powered carbon audit** that degrades gracefully to offline heuristics — a judge can click "Expand" on any server and get an actionable recommendation in under 2 seconds, every time.
- The **Live Threat Sweep** is a genuinely dramatic presentation tool: the 5-second countdown, live vulnerability tags, animated savings counter, and projected 1-year burn make the technology feel urgent and real.
- **12 real CVE scenarios** in the Chaos & Cure engine — we didn't use placeholder data. Every threat (Log4Shell, EternalBlue, MOVEit, PAN-OS) is a real-world incident that cost organisations millions.
- All three pillars work **independently but share a common design system** — a judge can navigate between them seamlessly in a single-page app without any loading friction.

---

## 📚 What We Learned

- **Vercel + monorepo deployment** requires explicit configuration — the default Vercel auto-detection fails for projects where the frontend is in a subdirectory.
- **Vite's tree-shaking** is more aggressive than expected in production mode — any `import.meta.env` fallback that doesn't exist at build time is dropped entirely.
- **Recharts needs explicit layout context** — `ResponsiveContainer` inherits its dimensions from the parent DOM element. A `height: 0` parent renders nothing, silently.
- **State machine design for demos** — when there's no backend to rely on, a well-designed local simulator (using `useRef` + `setInterval`) can deliver an identical user experience to a live WebSocket server.
- **Team merge discipline** — working on the same file across branches requires more coordination than async feature work. We learned to resolve conflicts based on *intent*, not just syntax.

---

## 🔭 What's Next for BuildShield_AI-Cavan

1. **Real cloud provider integration** — Connect directly to AWS CloudWatch, Azure Monitor, and GCP Cloud Monitoring APIs to pull live resource telemetry instead of simulated data.
2. **Scheduled Auto-Reap policies** — Let operators define rules like "terminate any resource idle >72 hours" that run automatically on a cron.
3. **Gemini Live threat narration** — Use Gemini's streaming API to narrate the Chaos & Cure incident response in plain English, live, as it happens.
4. **Multi-tenant organisation support** — Allow multiple teams to manage their own projects and resources within isolated workspaces.
5. **Carbon Scope 3 reporting** — Extend carbon calculations to include indirect emissions from CDN traffic, SaaS API calls, and developer device usage.
6. **Regulatory compliance dashboard** — Map server configurations to ISO 27001, NIST CSF, and EU Cyber Resilience Act requirements and generate a one-click audit PDF.
