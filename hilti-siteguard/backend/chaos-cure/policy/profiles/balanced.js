// Balanced Policy: Default - Middle ground, good for most SaaS

module.exports = {
  orgId: 'balanced',
  label: 'Balanced — Default',
  description: 'Default risk posture, suitable for most SaaS companies',

  thresholds: {
    tier1Min: 0.85,
    tier2Min: 0.55,
    tier3MinWithUrgency: 0.40,
    urgencyEscalation: 0.5,
  },

  hardCaps: {},

  fastTrack: ['throttle-process', 'rate-limit'],

  dataClassificationOverrides: {},
};
