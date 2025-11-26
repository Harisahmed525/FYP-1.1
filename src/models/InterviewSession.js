const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Link to user's pre-interview setup
    setupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PreInterview",
      required: true
    },

    // Total questions generated (7 / 10 / 12)
    totalQuestions: {
      type: Number,
      required: true
    },

    // All interview Q&A
    questions: [
      {
        question: { type: String, required: true },
        answer: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    // -----------------------------
    // 🌟 AI EVALUATION RESULTS
    // -----------------------------
    technicalAccuracy: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    conciseness: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },

    // AI-generated summary for user
    aiSummary: { type: String, default: "" },

    // Mark when interview fully completed & evaluated
    isCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
