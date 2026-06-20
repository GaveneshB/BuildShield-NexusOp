const express = require('express');
const router = express.Router();

// Initialize routes with a manager - caller must pass manager as middleware or attach to app
// We'll use app.use((req, res, next) => { req.incidentManager = manager; next() })

router.post('/trigger', async (req, res) => {
  const { scenarioId } = req.body;
  const incidentManager = req.incidentManager;
  const scenarios = req.scenarios;
  const policy = req.policy;

  if (!incidentManager) {
    return res.status(500).json({ error: 'Manager not initialized' });
  }

  // Pick scenario (random if not specified)
  let scenario;
  if (scenarioId) {
    scenario = scenarios[scenarioId];
  } else {
    // Random scenario
    const keys = Object.keys(scenarios);
    scenario = scenarios[keys[Math.floor(Math.random() * keys.length)]];
  }

  if (!scenario) {
    return res.status(400).json({ error: 'Invalid scenario' });
  }

  const result = await incidentManager.startIncident(scenario, policy);

  if (result.error === 'CONFLICT') {
    return res.status(409).json(result);
  }

  if (result.error) {
    return res.status(500).json(result);
  }

  res.json(result);
});

router.post('/:incidentId/approve', (req, res) => {
  const { incidentId } = req.params;
  const incidentManager = req.incidentManager;
  const stateStore = req.stateStore;
  const scenarios = req.scenarios;

  if (!incidentManager) {
    return res.status(500).json({ error: 'Manager not initialized' });
  }

  const incident = stateStore.getIncident(incidentId);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const scenario = scenarios[incident.scenarioId];
  if (!scenario) {
    return res.status(500).json({ error: 'Scenario not found' });
  }

  const result = incidentManager.approveIncident(incidentId, scenario);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

router.post('/:incidentId/deny', (req, res) => {
  const { incidentId } = req.params;
  const incidentManager = req.incidentManager;
  const stateStore = req.stateStore;

  if (!incidentManager) {
    return res.status(500).json({ error: 'Manager not initialized' });
  }

  const incident = stateStore.getIncident(incidentId);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const result = incidentManager.denyIncident(incidentId);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

router.post('/:incidentId/rollback', (req, res) => {
  const { incidentId } = req.params;
  const incidentManager = req.incidentManager;
  const stateStore = req.stateStore;
  const scenarios = req.scenarios;

  if (!incidentManager) {
    return res.status(500).json({ error: 'Manager not initialized' });
  }

  const incident = stateStore.getIncident(incidentId);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const scenario = scenarios[incident.scenarioId];
  if (!scenario) {
    return res.status(500).json({ error: 'Scenario not found' });
  }

  const result = incidentManager.rollbackIncident(incidentId, scenario);

  if (result.error) {
    return res.status(400).json(result);
  }

  res.json(result);
});

router.get('/scenarios', (req, res) => {
  const scenarios = req.scenarios;
  const list = Object.keys(scenarios).map(key => {
    const s = scenarios[key];
    return {
      id: s.id,
      label: s.label,
      category: s.category,
      description: s.description,
    };
  });
  res.json(list);
});

router.get('/:incidentId', (req, res) => {
  const { incidentId } = req.params;
  const stateStore = req.stateStore;

  const incident = stateStore.getIncident(incidentId);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  res.json(incident);
});

router.get('/config', (req, res) => {
  const policy = req.policy;
  res.json({
    orgId: policy.orgId,
    label: policy.label,
    thresholds: policy.thresholds,
  });
});

router.patch('/config', (req, res) => {
  const { thresholds } = req.body;
  const policy = req.policy;

  if (!thresholds) {
    return res.status(400).json({ error: 'thresholds required' });
  }

  Object.assign(policy.thresholds, thresholds);
  res.json({
    orgId: policy.orgId,
    label: policy.label,
    thresholds: policy.thresholds,
  });
});

module.exports = router;
