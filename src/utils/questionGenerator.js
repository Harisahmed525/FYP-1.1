const { safeChatCompletion } = require("./openaiClient");

// ------------------------------------------------------
// Generate a single interview question
// ------------------------------------------------------
async function generateQuestion(role, difficulty) {
  const prompt = `
Generate ONE ${difficulty} level technical interview question for the role:
"${role}"

Rules:
- Return ONLY the question text (no numbering, no description).
- Keep the question concise.
`;

  try {
    const result = await safeChatCompletion([{ role: "user", content: prompt }]);
    return result?.content?.trim() || "Could not generate question.";
  } catch (err) {
    console.error("Error generating question:", err);
    return "Fallback question due to error.";
  }
}

// ------------------------------------------------------
// Generate multiple questions based on experience level
// ------------------------------------------------------
async function getQuestionsByExperience(role, experienceLevel) {
  let difficultyMix = [];

  switch (experienceLevel) {
    case "Entry level":
      difficultyMix = [
        { level: "easy", amount: 3 },
        { level: "medium", amount: 2 },
        { level: "hard", amount: 2 }
      ];
      break;

    case "Mid level":
      difficultyMix = [
        { level: "medium", amount: 6 },
        { level: "hard", amount: 4 }
      ];
      break;

    case "Senior level":
      difficultyMix = [
        { level: "hard", amount: 6 },
        { level: "very hard", amount: 6 }
      ];
      break;

    default:
      // Fallback default if experienceLevel is invalid
      difficultyMix = [
        { level: "medium", amount: 5 },
        { level: "hard", amount: 3 }
      ];
      break;
  }

  const finalQuestions = [];
  const seenQuestions = new Set();

  // Generate questions based on difficulty mix
  for (const mix of difficultyMix) {
    for (let i = 0; i < mix.amount; i++) {
      let question = await generateQuestion(role, mix.level);

      // Avoid duplicate questions
      let attempts = 0;
      while (seenQuestions.has(question) && attempts < 3) {
        question = await generateQuestion(role, mix.level);
        attempts++;
      }

      seenQuestions.add(question);
      finalQuestions.push(question);
    }
  }

  return finalQuestions;
}

module.exports = { getQuestionsByExperience };
