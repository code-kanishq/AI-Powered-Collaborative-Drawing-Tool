"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useRouter } from "next/navigation";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Connecting to server...");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Not authenticated. Please sign in again.");
      router.push("/signin");
      return;
    }

    let ws: WebSocket;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    function connect() {
      attempts++;
      setStatus(`Connecting... (attempt ${attempts})`);

      ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token!)}`);

      ws.onopen = () => {
        setStatus("Connected!");
        setSocket(ws);
        ws.send(JSON.stringify({ type: "join-room", roomId }));
      };

      ws.onerror = () => {
        if (attempts < MAX_ATTEMPTS) {
          setStatus(`Connection failed, retrying in 1s... (${attempts}/${MAX_ATTEMPTS})`);
          retryTimeout = setTimeout(connect, 1000);
        } else {
          setError("Could not connect to server. Please refresh the page.");
        }
      };

      ws.onclose = () => {
        console.log("WS closed");
      };
    }

    connect();

    return () => {
      clearTimeout(retryTimeout);
      ws?.close();
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
        {status}
      </div>
    );
  }

  return (
    <div className="bg-amber-50 text-black">
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}