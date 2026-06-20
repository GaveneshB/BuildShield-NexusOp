// Policy types and validation
// Org-specific tier assignments and override rules

const defaultPolicyTemplate = {
  orgId: 'default',
  label: 'Default Balanced Policy',
  description: 'Balanced risk posture suitable for most SaaS companies',

  thresholds: {
    tier1Min: 0.85,
    tier2Min: 0.55,
    tier3MinWithUrgency: 0.40,
    urgencyEscalation: 0.5,
  },

  hardCaps: {},
  fastTrack: [],
  dataClassificationOverrides: {},
};

function validatePolicy(policy) {
  if (!policy || typeof policy !== 'object') {
    return { valid: false, error: 'Policy must be an object' };
  }

  if (!policy.orgId || !policy.label) {
    return { valid: false, error: 'Policy must have orgId and label' };
  }

  if (!policy.thresholds) {
    return { valid: false, error: 'Policy must have thresholds' };
  }

  // Check that hardCaps doesn't force destructive actions to Tier 1/2
  if (policy.hardCaps) {
    const destructiveRemediations = [
      'delete-data',
      'notify-customer',
      'shutdown-server',
      'revoke-account',
      'full-shutdown',
      'delete-bucket',
    ];

    for (const remId of Object.keys(policy.hardCaps)) {
      if (destructiveRemediations.includes(remId)) {
        const tier = policy.hardCaps[remId];
        if (tier !== 'TIER_3_APPROVAL_REQUIRED') {
          return {
            valid: false,
            error: `Destructive remediation '${remId}' cannot be fast-tracked to ${tier}`,
          };
        }
      }
    }
  }

  return { valid: true };
}

module.exports = {
  defaultPolicyTemplate,
  validatePolicy,
};
