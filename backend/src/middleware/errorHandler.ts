import type { ErrorRequestHandler } from "express";
import { HttpError } from "../errors.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = err instanceof HttpError ? err.message : "Internal server error";

  console.error(
    JSON.stringify({
      requestId: req.requestId,
      statusCode,
      message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    })
  );

  res.status(statusCode).json({
    error: {
      message,
      requestId: req.requestId
    }
  });
};
