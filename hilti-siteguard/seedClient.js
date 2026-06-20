import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, query } from 'firebase/firestore';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearCollection(name) {
  const snap = await getDocs(query(collection(db, name)));
  const deletes = snap.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);
  console.log(`Cleared ${snap.size} docs from ${name}`);
}

async function seed() {
  console.log('🇲🇾 Seeding Malaysian Hilti construction project data...');

  // Clear existing data
  await clearCollection('projects');
  await clearCollection('cloudResources');
  await clearCollection('reapEvents');

  const projects = [
    { id: 'proj_kl_tun_razak',    name: 'KL Tun Razak Exchange Tower',      hiltiProjectId: 'HILTI-MY-KL-001', status: 'active',    managerId: 'mgr_my_kl_01' },
    { id: 'proj_penang_bridge',   name: 'Penang Second Bridge Widening',     hiltiProjectId: 'HILTI-MY-PNG-002', status: 'completed', managerId: 'mgr_my_png_02' },
    { id: 'proj_jb_iskandar',     name: 'Johor Bahru Iskandar Smart Hub',    hiltiProjectId: 'HILTI-MY-JB-003',  status: 'archived',  managerId: 'mgr_my_jb_03' },
    { id: 'proj_putrajaya_civic', name: 'Putrajaya Civic Centre Expansion',  hiltiProjectId: 'HILTI-MY-PJ-004',  status: 'completed', managerId: 'mgr_my_pj_04' },
  ];

  for (const p of projects) {
    const { id, ...data } = p;
    await setDoc(doc(db, 'projects', id), {
      ...data,
      completedAt: (p.status === 'completed' || p.status === 'archived') ? new Date() : null,
      updatedAt: new Date()
    });
  }
  console.log('✓ Projects seeded');

  // MYR-priced cloud resources (1 USD ≈ 4.72 MYR)
  const resources = [
    // Penang Bridge (Completed) — AWS ap-southeast-1
    { projectId: 'proj_penang_bridge', name: 'RDS-Penang-Structural-Telemetry', provider: 'aws', resourceType: 'rds',      resourceTag: 'db-png-struct-01',              region: 'ap-southeast-1',  energyKwhPerDay: 45.2,  monthlyCostMYR: 6840.00 },
    { projectId: 'proj_penang_bridge', name: 'EC2-BIM-Render-Node-01',          provider: 'aws', resourceType: 'ec2',      resourceTag: 'i-0png1111aa',                  region: 'ap-southeast-1',  energyKwhPerDay: 18.5,  monthlyCostMYR: 2454.00 },
    { projectId: 'proj_penang_bridge', name: 'EC2-BIM-Render-Node-02',          provider: 'aws', resourceType: 'ec2',      resourceTag: 'i-0png2222bb',                  region: 'ap-southeast-1',  energyKwhPerDay: 18.5,  monthlyCostMYR: 2454.00 },
    { projectId: 'proj_penang_bridge', name: 'S3-GeoSpatial-Survey-Archive',    provider: 'aws', resourceType: 's3',       resourceTag: 'arn:aws:s3:::penang-survey',     region: 'ap-southeast-1',  energyKwhPerDay: 3.8,   monthlyCostMYR: 849.00 },

    // Johor Bahru Smart Hub (Archived) — Azure
    { projectId: 'proj_jb_iskandar',   name: 'Azure-SQL-Iskandar-BIM-DB',      provider: 'azure', resourceType: 'database', resourceTag: 'sql-jb-iskandar-01',           region: 'southeastasia',    energyKwhPerDay: 32.8,  monthlyCostMYR: 4626.00 },
    { projectId: 'proj_jb_iskandar',   name: 'Azure-VM-SmartCity-Analytics',   provider: 'azure', resourceType: 'vm',       resourceTag: 'vm-jb-analytics-01',           region: 'southeastasia',    energyKwhPerDay: 56.4,  monthlyCostMYR: 10148.00 },
    { projectId: 'proj_jb_iskandar',   name: 'Azure-Blob-CCTV-Archive',        provider: 'azure', resourceType: 'storage',  resourceTag: 'blob-jb-cctv-archive',         region: 'southeastasia',    energyKwhPerDay: 8.2,   monthlyCostMYR: 1180.00 },

    // Putrajaya Civic Centre (Completed) — GCP
    { projectId: 'proj_putrajaya_civic', name: 'GCP-Spanner-Civic-Records-DB',   provider: 'gcp', resourceType: 'database', resourceTag: 'spanner-pj-civic-01',          region: 'asia-southeast1',  energyKwhPerDay: 88.0,  monthlyCostMYR: 16048.00 },
    { projectId: 'proj_putrajaya_civic', name: 'GCP-Compute-3D-Visualisation',   provider: 'gcp', resourceType: 'vm',       resourceTag: 'vm-pj-3drender-01',            region: 'asia-southeast1',  energyKwhPerDay: 112.5, monthlyCostMYR: 19352.00 },
    { projectId: 'proj_putrajaya_civic', name: 'GCP-Storage-Blueprint-Archive',  provider: 'gcp', resourceType: 'storage',  resourceTag: 'bucket-pj-blueprints',         region: 'asia-southeast1',  energyKwhPerDay: 1.4,   monthlyCostMYR: 212.00 },

    // KL Tun Razak Exchange (Active) — AWS
    { projectId: 'proj_kl_tun_razak',   name: 'AWS-EKS-TRX-Main-Cluster',      provider: 'aws', resourceType: 'eks',      resourceTag: 'eks-kl-trx-prod',              region: 'ap-southeast-1',  energyKwhPerDay: 145.0, monthlyCostMYR: 27376.00 },
    { projectId: 'proj_kl_tun_razak',   name: 'AWS-RDS-TRX-Postgres-Master',   provider: 'aws', resourceType: 'rds',      resourceTag: 'rds-kl-trx-master',            region: 'ap-southeast-1',  energyKwhPerDay: 62.4,  monthlyCostMYR: 9204.00 },
    { projectId: 'proj_kl_tun_razak',   name: 'AWS-Lambda-IoT-Sensor-Stream',  provider: 'aws', resourceType: 'lambda',   resourceTag: 'lambda-kl-iot-stream',         region: 'ap-southeast-1',  energyKwhPerDay: 4.6,   monthlyCostMYR: 1132.00 },
  ];

  for (const r of resources) {
    await addDoc(collection(db, 'cloudResources'), {
      ...r,
      status: 'active',
      reapedAt: null,
      reapedBy: null,
      lastActiveAt: new Date(),
      createdAt: new Date()
    });
  }
  console.log('✓ Cloud resources seeded');

  await setDoc(doc(db, 'reapSummary', 'global'), {
    totalResourcesReaped: 0,
    totalEnergySavedKwh: 0,
    totalCostSavedMYR: 0,
    totalCarbonSavedKg: 0,
    lastUpdated: new Date()
  });
  console.log('✓ Summary reset');

  console.log('🎉 Malaysian project data seeded to Firebase successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
