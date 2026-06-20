# Chaos & Cure AI Demo Engine — Implementation Spec

**Module:** BuildShield NEXUSOP → Chaos & Cure Demo
**Stack:** React (frontend) + Node/Express (backend)
**Audience:** Code agent implementing this feature end-to-end
**Status:** Ready for implementation

---

## 0. What this feature actually is

This is **not** a scripted animation that plays a canned sequence when a button is clicked. It is a real, running incident-response state machine:

1. **Chaos Agent** — injects a synthetic security/ops incident into real backend state (a flag, a fake "compromised" resource record, a metrics spike) so the system has something genuine to detect.
2. **Detection Layer** — backend logic that scores the incident on severity and confidence, exactly like a real monitoring pipeline would.
3. **Decision Engine** — the tiered-autonomy router (the part we designed earlier). It decides, per incident, whether to auto-execute, auto-execute-with-notify, or require human approval.
5. **Cure Agent** — executes the remediation action against the real backend state (quarantine flag flips, process-throttle flag flips, etc.) and the change is genuinely reflected when you query the state afterward.
6. **Frontend** — terminal log (already built) + telemetry sidebar (already built) + new components for risk scoring, action tier, and approve/rollback controls, all driven by a WebSocket stream from the backend, not local fake timers.

"Real backend state changes" means: the Node service maintains an actual incident/resource state machine in memory (or a lightweight store), the Chaos agent actually mutates it, the Cure agent's actions actually mutate it back, and the frontend reflects true state via API/WebSocket — not simulated purely client-side. This is a closed sandbox (no real infrastructure, cloud accounts, or external systems are touched), but the state transitions, scoring, and decisions are real, not pre-recorded.

---

## 1. Architecture overview

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  React Frontend              │  WS/    │  Node/Express Backend        │
│  - Terminal log view         │  REST   │  - Scenario Engine           │
│  - Telemetry sidebar         │ <─────> │  - Risk Scoring Engine       │
│  - Risk/Tier readout         │         │  - Tiered Decision Router    │
│  - Approve/Rollback controls │         │  - Cure Action Executor      │
│  - Cost-of-inaction counter  │         │  - In-memory State Store     │
└─────────────────────────────┘         │  - WebSocket event emitter   │
                                          └──────────────────────────────┘
```

### Why WebSocket, not polling
Incidents evolve in real time (cost-of-inaction counters ticking, telemetry spiking, tier transitions). Use a single WebSocket channel (`socket.io` or native `ws`) for all incident lifecycle events. REST endpoints are still used for one-shot actions (trigger scenario, approve action, rollback).

---

## 2. Backend implementation

### 2.1 Directory structure to create

```
/server
  /chaos-cure
    scenarios/
      index.js            # scenario registry
      dataLeak.js
      cryptojacking.js
      ddos.js
      insiderThreat.js
      ransomwareStaging.js
      misconfigExposure.js
    engine/
      riskScorer.js        # severity x confidence x reversibility
      decisionRouter.js     # tier assignment logic
      cureExecutor.js       # executes remediation per tier
      stateStore.js         # in-memory incident + resource state
      incidentManager.js     # orchestrates full lifecycle
    websocket.js
    routes.js
