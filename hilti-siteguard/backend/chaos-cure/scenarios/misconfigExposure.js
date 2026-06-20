// Scenario: Misconfiguration Exposure
// Open S3-equivalent bucket / open port / exposed secret

module.exports = {
  id: 'misconfigExposure',
  label: 'Misconfiguration Exposure Detected',
  category: 'infra-integrity',
  description: 'Open bucket or port exposing sensitive data',

  inject: (stateStore) => {
    stateStore.mutateResource('dataset-customers', {
      status: 'exposed',
      publiclyAccessible: true,
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    return { metric: 'rowsLeaked', value: 300 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.45,
    confidence: 0.96,
    blastRadius: 0.35,
    reversibility: 0.98,
  }),

  remediations: [
    {
      id: 'fix-acl',
      label: 'Fix bucket/port ACLs',
      reversible: true,
      destructive: false,
    },
    {
      id: 'rotate-secrets',
      label: 'Rotate exposed secrets',
      reversible: true,
      destructive: false,
    },
    {
      id: 'disable-public-access',
      label: 'Disable public access flag',
      reversible: true,
      destructive: false,
    },
    {
      id: 'delete-bucket',
      label: 'Delete exposed resource',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'fix-acl':
        stateStore.mutateResource('dataset-customers', { status: 'restricted' });
        return { success: true, message: 'ACLs corrected to private' };
      case 'rotate-secrets':
        return { success: true, message: 'Exposed secrets rotated' };
      case 'disable-public-access':
        stateStore.mutateResource('dataset-customers', { publiclyAccessible: false });
        return { success: true, message: 'Public access flag disabled' };
      case 'delete-bucket':
        stateStore.mutateResource('dataset-customers', { status: 'deleted' });
        return { success: true, message: 'Exposed resource deleted' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'fix-acl':
        stateStore.mutateResource('dataset-customers', { status: 'exposed' });
        return { success: true, message: 'ACLs reverted' };
      case 'disable-public-access':
        stateStore.mutateResource('dataset-customers', { publiclyAccessible: true });
        return { success: true, message: 'Public access re-enabled' };
      default:
        return { success: false };
    }
  },
};
