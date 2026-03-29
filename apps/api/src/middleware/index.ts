import type { Express } from "express";
import express from "express";
import cors from "cors";

const ALLOWED_ORIGINS = [
  "https://macroapp-nine.vercel.app",
  "http://localhost:5173"
];

export function registerMiddleware(app: Express): void {
  app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
  app.use(express.json());
}