```

### 2.2 Scenario framework (flexible, not hardcoded to 2 cases)

Build a **scenario registry pattern** so new threat types can be added without touching the engine. Each scenario is a self-contained module implementing a common interface.

```js
// scenarios/_scenarioInterface.js (reference shape, not enforced via TS but document it)
{
  id: 'cryptojacking',
  label: 'Cryptojacking Energy Spike',
  category: 'resource-abuse', // resource-abuse | data-exfiltration | network | identity | infra-integrity
  description: 'Unauthorized process consuming abnormal compute for crypto mining',

  // Called when chaos is triggered. Mutates state to simulate the start of the incident.
  inject: (stateStore) => { /* set fake resource into a "compromised" condition */ },

  // Called every tick while incident is active and unresolved. Returns updated metrics.
  tickInactionCost: (elapsedSeconds, stateStore) => {
    // returns { metric: 'usd', value: number } or { metric: 'rowsLeaked', value: number }
  },

  // Static or dynamic inputs to the risk scorer
  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.42,      // cost unit per second of inaction
    confidence: 0.94,             // model certainty incident is real (0-1)
    blastRadius: 0.15,            // 0=fully isolated, 1=affects everything
    reversibility: 0.95,          // 1 = trivially reversible, 0 = irreversible
  }),

  // The remediation action(s) available, each tagged with what tier it WOULD be
  // if chosen alone — actual tier is still computed by decisionRouter using
  // getRiskInputs, this is just the catalog of available moves.
  remediations: [
    { id: 'throttle-process', label: 'Throttle suspicious process', reversible: true, destructive: false },
    { id: 'isolate-vm', label: 'Isolate VM to quarantine VLAN', reversible: true, destructive: false },
    { id: 'kill-process', label: 'Kill process', reversible: true, destructive: false },
    { id: 'revoke-key', label: 'Revoke API key', reversible: true, destructive: false },
    { id: 'shutdown-server', label: 'Shut down production server', reversible: false, destructive: true },
    { id: 'delete-data', label: 'Delete compromised dataset copy', reversible: false, destructive: true },
  ],

  // Executes a specific remediation against state. Must be idempotent & loggable.
  applyRemediation: (remediationId, stateStore) => { /* mutate state, return result */ },

  // Reverses a remediation if rollback is requested (only for reversible actions)
  rollbackRemediation: (remediationId, stateStore) => { /* mutate state back */ },
}
```

### 2.3 Minimum scenario set to ship (cover the realistic threat space)

Implement all of these from day one since the registry pattern makes each one cheap:

| Scenario ID | Category | Example remediation chain |
|---|---|---|
| `cryptojacking` | resource-abuse | throttle → isolate → kill process |
| `dataLeak` (mass exfiltration) | data-exfiltration | isolate network access → revoke key → (Tier 3) notify/delete |
| `ddos` | network | rate-limit → blackhole IP range → scale defenses |
| `insiderThreat` | identity | flag anomalous access pattern → suspend session → (Tier 3) revoke account |
| `ransomwareStaging` (mass file-encryption precursor signals) | infra-integrity | isolate host → snapshot → (Tier 3) full shutdown |
| `misconfigExposure` (e.g. open S3-equivalent bucket / open port) | infra-integrity | auto-close port/ACL → rotate exposed secret → notify |

Each scenario file is ~60-100 lines. Keep `index.js` as a simple registry export:

```js
// scenarios/index.js
module.exports = {
  cryptojacking: require('./cryptojacking'),
  dataLeak: require('./dataLeak'),
  ddos: require('./ddos'),
  insiderThreat: require('./insiderThreat'),
  ransomwareStaging: require('./ransomwareStaging'),
  misconfigExposure: require('./misconfigExposure'),
};
```

This means the "Simulate Zero-Day Exploit" button becomes a **scenario picker** (random or selectable) rather than one fixed flow — directly upgrades the demo to "press a different button each time, get a real new scenario," which is a better hackathon flex than the original single-flow idea.

### 2.4 Risk Scoring Engine (`engine/riskScorer.js`)

This is the implementation of the framework from our earlier discussion. Pure function, fully unit-testable:

```js
function computeRiskScore({ severityPerSecond, confidence, blastRadius, reversibility }) {
  // action_score: how safe/clear it is to act automatically
  const actionScore = confidence * reversibility * (1 - blastRadius);

  // urgency: how costly waiting is (used for display + tie-breaking, not tier alone)
  const urgency = severityPerSecond;

  return { actionScore, urgency, confidence, blastRadius, reversibility, severityPerSecond };
}

function assignTier(riskScore, thresholds = DEFAULT_THRESHOLDS) {
  const { actionScore, urgency } = riskScore;

  if (actionScore >= thresholds.tier1Min) return 'TIER_1_AUTO';
  if (actionScore >= thresholds.tier2Min) return 'TIER_2_AUTO_NOTIFY';
  if (urgency >= thresholds.urgencyEscalation && actionScore >= thresholds.tier3MinWithUrgency) {
    // High cost of waiting + moderate confidence: still act, but shorten human review window
    return 'TIER_2_AUTO_NOTIFY';
  }
  return 'TIER_3_APPROVAL_REQUIRED';
}

