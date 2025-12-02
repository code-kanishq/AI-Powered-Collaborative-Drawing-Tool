import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      message: "No Authorization header",
    });
  }

  // Support "Bearer <token>" or just "<token>"
  const token =
    typeof authHeader === "string" && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7) // remove "Bearer "
      : (authHeader as string);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    // attach userId so /room can use it
    (req as any).userId = decoded.userId;

    next();
  } catch (e) {
    console.error("JWT verify failed in middleware:", e);
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}
