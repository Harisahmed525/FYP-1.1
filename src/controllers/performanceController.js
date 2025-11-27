const InterviewSession = require("../models/InterviewSession");

exports.getPerformanceSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all completed interviews of this user
    const sessions = await InterviewSession.find({
      userId,
      isCompleted: true
    }).sort({ createdAt: 1 });

    if (!sessions.length) {
      return res.json({
        success: true,
        summary: {
          userId,
          interviewsCompleted: 0,
          hoursPracticed: 0,
          skillsMastered: 0,
          progressOverTime: [],
          overallScore: 0,
          improvement: 0,
          answerQuality: {
            score: 0,
            technicalAccuracy: 0,
            completeness: 0,
            conciseness: 0,
            problemSolving: 0
          },
          bodyLanguage: {}, // no body language now
          upcomingInterviews: []
        }
      });
    }

    // TOTAL INTERVIEWS COMPLETED
    const interviewsCompleted = sessions.length;

    // HOURS PRACTICED (estimate: each mock interview ≈ 10 min)
    const hoursPracticed = (interviewsCompleted * 10) / 60;

    // AVERAGES ACROSS ALL SESSIONS
    const avg = field =>
      Math.round(
        sessions.reduce((sum, s) => sum + (s[field] || 0), 0) /
          sessions.length
      );

    const averageTechnical = avg("technicalAccuracy");
    const averageComplete = avg("completeness");
    const averageConcise = avg("conciseness");
    const averageProblemSolve = avg("problemSolving");

    // OVERALL SCORE (avg of all categories)
    const overallScore = Math.round(
      (averageTechnical +
        averageComplete +
        averageConcise +
        averageProblemSolve) /
        4
    );

    // PROGRESS TREND (per interview)
    const progressOverTime = sessions.map(s => {
      return Math.round(
        (s.technicalAccuracy +
          s.completeness +
          s.conciseness +
          s.problemSolving) /
          4
      );
    });

    // Improvement = last interview score - first interview score
    const improvement =
      progressOverTime[progressOverTime.length - 1] -
      progressOverTime[0];

    // ESTIMATE SKILLS MASTERED
    const skillsMastered =
      averageTechnical > 60
        ? 10
        : averageTechnical > 40
        ? 5
        : 2;

    // FINAL SUMMARY OBJECT
    const summary = {
      userId,

      interviewsCompleted,
      hoursPracticed,
      skillsMastered,

      progressOverTime,
      overallScore,
      improvement,

      answerQuality: {
        score: overallScore,
        technicalAccuracy: averageTechnical,
        completeness: averageComplete,
        conciseness: averageConcise,
        problemSolving: averageProblemSolve
      },

      bodyLanguage: {}, // no emotion tracking anymore

      upcomingInterviews: [] // optional future feature
    };

    return res.json({ success: true, summary });
  } catch (error) {
    console.error("Performance summary error:", error);
    res.status(500).json({ message: "Failed to fetch performance summary" });
  }
};