const DEFAULT_THRESHOLDS = {
  tier1Min: 0.85,
  tier2Min: 0.55,
  tier3MinWithUrgency: 0.40,
  urgencyEscalation: 0.5, // cost-per-second above which we lean toward acting
};

module.exports = { computeRiskScore, assignTier, DEFAULT_THRESHOLDS };
```

**Make thresholds runtime-configurable** (env vars or a `/config` endpoint) so you can tune live on stage if a judge asks "what if you set the bar higher?" — this is a strong demo answer ("let me show you live") rather than a hardcoded constant.

### 2.5 Decision Router (`engine/decisionRouter.js`)

Orchestrates: take scenario risk inputs → compute score → assign tier → decide which remediation(s) from the scenario's catalog match that tier → execute or queue for approval.

```js
function routeIncident(scenario, stateStore) {
  const riskInputs = scenario.getRiskInputs(stateStore);
  const riskScore = computeRiskScore(riskInputs);
  const tier = assignTier(riskScore);

  // Pick the least-destructive remediation that matches the tier's permission level
  const candidateRemediations = scenario.remediations.filter(r =>
    tier === 'TIER_3_APPROVAL_REQUIRED' ? true : !r.destructive
  );
  const chosenRemediation = candidateRemediations[0]; // simplest reversible action first

  return { riskScore, tier, chosenRemediation, scenario };
}
```

Key rule encoded here: **destructive actions are never auto-executed regardless of confidence.** Only non-destructive (reversible) actions can land in Tier 1/2. This is a hard rule, not a tunable — keep it in code as a guard, not just convention, and say so explicitly on stage ("destructive actions cannot be auto-approved, full stop, even at 99% confidence").

### 2.6 Cure Executor (`engine/cureExecutor.js`)

Executes the chosen remediation and logs a structured event for every action:

```js
function executeCure({ scenario, chosenRemediation, tier, riskScore }, stateStore, emit) {
  const startedAt = Date.now();
  const result = scenario.applyRemediation(chosenRemediation.id, stateStore);

  const event = {
    type: 'CURE_EXECUTED',
    scenarioId: scenario.id,
    remediationId: chosenRemediation.id,
    tier,
    riskScore,
    reasoning: buildReasoningTrace(scenario, chosenRemediation, tier, riskScore),
    executedAt: startedAt,
    rollbackAvailable: chosenRemediation.reversible,
  };

  emit('incident:cure-executed', event);
  return event;
}

