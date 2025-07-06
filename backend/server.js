const connectDB = require('./db/mongoose'); // ✅ Required for MongoDB
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const challengesRoute = require('./routes/challenges');

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB(); // ✅ You must call this to connect to MongoDB

app.use('/api/challenges', challengesRoute);
app.use('/api/submit', require('./routes/submit'));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/leaderboard', require('./routes/leaderboard'));


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
