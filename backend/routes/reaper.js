const router = require('express').Router();
const { db } = require('../firebase');
const { triggerReap } = require('../services/reaperService');

// GET reap events (latest 50)
router.get('/events', async (req, res) => {
  try {
    const snap = await db.collection('reapEvents')
      .orderBy('initiatedAt','desc').limit(50).get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET global summary
router.get('/summary', async (req, res) => {
  try {
    const doc = await db.collection('reapSummary').doc('global').get();
    res.json(doc.exists ? doc.data() : { totalResourcesReaped:0, totalEnergySavedKwh:0, totalCostSavedUSD:0, totalCarbonSavedKg:0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST manual reap trigger for a project
router.post('/trigger/:projectId', async (req, res) => {
  try {
    const result = await triggerReap(req.params.projectId, 'manual');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
