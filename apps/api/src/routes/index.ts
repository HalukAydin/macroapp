import type { Express } from "express";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import weightRouter from "./weight.js";
import foodRouter from "./food.js";

export function registerRoutes(app: Express): void {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/profile", profileRouter);
  app.use("/weight", weightRouter);
  app.use("/food", foodRouter);
}
