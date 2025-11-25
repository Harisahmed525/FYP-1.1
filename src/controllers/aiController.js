const PreInterview = require("../models/PreInterview");
const { safeChatCompletion } = require("../utils/openaiClient");

// Helper: treat "string", "", null, undefined as "not provided"
function cleanField(value) {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t) return null;
  if (t.toLowerCase() === "string") return null; // Swagger placeholder
  return value;
}

// Generate interview questions using AI
exports.generateQuestions = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Optional overrides from body (but we will mostly use latest setup)
    const {
      desiredRole,
      industry,
      educationLevel,
      experienceLevel
      // count is intentionally ignored – we always use 7
    } = req.body || {};

    let role = cleanField(desiredRole);
    let ind = cleanField(industry);
    let edu = cleanField(educationLevel);
    let exp = cleanField(experienceLevel);

    // Always try to load latest setup for this user
    const latest = await PreInterview.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (latest) {
      role = role || latest.desiredRole;
      ind = ind || latest.industry;
      edu = edu || latest.educationLevel;
      exp = exp || latest.experienceLevel;
    }

    if (!role || !exp) {
      return res.status(400).json({
        message:
          "No valid context found. Please create a pre-interview setup first."
      });
    }

    // 🔒 Fixed number of questions: always 7
    const qty = 7;

    const prompt = `
Generate ${qty} interview questions for this candidate:

Role: ${role}
Industry: ${ind || "N/A"}
Education: ${edu || "N/A"}
Experience level: ${exp}

Return ONLY valid JSON:

[
  { "question": "..." },
  { "question": "..." }
]
    `;

    // Safe OpenAI wrapper (will not crash if OPENAI_API_KEY missing)
    const result = await safeChatCompletion([
      { role: "user", content: prompt }
    ]);

    if (result.error) {
      return res.status(500).json({
        message: "AI unavailable",
        details: result.message
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(result.content);
    } catch {
      const match = result.content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (_) {
          parsed = null;
        }
      }
    }

    if (!parsed) {
      return res.json({
        error: "AI did not return valid JSON",
        raw: result.content
      });
    }

    return res.json({ questions: parsed });
  } catch (err) {
    next(err);
  }
};
