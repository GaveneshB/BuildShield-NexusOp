// Conservative Policy: Bank/Healthcare - Very cautious, high approval gates

module.exports = {
  orgId: 'conservative',
  label: 'Conservative — Bank/Healthcare',
  description: 'High approval gates, suitable for highly regulated industries',

  thresholds: {
    tier1Min: 0.95,
    tier2Min: 0.80,
    tier3MinWithUrgency: 0.65,
    urgencyEscalation: 0.8,
  },

  hardCaps: {
    'revoke-key': 'TIER_3_APPROVAL_REQUIRED',
    'isolate-vm': 'TIER_3_APPROVAL_REQUIRED',
    'isolate-host': 'TIER_3_APPROVAL_REQUIRED',
    'isolate-network': 'TIER_3_APPROVAL_REQUIRED',
  },

  fastTrack: [],

  dataClassificationOverrides: {
    pii: 'TIER_3_APPROVAL_REQUIRED',
    financial: 'TIER_3_APPROVAL_REQUIRED',
  },
};
