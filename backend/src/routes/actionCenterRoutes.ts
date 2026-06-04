import { Router } from "express";
import { getActionCenter, updateTaskStatus } from "../services/actionCenterService.js";

export const actionCenterRouter = Router();

actionCenterRouter.get("/students/:id/action-center", (req, res, next) => {
  try {
    res.json(getActionCenter(req.params.id));
  } catch (error) {
    next(error);
  }
});

actionCenterRouter.patch("/tasks/:taskId/status", (req, res, next) => {
  try {
    const task = updateTaskStatus(req.params.taskId, req.body.status);
    res.json({ task });
  } catch (error) {
    next(error);
  }
});
