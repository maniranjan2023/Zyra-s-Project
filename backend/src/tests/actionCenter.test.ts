import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

describe("action center API", () => {
  const app = createApp();

  it("returns a student's action center with urgency and unread counts", async () => {
    const response = await request(app)
      .get("/students/stu_001/action-center")
      .expect(200);

    expect(response.body.student.name).toBe("Maya Patel");
    expect(response.body.unreadMessagesCount).toBe(2);
    expect(response.body.urgency.level).toBe("critical");
    expect(response.body.tasks[0]).toMatchObject({
      id: "tsk_003",
      isOverdue: true,
      urgencyLabel: "Urgent"
    });
  });

  it("updates a task status", async () => {
    const response = await request(app)
      .patch("/tasks/tsk_001/status")
      .send({ status: "completed" })
      .expect(200);

    expect(response.body.task).toMatchObject({
      id: "tsk_001",
      status: "completed"
    });
  });

  it("returns request IDs from error middleware", async () => {
    const response = await request(app)
      .patch("/tasks/tsk_001/status")
      .set("x-request-id", "test-request-id")
      .send({ status: "blocked" })
      .expect(400);

    expect(response.body.error).toEqual({
      message: "Status must be one of: todo, in_progress, completed",
      requestId: "test-request-id"
    });
  });
});