function buildReasoningTrace(scenario, remediation, tier, riskScore) {
  return `Detected ${scenario.label} — confidence ${(riskScore.confidence*100).toFixed(0)}%, ` +
    `blast radius ${(riskScore.blastRadius*100).toFixed(0)}%, reversibility ${(riskScore.reversibility*100).toFixed(0)}%. ` +
    `Action score ${riskScore.actionScore.toFixed(2)} → ${tier}. ` +
    `Executing "${remediation.label}" (${remediation.reversible ? 'reversible' : 'irreversible'}).`;
}
```

This reasoning string is what renders in the terminal log — it's the single most important UI element for judges because it makes the AI's logic legible in real time, not just its outcome.

### 2.7 State Store (`engine/stateStore.js`)

Simple in-memory store is sufficient (no DB needed for a demo sandbox), but structure it like real state so it's not just a flag:

```js
const state = {
  resources: {
    'vm-prod-01': { status: 'healthy', cpuLoad: 0.10, quarantined: false },
    'api-key-7741': { status: 'active', revoked: false },
    'dataset-customers': { status: 'sealed', rowsLeaked: 0 },
  },
  activeIncidents: {},  // incidentId -> { scenarioId, startedAt, status, tier, ... }
  auditLog: [],          // append-only event log for every action taken
};
```

Every mutation goes through a single `mutate(path, value)` helper that also appends to `auditLog`, so the audit trail (point 4 of the original demo plan) is automatic, not bolted on.

### 2.8 Incident Manager (`engine/incidentManager.js`)

Ties it together; runs a tick loop (e.g. every 1s via `setInterval`) per active incident:

1. On `POST /api/chaos/trigger` with a `scenarioId` (or `random`): call `scenario.inject()`, create incident record, emit `incident:started`.
2. Every tick while incident is unresolved: call `tickInactionCost`, emit `incident:cost-update` (drives the live counter).
3. Immediately after injection, call `routeIncident()` once: emit `incident:risk-assessed` with tier + reasoning.
4. If tier is `TIER_1_AUTO` or `TIER_2_AUTO_NOTIFY`: call `executeCure()` immediately, emit `incident:cure-executed`, stop the cost-of-inaction tick.
5. If tier is `TIER_3_APPROVAL_REQUIRED`: emit `incident:approval-needed` with the proposed action pre-filled, keep cost ticking, wait for `POST /api/chaos/:incidentId/approve` or `/deny`.
6. Rollback: `POST /api/chaos/:incidentId/rollback` → calls `scenario.rollbackRemediation()`, emits `incident:rolled-back`. Only allowed if `chosenRemediation.reversible === true` — enforce server-side, don't trust the frontend to gate this.

### 2.9 REST + WebSocket contract

**REST endpoints**
```
POST   /api/chaos/trigger          { scenarioId?: string }  -> { incidentId }
POST   /api/chaos/:id/approve      {}                       -> { event }
POST   /api/chaos/:id/deny         {}                        -> { event }
POST   /api/chaos/:id/rollback     {}                       -> { event }
GET    /api/chaos/scenarios        ()                       -> list of scenario metadata (id, label, category)
GET    /api/chaos/config           ()                       -> current thresholds
PATCH  /api/chaos/config           { thresholds }            -> updated thresholds (for live tuning on stage)
GET    /api/chaos/:id              ()                       -> full incident state (for refresh/reload)
```

**WebSocket events (server → client)**
```
incident:started          { incidentId, scenario: {id, label, category}, startedAt }
incident:cost-update       { incidentId, metric, value, elapsedSeconds }
incident:risk-assessed     { incidentId, riskScore, tier, reasoning }
incident:cure-executed     { incidentId, remediationId, tier, reasoning, rollbackAvailable }
incident:approval-needed   { incidentId, proposedRemediation, riskScore, reasoning }
incident:approved          { incidentId, by: 'human' }
incident:denied            { incidentId, by: 'human' }
incident:rolled-back       { incidentId, remediationId }
telemetry:update           { cpuLoad, networkMbps, ramPercent }   // feeds existing sidebar
```

Use a consistent envelope and incidentId on every event so the frontend can route updates to the right UI state even with multiple incidents (recommended: allow only one active incident at a time for the demo to avoid UI clutter — enforce server-side by rejecting `/trigger` while one is active, return 409).

---

## 3. Frontend implementation

### 3.1 New components to add (alongside existing terminal + telemetry sidebar)

```
/src/components/chaos-cure/
  ScenarioPicker.jsx        # dropdown/button group: pick scenario or "Random"
  RiskReadout.jsx           # shows actionScore, confidence, blast radius, tier badge
  CostOfInactionCounter.jsx  # live ticking $ or rows-leaked counter, freezes on cure
  ApprovalPanel.jsx         # appears only for Tier 3 — Approve / Deny buttons + reasoning
  RollbackControl.jsx       # always visible after any cure action; countdown since action
  TerminalLog.jsx           # extend existing terminal to stream reasoning lines, not just static text
  useChaosSocket.js          # hook wrapping the WebSocket connection + event handlers
