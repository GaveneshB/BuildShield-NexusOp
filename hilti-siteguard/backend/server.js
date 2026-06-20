require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Chaos & Cure modules
const StateStore = require('./chaos-cure/engine/stateStore');
const IncidentManager = require('./chaos-cure/engine/incidentManager');
const scenarios = require('./chaos-cure/scenarios');
const conservativePolicy = require('./chaos-cure/policy/profiles/conservative');
const balancedPolicy = require('./chaos-cure/policy/profiles/balanced');
const aggressivePolicy = require('./chaos-cure/policy/profiles/aggressive');

// Lights Out service
const lightsOutService = require('./services/lightsOutService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors(), express.json());

// Initialize Chaos & Cure state management
const stateStore = new StateStore();
let activePolicy = balancedPolicy;

// Create incident manager with WebSocket emitter
const incidentManager = new IncidentManager(stateStore, (event, data) => {
  io.of('/chaos-cure').emit(event, data);
});

// Attach to all requests
app.use((req, res, next) => {
  req.stateStore = stateStore;
  req.incidentManager = incidentManager;
  req.scenarios = scenarios;
  req.policy = activePolicy;
  req.policyManager = { setPolicy: (p) => { activePolicy = p; } };
  next();
});

// WebSocket handlers
io.of('/chaos-cure').on('connection', (socket) => {
  console.log('[CHAOS-CURE] Client connected:', socket.id);

  socket.emit('connected', {
    message: 'Connected to Chaos & Cure engine',
    policy: {
      orgId: activePolicy.orgId,
      label: activePolicy.label,
    },
  });

  socket.on('set-policy', (policyId) => {
    const policies = {
      conservative: conservativePolicy,
      balanced: balancedPolicy,
      aggressive: aggressivePolicy,
    };
    if (policies[policyId]) {
      activePolicy = policies[policyId];
      socket.emit('policy-updated', { orgId: activePolicy.orgId });
    }
  });

  socket.on('disconnect', () => {
    console.log('[CHAOS-CURE] Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/projects',   require('./routes/projects'));
app.use('/api/resources',  require('./routes/resources'));
app.use('/api/reaper',     require('./routes/reaper'));
app.use('/api/lightsout',  require('./routes/lightsOut'));
app.use('/api/carbon',     require('./routes/carbonRoutes'));

app.use('/api/chaos',      require('./routes/chaos-cure'));

const port = process.env.PORT || 5555;
server.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  // Start the Jobsite Lights Out background scheduler
  lightsOutService.startScheduler();
});
