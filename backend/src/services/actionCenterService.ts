import { messages, students, tasks } from "../data/mockData.js";
import { HttpError } from "../errors.js";
import type { ActionCenterTask, ActionCenterUrgency, Task, TaskStatus } from "../types.js";

const TODAY = "2026-06-04";
const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "completed"];

function isOpenTask(task: Task) {
  return task.status !== "completed";
}

function daysUntilDue(dueDate: string) {
  const due = new Date(`${dueDate}T00:00:00Z`).getTime();
  const today = new Date(`${TODAY}T00:00:00Z`).getTime();
  return Math.ceil((due - today) / 86_400_000);
}

function decorateTask(task: Task): ActionCenterTask {
  const remainingDays = daysUntilDue(task.dueDate);
  const isOverdue = isOpenTask(task) && remainingDays < 0;
  const isDueSoon = isOpenTask(task) && remainingDays >= 0 && remainingDays <= 3;
  const urgencyLabel = task.priority === "urgent" || isOverdue
    ? "Urgent"
    : task.priority === "high" || isDueSoon
      ? "High"
      : task.priority === "medium"
        ? "Medium"
        : "Low";

  return {
    ...task,
    isOverdue,
    isDueSoon,
    urgencyLabel
  };
}

function summarizeUrgency(studentTasks: ActionCenterTask[], unreadMessagesCount: number): ActionCenterUrgency {
  const openTasks = studentTasks.filter(isOpenTask);
  const urgentOpenCount = openTasks.filter((task) => task.priority === "urgent").length;
  const overdueCount = openTasks.filter((task) => task.isOverdue).length;
  const dueSoonCount = openTasks.filter((task) => task.isDueSoon).length;
  const highOpenCount = openTasks.filter((task) => task.priority === "high").length;
  const reasons: string[] = [];

  if (urgentOpenCount > 0) reasons.push(`${urgentOpenCount} urgent open task${urgentOpenCount === 1 ? "" : "s"}`);
  if (overdueCount > 0) reasons.push(`${overdueCount} overdue task${overdueCount === 1 ? "" : "s"}`);
  if (dueSoonCount > 0) reasons.push(`${dueSoonCount} task${dueSoonCount === 1 ? "" : "s"} due within 3 days`);
  if (unreadMessagesCount > 0) reasons.push(`${unreadMessagesCount} unread message${unreadMessagesCount === 1 ? "" : "s"}`);

  if (urgentOpenCount > 0 || overdueCount > 0) {
    return { level: "critical", label: "Critical", reasons };
  }

  if (highOpenCount > 0 || dueSoonCount > 0) {
    return { level: "high", label: "High Priority", reasons };
  }

  if (openTasks.length > 0 || unreadMessagesCount > 0) {
    return { level: "medium", label: "Moderate", reasons: reasons.length ? reasons : ["Open follow-up items"] };
  }

  return { level: "low", label: "On Track", reasons: ["No urgent counselor action needed"] };
}

export function getActionCenter(studentId: string) {
  const student = students.find((candidate) => candidate.id === studentId);

  if (!student) {
    throw new HttpError(404, "Student not found");
  }

  const studentTasks = tasks
    .filter((task) => task.studentId === studentId)
    .map(decorateTask)
    .sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      return daysUntilDue(a.dueDate) - daysUntilDue(b.dueDate);
    });

  const studentMessages = messages
    .filter((message) => message.studentId === studentId)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  const unreadMessagesCount = studentMessages.filter((message) => !message.read).length;

  return {
    student,
    tasks: studentTasks,
    unreadMessagesCount,
    recentMessages: studentMessages.slice(0, 3),
    urgency: summarizeUrgency(studentTasks, unreadMessagesCount)
  };
}

export function updateTaskStatus(taskId: string, status: unknown) {
  if (!VALID_STATUSES.includes(status as TaskStatus)) {
    throw new HttpError(400, "Status must be one of: todo, in_progress, completed");
  }

  const task = tasks.find((candidate) => candidate.id === taskId);

  if (!task) {
    throw new HttpError(404, "Task not found");
  }

  task.status = status as TaskStatus;
  task.updatedAt = new Date().toISOString();

  return task;
}