```

### 3.2 Terminal log behavior

Replace the static `[*] System secure...` line with a streaming log fed by WebSocket events. Each event type maps to a styled line:

```
[CHAOS]   14:02:01  Injected scenario: Cryptojacking Energy Spike
[DETECT]  14:02:01  Anomaly detected — CPU load 94%, confidence 96%
[RISK]    14:02:02  action_score=0.91 urgency=0.78 → TIER_1_AUTO
[CURE]    14:02:02  Executing: Throttle suspicious process (reversible)
[CURE]    14:02:02  ✓ Resolved. vm-prod-01 cpuLoad: 94% → 11%
```

For Tier 3 incidents, insert a waiting state:
```
[RISK]    14:05:10  action_score=0.31 → TIER_3_APPROVAL_REQUIRED
[WAIT]    14:05:10  Awaiting human approval — proposed: Shut down production server
```

Color-code by tag (`[CHAOS]` red/orange, `[DETECT]` yellow, `[RISK]` blue, `[CURE]` green, `[WAIT]` amber pulsing). This is what makes the terminal feel alive rather than decorative.

### 3.3 Risk Readout component

Render the four scoring inputs as small live gauges/bars (confidence, blast radius, reversibility, action score) plus a prominent **Tier badge**:

- `TIER_1_AUTO` → green badge, "Auto-Resolved"
- `TIER_2_AUTO_NOTIFY` → blue badge, "Auto-Resolved · Notified"
- `TIER_3_APPROVAL_REQUIRED` → amber badge, pulsing, "Awaiting Approval"

This directly answers "how does it decide?" without anyone having to ask.

### 3.4 Cost-of-inaction counter

A single large animated number (use `Intl.NumberFormat` for currency or comma-formatted row counts) driven by `incident:cost-update` events. It must visibly **stop counting the instant `incident:cure-executed` fires** — this is your single best "wow" visual since it makes the tradeoff from our framework tangible on screen.

### 3.5 Approval panel (Tier 3 only)

When `incident:approval-needed` fires:
- Show the reasoning trace
- Show the proposed action with a clear "irreversible" warning badge if `destructive: true`
- Two buttons: **Approve** (calls `/approve`) and **Deny** (calls `/deny`)
- Keep the cost counter visibly running while waiting — this is the point of the demo: showing the human *is* the bottleneck for irreversible actions, by design, not by accident

### 3.6 Rollback control

After any cure action (Tier 1/2 especially), show a persistent small bar: *"Action taken 4s ago — [Rollback]"* with an elapsed-time counter. Disable/hide it if `rollbackAvailable: false`. This single element is what neutralizes the "what if the AI is wrong" question live.

### 3.7 Scenario picker

Replace single "Simulate Zero-Day Exploit" button with a button group or dropdown: each scenario from `GET /api/chaos/scenarios`, plus a "Random Threat" option. This is a cheap upgrade that makes the live demo repeatable and impressive across multiple judge visits to your table (different scenario each time, not the same canned run).

---

## 4. The hard rule to keep visible in both code and pitch

Encode this as a literal comment block at the top of `decisionRouter.js` and say it out loud during the demo — it's the single sentence that makes judges trust the autonomy design:

```js
/**
 * HARD SAFETY RULE — DO NOT MAKE THIS CONFIGURABLE:
 * Destructive / irreversible remediations (shutdown, delete, customer notification,
 * account termination) can NEVER be assigned to Tier 1 or Tier 2, regardless of
 * confidence score. They always route to Tier 3 (human approval required).
 * Only severity/urgency scoring and tier-1/2 thresholds are tunable at runtime.
 */
```

---

## 5. Policy Configuration Layer (org-specific risk appetite)

### 5.1 Why this layer exists

The risk-scoring math in section 2.4 (`action_score = confidence × reversibility × (1 − blast_radius)`) is universal — it's just "how safe is this action." But **which tier a given action is allowed to land in** is not universal. A bank, a hospital, and a gaming startup have genuinely different risk tolerances, regulatory exposure, and actual infra reversibility. Hardcoding one global threshold set bakes someone's specific risk appetite into the engine as if it were physics.

The fix: split the system into two layers that never get conflated.

```
Universal Scoring Layer   →  action_score, urgency   (same math for everyone)
Org Policy Layer          →  hard caps + fast-tracks  (different per org, fully configurable)
                          ↓
