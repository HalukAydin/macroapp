import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthedRequest = Request & { userId: number };

type JwtPayload = { userId: number };

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server misconfiguration: JWT_SECRET not set" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    (req as AuthedRequest).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
