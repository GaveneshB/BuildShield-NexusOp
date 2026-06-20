// CVE-2021-44228 — Apache Log4Shell
// CVSS Score: 10.0 (Critical)
// Zero-day RCE in Apache Log4j affecting millions of Java-based applications.
// Attacker sends malicious JNDI string in HTTP headers, triggering remote code execution.

module.exports = {
  id: 'cve202144228',
  label: 'Log4Shell — Apache Log4j RCE (CVE-2021-44228)',
  category: 'rce',
  cve: 'CVE-2021-44228',
  cvss: 10.0,
  description: 'CRITICAL: Zero-day Remote Code Execution detected in Apache Log4j 2.x. Attacker is exploiting JNDI injection via HTTP User-Agent header. Malicious LDAP callback observed from external IP. All internet-facing Java services are potentially compromised.',

  inject: (stateStore) => {
    stateStore.mutateResource('vm-prod-01', {
      status: 'exploited',
      cpuLoad: 0.88,
      jndiPayloadDetected: true,
      externalCallbackIp: '185.220.101.45',
    });
  },

  tickInactionCost: (elapsedSeconds, stateStore) => {
    // Every second of inaction allows deeper persistence
    return { metric: 'systems_compromised', value: Math.floor(elapsedSeconds / 12) };
  },

  getRiskInputs: (stateStore) => ({
    severityPerSecond: 0.99, // CVSS 10.0 — Maximum
    confidence: 0.97,        // JNDI callback is a confirmed indicator of exploitation
    blastRadius: 0.92,       // All Log4j-using services vulnerable
    reversibility: 0.65,     // Patch is available; reversible if caught early
  }),

  remediations: [
    {
      id: 'set-log4j2-noformatmsg',
      label: 'Set LOG4J_FORMAT_MSG_NO_LOOKUPS=true (Immediate Mitigation)',
      reversible: true,
      destructive: false,
    },
    {
      id: 'block-jndi-waf',
      label: 'Block JNDI/LDAP patterns at WAF and network perimeter',
      reversible: true,
      destructive: false,
    },
    {
      id: 'patch-log4j-2180',
      label: 'Deploy emergency patch: Log4j 2.18.0 via CI/CD pipeline',
      reversible: true,
      destructive: false,
    },
    {
      id: 'isolate-java-services',
      label: 'Take all Java services offline — full isolation (service disruption)',
      reversible: false,
      destructive: true,
    },
  ],

  applyRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'set-log4j2-noformatmsg':
        stateStore.mutateResource('vm-prod-01', { jndiPayloadDetected: false, status: 'mitigated' });
        return { success: true, message: 'ENV var set. JNDI lookups disabled. Immediate attack surface reduced.' };
      case 'block-jndi-waf':
        stateStore.mutateResource('vm-prod-01', { externalCallbackIp: null });
        return { success: true, message: 'WAF rules updated. JNDI/LDAP patterns blocked at perimeter.' };
      case 'patch-log4j-2180':
        stateStore.mutateResource('vm-prod-01', { status: 'patched', cpuLoad: 0.22 });
        return { success: true, message: 'Log4j 2.18.0 deployed. CVE-2021-44228 remediated.' };
      case 'isolate-java-services':
        stateStore.mutateResource('vm-prod-01', { status: 'offline' });
        return { success: true, message: 'All Java services taken offline.' };
      default:
        return { success: false };
    }
  },

  rollbackRemediation: (remediationId, stateStore) => {
    switch (remediationId) {
      case 'set-log4j2-noformatmsg':
        stateStore.mutateResource('vm-prod-01', { status: 'healthy', jndiPayloadDetected: false });
        return { success: true, message: 'ENV var unset. Lookups re-enabled.' };
      case 'block-jndi-waf':
        return { success: true, message: 'WAF rule rolled back.' };
      case 'patch-log4j-2180':
        stateStore.mutateResource('vm-prod-01', { status: 'vulnerable' });
        return { success: true, message: 'Rolled back to previous Log4j version.' };
      default:
        return { success: false };
    }
  },
};
