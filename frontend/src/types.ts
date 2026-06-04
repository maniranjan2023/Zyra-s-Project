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

export type ActionCenterTask = {
  id: string;
  studentId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  urgencyLabel: "Urgent" | "High" | "Medium" | "Low";
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

export type ActionCenter = {
  student: Student;
  tasks: ActionCenterTask[];
  unreadMessagesCount: number;
  recentMessages: Message[];
  urgency: {
    level: "critical" | "high" | "medium" | "low";
    label: "Critical" | "High Priority" | "Moderate" | "On Track";
    reasons: string[];
  };
};
