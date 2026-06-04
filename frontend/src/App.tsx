import { useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ListTodo,
  Mail,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  UserRound
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchActionCenter, updateTaskStatus } from "./api/actionCenterApi";
import { useStudentStore } from "./store/useStudentStore";
import type { ActionCenter, ActionCenterTask, TaskStatus } from "./types";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Separator } from "./components/ui/separator";

type TaskFilter = "all" | TaskStatus;

const students = [
  { id: "stu_001", name: "Maya Patel" },
  { id: "stu_002", name: "Jordan Lee" },
  { id: "stu_003", name: "Carlos Rivera" }
];

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  completed: "Completed"
};

const urgencyCardStyles: Record<string, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  medium: "border-sky-200 bg-sky-50 text-sky-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

const urgencyBadgeStyles: Record<string, string> = {
  Urgent: "border-transparent bg-red-100 text-red-700 hover:bg-red-100",
  High: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-100",
  Medium: "border-transparent bg-sky-100 text-sky-700 hover:bg-sky-100",
  Low: "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-100"
};

const statusBadgeStyles: Record<TaskStatus, string> = {
  todo: "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100",
  in_progress: "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100",
  completed: "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
};

const urgencyBorderLeft: Record<string, string> = {
  Urgent: "border-l-red-500",
  High: "border-l-amber-400",
  Medium: "border-l-sky-400",
  Low: "border-l-slate-300"
};

const enrollmentBadgeStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  at_risk: "bg-red-100 text-red-600"
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}