Final Tier Decision
```

**The policy layer always wins over the raw score.** A 99%-confidence, fully-reversible action can still be forced to Tier 3 if the org's policy says so (e.g. "anything touching customer PII is always human-approved, no exceptions"). This mirrors the hard safety rule from section 4 — that rule is really just the *default, non-removable* policy entry that ships with every org profile.

### 5.2 Policy schema

```js
// policy/policyTypes.js (reference shape)
{
  orgId: 'string',
  label: 'string',                 // e.g. "Conservative Bank Policy"
  description: 'string',

  thresholds: {
    tier1Min: 0.85,                 // action_score above this -> eligible for Tier 1
    tier2Min: 0.55,                 // action_score above this -> eligible for Tier 2
    tier3MinWithUrgency: 0.40,       // urgency-driven escalation floor
    urgencyEscalation: 0.5,
  },

  // Remediation IDs that are ALWAYS forced to a tier, regardless of computed score.
  // This always overrides the score-based tier. Keys are remediation IDs from the
  // scenario catalog (section 2.2/2.3), values are the forced tier.
  hardCaps: {
    'delete-data': 'TIER_3_APPROVAL_REQUIRED',
    'notify-customer': 'TIER_3_APPROVAL_REQUIRED',
    'shutdown-server': 'TIER_3_APPROVAL_REQUIRED',
  },

  // Remediation IDs that skip straight past Tier 2's "notify" step even if the
  // score would have placed them there — i.e. silent auto-resolve, log only.
  fastTrack: ['throttle-process', 'rate-limit-ip'],

  // Optional: resource-level overrides. If the affected resource carries this
  // dataClassification tag, force Tier 3 regardless of action or score.
  dataClassificationOverrides: {
    'pii': 'TIER_3_APPROVAL_REQUIRED',
    'financial': 'TIER_3_APPROVAL_REQUIRED',
  },
}
```

**Non-negotiable rule (still applies under every policy):** destructive actions (`destructive: true` in the scenario's remediation catalog) can never be set to anything other than `TIER_3_APPROVAL_REQUIRED` in `hardCaps`. Validate this when a policy is loaded/saved — reject any policy file that tries to fast-track or auto-tier a destructive action. This keeps the section 4 safety guarantee true *across every org profile*, not just the default one.

### 5.3 Three demo-ready policy profiles to ship

Create these as static JSON/JS files so they can be swapped instantly in the UI:

```
/policy/profiles/
  conservative.js   // "Conservative — Bank/Healthcare"
  balanced.js        // "Balanced — Default"
  aggressive.js      // "Aggressive — Startup/Gaming"
```

| Profile | tier1Min | tier2Min | hardCaps beyond destructive | fastTrack |
|---|---|---|---|---|
| Conservative | 0.95 | 0.80 | + revoke-key, isolate-vm forced to Tier 3 | none |
| Balanced (default) | 0.85 | 0.55 | only destructive actions | throttle-process |
| Aggressive | 0.70 | 0.40 | only destructive actions | throttle-process, rate-limit-ip, isolate-vm, kill-process |

These numbers are reasonable defaults to ship with — they don't need to be empirically perfect for a hackathon, they need to visibly produce **different tier outcomes for the same incident**, which is the actual point of the demo.

### 5.4 Updated decision router logic

Extend `engine/decisionRouter.js` from section 2.5 to apply the policy after computing the raw score:

```js
function routeIncident(scenario, stateStore, policy) {
  const riskInputs = scenario.getRiskInputs(stateStore);
  const riskScore = computeRiskScore(riskInputs); // unchanged, universal math
  let tier = assignTier(riskScore, policy.thresholds);

  const remediation = pickRemediation(scenario, tier);

  // Apply policy overrides — these always win over the computed tier
  tier = applyPolicyOverrides({ tier, remediation, scenario, stateStore, policy });

  return { riskScore, tier, chosenRemediation: remediation, scenario, policyApplied: policy.orgId };
}

