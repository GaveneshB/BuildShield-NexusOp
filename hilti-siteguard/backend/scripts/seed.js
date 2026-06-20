const admin = require('firebase-admin');

// Note: Requires GOOGLE_APPLICATION_CREDENTIALS set if not using emulators
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function seed() {
  console.log('Seeding outstanding Hilti mock data...');

  const projects = [
    {
      id: 'proj_frankfurt_hq',
      name: 'Frankfurt Central Hub Rebuild',
      hiltiProjectId: 'HILTI-EU-2441A',
      status: 'active',
      managerId: 'mgr_eu_992'
    },
    {
      id: 'proj_tokyo_metro',
      name: 'Tokyo Metro Extension Line 4',
      hiltiProjectId: 'HILTI-JP-990B',
      status: 'completed',
      managerId: 'mgr_jp_014'
    },
    {
      id: 'proj_seattle_tower',
      name: 'Seattle Skyline Residential',
      hiltiProjectId: 'HILTI-US-102C',
      status: 'archived',
      managerId: 'mgr_us_331'
    },
    {
      id: 'proj_dubai_marina',
      name: 'Dubai Marina Subsea Pipeline',
      hiltiProjectId: 'HILTI-AE-501',
      status: 'completed',
      managerId: 'mgr_ae_007'
    }
  ];

  // Write Projects
  for (const p of projects) {
    const { id, ...data } = p;
    await db.collection('projects').doc(id).set({
      ...data,
      completedAt: (p.status === 'completed' || p.status === 'archived') ? admin.firestore.Timestamp.now() : null,
      updatedAt: admin.firestore.Timestamp.now()
    });
  }

  // Define heavily-costing resources
  const resources = [
    // Tokyo Metro Resources (Completed)
    { projectId: 'proj_tokyo_metro', name: 'RDS-Tokyo-Substation-Telemetry', provider: 'aws', resourceType: 'rds', resourceTag: 'db-tokyo-992a', region: 'ap-northeast-1', energyKwhPerDay: 45.2, monthlyCostUSD: 1450.00 },
    { projectId: 'proj_tokyo_metro', name: 'EC2-BIM-Cluster-Node-01', provider: 'aws', resourceType: 'ec2', resourceTag: 'i-0ab111cd', region: 'ap-northeast-1', energyKwhPerDay: 18.5, monthlyCostUSD: 520.00 },
    { projectId: 'proj_tokyo_metro', name: 'EC2-BIM-Cluster-Node-02', provider: 'aws', resourceType: 'ec2', resourceTag: 'i-0ab222ef', region: 'ap-northeast-1', energyKwhPerDay: 18.5, monthlyCostUSD: 520.00 },
    { projectId: 'proj_tokyo_metro', name: 'S3-GeoSpatial-Archive', provider: 'aws', resourceType: 's3', resourceTag: 'arn:aws:s3:::tokyo-geospatial', region: 'ap-northeast-1', energyKwhPerDay: 4.1, monthlyCostUSD: 180.00 },
    
    // Seattle Tower Resources (Archived)
    { projectId: 'proj_seattle_tower', name: 'Azure-SQL-Seattle-BIM', provider: 'azure', resourceType: 'database', resourceTag: 'sql-seattle-001', region: 'us-west-2', energyKwhPerDay: 32.8, monthlyCostUSD: 980.50 },
    { projectId: 'proj_seattle_tower', name: 'Azure-VM-Render-Farm-01', provider: 'azure', resourceType: 'vm', resourceTag: 'vm-seattle-001', region: 'us-west-2', energyKwhPerDay: 56.4, monthlyCostUSD: 2150.00 },
    
    // Dubai Marina Resources (Completed)
    { projectId: 'proj_dubai_marina', name: 'GCP-Spanner-Pipeline-Data', provider: 'gcp', resourceType: 'database', resourceTag: 'spanner-dubai-data', region: 'me-central1', energyKwhPerDay: 88.0, monthlyCostUSD: 3400.00 },
    { projectId: 'proj_dubai_marina', name: 'GCP-Compute-Sonar-Analysis', provider: 'gcp', resourceType: 'vm', resourceTag: 'vm-sonar-001', region: 'me-central1', energyKwhPerDay: 112.5, monthlyCostUSD: 4100.00 },
    { projectId: 'proj_dubai_marina', name: 'GCP-CloudStorage-Acoustics', provider: 'gcp', resourceType: 'storage', resourceTag: 'bucket-acoustics-log', region: 'me-central1', energyKwhPerDay: 1.2, monthlyCostUSD: 45.00 },

    // Frankfurt HQ (Active)
    { projectId: 'proj_frankfurt_hq', name: 'AWS-EKS-Main-Cluster', provider: 'aws', resourceType: 'eks', resourceTag: 'eks-frankfurt-prod', region: 'eu-central-1', energyKwhPerDay: 145.0, monthlyCostUSD: 5800.00 },
    { projectId: 'proj_frankfurt_hq', name: 'AWS-RDS-Postgres-HQ', provider: 'aws', resourceType: 'rds', resourceTag: 'rds-frankfurt-prod', region: 'eu-central-1', energyKwhPerDay: 62.4, monthlyCostUSD: 1950.00 }
  ];

  for (const r of resources) {
    await db.collection('cloudResources').add({
      ...r, 
      status: 'active',
      reapedAt: null, 
      reapedBy: null, 
      lastActiveAt: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  await db.collection('reapSummary').doc('global').set({
    totalResourcesReaped: 0, totalEnergySavedKwh: 0,
    totalCostSavedUSD: 0, totalCarbonSavedKg: 0,
    lastUpdated: admin.firestore.Timestamp.now()
  });

  console.log('Outstanding mock data seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
