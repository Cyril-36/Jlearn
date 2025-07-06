const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new challenge
router.post('/', async (req, res) => {
  try {
    const newChallenge = new Challenge(req.body);
    await newChallenge.save();
    res.status(201).json(newChallenge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
