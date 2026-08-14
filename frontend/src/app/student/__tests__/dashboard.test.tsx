import { render, screen, waitFor } from "@testing-library/react";
import "@/test-utils/mocks";
import { mockGet } from "@/test-utils/mocks";
import StudentDashboard from "@/app/student/page";


jest.mock("@/components/ProtectedRoute", () => {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { __esModule: true, default: ProtectedRoute };
});

jest.mock("@/components/DashboardLayout", () => {
  const DashboardLayout = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { __esModule: true, default: DashboardLayout };
});

jest.mock("@/lib/api", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
  },
  getErrorMessage: (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback,
}));

const future = new Date(Date.now() + 7 * 86400000).toISOString();
const past = new Date(Date.now() - 7 * 86400000).toISOString();

const assignments = [
  {
    id: "a1",
    title: "Due Essay",
    description: "Write an essay",
    classSubjectId: "cs1",
    className: "Ten",
    subjectName: "English",
    teacherId: "t1",
    teacherName: "John Smith",
    deadline: future,
    maxMarks: 100,
    status: "Published" as const,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "a2",
    title: "Submitted Report",
    description: "Write a report",
    classSubjectId: "cs1",
    className: "Ten",
    subjectName: "English",
    teacherId: "t1",
    teacherName: "John Smith",
    deadline: future,
    maxMarks: 50,
    status: "Published" as const,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "a3",
    title: "Missed Homework",
    description: "Past deadline homework",
    classSubjectId: "cs1",
    className: "Ten",
    subjectName: "Math",
    teacherId: "t1",
    teacherName: "John Smith",
    deadline: past,
    maxMarks: 20,
    status: "Published" as const,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const submissions = [
  {
    id: "s1",
    assignmentId: "a2",
    assignmentTitle: "Submitted Report",
    studentId: "st1",
    studentName: "Alice",
    content: "My report",
    status: "Submitted" as const,
    marks: null,
    feedback: null,
    submittedAt: "2026-01-05T00:00:00Z",
    createdAt: "2026-01-05T00:00:00Z",
    updatedAt: "2026-01-05T00:00:00Z",
  },
];

describe("StudentDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/student/submissions") return Promise.resolve({ data: submissions });
      return Promise.resolve({ data: assignments });
    });
  });

  it("counts only assignments viewable until the deadline as available", async () => {
    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Due Essay")).toBeInTheDocument();
    });

    const statBlocks = screen.getAllByText("Available Assignments");
    const block = statBlocks[0].closest(".stat-block");
    expect(block?.querySelector(".stat-value")).toHaveTextContent("2");
  });

  it("shows a Submitted status for submitted assignments", async () => {
    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Due Essay")).toBeInTheDocument();
    });

    const sheet = screen.getByText("My Assignments").closest(".sheet") as HTMLElement;
    const row = Array.from(sheet.querySelectorAll("tr"))
      .find((tr) => tr.textContent?.includes("Submitted Report"));
    expect(row?.textContent).toContain("Submitted");
  });

  it("shows a Due status (not Overdue) for unsubmitted before-deadline assignments", async () => {
    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Due Essay")).toBeInTheDocument();
    });

    const sheet = screen.getByText("My Assignments").closest(".sheet") as HTMLElement;
    const row = Array.from(sheet.querySelectorAll("tr"))
      .find((tr) => tr.textContent?.includes("Due Essay"));
    expect(row?.textContent).toContain("Due");
    expect(row?.textContent).not.toContain("Overdue");
  });

  it("hides overdue unsubmitted assignments from the assignments table", async () => {
    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Due Essay")).toBeInTheDocument();
    });

    expect(screen.queryByText("Missed Homework")).not.toBeInTheDocument();
  });
});
