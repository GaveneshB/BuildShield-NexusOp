// Scenario: Insider Threat
// Anomalous data access pattern from legitimate account

module.exports = {
  id: 'insiderThreat',
  label: 'Insider Threat - Anomalous Access Pattern',
  category: 'identity',
  description: 'Suspicious data access from legitimate user account',

  inject: (stateStore) => {
    stateStore.mutateResource('api-key-7741', {
      status: 'suspicious',
      anomalyScore: 0.92,
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    return { metric: 'rowsLeaked', value: 200 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.38,
    confidence: 0.79,
    blastRadius: 0.28,
    reversibility: 0.85,
  }),

  remediations: [
    {
      id: 'flag-session',
      label: 'Flag suspicious session',
      reversible: true,
      destructive: false,
    },
    {
      id: 'suspend-session',
      label: 'Suspend user session',
      reversible: true,
      destructive: false,
    },
    {
      id: 'require-mfa',
      label: 'Require MFA re-authentication',
      reversible: true,
      destructive: false,
    },
    {
      id: 'revoke-account',
      label: 'Revoke account credentials',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'flag-session':
        return { success: true, message: 'Session flagged for review' };
      case 'suspend-session':
        stateStore.mutateResource('api-key-7741', { status: 'suspended' });
        return { success: true, message: 'User session suspended' };
      case 'require-mfa':
        return { success: true, message: 'MFA challenge required' };
      case 'revoke-account':
        stateStore.mutateResource('api-key-7741', { status: 'revoked' });
        return { success: true, message: 'Account credentials revoked' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'suspend-session':
        stateStore.mutateResource('api-key-7741', { status: 'active' });
        return { success: true, message: 'Session restored' };
      default:
        return { success: false };
    }
  },
};
