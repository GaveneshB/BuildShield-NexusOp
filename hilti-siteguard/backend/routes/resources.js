const router = require('express').Router();
const { db, admin } = require('../firebase');

// GET resources (optionally filter by projectId)
router.get('/', async (req, res) => {
  try {
    let q = db.collection('cloudResources');
    if (req.query.projectId) q = q.where('projectId','==', req.query.projectId);
    const snap = await q.orderBy('createdAt','desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST register new cloud resource to a project
router.post('/', async (req, res) => {
  try {
    const { projectId, provider, resourceType, resourceTag,
            region, name, energyKwhPerDay, monthlyCostUSD } = req.body;
    const ref = await db.collection('cloudResources').add({
      projectId, provider, resourceType, resourceTag,
      region, name, energyKwhPerDay, monthlyCostUSD,
      status: 'active', reapedAt: null, reapedBy: null, lastActiveAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: ref.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (manual reap)
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('cloudResources').doc(req.params.id).update({
      status: 'reaped',
      reapedAt: admin.firestore.FieldValue.serverTimestamp(),
      reapedBy: 'manual'
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
