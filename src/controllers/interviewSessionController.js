const InterviewSession = require("../models/InterviewSession");
const PreInterview = require("../models/PreInterview");
const { safeChatCompletion } = require("../utils/openaiClient");
const { uploadToFirebase } = require("../utils/firebase");

/**
 * 1️⃣ START INTERVIEW SESSION
 */
exports.startInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { setupId } = req.body;

    if (!setupId)
      return res.status(400).json({ message: "setupId is required" });

    const setup = await PreInterview.findById(setupId);
    if (!setup)
      return res.status(404).json({ message: "Setup not found" });

    const prompt = `
Generate one interview question for a candidate:

Role: ${setup.desiredRole}
Industry: ${setup.industry || "N/A"}
Education: ${setup.educationLevel || "N/A"}
Experience: ${setup.experienceLevel}

Return ONLY the question text.
`;

    const result = await safeChatCompletion([
      { role: "user", content: prompt }
    ]);

    const firstQuestion = result.error
      ? "AI unavailable. Default question: Tell me about yourself."
      : result.content.trim();

    const session = await InterviewSession.create({
      userId,
      setupId,
      questions: [{ question: firstQuestion, answer: "" }]
    });

    res.json({
      sessionId: session._id,
      question: firstQuestion
    });
  } catch (err) {
    next(err);
  }
};


/**
 * 2️⃣ HANDLE ANSWER → NEXT QUESTION
 */
exports.sendAnswer = async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body;
    const userId = req.user.id;

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.questions[session.questions.length - 1].answer = answer;

    const prompt = `
Previous: ${session.questions[session.questions.length - 1].question}
Answer: ${answer}

Generate the next interview question.
`;

    const result = await safeChatCompletion([
      { role: "user", content: prompt }
    ]);

    const nextQuestion = result.error
      ? "AI unavailable. Default follow-up: Why do you want this role?"
      : result.content.trim();

    session.questions.push({
      question: nextQuestion,
      answer: ""
    });

    await session.save();

    res.json({ nextQuestion });
  } catch (err) {
    next(err);
  }
};


/**
 * 3️⃣ LOG EMOTION DATA
 */
exports.logEmotion = async (req, res, next) => {
  try {
    const { sessionId, emotion, eyeContact, facialExpression, gestures, time } = req.body;

    await InterviewSession.findByIdAndUpdate(sessionId, {
      $push: {
        emotionTimeline: { emotion, eyeContact, facialExpression, gestures, time }
      }
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


/**
 * 4️⃣ UPLOAD VIDEO
 */
exports.uploadVideo = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "No video file provided" });

    const filePath = req.file.path;

    const video = await uploadToFirebase(filePath);

    if (video.error) {
      return res.json({
        error: true,
        message: "Firebase disabled. Video saved locally.",
        localPath: filePath
      });
    }

    await InterviewSession.findByIdAndUpdate(sessionId, {
      videoUrl: video.url
    });

    res.json({ videoUrl: video.url });
  } catch (err) {
    next(err);
  }
};


/**
 * 5️⃣ FINISH INTERVIEW — SAFE AI EVAL
 */
exports.finishInterview = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const session = await InterviewSession.findById(sessionId);

    if (!session) return res.status(404).json({ message: "Session not found" });

    let transcript = "";
    session.questions.forEach((qa, i) => {
      transcript += `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}\n\n`;
    });

    const prompt = `
Evaluate this interview transcript. Return JSON:

{
  "technicalScore": number,
  "communicationScore": number,
  "summary": "..."
}

Transcript:
${transcript}
`;

    const result = await safeChatCompletion([
      { role: "user", content: prompt }
    ]);

    let output = {
      technicalScore: 0,
      summary: "AI unavailable. Default summary."
    };

    if (!result.error) {
      try {
        output = JSON.parse(result.content);
      } catch {
        output.summary = result.content;
      }
    }

    await InterviewSession.findByIdAndUpdate(sessionId, {
      aiSummary: output.summary,
      technicalScore: output.technicalScore || 0,
      bodyLanguageScore: 0
    });

    res.json(output);
  } catch (err) {
    next(err);
  }
};
