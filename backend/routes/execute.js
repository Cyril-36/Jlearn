const express = require('express');
const router = express.Router();
const { runCode } = require('../services/codeRunner');

router.post('/', async (req, res) => {
  const { code, input } = req.body;
  try {
    const output = await runCode(code, input);
    res.json({ output });
  } catch (err) {
    res.status(500).json({ error: 'Execution failed' });
  }
});

module.exports = router;
