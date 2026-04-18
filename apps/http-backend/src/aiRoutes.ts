import express, { Router as ExpressRouter } from "express";
import fetch from "node-fetch";

const router: ExpressRouter = express.Router();

// This is the instruction we give Gemini — tells it to reply ONLY with JSON
const SYSTEM_PROMPT = `You are an AI assistant for a drawing application.
The user will describe what they want to draw.
You must respond ONLY with a valid JSON object — no explanation, no markdown, no code blocks.

The JSON must have a "shapes" array. Each shape must be one of these exact formats:
- { "type": "circle", "centerX": number, "centerY": number, "radius": number }
- { "type": "rect", "x": number, "y": number, "width": number, "height": number }
- { "type": "pencil", "startX": number, "startY": number, "endX": number, "endY": number }

The canvas is 1200 pixels wide and 800 pixels tall.
Place shapes at sensible positions and sizes.

Example — if the user says "draw a circle in the middle":
{"shapes":[{"type":"circle","centerX":600,"centerY":400,"radius":80}]}

IMPORTANT: Your entire response must be ONLY the JSON object. Nothing else.`;

router.post("/parse", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const userPrompt = req.body.prompt;

    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key missing" });
    }

    if (!userPrompt) {
      return res.status(400).json({ error: "Missing prompt field" });
    }

    console.log("🔥 AI Request:", userPrompt);

    // Combine system instruction + user prompt into one message
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser request: ${userPrompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
        }),
      }
    );

    const data = await response.json() as any;

    if (data.error) {
      return res.status(400).json({
        error: "Gemini request failed",
        detail: data.error.message,
      });
    }

    let outputText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip markdown code blocks if Gemini wraps the JSON in ```json ... ```
    outputText = outputText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    console.log("🤖 AI Response:", outputText);

    res.json({ output: outputText });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: "Server failed", detail: error.message });
  }
});

export default router;