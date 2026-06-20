require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const lightsOutService = require('./services/lightsOutService');

app.use(cors(), express.json());

app.use('/api/projects',   require('./routes/projects'));
app.use('/api/resources',  require('./routes/resources'));
app.use('/api/reaper',     require('./routes/reaper'));
app.use('/api/lightsout',  require('./routes/lightsOut'));
app.use('/api/carbon',     require('./routes/carbonRoutes'));


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  // Start the Jobsite Lights Out background scheduler
  lightsOutService.startScheduler();
});
