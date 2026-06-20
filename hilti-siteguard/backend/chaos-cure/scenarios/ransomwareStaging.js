// Scenario: Ransomware Staging
// Precursor signals of mass file-encryption attack

module.exports = {
  id: 'ransomwareStaging',
  label: 'Ransomware Staging Indicators Detected',
  category: 'infra-integrity',
  description: 'Mass file-encryption precursor signals detected',

  inject: (stateStore) => {
    stateStore.mutateResource('vm-prod-01', {
      status: 'compromised',
      cpuLoad: 0.72,
      fileOpsSpike: true,
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    return { metric: 'usd', value: 200 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.58,
    confidence: 0.85,
    blastRadius: 0.78,
    reversibility: 0.52,
  }),

  remediations: [
    {
      id: 'snapshot-host',
      label: 'Create emergency snapshot',
      reversible: true,
      destructive: false,
    },
    {
      id: 'isolate-host',
      label: 'Isolate host to air-gapped network',
      reversible: true,
      destructive: false,
    },
    {
      id: 'kill-process',
      label: 'Kill suspicious processes',
      reversible: true,
      destructive: false,
    },
    {
      id: 'full-shutdown',
      label: 'Full system shutdown',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'snapshot-host':
        return { success: true, message: 'Emergency snapshot created' };
      case 'isolate-host':
        stateStore.mutateResource('vm-prod-01', { quarantined: true });
        return { success: true, message: 'Host isolated to air-gapped network' };
      case 'kill-process':
        stateStore.mutateResource('vm-prod-01', { fileOpsSpike: false });
        return { success: true, message: 'Suspicious processes terminated' };
      case 'full-shutdown':
        stateStore.mutateResource('vm-prod-01', { status: 'offline' });
        return { success: true, message: 'System shut down' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'isolate-host':
        stateStore.mutateResource('vm-prod-01', { quarantined: false });
        return { success: true, message: 'Host reintegrated to network' };
      default:
        return { success: false };
    }
  },
};
