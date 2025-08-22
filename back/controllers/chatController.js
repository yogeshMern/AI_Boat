require("dotenv").config();
const axios = require("axios");
const { botRoles } = require("../roles/botRoles");
const { sendError, sendSuccess } = require("../utils/response");

// ✅ Load and validate API keys
const API_KEYS = [
  process.env.GROQ_API_KEY1,
  process.env.GROQ_API_KEY2,
  process.env.GROQ_API_KEY3,
].filter((key) => key && key.trim() !== "");

if (API_KEYS.length === 0) {
  console.error("❌ No valid API keys found. Exiting.");
  process.exit(1);
}

// 🤖 Main chat handler
exports.prompt = async (req, res) => {
  const { message, botType = "default" } = req.body;

  if (!message || typeof message !== "string" || message.trim() === "") {
    return sendError(
      res,
      "Message is required and must be a non-empty string.",
      400
    );
  }

  const systemPrompt = botRoles[botType] || botRoles["default"];
  let lastError = null;

  for (let i = 0; i < API_KEYS.length; i++) {
    const apiKey = API_KEYS[i];
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama3-70b-8192",
          messages: [
            { role: "system", content: systemPrompt.trim() },
            { role: "user", content: message.trim() },
          ],
          temperature: 0.7,
          max_tokens: 400,
          top_p: 0.9,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const reply = response.data.choices[0]?.message?.content;
      if (!reply) throw new Error("Empty response from API");

      return sendSuccess(
        res,
        {
          reply: reply.trim(),
          botType,
          model: "llama3-70b-8192",
          timestamp: new Date().toISOString(),
        },
        "Reply generated"
      );
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      console.warn(`⚠️ API key ${i + 1} (${apiKey.slice(0, 5)}...) failed:`, {
        status,
        message,
        type: error.code || "unknown",
      });

      if (status === 429) continue;

      if (status >= 400 && status < 500 && status !== 429) {
        return sendError(res, `API request failed: ${message}`, 400);
      }
    }
  }

  // All keys failed
  const status = lastError?.response?.status || 500;
  const retryAfter = lastError?.response?.headers?.["retry-after"];
  const fallbackMessage =
    status === 429
      ? "All API keys are rate-limited. Please try again later."
      : "Service temporarily unavailable. Please try again.";

  return sendError(res, `API request failed: ${message}`, 400, {
    retryAfter: retryAfter || null,
    err: fallbackMessage,
  });
};

// 🧪 Health check endpoint
exports.healthPrompt = async (req, res) => {
  return sendSuccess(
    res,
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      apiKeysCount: API_KEYS.length,
    },
    "Server is healthy"
  );
};

// 🔍 List bot types
exports.botTypes = async (req, res) => {
  return sendSuccess(
    res,
    {
      botTypes: Object.keys(botRoles),
      default: "default",
    },
    "Available bot types"
  );
};
