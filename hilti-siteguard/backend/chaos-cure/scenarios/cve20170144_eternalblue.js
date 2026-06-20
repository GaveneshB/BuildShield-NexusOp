// CVE-2017-0144 — EternalBlue / WannaCry SMB Exploit
// CVSS Score: 9.3 (Critical)
// NSA-developed exploit leaked by Shadow Brokers, weaponized by WannaCry ransomware.
// Targets Windows SMBv1; worm propagates laterally across internal network at machine speed.

module.exports = {
  id: 'cve20170144',
  label: 'EternalBlue / WannaCry Lateral Movement (CVE-2017-0144)',
  category: 'lateral-movement',
  cve: 'CVE-2017-0144',
  cvss: 9.3,
  description: 'CRITICAL: EternalBlue SMB exploit (CVE-2017-0144) active on internal network. WannaCry-style worm detected spreading laterally across 12 hosts in the last 90 seconds via Windows SMBv1 (port 445). Encrypted files detected on 3 endpoints. Self-propagating worm will reach all network segments if not contained.',

  inject: (stateStore) => {
    stateStore.mutateResource('vm-prod-01', {
      status: 'worm-active',
      hostsCompromised: 12,
      encryptedFiles: 3800,
      smb445Scanning: true,
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    // Worm doubles hosts compromised every 30 seconds
    const hostsAtRisk = Math.floor(Math.pow(2, elapsedSeconds / 30));
    return { metric: 'hosts_at_risk', value: hostsAtRisk };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.97,  // Self-propagating worm — grows exponentially
    confidence: 0.96,          // SMB scanning + file encryption signatures are definitive
    blastRadius: 0.95,         // Will reach entire network if not stopped
    reversibility: 0.30,       // Encrypted files may not be recoverable
  }),

  remediations: [
    {
      id: 'block-smb445',
      label: 'Emergency firewall: block port 445 inbound/outbound across all VLANs',
      reversible: true,
      destructive: false,
    },
    {
      id: 'apply-ms17-010',
      label: 'Push Microsoft MS17-010 patch (Windows SMB patch) via WSUS',
      reversible: true,
      destructive: false,
    },
    {
      id: 'disable-smb1',
      label: 'Disable SMBv1 protocol on all Windows hosts via Group Policy',
      reversible: true,
      destructive: false,
    },
    {
      id: 'network-segment-shutdown',
      label: 'Emergency isolation: shut down all inter-VLAN routing',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'block-smb445':
        stateStore.mutateResource('vm-prod-01', { smb445Scanning: false, status: 'contained' });
        return { success: true, message: 'Port 445 blocked network-wide. Lateral movement halted. Worm quarantined.' };
      case 'apply-ms17-010':
        stateStore.mutateResource('vm-prod-01', { status: 'patched' });
        return { success: true, message: 'MS17-010 patch deployed to all reachable hosts. EternalBlue vector closed.' };
      case 'disable-smb1':
        stateStore.mutateResource('vm-prod-01', { smb445Scanning: false });
        return { success: true, message: 'SMBv1 disabled via Group Policy. Protocol attack surface eliminated.' };
      case 'network-segment-shutdown':
        stateStore.mutateResource('vm-prod-01', { status: 'offline' });
        return { success: true, message: 'Inter-VLAN routing disabled. All network segments isolated.' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'block-smb445':
        stateStore.mutateResource('vm-prod-01', { smb445Scanning: false });
        return { success: true, message: 'Port 445 firewall rule reverted. Monitor closely.' };
      case 'disable-smb1':
        return { success: true, message: 'SMBv1 re-enabled via Group Policy. Not recommended.' };
      default:
        return { success: false };
    }
  },
};
