const express = require('express');
const router = express.Router();
const { runTests } = require('../services/testEvaluator');

router.post('/', async (req, res) => {
  const { code, tests } = req.body;
  try {
    const { score, results } = await runTests(code, tests);
    res.json({ score, results });
  } catch (err) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

module.exports = router;
