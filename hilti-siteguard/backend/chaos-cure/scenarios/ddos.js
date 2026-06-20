// Scenario: DDoS Attack
// Massive inbound traffic spike from botnet

module.exports = {
  id: 'ddos',
  label: 'DDoS Botnet Attack Detected',
  category: 'network',
  description: 'Massive inbound traffic spike detected',

  inject: (stateStore) => {
    stateStore.mutateResource('vm-prod-01', {
      status: 'under-attack',
      cpuLoad: 0.89,
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    return { metric: 'usd', value: 120 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.55,
    confidence: 0.91,
    blastRadius: 0.65,
    reversibility: 0.88,
  }),

  remediations: [
    {
      id: 'rate-limit',
      label: 'Enable rate limiting',
      reversible: true,
      destructive: false,
    },
    {
      id: 'blackhole-ip',
      label: 'Blackhole source IP range',
      reversible: true,
      destructive: false,
    },
    {
      id: 'scale-defenses',
      label: 'Scale DDoS mitigation',
      reversible: true,
      destructive: false,
    },
    {
      id: 'shutdown-service',
      label: 'Shut down exposed service',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'rate-limit':
        return { success: true, message: 'Rate limiting enabled' };
      case 'blackhole-ip':
        return { success: true, message: 'Source IP range blackholed' };
      case 'scale-defenses':
        return { success: true, message: 'DDoS defense infrastructure scaled' };
      case 'shutdown-service':
        stateStore.mutateResource('vm-prod-01', { status: 'offline' });
        return { success: true, message: 'Service shut down' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'rate-limit':
        return { success: true, message: 'Rate limiting disabled' };
      case 'blackhole-ip':
        return { success: true, message: 'IP range whitelist restored' };
      case 'scale-defenses':
        return { success: true, message: 'Defense scaling reverted' };
      default:
        return { success: false };
    }
  },
};
