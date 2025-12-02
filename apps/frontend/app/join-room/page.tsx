"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";

export default function JoinRoomPage() {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/signin");
    }
  }, [router]);

  async function handleJoin() {
    setError(null);

    if (!slug.trim()) {
      setError("Please enter a room slug.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      router.push("/signin");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${HTTP_BACKEND}/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: slug,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (_) {
        // ignore JSON parse error for now
      }

      if (!res.ok) {
        console.error("Join-room response not ok:", res.status, data);
        setError(data?.message || `Server error: ${res.status}`);
        return;
      }

      if (!data?.roomId) {
        console.error("Join-room: no roomId in response", data);
        setError("No roomId returned from server.");
        return;
      }

      // IMPORTANT: your route is /canvas/[roomId]
      router.push(`/canvas/${data.roomId}`);
    } catch (e) {
      console.error("Join-room network error:", e);
      setError("Network error. Please check console and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-linear-to-br from-gray-900 to-black text-white">
      <div className="w-[90%] max-w-sm bg-white text-black rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Join a Room</h1>
        <p className="text-center text-sm text-gray-500 mb-6">
          Enter a room slug to create or join a room.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Room Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. design-team"
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Joining..." : "Join Room"}
        </button>
      </div>
    </div>
  );
}
