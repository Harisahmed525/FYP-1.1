/**
 * Safe OpenAI Client Wrapper
 * - Does NOT crash when API key is missing
 * - Provides helper function: safeChatCompletion()
 * - Uses gpt-4o-mini (your chosen model)
 */

const OpenAI = require("openai");

// Check if OPENAI_API_KEY exists
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Create client only if key exists
let client = null;

if (OPENAI_KEY) {
  try {
    client = new OpenAI({ apiKey: OPENAI_KEY });
    console.log("✅ OpenAI client initialized");
  } catch (err) {
    console.error("❌ Failed to initialize OpenAI client:", err.message);
  }
} else {
  console.warn("⚠️ OPENAI_API_KEY missing → AI features disabled");
}

/**
 * Safe wrapper for Chat Completions.
 * If API is not configured, returns an error object instead of throwing.
 */
async function safeChatCompletion(messages, model = "gpt-4o-mini") {
  if (!client) {
    return {
      error: true,
      message:
        "OpenAI API key is missing. Please set OPENAI_API_KEY in .env.local"
    };
  }

  try {
    const response = await client.chat.completions.create({
      model,
      messages
    });

    return {
      error: false,
      content: response.choices[0].message.content
    };
  } catch (err) {
    console.error("❌ OpenAI Error:", err.message);

    return {
      error: true,
      message: "OpenAI request failed",
      details: err.message
    };
  }
}

module.exports = {
  openaiClient: client,
  safeChatCompletion
};
