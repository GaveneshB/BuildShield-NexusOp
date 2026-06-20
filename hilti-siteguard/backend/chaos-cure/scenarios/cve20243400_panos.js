// CVE-2024-3400 — Palo Alto PAN-OS Command Injection (Zero-Day)
// CVSS Score: 10.0 (Critical)
// Unauthenticated remote code execution in Palo Alto GlobalProtect Gateway.
// Actively exploited by UTA0218 threat actor for espionage. CISA KEV listed.

module.exports = {
  id: 'cve20243400',
  label: 'Palo Alto PAN-OS Zero-Day Command Injection (CVE-2024-3400)',
  category: 'rce',
  cve: 'CVE-2024-3400',
  cvss: 10.0,
  description: 'CRITICAL: Zero-day command injection (CVE-2024-3400) detected in Palo Alto Networks PAN-OS GlobalProtect. Threat actor UTA0218 is executing commands as root on the firewall. UPSTYLE backdoor implant detected. Firewall configuration, VPN credentials, and network topology are being exfiltrated. CISA emergency directive in effect.',

  inject: (stateStore) => {
    stateStore.mutateResource('vm-prod-01', {
      status: 'firewall-compromised',
      upstyleBackdoor: true,
      commandInjectionActive: true,
      configExfiltrated: true,
      threatActor: 'UTA0218',
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    // Firewall compromise = all network traffic potentially monitored
    return { metric: 'usd', value: 1000 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.99, // CVSS 10.0 + active nation-state actor
    confidence: 0.98,        // UPSTYLE backdoor is a confirmed IoC
    blastRadius: 0.97,       // Compromised firewall = entire perimeter down
    reversibility: 0.55,     // Patch available; config rotation needed
  }),

  remediations: [
    {
      id: 'enable-threat-prevention',
      label: 'Enable Threat Prevention on GlobalProtect interface (PAN workaround)',
      reversible: true,
      destructive: false,
    },
    {
      id: 'apply-panw-hotfix',
      label: 'Apply PAN-OS 10.2.9-h1 / 11.0.4-h1 emergency hotfix',
      reversible: true,
      destructive: false,
    },
    {
      id: 'rotate-vpn-credentials',
      label: 'Force-rotate all VPN/GlobalProtect credentials and certificates',
      reversible: true,
      destructive: false,
    },
    {
      id: 'factory-reset-firewall',
      label: 'Factory reset firewall — full service disruption',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'enable-threat-prevention':
        stateStore.mutateResource('vm-prod-01', { commandInjectionActive: false });
        return { success: true, message: 'Threat Prevention enabled. Command injection vector blocked. CISA workaround applied.' };
      case 'apply-panw-hotfix':
        stateStore.mutateResource('vm-prod-01', { status: 'patched', upstyleBackdoor: false });
        return { success: true, message: 'PAN-OS hotfix applied. CVE-2024-3400 remediated. UPSTYLE backdoor removed.' };
      case 'rotate-vpn-credentials':
        stateStore.mutateResource('vm-prod-01', { configExfiltrated: false });
        return { success: true, message: 'All VPN credentials and certificates rotated. Stolen creds invalidated.' };
      case 'factory-reset-firewall':
        stateStore.mutateResource('vm-prod-01', { status: 'offline' });
        return { success: true, message: 'Firewall factory reset. Network perimeter temporarily down.' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'enable-threat-prevention':
        stateStore.mutateResource('vm-prod-01', { commandInjectionActive: true });
        return { success: true, message: 'Threat Prevention setting reverted. Not recommended.' };
      default:
        return { success: false };
    }
  },
};
