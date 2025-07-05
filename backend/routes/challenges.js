const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const dataPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'challenges.json');

function loadData() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

function getProblems() {
  const data = loadData();
  const problems = [];
  for (const unit of data.units || []) {
    for (const topic of unit.topics || []) {
      for (const problem of topic.problems || []) {
        problems.push({ ...problem, unitId: unit.id, topicId: topic.id });
      }
    }
  }
  return problems;
}

router.get('/challenges', (req, res) => {
  try {
    let problems = getProblems();
    const { difficulty } = req.query;
    if (difficulty) {
      problems = problems.filter(p =>
        p.difficulty && p.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load challenges' });
  }
});

router.get('/challenge/:id', (req, res) => {
  try {
    const { id } = req.params;
    const problem = getProblems().find(p => p.id === id);
    if (!problem) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json(problem);
  } catch (err) {
    res.status(500).json({ error: 'Unable to load challenge' });
  }
});

module.exports = router;
