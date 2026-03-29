import type { Express } from "express";
import authRouter from "./auth.js";

export function registerRoutes(app: Express): void {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRouter);
}
