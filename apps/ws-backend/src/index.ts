import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db";

const wss = new WebSocketServer({ port: 8081 });

interface User {
  ws: WebSocket;
  rooms: number[]; // store numeric room IDs
  userId: string;
}

const users: User[] = [];

// Verify JWT and extract userId
function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded || !(decoded as JwtPayload).userId) {
      return null;
    }

    return (decoded as JwtPayload).userId as string;
  } catch (e) {
    console.error("JWT verification failed:", e);
    return null;
  }
}

wss.on("error", (error) => {
  const err = error as NodeJS.ErrnoException;
  if (err.code === "EADDRINUSE") {
    console.error("Port 8081 is already in use. Please stop the existing server.");
    process.exit(1);
  } else {
    console.error("WebSocket server error:", error);
  }
});

wss.on("connection", (ws, request) => {
  console.log("🟢 New WebSocket connection:", request.url);

  const url = request.url;
  if (!url) {
    console.log("❌ Connection without URL, closing");
    ws.close();
    return;
  }

  const [_, queryString] = url.split("?");
  const queryParams = new URLSearchParams(queryString);
  const token = queryParams.get("token") || "";

  console.log("Received token:", token ? "[present]" : "[missing]");

  const userId = checkUser(token);

  if (userId == null) {
    console.log("❌ Invalid or missing token, closing connection");
    ws.close();
    return;
  }

  console.log("✅ Authenticated user:", userId);

  const currentUser: User = {
    userId,
    rooms: [],
    ws,
  };

  users.push(currentUser);
  console.log("Current users connected:", users.length);

  ws.on("message", async (data) => {
    const raw = typeof data === "string" ? data : data.toString();
    console.log("📩 Raw WS message:", raw);

    let parsedData: any;
    try {
      parsedData = JSON.parse(raw);
    } catch (e) {
      console.error("❌ Failed to parse JSON message:", e);
      return;
    }

    const type = parsedData.type;
    console.log("Parsed message type:", type);

    const user = users.find((x) => x.ws === ws);
    if (!user) {
      console.log("❌ Message from unknown user (socket already removed?)");
      return;
    }

    // JOIN ROOM
    if (type === "join-room") {
      const roomId = Number(parsedData.roomId);
      if (!Number.isFinite(roomId)) {
        console.error("❌ Invalid roomId in join-room:", parsedData.roomId);
        return;
      }

      if (!user.rooms.includes(roomId)) {
        user.rooms.push(roomId);
      }

      console.log(`👤 User ${user.userId} joined room ${roomId}`);
      return;
    }

    // LEAVE ROOM
    if (type === "leave-room") {
      const roomId = Number(parsedData.roomId);
      if (!Number.isFinite(roomId)) {
        console.error("❌ Invalid roomId in leave-room:", parsedData.roomId);
        return;
      }

      user.rooms = user.rooms.filter((x) => x !== roomId);
      console.log(`👤 User ${user.userId} left room ${roomId}`);
      return;
    }

    // CHAT MESSAGE
    if (type === "chat") {
      const roomId = Number(parsedData.roomId);
      const message = parsedData.message as string | undefined;

      if (!Number.isFinite(roomId) || !message) {
        console.error("❌ Invalid chat payload:", parsedData);
        return;
      }

      console.log(`💬 Chat in room ${roomId} from user ${user.userId}:`, message);

      try {
        // Save chat message to DB
        await prismaClient.chat.create({
          data: {
            roomId, // Int in Prisma
            message,
            userId: user.userId, // from JWT
          },
        });
        console.log("✅ Saved chat message to DB");
      } catch (e) {
        console.error("❌ Error saving chat to DB:", e);
        // You can choose to return here or still broadcast
      }

      // Broadcast to all users in this room
      users.forEach((u) => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(
            JSON.stringify({
              type: "chat",
              message,
              roomId,
            }),
          );
        }
      });

      console.log(`📤 Broadcasted message to room ${roomId}`);
      return;
    }

    console.log("ℹ️ Unknown message type received:", type);
  });

  ws.on("close", () => {
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) {
      console.log("🔴 WebSocket closed for user:");
      users.splice(index, 1);
    } else {
      console.log("🔴 WebSocket closed for unknown user");
    }

    console.log("Current users connected:", users.length);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error for user", currentUser.userId, ":", err);
  });
});
