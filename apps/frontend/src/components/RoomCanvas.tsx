// draw-app/apps/frontend/components/RoomCanvas.tsx

"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Not authenticated. Please sign in again.");
      router.push("/signin");
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join-room",
          roomId,
        })
      );
    };

    ws.onerror = (err) => {
      console.error("WS error:", err);
      setError("WebSocket error. Please refresh.");
    };

    ws.onclose = () => {
      console.log("WS closed");
    };

    // cleanup
    return () => {
      ws.close();
      setSocket(null);
    };
  }, [roomId, router]);

  if (error) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-amber-50 text-red-600">
        {error}
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-amber-50 text-black">
        Connecting to server...
      </div>
    );
  }

  return (
    <div className="bg-amber-50 text-black">
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
