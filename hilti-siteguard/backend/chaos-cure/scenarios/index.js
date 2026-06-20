// Scenario registry - all scenarios self-contained and pluggable

module.exports = {
  // Original scenarios
  cryptojacking: require('./cryptojacking'),
  dataLeak: require('./dataLeak'),
  ddos: require('./ddos'),
  insiderThreat: require('./insiderThreat'),
  ransomwareStaging: require('./ransomwareStaging'),
  misconfigExposure: require('./misconfigExposure'),
  stolenCredentials: require('./stolenCredentials'),

  // Real CVE-based threat scenarios
  cve202144228: require('./cve202144228_log4shell'),
  cve202334362: require('./cve202334362_moveit'),
  cve20170144: require('./cve20170144_eternalblue'),
  cve20220847: require('./cve20220847_dirtypipe'),
  cve20243400: require('./cve20243400_panos'),
};
