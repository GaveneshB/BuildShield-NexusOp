// Decision router: score → tier assignment → remediation selection
// Applies universal scoring, then org policy overrides

const { computeRiskScore, assignTier, buildReasoningTrace } = require('./riskScorer');

/**
 * HARD SAFETY RULE — DO NOT MAKE THIS CONFIGURABLE:
 * Destructive / irreversible remediations (shutdown, delete, customer notification,
 * account termination) can NEVER be assigned to Tier 1 or Tier 2, regardless of
 * confidence score. They always route to Tier 3 (human approval required).
 * Only severity/urgency scoring and tier-1/2 thresholds are tunable at runtime.
 */

const { evaluateIncident } = require('./aiRiskScorer');

async function routeIncident(scenario, stateStore, policy) {
  // Step 1: AI Risk scoring and remediation selection
  const aiDecision = await evaluateIncident(scenario, policy, stateStore);

  // Fallback to scenario defaults if AI returned invalid remediation
  let chosenRemediation = scenario.remediations.find(r => r.id === aiDecision.aiRemediationId);
  if (!chosenRemediation) {
    chosenRemediation = scenario.remediations[0]; // fallback
  }

  let tier = aiDecision.aiTier;

  // Step 2: Apply policy overrides (hard caps, fast tracks) — these always win over AI
  tier = applyPolicyOverrides({
    tier,
    remediation: chosenRemediation,
    scenario,
    stateStore,
    policy,
  });

  // Step 3: Non-negotiable safety guard — NEVER let AI or policy auto-run destructive actions
  if (chosenRemediation.destructive && tier !== 'TIER_3_APPROVAL_REQUIRED') {
    tier = 'TIER_3_APPROVAL_REQUIRED';
  }

  return {
    riskScore: {
      actionScore: aiDecision.actionScore,
      urgency: aiDecision.urgency,
      confidence: aiDecision.confidence,
      blastRadius: aiDecision.blastRadius,
      reversibility: aiDecision.reversibility,
    },
    tier,
    chosenRemediation,
    scenario,
    policyApplied: policy.orgId,
    reasoning: aiDecision.reasoning,
  };
}

function applyPolicyOverrides({ tier, remediation, scenario, stateStore, policy }) {
  // 1. Hard caps by remediation ID — highest priority
  if (policy.hardCaps && policy.hardCaps[remediation.id]) {
    return policy.hardCaps[remediation.id];
  }

  // 2. Fast-track — only relevant if tier was already going to be 1 or 2
  if (policy.fastTrack && policy.fastTrack.includes(remediation.id)) {
    if (tier === 'TIER_2_AUTO_NOTIFY') {
      return 'TIER_1_AUTO';
    }
  }

  // 3. Non-negotiable guard — re-enforced here regardless of policy bugs
  if (remediation.destructive) {
    return 'TIER_3_APPROVAL_REQUIRED';
  }

  return tier;
}

module.exports = {
  routeIncident,
  applyPolicyOverrides,
};
