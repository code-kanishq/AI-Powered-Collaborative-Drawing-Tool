"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, Square } from "lucide-react";
import { Game } from "@/make/Game";
import type { Tool } from "@/make/tool-types";
import { HTTP_BACKEND } from "@/config";

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);

  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

  // AI chat state
  const [prompt, setPrompt] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Initialize the Game object
  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new Game(canvasRef.current, roomId, socket);
    gameRef.current = game;
    game.setTool(selectedTool);

    return () => {
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, [roomId, socket]);

  // Sync selected tool
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.setTool(selectedTool);
    }
  }, [selectedTool]);

  // ----------------------------------------------------------
  // AI COMMAND — calls Gemini via backend
  // ----------------------------------------------------------
  async function handleSend() {
    if (!prompt.trim()) return;

    const userText = prompt.trim();
    setLog((prev) => [...prev, "👤 " + userText]);
    setPrompt("");
    setAiLoading(true);

    try {
      const response = await fetch(`${HTTP_BACKEND}/ai/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText }),
      });

      const data = await response.json();

      if (data.output) {
        try {
          const parsed = JSON.parse(data.output);
          const g = gameRef.current;

          if (g && parsed.shapes && Array.isArray(parsed.shapes)) {
            parsed.shapes.forEach((shape: any) => {
              if (shape.type === "circle") {
                g.drawCircle(shape.centerX, shape.centerY, shape.radius);
              } else if (shape.type === "rect") {
                g.drawRect(shape.x, shape.y, shape.width, shape.height);
              } else if (shape.type === "pencil") {
                g.drawLine(shape.startX, shape.startY, shape.endX, shape.endY);
              }
            });
            setLog((prev) => [
              ...prev,
              `🤖 Drew ${parsed.shapes.length} shape(s)!`,
            ]);
          } else {
            setLog((prev) => [...prev, "🤖 No shapes returned."]);
          }
        } catch (err) {
          setLog((prev) => [
            ...prev,
            "🤖 Could not parse AI response. Try rephrasing.",
          ]);
        }
      } else {
        setLog((prev) => [...prev, "🤖 AI error: " + JSON.stringify(data)]);
      }
    } catch (err) {
      setLog((prev) => [
        ...prev,
        "🤖 Network error — is the backend running?",
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  // Allow pressing Enter to send
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex" }}>

      {/* MAIN CANVAS */}
      <canvas
        ref={canvasRef}
        height={typeof window !== "undefined" ? window.innerHeight : 800}
        width={typeof window !== "undefined" ? window.innerWidth - 350 : 1000}
        style={{ borderRight: "1px solid #ddd" }}
      />

      {/* AI CHAT SIDEBAR */}
      <div
        style={{
          width: 350,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#fafafa",
          borderLeft: "1px solid #ccc",
          padding: 12,
        }}
      >
        <h2 style={{ fontWeight: "bold", marginBottom: 4 }}>🤖 AI Assistant</h2>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
          Describe what to draw — e.g. "draw a house using rectangles"
        </p>

        {/* Message log */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "white",
            borderRadius: 8,
            padding: 10,
            border: "1px solid #ddd",
            marginBottom: 10,
            fontSize: 13,
          }}
        >
          {log.length === 0 && (
            <p style={{ color: "#aaa", textAlign: "center", marginTop: 20 }}>
              Your conversation will appear here
            </p>
          )}
          {log.map((msg, i) => (
            <div key={i} style={{ marginBottom: 8, lineHeight: 1.4 }}>
              {msg}
            </div>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command and press Enter…"
          style={{
            width: "100%",
            height: 80,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
            resize: "none",
            fontSize: 13,
          }}
        />

        <button
          onClick={handleSend}
          disabled={aiLoading}
          style={{
            marginTop: 8,
            padding: "10px 16px",
            background: aiLoading ? "#888" : "black",
            color: "white",
            borderRadius: 8,
            cursor: aiLoading ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
        >
          {aiLoading ? "Thinking…" : "Send"}
        </button>
      </div>

      {/* Tool Bar */}
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

type TopBarProps = {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
};

function TopBar({ selectedTool, setSelectedTool }: TopBarProps) {
  return (
    <div style={{ position: "fixed", top: 10, left: 10, zIndex: 100 }}>
      <div className="flex gap-2">
        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
        />
        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<Circle />}
        />
        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<Square />}
        />
      </div>
    </div>
  );
}