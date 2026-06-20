// Incident manager: orchestrates full incident lifecycle
// - Injects scenario
// - Manages tick loop for cost-of-inaction
// - Routes to decision engine
// - Executes cure or waits for approval

const { routeIncident } = require('./decisionRouter');
const { executeCure, rollbackCure } = require('./cureExecutor');

class IncidentManager {
  constructor(stateStore, emit) {
    this.stateStore = stateStore;
    this.emit = emit;
    this.tickIntervals = {}; // incidentId -> intervalId
  }

  async startIncident(scenario, policy) {
    // Check if already active
    if (this.stateStore.hasActiveIncident()) {
      return { error: 'CONFLICT', message: 'An incident is already active' };
    }

    // Inject the scenario chaos
    scenario.inject(this.stateStore);

    // Route the incident through decision engine
    const decision = await routeIncident(scenario, this.stateStore, policy);

    // Create incident record
    const incidentId = this.stateStore.createIncident(scenario, decision.tier, decision.riskScore);
    const incident = this.stateStore.getIncident(incidentId);

    // Emit: incident started
    this.emit('incident:started', {
      incidentId,
      scenario: {
        id: scenario.id,
        label: scenario.label,
        category: scenario.category,
      },
      startedAt: incident.startedAt,
    });

    // Emit: risk assessed with reasoning
    this.emit('incident:risk-assessed', {
      incidentId,
      riskScore: decision.riskScore,
      tier: decision.tier,
      reasoning: decision.reasoning,
    });

    // Start cost-of-inaction tick loop
    this.startCostTick(incidentId, scenario);

    // If Tier 1 or 2: execute immediately
    if (decision.tier === 'TIER_1_AUTO' || decision.tier === 'TIER_2_AUTO_NOTIFY') {
      this.executeCure(incidentId, scenario, decision.chosenRemediation, decision.tier);

      if (decision.tier === 'TIER_2_AUTO_NOTIFY') {
        this.emit('incident:notified', {
          incidentId,
          message: 'Action executed. Human review recommended.',
        });
      }
    } else {
      // Tier 3: wait for approval
      this.stateStore.setProposedRemediation(incidentId, decision.chosenRemediation);
      this.emit('incident:approval-needed', {
        incidentId,
        proposedRemediation: decision.chosenRemediation,
        riskScore: decision.riskScore,
        reasoning: decision.reasoning,
      });
    }

    return { success: true, incidentId };
  }

  startCostTick(incidentId, scenario) {
    const interval = setInterval(() => {
      const incident = this.stateStore.getIncident(incidentId);
      if (!incident) {
        clearInterval(this.tickIntervals[incidentId]);
        delete this.tickIntervals[incidentId];
        return;
      }

      // Only tick while active (not cured, denied, or rolled back)
      if (incident.status !== 'active') {
        clearInterval(this.tickIntervals[incidentId]);
        delete this.tickIntervals[incidentId];
        return;
      }

      const costInfo = scenario.tickInactionCost(
        (Date.now() - incident.startedAt) / 1000,
        this.stateStore
      );

      this.stateStore.updateIncidentCost(incidentId, 0); // Just update elapsed time
      this.emit('incident:cost-update', {
        incidentId,
        metric: costInfo.metric,
        value: costInfo.value,
        elapsedSeconds: (Date.now() - incident.startedAt) / 1000,
      });
    }, 1000);

    this.tickIntervals[incidentId] = interval;
  }

  executeCure(incidentId, scenario, remediation, tier) {
    const incident = this.stateStore.getIncident(incidentId);
    if (!incident || incident.status !== 'active') {
      return { error: 'NOT_FOUND' };
    }

    // Stop cost-of-inaction tick
    if (this.tickIntervals[incidentId]) {
      clearInterval(this.tickIntervals[incidentId]);
      delete this.tickIntervals[incidentId];
    }

    // Execute the remediation
    executeCure(
      { scenario, chosenRemediation: remediation, tier, riskScore: incident.riskScore },
      this.stateStore,
      (event, data) => this.emit(event, { incidentId, ...data })
    );

    // Mark as cured
    this.stateStore.setCuredRemediation(incidentId, remediation);

    // Emit cure executed
    this.emit('incident:cure-executed', {
      incidentId,
      remediationId: remediation.id,
      remediationLabel: remediation.label,
      tier,
      rollbackAvailable: remediation.reversible,
    });

    return { success: true };
  }

  approveIncident(incidentId, scenario) {
    const incident = this.stateStore.getIncident(incidentId);
    if (!incident || incident.status !== 'active') {
      return { error: 'NOT_FOUND' };
    }

    if (!incident.proposedRemediation) {
      return { error: 'NO_PROPOSAL' };
    }

    this.executeCure(incidentId, scenario, incident.proposedRemediation, incident.tier);

    this.emit('incident:approved', {
      incidentId,
      by: 'human',
    });

    return { success: true };
  }

  denyIncident(incidentId) {
    const incident = this.stateStore.getIncident(incidentId);
    if (!incident) {
      return { error: 'NOT_FOUND' };
    }

    // Stop cost-of-inaction tick
    if (this.tickIntervals[incidentId]) {
      clearInterval(this.tickIntervals[incidentId]);
      delete this.tickIntervals[incidentId];
    }

    this.stateStore.setDenied(incidentId);
    this.emit('incident:denied', {
      incidentId,
      by: 'human',
    });

    return { success: true };
  }

  rollbackIncident(incidentId, scenario) {
    const incident = this.stateStore.getIncident(incidentId);
    if (!incident) {
      return { error: 'NOT_FOUND' };
    }

    if (!incident.appliedRemediation) {
      return { error: 'NO_REMEDIATION_TO_ROLLBACK' };
    }

    if (!incident.appliedRemediation.reversible) {
      return { error: 'NOT_REVERSIBLE' };
    }

    rollbackCure(
      { scenario, remediationId: incident.appliedRemediation.id },
      this.stateStore,
      (event, data) => this.emit(event, { incidentId, ...data })
    );

    this.stateStore.setRolledBack(incidentId);

    this.emit('incident:rolled-back', {
      incidentId,
      remediationId: incident.appliedRemediation.id,
    });

    return { success: true };
  }

  clearAllIncidents() {
    // Stop all tick intervals
    Object.values(this.tickIntervals).forEach(interval => clearInterval(interval));
    this.tickIntervals = {};
    this.stateStore.clearActiveIncidents();
  }
}

module.exports = IncidentManager;
