const { Schema, model } = require("mongoose");

const submissionSchema = new Schema(
  {
    challengeId: { type: Schema.Types.ObjectId, ref: "Challenge" },
    userId:      { type: String, required: false },
    status:      { type: String, enum: ["PASS", "FAIL", "CE", "RE"], required: true },
    execTimeMs:  Number,
    code:        String,
    stdout:      String,
    stderr:      String,
  },
  { timestamps: true }
);

module.exports = model("Submission", submissionSchema);
