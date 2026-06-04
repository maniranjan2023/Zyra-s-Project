import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";

// ─── jsdom gaps that Radix UI relies on ──────────────────────────────────────
// ResizeObserver: used by @radix-ui/react-select internals
// hasPointerCapture / setPointerCapture / releasePointerCapture: called on
//   the trigger element when a pointerdown event fires
// scrollIntoView: called when Radix scrolls to the selected item
beforeAll(() => {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
});
// ─────────────────────────────────────────────────────────────────────────────

const actionCenterResponse = {
  student: {
    id: "stu_001",
    name: "Maya Patel",
    email: "maya.patel@school.edu",
    grade: 11,
    gpa: 3.2,
    counselorId: "csl_001",
    enrollmentStatus: "at_risk"
  },
  tasks: [
    {
      id: "tsk_001",
      studentId: "stu_001",
      title: "Submit FAFSA application",
      description: "Deadline is approaching. Student has not started the form.",
      status: "todo",
      priority: "urgent",
      dueDate: "2026-06-05",
      createdAt: "2026-05-13T14:00:00Z",
      updatedAt: "2026-05-13T14:00:00Z",
      isOverdue: false,
      isDueSoon: true,
      urgencyLabel: "Urgent"
    }
  ],
  unreadMessagesCount: 2,
  recentMessages: [
    {
      id: "msg_001",
      studentId: "stu_001",
      from: "Mrs. Thompson (Math)",
      subject: "Maya missing assignments",
      preview: "Maya has not submitted the last three homework sets...",
      read: false,
      receivedAt: "2026-05-30T08:30:00Z"
    }
  ],
  urgency: {
    level: "critical",
    label: "Critical",
    reasons: ["1 urgent open task", "2 unread messages"]
  }
};

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString();

        if (url.includes("/tasks/tsk_001/status") && init?.method === "PATCH") {
          return Response.json({
            task: {
              ...actionCenterResponse.tasks[0],
              status: "completed"
            }
          });
        }

        return Response.json(actionCenterResponse);
      })
    );
  });

  it("renders action center data and updates task status", async () => {
    renderApp();

    // Task title appears after data loads
    expect(await screen.findByText("Submit FAFSA application")).toBeInTheDocument();

    // "Maya Patel" appears in the student-selector tab AND the profile card
    expect(screen.getAllByText("Maya Patel")).toHaveLength(2);

    // Unread count "2" renders as both the large heading figure and the notification badge
    expect(screen.getAllByText("2")).toHaveLength(2);

    // Radix Select renders its trigger with role="combobox". One task → one trigger.
    await userEvent.click(screen.getByRole("combobox"));

    // After opening, each option carries role="option". Pick "Completed".
    await userEvent.click(await screen.findByRole("option", { name: "Completed" }));

    // The PATCH request must fire with the correct payload
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/tasks/tsk_001/status",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "completed" })
        })
      );
    });
  });
});
