require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors(), express.json());

app.use('/api/projects',   require('./routes/projects'));
app.use('/api/resources',  require('./routes/resources'));
app.use('/api/reaper',     require('./routes/reaper'));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
