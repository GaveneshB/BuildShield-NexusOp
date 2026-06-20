const { db, admin } = require('../firebase');
const cloudProvider = require('./cloudProvider');

const APP_ID = 'buildshield-nexusop';
const DOC_PATH = `artifacts/${APP_ID}/lightsOut/current`;

// Map front-end timezone names to standard IANA timezone identifiers
const TZ_MAP = {
  'MYT (UTC+8)': 'Asia/Kuala_Lumpur',
  'SGT (UTC+8)': 'Asia/Singapore',
  'EST (UTC-5)': 'America/New_York',
  'CET (UTC+1)': 'Europe/Berlin'
};

// Check if a resource is non-critical (eligible for Lights Out pausing)
function isNonCritical(resourceName) {
  const nameLower = resourceName.toLowerCase();
  // Main, production, and hq resources are critical; others are paused
  return !nameLower.includes('prod') && !nameLower.includes('hq') && !nameLower.includes('main');
}

async function checkAndApplySchedule() {
  try {
    const docRef = db.doc(DOC_PATH);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      // If no schedule exists, default to inactive
      return;
    }
    
    const schedule = docSnap.data();
    const { shiftStart, shiftEnd, isActive, timezone } = schedule;
    
    // Resolve IANA timezone
    const ianaTz = TZ_MAP[timezone] || 'Asia/Kuala_Lumpur';
    
    // Get current hour in the jobsite's target timezone
    const timeString = new Date().toLocaleString("en-US", { timeZone: ianaTz });
    const localTime = new Date(timeString);
    const currentHour = localTime.getHours();
    
    // If the schedule is NOT active, ensure no resources remain paused
    if (!isActive) {
      await resumeAllPausedResources();
      return;
    }
    
    // Determine if it is currently "Lights Out" (off-shift hours)
    const isOffShift = currentHour < shiftStart || currentHour >= shiftEnd;
    
    if (isOffShift) {
      await pauseNonCriticalResources(schedule, currentHour);
    } else {
      await resumeAllPausedResources();
    }
    
  } catch (err) {
    console.error("[LIGHTS OUT SCHEDULER ERROR] Failed to run check:", err.message);
  }
}

async function pauseNonCriticalResources(schedule, currentHour) {
  const resourcesSnap = await db.collection('cloudResources')
    .where('status', 'in', ['active', 'idle'])
    .get();
    
  if (resourcesSnap.empty) return;
  
  const batch = db.batch();
  let pausedCount = 0;
  
  for (const doc of resourcesSnap.docs) {
    const res = doc.data();
    if (isNonCritical(res.name)) {
      console.log(`[LIGHTS OUT] Pausing non-critical resource ${res.name} (Tag: ${res.resourceTag}) during off-shift hour ${currentHour}`);
      
      // Simulate Cloud Provider Shutdown
      try {
        await cloudProvider.shutdown(res.provider, res.resourceType, res.resourceTag, res.region);
      } catch (err) {
        console.error(`[LIGHTS OUT] Cloud shutdown failed for ${res.name}:`, err.message);
      }
      
      // Calculate savings for the log (1 hour of savings since scheduler runs hourly/periodically)
      const energySaved = +(res.energyKwhPerDay / 24).toFixed(2);
      const carbonSaved = +(energySaved * 0.417).toFixed(2);
      const costSaved = +(res.monthlyCostUSD / 30 / 24).toFixed(2);
      
      // Update resource status in Firestore to 'paused'
      batch.update(doc.ref, {
        status: 'paused',
        pausedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Create audit log event
      const eventRef = db.collection('reapEvents').doc();
      batch.set(eventRef, {
        projectId: res.projectId,
        resourceId: doc.id,
        resourceName: res.name,
        resourceTag: res.resourceTag,
        action: 'lights_out_pause',
        trigger: 'lights_out_schedule',
        status: 'success',
        energySavedKwh: energySaved,
        costSavedUSD: costSaved,
        carbonSavedKg: carbonSaved,
        errorMessage: null,
        initiatedAt: admin.firestore.FieldValue.serverTimestamp(),
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      pausedCount++;
    }
  }
  
  if (pausedCount > 0) {
    await batch.commit();
    console.log(`[LIGHTS OUT] Successfully paused ${pausedCount} cloud resources.`);
  }
}

async function resumeAllPausedResources() {
  const resourcesSnap = await db.collection('cloudResources')
    .where('status', '==', 'paused')
    .get();
    
  if (resourcesSnap.empty) return;
  
  const batch = db.batch();
  let resumedCount = 0;
  
  for (const doc of resourcesSnap.docs) {
    const res = doc.data();
    console.log(`[LIGHTS OUT] Resuming paused resource ${res.name} (Tag: ${res.resourceTag}) for active shift`);
    
    // Simulate Cloud Provider Startup
    console.log(`[LIGHTS OUT] Starting up ${res.provider} ${res.resourceType} ${res.resourceTag} in ${res.region}`);
    
    // Update resource status back to 'active'
    batch.update(doc.ref, {
      status: 'active',
      resumedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create audit log event
    const eventRef = db.collection('reapEvents').doc();
    batch.set(eventRef, {
      projectId: res.projectId,
      resourceId: doc.id,
      resourceName: res.name,
      resourceTag: res.resourceTag,
      action: 'lights_out_resume',
      trigger: 'lights_out_schedule',
      status: 'success',
      energySavedKwh: 0,
      costSavedUSD: 0,
      carbonSavedKg: 0,
      errorMessage: null,
      initiatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    resumedCount++;
  }
  
  if (resumedCount > 0) {
    await batch.commit();
    console.log(`[LIGHTS OUT] Successfully resumed ${resumedCount} cloud resources.`);
  }
}

let intervalId = null;

function startScheduler(intervalMs = 15000) {
  if (intervalId) return;
  
  console.log(`[LIGHTS OUT SCHEDULER] Starting background check loop (every ${intervalMs / 1000}s)...`);
  // Run an immediate check first
  checkAndApplySchedule();
  
  intervalId = setInterval(checkAndApplySchedule, intervalMs);
}

function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[LIGHTS OUT SCHEDULER] Background check loop stopped.');
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
  checkAndApplySchedule
};
