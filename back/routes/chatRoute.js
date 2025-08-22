const express = require("express");
const {
  prompt,
  healthPrompt,
  botTypes,
} = require("../controllers/chatController");

const router = express.Router();

router.post("/chat", prompt);
router.get("/health", healthPrompt);
router.get("/bot-types", botTypes);

module.exports = router;
