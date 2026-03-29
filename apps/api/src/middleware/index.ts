import type { Express } from "express";
import express from "express";

export function registerMiddleware(app: Express): void {
  app.use(express.json());
}
