// Aggressive Policy: Startup/Gaming - Low approval gates, lots of automation

module.exports = {
  orgId: 'aggressive',
  label: 'Aggressive — Startup/Gaming',
  description: 'Aggressive automation, prioritizes speed over caution',

  thresholds: {
    tier1Min: 0.70,
    tier2Min: 0.40,
    tier3MinWithUrgency: 0.25,
    urgencyEscalation: 0.3,
  },

  hardCaps: {},

  fastTrack: [
    'throttle-process',
    'rate-limit',
    'isolate-vm',
    'kill-process',
    'blackhole-ip',
    'fix-acl',
    'disable-public-access',
  ],

  dataClassificationOverrides: {},
};
