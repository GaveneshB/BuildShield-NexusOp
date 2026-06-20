// In-memory state store for incidents and resources
// All mutations are logged to audit trail for compliance

class StateStore {
  constructor() {
    this.resources = {
      'vm-prod-01': { status: 'healthy', cpuLoad: 0.10, quarantined: false },
      'api-key-7741': { status: 'active', revoked: false },
      'dataset-customers': { status: 'sealed', rowsLeaked: 0 },
    };

    this.activeIncidents = {}; // incidentId -> incident object
    this.auditLog = []; // append-only event log
    this.nextIncidentId = 1;
  }

  createIncident(scenario, tier, riskScore) {
    const incidentId = String(this.nextIncidentId++);
    const incident = {
      incidentId,
      scenarioId: scenario.id,
      scenarioLabel: scenario.label,
      category: scenario.category,
      startedAt: Date.now(),
      status: 'active', // active | awaiting-approval | cured | denied | rolled-back
      tier,
      riskScore,
      proposedRemediation: null,
      appliedRemediation: null,
      costAccumulated: 0,
      elapsedSeconds: 0,
      tickInterval: null,
    };

    this.activeIncidents[incidentId] = incident;
    this.logEvent({
      type: 'INCIDENT_CREATED',
      incidentId,
      scenarioId: scenario.id,
      tier,
      riskScore,
      timestamp: Date.now(),
    });

    return incidentId;
  }

  getIncident(incidentId) {
    return this.activeIncidents[incidentId];
  }

  updateIncidentCost(incidentId, costDelta) {
    const incident = this.activeIncidents[incidentId];
    if (!incident) return;

    incident.costAccumulated += costDelta;
    incident.elapsedSeconds = (Date.now() - incident.startedAt) / 1000;
  }

  setProposedRemediation(incidentId, remediation) {
    const incident = this.activeIncidents[incidentId];
    if (!incident) return;
    incident.proposedRemediation = remediation;
  }

  setCuredRemediation(incidentId, remediation) {
    const incident = this.activeIncidents[incidentId];
    if (!incident) return;
    incident.appliedRemediation = remediation;
    incident.status = 'cured';
  }

  setDenied(incidentId) {
    const incident = this.activeIncidents[incidentId];
    if (!incident) return;
    incident.status = 'denied';
  }

  setRolledBack(incidentId) {
    const incident = this.activeIncidents[incidentId];
    if (!incident) return;
    incident.status = 'rolled-back';
  }

  clearActiveIncidents() {
    this.activeIncidents = {};
  }

  hasActiveIncident() {
    return Object.values(this.activeIncidents).some(incident => incident.status === 'active');
  }

  mutateResource(resourceId, updates) {
    if (this.resources[resourceId]) {
      Object.assign(this.resources[resourceId], updates);
    }
  }

  getResource(resourceId) {
    return this.resources[resourceId];
  }

  logEvent(event) {
    this.auditLog.push(event);
  }

  getAuditLog() {
    return [...this.auditLog];
  }
}

module.exports = StateStore;
