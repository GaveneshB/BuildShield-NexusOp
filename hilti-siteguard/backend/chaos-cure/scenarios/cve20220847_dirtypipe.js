// CVE-2022-0847 — Dirty Pipe (Linux Kernel Privilege Escalation)
// CVSS Score: 7.8 (High)
// Allows unprivileged user to overwrite data in arbitrary read-only files via Linux pipe.
// Exploited to gain root access on any Linux kernel 5.8 - 5.17.

module.exports = {
  id: 'cve20220847',
  label: 'Dirty Pipe Linux Privilege Escalation (CVE-2022-0847)',
  category: 'privilege-escalation',
  cve: 'CVE-2022-0847',
  cvss: 7.8,
  description: 'HIGH: Dirty Pipe Linux kernel exploit (CVE-2022-0847) detected. An attacker with shell access on vm-prod-01 (running kernel 5.15.0) has overwritten /etc/passwd to inject a root-privileged backdoor account. Attacker now has full root access. Persistence mechanisms (cron, SSH key) detected.',

  inject: (stateStore) => {
    stateStore.mutateResource('vm-prod-01', {
      status: 'root-compromised',
      kernelVersion: '5.15.0',
      backdoorAccount: 'svc_monitor',
      sshKeyInjected: true,
      cronPersistence: true,
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    return { metric: 'usd', value: 150 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.78,
    confidence: 0.92,   // /etc/passwd modification is definitive evidence
    blastRadius: 0.60,  // Full root on one host; can pivot to others
    reversibility: 0.70, // Kernel patch available; remove backdoor accounts
  }),

  remediations: [
    {
      id: 'remove-backdoor',
      label: 'Remove backdoor account and revoke injected SSH keys',
      reversible: true,
      destructive: false,
    },
    {
      id: 'patch-kernel',
      label: 'Apply kernel patch (upgrade to 5.17.2+) via live patching',
      reversible: true,
      destructive: false,
    },
    {
      id: 'isolate-host',
      label: 'Network-isolate vm-prod-01 to prevent lateral movement',
      reversible: true,
      destructive: false,
    },
    {
      id: 'destroy-rebuild',
      label: 'Destroy and rebuild VM from golden image (data loss risk)',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'remove-backdoor':
        stateStore.mutateResource('vm-prod-01', {
          backdoorAccount: null,
          sshKeyInjected: false,
          cronPersistence: false,
          status: 'clean',
        });
        return { success: true, message: 'Backdoor account removed. SSH keys revoked. Cron persistence cleared.' };
      case 'patch-kernel':
        stateStore.mutateResource('vm-prod-01', { kernelVersion: '5.17.2', status: 'patched' });
        return { success: true, message: 'Kernel live-patched to 5.17.2. CVE-2022-0847 remediated.' };
      case 'isolate-host':
        stateStore.mutateResource('vm-prod-01', { quarantined: true, status: 'quarantined' });
        return { success: true, message: 'vm-prod-01 network-isolated. Lateral movement blocked.' };
      case 'destroy-rebuild':
        stateStore.mutateResource('vm-prod-01', { status: 'rebuilding' });
        return { success: true, message: 'VM scheduled for destruction. Rebuild from golden image initiated.' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'isolate-host':
        stateStore.mutateResource('vm-prod-01', { quarantined: false });
        return { success: true, message: 'vm-prod-01 returned to network.' };
      default:
        return { success: false };
    }
  },
};
