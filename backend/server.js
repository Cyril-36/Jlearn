const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const challengesRouter = require('./routes/challenges');
const executeRouter = require('./routes/execute');
const submitRouter = require('./routes/submit');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', challengesRouter);
app.use('/api/execute', executeRouter);
app.use('/api/submit', submitRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