function StudentSelector() {
  const selectedStudentId = useStudentStore((state) => state.selectedStudentId);
  const setSelectedStudentId = useStudentStore((state) => state.setSelectedStudentId);

  return (
    <Tabs value={selectedStudentId} onValueChange={setSelectedStudentId}>
      <TabsList aria-label="Students">
        {students.map((student) => (
          <TabsTrigger key={student.id} value={student.id}>
            {student.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

function ProfileSummary({ data }: { data: ActionCenter }) {
  const initials = data.student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card aria-labelledby="profile-heading">
      <CardHeader className="pb-4">
        <CardTitle
          id="profile-heading"
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400"
        >
          <UserRound aria-hidden="true" size={12} />
          Student Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-600 text-base font-black text-white shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-950">{data.student.name}</h3>
            <p className="truncate text-xs text-slate-500">{data.student.email}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${enrollmentBadgeStyles[data.student.enrollmentStatus]}`}
          >
            {data.student.enrollmentStatus === "at_risk" ? "At Risk" : "Active"}
          </span>
        </div>

        <Separator />

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Grade</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{data.student.grade}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">GPA</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{data.student.gpa.toFixed(1)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">ID</p>
            <p className="mt-1.5 font-mono text-[11px] font-bold text-slate-600">
              {data.student.id.replace("stu_", "#")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UrgencyPanel({ data }: { data: ActionCenter }) {
  return (
    <Card
      className={urgencyCardStyles[data.urgency.level]}
      aria-labelledby="urgency-heading"
    >
      <CardHeader className="pb-4">
        <CardTitle
          id="urgency-heading"
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest"
        >
          <ShieldAlert aria-hidden="true" size={12} />
          Urgency Level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="block text-3xl font-black tracking-tight">{data.urgency.label}</span>
          <p className="mt-1 text-xs font-medium opacity-60">Requires counselor attention</p>
        </div>
        <div className="h-px w-full bg-current opacity-15" />
        <ul className="space-y-2.5 text-sm font-medium">
          {data.urgency.reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
              <span className="leading-snug">{reason}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function MessageSummary({ data }: { data: ActionCenter }) {
  return (
    <Card aria-labelledby="messages-heading">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle
            id="messages-heading"
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400"
          >
            <Mail aria-hidden="true" size={12} />
            Messages
          </CardTitle>
          {data.unreadMessagesCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-black text-white">
              {data.unreadMessagesCount}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end gap-3">
          <p className="text-4xl font-black tracking-tight text-slate-950">
            {data.unreadMessagesCount}
          </p>
          <div className="pb-1">
            <p className="text-sm font-semibold text-slate-600">unread messages</p>
            <p className="text-xs text-slate-400">Awaiting response</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {data.recentMessages.map((message) => (
            <article key={message.id} className="flex items-start gap-3">
              <div
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  message.read ? "bg-slate-200" : "bg-teal-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {message.from}
                </span>
                <strong className="block truncate text-sm font-medium text-slate-800">
                  {message.subject}
                </strong>
              </div>
              {!message.read && (
                <span className="shrink-0 rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">
                  New
                </span>
              )}
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyTaskState({ filter }: { filter: TaskFilter }) {
  const config = {
    all: {
      icon: <ListTodo className="h-6 w-6" />,
      title: "No tasks assigned",
      desc: "This student has no counselor tasks yet.",
    },
    todo: {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "All caught up",
      desc: "No pending tasks to action right now.",
    },
    in_progress: {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Nothing in progress",
      desc: "No tasks are currently being worked on.",
    },
    completed: {
      icon: <BookOpen className="h-6 w-6" />,
      title: "No completed tasks yet",
      desc: "Completed tasks will appear here.",
    },
  } satisfies Record<TaskFilter, { icon: JSX.Element; title: string; desc: string }>;

  const { icon, title, desc } = config[filter];
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-400">{desc}</p>
    </div>
  );
}

function TaskRow({
  task,
  onStatusChange,
  isUpdating
}: {
  task: ActionCenterTask;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isUpdating: boolean;
}) {
  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-lg border border-l-4 border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm ${urgencyBorderLeft[task.urgencyLabel]}`}
    >
      <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h3 className="text-sm font-bold leading-snug text-slate-900">{task.title}</h3>
            <Badge className={urgencyBadgeStyles[task.urgencyLabel]}>
              {task.urgencyLabel}
            </Badge>
          </div>
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {task.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <Badge className={statusBadgeStyles[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock3 aria-hidden="true" size={11} />
              Due {formatDate(task.dueDate)}
            </span>
            {task.isOverdue && (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                <AlertCircle aria-hidden="true" size={11} />
                Overdue
              </span>
            )}
            {task.isDueSoon && !task.isOverdue && (
              <span className="text-xs font-semibold text-amber-500">Due soon</span>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 sm:w-40">
          <Select
            value={task.status}
            disabled={isUpdating}
            onValueChange={(v) => onStatusChange(task.id, v as TaskStatus)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function TaskList({ data }: { data: ActionCenter }) {
  const [filter, setFilter] = useState<TaskFilter>("all");
  const queryClient = useQueryClient();
  const selectedStudentId = useStudentStore((state) => state.selectedStudentId);

  const mutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["action-center", selectedStudentId] });
    }
  });

  const counts = {
    all: data.tasks.length,
    todo: data.tasks.filter((t) => t.status === "todo").length,
    in_progress: data.tasks.filter((t) => t.status === "in_progress").length,
    completed: data.tasks.filter((t) => t.status === "completed").length
  };

  const filteredTasks =
    filter === "all" ? data.tasks : data.tasks.filter((t) => t.status === filter);

  const completionPct =
    counts.all > 0 ? Math.round((counts.completed / counts.all) * 100) : 0;

  const filterTabs: Array<{ key: TaskFilter; label: string }> = [
    { key: "all", label: "All" },
    { key: "todo", label: "To do" },
    { key: "in_progress", label: "In progress" },
    { key: "completed", label: "Completed" }
  ];

  return (
    <Card aria-labelledby="tasks-heading">
      <CardHeader className="pb-0">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle id="tasks-heading" className="text-lg font-black text-slate-950">
              Task List
            </CardTitle>
            <p className="mt-0.5 text-sm text-slate-500">
              {counts.all - counts.completed} open &middot; {counts.completed} completed
            </p>
          </div>
          <div className="text-right">
            <span className="block text-3xl font-black leading-none text-slate-950">
              {completionPct}%
            </span>
            <span className="text-xs text-slate-400">complete</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-[width] duration-700"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Filter tabs */}
        <div className="mt-1 flex overflow-x-auto border-b border-slate-100">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                filter === tab.key
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-px text-[11px] font-bold ${
                  filter === tab.key
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {mutation.isError && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
            Could not update task. Please try again.
          </p>
        )}

        {filteredTasks.length === 0 ? (
          <EmptyTaskState filter={filter} />
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isUpdating={mutation.isPending}
                onStatusChange={(taskId, status) => mutation.mutate({ taskId, status })}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function App() {
  const selectedStudentId = useStudentStore((state) => state.selectedStudentId);
  const query = useQuery({
    queryKey: ["action-center", selectedStudentId],
    queryFn: () => fetchActionCenter(selectedStudentId)
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <GraduationCap aria-hidden="true" size={19} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-950">
                  Action Center
                </span>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700">
                  Counselor
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Zyra Student Management · Prioritized actions &amp; follow-ups
              </p>
            </div>
          </div>
          <StudentSelector />
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-8">
        {query.isLoading && (
          <Card role="status">
            <CardContent className="flex items-center gap-3 p-5">
              <RefreshCw aria-hidden="true" className="animate-spin text-teal-600" size={18} />
              <span className="text-sm font-semibold text-slate-600">
                Loading action center...
              </span>
            </CardContent>
          </Card>
        )}

        {query.isError && (
          <Card className="border-red-200 bg-red-50" role="alert">
            <CardContent className="flex flex-col gap-3 p-5 text-red-700 sm:flex-row sm:items-center">
              <AlertCircle aria-hidden="true" size={20} />
              <span className="flex-1 text-sm font-semibold">
                Could not load this student&apos;s action center.
              </span>
              <Button variant="destructive" size="sm" onClick={() => query.refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {query.data && (
          <>
            <div className="mb-5 grid gap-4 lg:grid-cols-[1.15fr_0.9fr_0.95fr]">
              <ProfileSummary data={query.data} />
              <UrgencyPanel data={query.data} />
              <MessageSummary data={query.data} />
            </div>
            <TaskList data={query.data} />
          </>
        )}
      </div>
    </main>
  );
}
