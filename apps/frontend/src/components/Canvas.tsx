"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, Square } from "lucide-react";
import { Game } from "@/make/Game";
import type { Tool } from "@/make/tool-types";

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

  // --------------------------
  // Initialize the Game object
  // --------------------------
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
  // Simple AI COMMAND PARSER  (no actual LLM call yet)
  // ----------------------------------------------------------
  function processAICommand(text: string) {
    const g = gameRef.current;
    if (!g) return;

    const lower = text.toLowerCase();

    // draw circle radius 40 at 200 200
    const circleMatch = lower.match(/circle.*?radius\s+(\d+).*?at\s+(\d+)\s+(\d+)/);
    if (circleMatch) {
      const radius = parseInt(circleMatch[1]);
      const x = parseInt(circleMatch[2]);
      const y = parseInt(circleMatch[3]);
      g.drawCircle(x, y, radius);
      return "✔️ Circle created";
    }

    // rectangle 120 80 at 300 100
    const rectMatch = lower.match(/rect|rectangle.*?(\d+)\s+(\d+).*?at\s+(\d+)\s+(\d+)/);
    if (rectMatch) {
      const w = parseInt(rectMatch[1]);
      const h = parseInt(rectMatch[2]);
      const x = parseInt(rectMatch[3]);
      const y = parseInt(rectMatch[4]);
      g.drawRect(x, y, w, h);
      return "✔️ Rectangle created";
    }

    // line 0 0 to 400 100
    const lineMatch = lower.match(/line.*?(\d+)\s+(\d+).*?to\s+(\d+)\s+(\d+)/);
    if (lineMatch) {
      const x1 = parseInt(lineMatch[1]);
      const y1 = parseInt(lineMatch[2]);
      const x2 = parseInt(lineMatch[3]);
      const y2 = parseInt(lineMatch[4]);
      g.drawLine(x1, y1, x2, y2);
      return "✔️ Line created";
    }

    return "❌ Sorry, I didn't understand that command.";
  }

  function handleSend() {
    if (!prompt.trim()) return;

    const userText = prompt.trim();
    setLog((prev) => [...prev, "👤: " + userText]);

    const response = processAICommand(userText);
    setLog((prev) => [...prev, "🤖: " + response]);

    setPrompt("");
  }

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
      }}
    >
      {/* MAIN CANVAS */}
      <canvas
        ref={canvasRef}
        height={typeof window !== "undefined" ? window.innerHeight : 800}
        width={typeof window !== "undefined" ? window.innerWidth - 350 : 1000}
        style={{
          borderRight: "1px solid #ddd",
        }}
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
        <h2 style={{ fontWeight: "bold", marginBottom: 10 }}>AI Assistant</h2>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "white",
            borderRadius: 8,
            padding: 10,
            border: "1px solid #ddd",
            marginBottom: 10,
          }}
        >
          {log.map((msg, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              {msg}
            </div>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a command…"
          style={{
            width: "100%",
            height: 80,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
            resize: "none",
          }}
        />

        <button
          onClick={handleSend}
          style={{
            marginTop: 8,
            padding: "10px 16px",
            background: "black",
            color: "white",
            borderRadius: 8,
          }}
        >
          Send
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
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 10,
        zIndex: 100,
      }}
    >
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
