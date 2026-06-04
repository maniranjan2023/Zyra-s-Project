import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incomingRequestId = req.header("x-request-id");
  req.requestId = incomingRequestId || randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
}
