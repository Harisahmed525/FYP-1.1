// performanceController.js

exports.getPerformanceSummary = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    // ----------------------------------------------
    // 🚀 For Now: Dummy static values (easy to integrate)
    // Replace with real DB logic later
    // ----------------------------------------------

    const summary = {
      userId,

      // Dashboard top cards
      interviewsCompleted: 24,
      hoursPracticed: 48,
      skillsMastered: 12,

      // Progress over time (weekly scores)
      progressOverTime: [65, 68, 72, 75, 78, 80],

      // Interview Statistics
      overallScore: 82,
      improvement: 12,

      // Answer Quality
      answerQuality: {
        score: 85,
        technicalAccuracy: 90,
        completeness: 85,
        conciseness: 80,
        problemSolving: 85
      },

      // Body Language
      bodyLanguage: {
        score: 76,
        eyeContact: 85,
        facialExpressions: 70,
        handGestures: 75,
        toneOfVoice: 75
      },

      // Upcoming Interviews
      upcomingInterviews: [
        {
          title: "React Performance",
          date: "2024-05-10",
          time: "10:00 AM",
          status: "Ready"
        },
        {
          title: "System Design",
          date: "2024-05-12",
          time: "02:00 PM",
          status: "Ready"
        }
      ]
    };

    return res.json({ success: true, summary });

  } catch (error) {
    console.error("Performance summary error:", error);
    res.status(500).json({
      message: "Failed to fetch performance summary"
    });
  }
};
