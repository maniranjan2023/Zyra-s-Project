export type Student = {
  id: string;
  name: string;
  email: string;
  grade: number;
  gpa: number;
  counselorId: string;
  enrollmentStatus: "at_risk" | "active";
};

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  studentId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  studentId: string;
  from: string;
  subject: string;
  preview: string;
  read: boolean;
  receivedAt: string;
};

export type ActionCenterTask = Task & {
  isOverdue: boolean;
  isDueSoon: boolean;
  urgencyLabel: "Urgent" | "High" | "Medium" | "Low";
};

export type ActionCenterUrgency = {
  level: "critical" | "high" | "medium" | "low";
  label: "Critical" | "High Priority" | "Moderate" | "On Track";
  reasons: string[];
};
