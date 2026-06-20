// CVE-2023-34362 — MOVEit Transfer SQL Injection
// CVSS Score: 9.8 (Critical)
// Mass exploitation wave by Cl0p ransomware group targeting MOVEit managed file transfer.
// SQL injection allows unauthenticated access to database; data exfiltration observed.

module.exports = {
  id: 'cve202334362',
  label: 'MOVEit Transfer SQL Injection — Data Exfiltration (CVE-2023-34362)',
  category: 'data-exfiltration',
  cve: 'CVE-2023-34362',
  cvss: 9.8,
  description: 'CRITICAL: Unauthenticated SQL injection in MOVEit Transfer being actively exploited by Cl0p ransomware group. 2.4 million customer records from the MOVEit database are being exfiltrated to external FTP server. GDPR/HIPAA breach notification window is open.',

  inject: (stateStore) => {
    stateStore.mutateResource('dataset-customers', {
      status: 'exfiltrating',
      rowsLeaked: 2400000,
      exfiltrationTarget: 'ftp://45.227.253.80/stolen',
      sqlInjectionPayload: "'; SELECT * FROM moveittransfer.users --",
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    // Regulatory fines grow per second of breach
    return { metric: 'gdpr_fine_usd', value: 4000 * (elapsedSeconds / 60) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.95,
    confidence: 0.99, // Active exfiltration detected with payload signature
    blastRadius: 0.90, // All MOVEit-stored customer data at risk
    reversibility: 0.45, // Data already leaving — difficult to undo breach notification
  }),

  remediations: [
    {
      id: 'block-moveit-internet',
      label: 'Block MOVEit Transfer from internet access (firewall rule)',
      reversible: true,
      destructive: false,
    },
    {
      id: 'apply-moveit-patch',
      label: 'Apply MOVEit Transfer hotfix (May 2023 emergency patch)',
      reversible: true,
      destructive: false,
    },
    {
      id: 'revoke-db-credentials',
      label: 'Rotate and revoke all MOVEit database credentials',
      reversible: true,
      destructive: false,
    },
    {
      id: 'shutdown-moveit',
      label: 'Shut down MOVEit Transfer instance permanently',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'block-moveit-internet':
        stateStore.mutateResource('dataset-customers', { exfiltrationTarget: null, status: 'contained' });
        return { success: true, message: 'Internet access blocked. Exfiltration halted. Firewall rule applied.' };
      case 'apply-moveit-patch':
        stateStore.mutateResource('dataset-customers', { sqlInjectionPayload: null, status: 'patched' });
        return { success: true, message: 'MOVEit emergency patch applied. SQL injection vector closed.' };
      case 'revoke-db-credentials':
        stateStore.mutateResource('dataset-customers', { status: 'secured' });
        return { success: true, message: 'Database credentials rotated. Unauthorized sessions terminated.' };
      case 'shutdown-moveit':
        stateStore.mutateResource('dataset-customers', { status: 'offline' });
        return { success: true, message: 'MOVEit instance shut down. File transfers suspended.' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'block-moveit-internet':
        stateStore.mutateResource('dataset-customers', { status: 'sealed' });
        return { success: true, message: 'Internet access restored. Monitor closely.' };
      case 'revoke-db-credentials':
        return { success: true, message: 'Previous credentials restored from vault.' };
      default:
        return { success: false };
    }
  },
};
