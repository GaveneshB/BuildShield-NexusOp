// Universal risk scoring engine
// Implements: action_score = confidence × reversibility × (1 - blast_radius)
// This math is the same for every organization; policies override tier assignment

const DEFAULT_THRESHOLDS = {
  tier1Min: 0.85,
  tier2Min: 0.55,
  tier3MinWithUrgency: 0.40,
  urgencyEscalation: 0.5, // cost-per-second above which we lean toward acting
};

function computeRiskScore({ severityPerSecond, confidence, blastRadius, reversibility }) {
  // action_score: how safe/clear it is to act automatically
  // higher = safer to execute without human review
  const actionScore = confidence * reversibility * (1 - blastRadius);

  // urgency: how costly waiting is (used for display + tie-breaking)
  // higher = more expensive to delay (e.g., $500/sec data exfiltration)
  const urgency = severityPerSecond;

  return {
    actionScore,
    urgency,
    confidence,
    blastRadius,
    reversibility,
    severityPerSecond,
  };
}

function assignTier(riskScore, thresholds = DEFAULT_THRESHOLDS) {
  const { actionScore, urgency } = riskScore;

  if (actionScore >= thresholds.tier1Min) {
    return 'TIER_1_AUTO';
  }

  if (actionScore >= thresholds.tier2Min) {
    return 'TIER_2_AUTO_NOTIFY';
  }

  // High cost of waiting + moderate confidence: escalate to Tier 2 but keep human window short
  if (urgency >= thresholds.urgencyEscalation && actionScore >= thresholds.tier3MinWithUrgency) {
    return 'TIER_2_AUTO_NOTIFY';
  }

  return 'TIER_3_APPROVAL_REQUIRED';
}

function buildReasoningTrace(scenario, chosenRemediation, tier, riskScore) {
  return (
    `Detected ${scenario.label} — confidence ${(riskScore.confidence * 100).toFixed(0)}%, ` +
    `blast radius ${(riskScore.blastRadius * 100).toFixed(0)}%, reversibility ${(riskScore.reversibility * 100).toFixed(0)}%. ` +
    `Action score ${riskScore.actionScore.toFixed(2)} → ${tier}. ` +
    `Executing "${chosenRemediation.label}" (${chosenRemediation.reversible ? 'reversible' : 'IRREVERSIBLE'}).`
  );
}

module.exports = {
  computeRiskScore,
  assignTier,
  buildReasoningTrace,
  DEFAULT_THRESHOLDS,
};
