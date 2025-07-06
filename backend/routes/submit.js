const express = require('express');
const router = express.Router();
const { runJavaCode } = require('../services/codeRunner');
const challenges = require('../data/challenges.json');

router.post('/', async (req, res) => {
  const { challengeId, code, stdin } = req.body;
  const challenge = challenges.find(c => c.id === challengeId);

  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  try {
    const result = await runJavaCode(code, stdin);

    if (!result.success) {
      return res.json({ verdict: 'Failed', output: result.stderr });
    }

    // Compare output with challenge test cases if provided
    let allPassed = true;
    const tests = challenge.testCases || [];
    for (const test of tests) {
      const hiddenResult = await runJavaCode(code, test.input);
      if (!hiddenResult.success || hiddenResult.stdout.trim() !== test.output.trim()) {
        allPassed = false;
        break;
      }
    }

    res.json({
      verdict: allPassed ? 'Passed' : 'Failed',
      output: result.stdout,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
