import type { Express } from "express";

export function registerRoutes(app: Express): void {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
}
