const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { system, messages } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: system },
          ...messages
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({
      success: true,
      reply
    });

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "AI request failed"
    });
  }
});

module.exports = router;