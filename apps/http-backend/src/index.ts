import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import aiRoutes from "./aiRoutes";

const app = express();
app.use(cors());
app.use(express.json());

// ── AI routes ──────────────────────────────────────────
app.use("/ai", aiRoutes);

// ── SIGNUP ─────────────────────────────────────────────
app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "email, password and name are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: { email, password: hashed, name },
    });

    return res.json({ userId: user.id });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ message: "Email already in use" });
    }
    console.error("Signup error:", e);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ── SIGNIN ─────────────────────────────────────────────
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    return res.json({ token });
  } catch (e) {
    console.error("Signin error:", e);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ── CREATE / JOIN ROOM ─────────────────────────────────
app.post("/room", middleware, async (req, res) => {
  const { name } = req.body;
  const userId = (req as any).userId;

  if (!name) {
    return res.status(400).json({ message: "Room name is required" });
  }

  try {
    // If room already exists, return it — otherwise create it
    let room = await prismaClient.room.findUnique({ where: { slug: name } });

    if (!room) {
      room = await prismaClient.room.create({
        data: { slug: name, adminId: userId },
      });
    }

    return res.json({ roomId: room.id });
  } catch (e) {
    console.error("Room error:", e);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ── GET CHAT / SHAPES FOR A ROOM ───────────────────────
app.get("/chats/:roomId", middleware, async (req, res) => {
  const roomId = Number(req.params.roomId);

  if (!Number.isFinite(roomId)) {
    return res.status(400).json({ message: "Invalid roomId" });
  }

  try {
    const messages = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { id: "asc" },
    });

    return res.json({ messages });
  } catch (e) {
    console.error("Chats error:", e);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ── START SERVER ───────────────────────────────────────
app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});