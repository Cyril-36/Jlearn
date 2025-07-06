const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

// GET /api/leaderboard/:challengeId
router.get("/:id", async (req, res) => {
  const board = await Submission.find({ challengeId: req.params.id, status: "PASS" })
    .sort({ execTimeMs: 1, createdAt: 1 })
    .limit(20)
    .select("execTimeMs createdAt");
  res.json(board);
});

module.exports = router;
