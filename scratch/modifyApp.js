const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../hilti-siteguard/src/App.jsx');
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace("import { db, rtdb, isFirebaseReady } from './firebase.config.js'", "import { db, rtdb, isFirebaseReady } from './firebase.config.js'\nimport PhantomReaperPageNew from './pages/PhantomReaperPage.jsx'");

// Update render
content = content.replace("<PhantomReaperPage\n              projects={projects}\n              terminateProject={terminateProject}\n              totalReclaimedCost={totalReclaimedCost}\n            />", "<PhantomReaperPageNew />");

fs.writeFileSync(file, content);
console.log('App.jsx modified');
