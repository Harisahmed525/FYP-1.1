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

    // List of Q&A pairs during interview
    questions: [
      {
        question: { type: String, required: true },
        answer: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    // AI Evaluation Summary
    aiSummary: { type: String },

    // ----------------------------------------
    // ANSWER QUALITY SCORES (for Performance UI)
    // ----------------------------------------
    technicalAccuracy: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    conciseness: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },

    // ----------------------------------------
    // BODY LANGUAGE SCORES (for Performance UI)
    // ----------------------------------------
    eyeContactScore: { type: Number, default: 0 },
    facialExpressionsScore: { type: Number, default: 0 },
    handGesturesScore: { type: Number, default: 0 },
    toneOfVoiceScore: { type: Number, default: 0 },

    // OLD TOTAL SCORES (optional summary)
    technicalScore: { type: Number, default: 0 },
    bodyLanguageScore: { type: Number, default: 0 },

    // Video stored in Firebase
    videoUrl: { type: String },

    // Emotion timeline from frontend logs
    emotionTimeline: [
      {
        time: Number,
        emotion: String,
        eyeContact: Number,
        facialExpression: Number,
        gestures: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
