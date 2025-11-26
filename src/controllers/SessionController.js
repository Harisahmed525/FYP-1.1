const InterviewSession = require("../models/InterviewSession");
const PreInterview = require("../models/PreInterview");
const { getQuestionsByExperience } = require("../utils/questionGenerator");
const { safeChatCompletion } = require("../utils/openaiClient");

// ------------------------------------------------------
// 1️⃣ START INTERVIEW (Generate questions ONCE)
// ------------------------------------------------------
exports.startInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { setupId } = req.body;

    if (!setupId)
      return res.status(400).json({ message: "setupId is required" });

    const setup = await PreInterview.findById(setupId);
    if (!setup)
      return res.status(404).json({ message: "Setup not found" });

    // Generate questions based on experience level
    const allQuestions = await getQuestionsByExperience(
      setup.desiredRole,
      setup.experienceLevel
    );

    if (!allQuestions.length)
      return res.status(500).json({ message: "Failed to generate questions" });

    // Create a fresh interview session
    const session = await InterviewSession.create({
      userId,
      setupId,
      totalQuestions: allQuestions.length,
      currentIndex: 0,
      questions: allQuestions.map(q => ({ question: q, answer: "" })),
      isCompleted: false
    });

    return res.json({
      sessionId: session._id,
      question: allQuestions[0],
      totalQuestions: allQuestions.length
    });

  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------
// 2️⃣ SAVE ANSWER → RETURN NEXT QUESTION
// ------------------------------------------------------
exports.sendAnswer = async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;
    const userId = req.user.id;

    if (!sessionId || !answer)
      return res.status(400).json({ message: "sessionId and answer required" });

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    const index = session.currentIndex;

    // Save the current answer
    session.questions[index].answer = answer;
    session.currentIndex++;

    // If all questions answered
    if (session.currentIndex >= session.totalQuestions) {
      session.isCompleted = true;
      await session.save();
      return res.json({ done: true, message: "All questions answered" });
    }

    // Send the next question
    const nextQuestion = session.questions[session.currentIndex].question;
    await session.save();

    return res.json({
      done: false,
      nextQuestion,
      current: session.currentIndex + 1,
      total: session.totalQuestions
    });

  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------
// 3️⃣ FINISH → ANALYZE ANSWERS WITH OPENAI
// ------------------------------------------------------
exports.finishInterview = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId)
      return res.status(400).json({ message: "sessionId required" });

    const session = await InterviewSession.findById(sessionId);
    if (!session)
      return res.status(404).json({ message: "Session not found" });

    // Build transcript
    let transcript = "";
    session.questions.forEach((qa, i) => {
      transcript += `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}\n\n`;
    });

    // OpenAI evaluation prompt
    const prompt = `
Evaluate the following interview transcript and provide structured scoring.

Return ONLY pure JSON in this format:

{
  "technicalAccuracy": number(0-100),
  "completeness": number(0-100),
  "conciseness": number(0-100),
  "problemSolving": number(0-100),
  "summary": "string"
}

Transcript:
${transcript}
`;

    const result = await safeChatCompletion([
      { role: "user", content: prompt }
    ]);

    let output;
    try {
      output = JSON.parse(result.content);
    } catch (err) {
      output = {
        technicalAccuracy: 0,
        completeness: 0,
        conciseness: 0,
        problemSolving: 0,
        summary: "AI evaluation failed to parse"
      };
    }

    // Save AI evaluation
    session.technicalAccuracy = output.technicalAccuracy;
    session.completeness = output.completeness;
    session.conciseness = output.conciseness;
    session.problemSolving = output.problemSolving;
    session.aiSummary = output.summary;
    session.isCompleted = true;

    await session.save();

    return res.json({
      message: "Interview evaluated successfully",
      ...output
    });

  } catch (err) {
    next(err);
  }
};
