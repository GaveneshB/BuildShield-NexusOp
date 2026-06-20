const { db, admin } = require('../firebase');
const cloudProvider   = require('./cloudProvider');

// Called whenever a project status changes to completed/archived
async function triggerReap(projectId, trigger = 'project_completed') {
  const resourcesSnap = await db.collection('cloudResources')
    .where('projectId', '==', projectId)
    .where('status', 'in', ['active', 'idle'])
    .get();

  const batch = db.batch();
  const events = [];

  for (const doc of resourcesSnap.docs) {
    const res = doc.data();

    // Mark as pending_reap immediately
    batch.update(doc.ref, {
      status: 'pending_reap',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Attempt cloud shutdown
    let success = false;
    let errorMessage = null;
    try {
      await cloudProvider.shutdown(res.provider, res.resourceType, res.resourceTag, res.region);
      success = true;
    } catch (err) {
      errorMessage = err.message;
    }

    const energySaved  = +(res.energyKwhPerDay * 30).toFixed(2);
    const carbonSaved  = +(energySaved * 0.417).toFixed(2);
    const costSaved    = +(res.monthlyCostUSD).toFixed(2);

    // Create reap event
    const eventRef = db.collection('reapEvents').doc();
    events.push({ ref: eventRef, energySaved, carbonSaved, costSaved, success, errorMessage, res });

    batch.set(eventRef, {
      projectId, resourceId: doc.id,
      resourceName: res.name, resourceTag: res.resourceTag,
      action: 'shutdown', trigger,
      status: success ? 'success' : 'failed',
      energySavedKwh: energySaved, costSavedUSD: costSaved, carbonSavedKg: carbonSaved,
      errorMessage,
      initiatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: success ? admin.firestore.FieldValue.serverTimestamp() : null
    });

    // Final resource status
    batch.update(doc.ref, {
      status: success ? 'reaped' : 'active',
      reapedAt: success ? admin.firestore.FieldValue.serverTimestamp() : null,
      reapedBy: 'auto'
    });
  }

  // Update global summary
  const succeeded = events.filter(e => e.success);
  if (succeeded.length > 0) {
    const summaryRef = db.collection('reapSummary').doc('global');
    batch.update(summaryRef, {
      totalResourcesReaped: admin.firestore.FieldValue.increment(succeeded.length),
      totalEnergySavedKwh:  admin.firestore.FieldValue.increment(succeeded.reduce((a,e)=>a+e.energySaved,0)),
      totalCostSavedUSD:    admin.firestore.FieldValue.increment(succeeded.reduce((a,e)=>a+e.costSaved,0)),
      totalCarbonSavedKg:   admin.firestore.FieldValue.increment(succeeded.reduce((a,e)=>a+e.carbonSaved,0)),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();
  return { triggered: resourcesSnap.size, succeeded: succeeded.length };
}

module.exports = { triggerReap };
