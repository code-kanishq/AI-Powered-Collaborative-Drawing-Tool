import { useState } from "react";

export default function AiChat({ onCommand }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCommand() {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("Server returned error");
      }

      const data = await response.json();
      setLoading(false);

      if (data.output) {
        // Gemini returns raw text → must parse JSON safely
        try {
          const parsed = JSON.parse(data.output);
          onCommand(parsed);
        } catch (err) {
          alert("Gemini returned invalid JSON: " + data.output);
        }
      } else {
        alert("AI failed: " + JSON.stringify(data));
      }
    } catch (err) {
      setLoading(false);
      alert("Network error: " + err);
    }
  }

  return (
    <div style={{ padding: "10px", borderLeft: "1px solid #ccc" }}>
      <textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe what to draw..."
      />
      <button onClick={sendCommand} disabled={loading}>
        {loading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
}
