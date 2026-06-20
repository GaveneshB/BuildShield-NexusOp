// Cure executor: runs remediations against state and logs all actions

function executeCure({ scenario, chosenRemediation, tier, riskScore }, stateStore, emit) {
  const startedAt = Date.now();

  // Execute the remediation against real state
  const result = scenario.applyRemediation(chosenRemediation.id, stateStore);

  // Log to audit trail
  const event = {
    type: 'CURE_EXECUTED',
    scenarioId: scenario.id,
    remediationId: chosenRemediation.id,
    remediationLabel: chosenRemediation.label,
    tier,
    riskScore,
    result,
    executedAt: startedAt,
    rollbackAvailable: chosenRemediation.reversible,
  };

  stateStore.logEvent(event);

  // Emit to frontend
  if (emit) {
    emit('incident:cure-executed', event);
  }

  return event;
}

function rollbackCure({ scenario, remediationId }, stateStore, emit) {
  const startedAt = Date.now();

  // Execute rollback against real state
  const result = scenario.rollbackRemediation(remediationId, stateStore);

  // Log to audit trail
  const event = {
    type: 'CURE_ROLLED_BACK',
    scenarioId: scenario.id,
    remediationId,
    result,
    rolledBackAt: startedAt,
  };

  stateStore.logEvent(event);

  // Emit to frontend
  if (emit) {
    emit('incident:rolled-back', event);
  }

  return event;
}

module.exports = {
  executeCure,
  rollbackCure,
};
