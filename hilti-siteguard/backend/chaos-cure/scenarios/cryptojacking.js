// Scenario: Cryptojacking Energy Spike
// Unauthorized process consuming abnormal compute for crypto mining

module.exports = {
  id: 'cryptojacking',
  label: 'Cryptojacking Energy Spike',
  category: 'resource-abuse',
  description: 'Unauthorized process consuming abnormal compute for crypto mining',

  inject: (stateStore) => {
    stateStore.mutateResource('vm-prod-01', {
      status: 'compromised',
      cpuLoad: 0.94,
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    return { metric: 'usd', value: 85 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.42,
    confidence: 0.94,
    blastRadius: 0.15,
    reversibility: 0.95,
  }),

  remediations: [
    {
      id: 'throttle-process',
      label: 'Throttle suspicious process',
      reversible: true,
      destructive: false,
    },
    {
      id: 'isolate-vm',
      label: 'Isolate VM to quarantine VLAN',
      reversible: true,
      destructive: false,
    },
    {
      id: 'kill-process',
      label: 'Kill process',
      reversible: true,
      destructive: false,
    },
    {
      id: 'shutdown-server',
      label: 'Shut down production server',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    const resource = stateStore.getResource('vm-prod-01');
    if (!resource) return { success: false };

    switch (remediationId) {
      case 'throttle-process':
        stateStore.mutateResource('vm-prod-01', { cpuLoad: 0.11 });
        return { success: true, message: 'Process throttled, CPU normalized' };
      case 'isolate-vm':
        stateStore.mutateResource('vm-prod-01', { quarantined: true });
        return { success: true, message: 'VM isolated to quarantine VLAN' };
      case 'kill-process':
        stateStore.mutateResource('vm-prod-01', { cpuLoad: 0.08, status: 'clean' });
        return { success: true, message: 'Malicious process terminated' };
      case 'shutdown-server':
        stateStore.mutateResource('vm-prod-01', { status: 'offline' });
        return { success: true, message: 'Server shut down' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'throttle-process':
        stateStore.mutateResource('vm-prod-01', { cpuLoad: 0.12 });
        return { success: true, message: 'Throttle reverted' };
      case 'isolate-vm':
        stateStore.mutateResource('vm-prod-01', { quarantined: false });
        return { success: true, message: 'VM returned to normal network' };
      case 'kill-process':
        stateStore.mutateResource('vm-prod-01', { cpuLoad: 0.10 });
        return { success: true, message: 'Process restored' };
      default:
        return { success: false };
    }
  },
};
