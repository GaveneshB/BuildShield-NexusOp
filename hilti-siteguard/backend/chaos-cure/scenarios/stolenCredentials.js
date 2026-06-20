// Scenario: Stolen Cloud Credentials Detected
// Highly privileged cloud credentials used from a known-malicious Tor exit node.

module.exports = {
  id: 'stolenCredentials',
  label: 'Stolen Cloud Credentials',
  category: 'identity',
  description: 'Highly privileged cloud credentials used from a known-malicious Tor exit node.',

  inject: (stateStore) => {
    stateStore.mutateResource('api-key-7741', {
      status: 'compromised',
      lastIp: 'Tor Exit Node (198.51.100.12)',
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    // Very high cost: potential full cloud account takeover
    return { metric: 'usd', value: 500 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.90, // Extremely urgent
    confidence: 0.98, // Tor exit node + impossible travel = high confidence
    blastRadius: 0.85, // Could destroy the entire cloud environment
    reversibility: 0.99, // Revoking keys is very reversible
  }),

  remediations: [
    {
      id: 'revoke-key',
      label: 'Revoke compromised API Key immediately',
      reversible: true,
      destructive: false,
    },
    {
      id: 'suspend-user',
      label: 'Suspend the associated IAM User account',
      reversible: true,
      destructive: false,
    },
    {
      id: 'nuke-infrastructure',
      label: 'Terminate all cloud instances spawned by this user (Nuke)',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'revoke-key':
        stateStore.mutateResource('api-key-7741', { revoked: true, status: 'secured' });
        return { success: true, message: 'API Key revoked successfully.' };
      case 'suspend-user':
        stateStore.mutateResource('api-key-7741', { status: 'suspended' });
        return { success: true, message: 'IAM User account suspended.' };
      case 'nuke-infrastructure':
        stateStore.mutateResource('api-key-7741', { status: 'nuked' });
        return { success: true, message: 'All associated infrastructure terminated.' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'revoke-key':
        stateStore.mutateResource('api-key-7741', { revoked: false, status: 'active' });
        return { success: true, message: 'API Key restored.' };
      case 'suspend-user':
        stateStore.mutateResource('api-key-7741', { status: 'active' });
        return { success: true, message: 'IAM User account activated.' };
      default:
        return { success: false };
    }
  },
};
