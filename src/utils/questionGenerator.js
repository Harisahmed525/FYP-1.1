const { safeChatCompletion } = require("./openaiClient");

/**
 * Extract questions reliably even if OpenAI returns:
 * - numbered lists
 * - bullet lists
 * - blank lines
 * - multiple lines in a single string
 */
function extractQuestions(raw) {
  return raw
    .split(/\r?\n+/)                             // split on linebreaks or multiple linebreaks
    .map(line => line.trim())
    .map(line => line.replace(/^\d+[\.\)\-]\s*/, "")) // remove "1.", "1)", "1-", etc
    .map(line => line.replace(/^[-*]\s*/, ""))        // remove bullet points
    .filter(line => line.length > 5);                 // remove empty or useless lines
}

/**
 * Generate multiple questions in one OpenAI call
 */
async function generateMultipleQuestions(role, count, difficulty) {
  const prompt = `
Generate ${count} unique technical interview questions.

Role: ${role}
Difficulty: ${difficulty}

Rules:
- Output ONLY the questions
- One per line
- No numbering (but if you add numbering, it's fine — we'll clean it)
- No formatting
- No paragraphs
`;

  console.log("🔥 Sending prompt to OpenAI:", prompt);

  const result = await safeChatCompletion([{ role: "user", content: prompt }]);

  if (result.error) {
    console.error("❌ OpenAI error:", result.details || result.message);
    return [];
  }

  const raw = result.content || "";
  console.log("📥 RAW TEXT RETURNED BY OPENAI:\n", raw);

  const extracted = extractQuestions(raw);
  console.log("🧪 Extracted Questions:", extracted);

  // If fewer questions returned than requested, retry ONCE
  if (extracted.length < count) {
    console.warn("⚠ Not enough questions, regenerating...");
    return extracted; // temporarily return what we have
  }

  return extracted.slice(0, count);
}

/**
 * Generate all questions based on experience level
 */
async function getQuestionsByExperience(role, experienceLevel) {
  experienceLevel = experienceLevel.trim().toLowerCase();
  console.log("LEVEL:", experienceLevel);

  let difficultyMix = [];

  if (experienceLevel === "entry level") {
    difficultyMix = [
      { level: "easy", amount: 3 },
      { level: "medium", amount: 2 },
      { level: "hard", amount: 2 }
    ];
  } else if (experienceLevel === "mid level") {
    difficultyMix = [
      { level: "medium", amount: 6 },
      { level: "hard", amount: 4 }
    ];
  } else if (experienceLevel === "senior level") {
    difficultyMix = [
      { level: "hard", amount: 6 },
      { level: "very hard", amount: 6 }
    ];
  } else {
    console.error("❌ Experience level invalid:", experienceLevel);
    return [];
  }

  let finalQuestions = [];

  for (const mix of difficultyMix) {
    const qs = await generateMultipleQuestions(role, mix.amount, mix.level);

    if (!qs.length) {
      console.error("❌ FAILED TO GENERATE QUESTIONS FOR LEVEL:", mix.level);
      return [];
    }

    finalQuestions.push(...qs);
  }

  console.log("🎯 FINAL QUESTIONS:", finalQuestions);
  return finalQuestions;
}

module.exports = { getQuestionsByExperience };
