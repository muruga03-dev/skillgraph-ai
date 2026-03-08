const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

router.post("/chat", async (req, res) => {

  try {

    const { system, messages } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://skillgraph-ai.vercel.app",
          "X-Title": "SkillGraph AI"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            ...messages
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "AI request failed"
    });

  }

});

module.exports = router;