function applyPolicyOverrides({ tier, remediation, scenario, stateStore, policy }) {
  // 1. Hard caps by remediation ID — highest priority
  if (policy.hardCaps[remediation.id]) {
    return policy.hardCaps[remediation.id];
  }

  // 2. Data classification override on the affected resource
  const resource = stateStore.resources[scenario.affectedResourceId];
  const classification = resource?.dataClassification;
  if (classification && policy.dataClassificationOverrides[classification]) {
    return policy.dataClassificationOverrides[classification];
  }

  // 3. Fast-track — only relevant if tier was already going to be 1 or 2
  if (policy.fastTrack.includes(remediation.id) && tier === 'TIER_2_AUTO_NOTIFY') {
    return 'TIER_1_AUTO';
  }

  // 4. Non-negotiable guard (section 4) — re-enforced here regardless of policy bugs
  if (remediation.destructive) {
    return 'TIER_3_APPROVAL_REQUIRED';
  }

  return tier;
}
```

Note `applyPolicyOverrides` re-checks `remediation.destructive` at the very end as a defensive guard, even though policy validation (section 5.2) should already prevent a bad policy file from reaching this point. Two layers of enforcement for the one rule that must never break is the right amount of paranoia for something you'll say out loud on stage.

### 5.5 API additions

```
GET    /api/chaos/policies              -> list available policy profiles (id, label, description)
GET    /api/chaos/policies/active       -> currently active policy for the session
PATCH  /api/chaos/policies/active        { orgId }  -> switch active policy (takes effect on next trigger)
```

Switching policy mid-demo should **not** retroactively change an already-resolved incident — only affects the next `trigger` call. Keep this simple for the demo; don't try to support "replay this incident under a different policy" unless you have spare build time, since it's a nice-to-have, not the core point.

### 5.6 Frontend: Policy Selector component

```
/src/components/chaos-cure/PolicySelector.jsx
```

A simple segmented control or dropdown above the scenario picker:

```
Policy:  [ Conservative ]  [ Balanced ]  [ Aggressive ]
```

Behavior:
- Fetches profiles from `GET /api/chaos/policies` on mount
- `PATCH`es the active policy on selection
- Shows a one-line description under the selector (pull from the profile's `description` field) so judges immediately understand what they're toggling — e.g. *"Balanced: default risk posture, suitable for most SaaS companies."*

### 5.7 The strongest live demo move this unlocks

Trigger the **same scenario twice in a row**, switching policy in between, and let the terminal log show the divergence:

```
Run 1 — Policy: Conservative
[RISK]   action_score=0.91 → policy override (revoke-key forced) → TIER_3_APPROVAL_REQUIRED
[WAIT]   Awaiting human approval...

Run 2 — Policy: Aggressive
[RISK]   action_score=0.91 → fast-tracked by policy → TIER_1_AUTO
[CURE]   ✓ Resolved automatically in 0.3s
```

This is a much stronger answer to "but every company is different" than anything you could say in words — you're showing the same AI reasoning, same math, producing different real-world behavior because the *policy*, not the model, changed. That's the line to say out loud: *"The AI's judgment doesn't change between these two runs — the company's risk policy does. That's the part we made configurable, on purpose."*

---

## 6. Suggested build order for the code agent

1. `stateStore.js` + `riskScorer.js` (pure, testable, no deps)
2. One scenario (`cryptojacking.js`) end-to-end through `incidentManager.js` with console logging only — verify tick loop and tier assignment work
3. WebSocket layer + REST routes
4. Remaining scenarios (registry pattern makes these fast)
5. Frontend `useChaosSocket` hook + terminal log streaming
6. Risk readout + cost counter components
7. Approval panel + rollback control
8. Scenario picker UI
9. Polish: color coding, tier badges, reasoning trace formatting
10. Stress-test: trigger rapid repeated incidents, confirm 409 lockout works, confirm rollback only works on reversible actions even via direct API call (security check, not just UI gating)

---

## 7. What to say on stage (tie-back to the framework)

> "We don't ask 'should the AI act or should a human act.' For every incident, we compute how reversible the fix is and how confident we are it's real. If it's safe to undo, the AI acts immediately — you can see the cost-of-inaction counter freeze the instant it does. If the action is destructive, the AI always stops and asks — no exception, no matter how confident it is. That part is fixed, in code, for every company. What's configurable is how cautious that company wants to be — watch what happens when I switch from a conservative bank policy to an aggressive startup policy on the exact same incident."