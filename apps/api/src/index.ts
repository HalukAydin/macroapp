import "dotenv/config";
import express from "express";
import { registerMiddleware } from "./middleware/index.js";
import { registerRoutes } from "./routes/index.js";

// Imported here to verify the workspace link resolves at startup.
// Domain functions will be used in route handlers as the API grows.
import "@macro/core";

const app = express();
const PORT = process.env.PORT ?? 3002;

registerMiddleware(app);
registerRoutes(app);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
