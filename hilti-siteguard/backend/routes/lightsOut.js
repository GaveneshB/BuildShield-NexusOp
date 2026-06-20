const router = require('express').Router();
const { db } = require('../firebase');

const APP_ID = 'buildshield-nexusop';
const DOC_PATH = `artifacts/${APP_ID}/lightsOut/current`;

// GET schedule
router.get('/schedule', async (req, res) => {
  try {
    const docRef = db.doc(DOC_PATH);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      res.json(docSnap.data());
    } else {
      res.json({ shiftStart: 7, shiftEnd: 17, isActive: false, timezone: 'MYT (UTC+8)', serverId: 'ap-southeast-1' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST update schedule
router.post('/schedule', async (req, res) => {
  try {
    const { shiftStart, shiftEnd, isActive, timezone, serverId } = req.body;
    const docRef = db.doc(DOC_PATH);
    const updateData = {
      shiftStart: Number(shiftStart),
      shiftEnd: Number(shiftEnd),
      isActive: Boolean(isActive),
      timezone: timezone || 'MYT (UTC+8)',
      serverId: serverId || 'ap-southeast-1',
      updatedAt: Date.now()
    };
    await docRef.set(updateData, { merge: true });
    res.json({ success: true, data: updateData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST toggle active status
router.post('/toggle', async (req, res) => {
  try {
    const { isActive } = req.body;
    const docRef = db.doc(DOC_PATH);
    const docSnap = await docRef.get();
    
    let nextActive = Boolean(isActive);
    if (isActive === undefined && docSnap.exists) {
      nextActive = !docSnap.data().isActive;
    }
    
    await docRef.set({
      isActive: nextActive,
      updatedAt: Date.now()
    }, { merge: true });
    
    res.json({ success: true, isActive: nextActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
