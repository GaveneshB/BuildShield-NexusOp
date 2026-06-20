const router = require('express').Router();
const { db, admin } = require('../firebase');
const { triggerReap } = require('../services/reaperService');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const snap = await db.collection('projects').orderBy('updatedAt','desc').get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create project
router.post('/', async (req, res) => {
  try {
    const { name, hiltiProjectId, managerId } = req.body;
    const ref = await db.collection('projects').add({
      name, hiltiProjectId, managerId,
      status: 'active', completedAt: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: ref.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status — triggers reap on complete/archived
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const ref = db.collection('projects').doc(req.params.id);
    const update = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(status === 'completed' ? { completedAt: admin.firestore.FieldValue.serverTimestamp() } : {})
    };
    await ref.update(update);

    let reapResult = null;
    if (status === 'completed' || status === 'archived') {
      reapResult = await triggerReap(req.params.id, `project_${status}`);
    }
    res.json({ success: true, reapResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
