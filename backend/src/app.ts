import cors from "cors";
import express from "express";
import { actionCenterRouter } from "./routes/actionCenterRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { requestLogger } from "./middleware/requestLogger.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestId);
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use(actionCenterRouter);
  app.use(errorHandler);

  return app;
}
