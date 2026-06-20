// Swap these stubs for real AWS/GCP/Azure SDKs
async function shutdown(provider, type, tag, region) {
  console.log(`[REAPER] Shutting down ${provider} ${type} ${tag} in ${region}`);
  // AWS example: EC2
  // const ec2 = new AWS.EC2({ region });
  // await ec2.stopInstances({ InstanceIds: [tag] }).promise();
  // GCP example: Compute
  // await compute.zone(region).vm(tag).stop();
  return true;
}

module.exports = { shutdown };
