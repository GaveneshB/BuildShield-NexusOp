// Scenario: Mass Data Exfiltration
// Large dataset being copied to external S3-equivalent bucket

module.exports = {
  id: 'dataLeak',
  label: 'Mass Data Exfiltration Detected',
  category: 'data-exfiltration',
  description: 'Large dataset being copied to external storage',

  inject: (stateStore) => {
    stateStore.mutateResource('dataset-customers', {
      status: 'compromised',
      rowsLeaked: 45000,
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    return { metric: 'rowsLeaked', value: 1500 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.68,
    confidence: 0.87,
    blastRadius: 0.42,
    reversibility: 0.60,
  }),

  remediations: [
    {
      id: 'revoke-key',
      label: 'Revoke API key',
      reversible: true,
      destructive: false,
    },
    {
      id: 'isolate-network',
      label: 'Isolate network access',
      reversible: true,
      destructive: false,
    },
    {
      id: 'delete-copy',
      label: 'Delete exfiltrated copy',
      reversible: false,
      destructive: true,
    },
    {
      id: 'notify-customers',
      label: 'Notify affected customers',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'revoke-key':
        stateStore.mutateResource('api-key-7741', { revoked: true });
        return { success: true, message: 'API key revoked' };
      case 'isolate-network':
        stateStore.mutateResource('dataset-customers', { status: 'isolated' });
        return { success: true, message: 'Network access isolated' };
      case 'delete-copy':
        return { success: true, message: 'Exfiltrated copy deleted from external storage' };
      case 'notify-customers':
        return { success: true, message: 'Breach notification sent' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'revoke-key':
        stateStore.mutateResource('api-key-7741', { revoked: false });
        return { success: true, message: 'API key restored' };
      case 'isolate-network':
        stateStore.mutateResource('dataset-customers', { status: 'accessible' });
        return { success: true, message: 'Network access restored' };
      default:
        return { success: false };
    }
  },
};
