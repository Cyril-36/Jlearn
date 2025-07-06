const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  topic: String,
  testCases: [
    {
      input: String,
      expectedOutput: String,
    },
  ],
});

module.exports = mongoose.model('Challenge', challengeSchema);
