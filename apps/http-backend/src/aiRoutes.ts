import express, { Router as ExpressRouter } from "express";
import fetch from "node-fetch";

const router: ExpressRouter = express.Router();

router.post("/parse", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = req.body.prompt;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt field" });
    }

    console.log("🔥 Gemini Request Prompt:", prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // Debug log
    console.log("🔥 Gemini Raw Response:", data);

    if (data.error) {
      return res.status(400).json({
        error: "Gemini request failed",
        detail: data.error.message,
      });
    }

    const outputText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ output: outputText });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: "Server failed", detail: error.message });
  }
});

export default router;
