const express = require("express");
const { exec } = require("child_process");
const fs   = require("fs");
const path = require("path");
const tmp  = require("tmp");
const { v4: uuid } = require("uuid");
const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");

const router = express.Router();

// POST /api/execute
router.post("/", async (req, res) => {
  const { code, stdin = "", challengeId } = req.body;
  const dir = tmp.dirSync({ unsafeCleanup: true });
  const mainPath = path.join(dir.name, "Main.java");
  fs.writeFileSync(mainPath, code);

  exec(`javac ${mainPath}`, { cwd: dir.name, timeout: 8000 }, (ce, co, cerr) => {
    if (ce) {
      dir.removeCallback();
      return res.json({ status: "CE", compileError: cerr.toString() });
    }

    const runStart = Date.now();
    const run = exec(`java Main`, { cwd: dir.name, timeout: 8000 }, async (re, ro, rerr) => {
      dir.removeCallback();

      let status = "PASS";
      let expected = null;
      if (challengeId) {
        try {
          const challenge = await Challenge.findById(challengeId);
          expected = challenge?.expectedOutput?.trim();
          if (re) status = "RE";
          else if (expected && expected !== ro.trim()) status = "FAIL";
        } catch (err) {
          console.error(err);
        }
      }

      await Submission.create({
        challengeId,
        status,
        execTimeMs: Date.now() - runStart,
        code,
        stdout: ro,
        stderr: rerr,
      });

      res.json({
        status,
        stdout: ro,
        stderr: rerr,
        execTimeMs: Date.now() - runStart,
        expected,
      });
    });

    run.stdin.write(stdin);
    run.stdin.end();
  });
});

module.exports = router;
