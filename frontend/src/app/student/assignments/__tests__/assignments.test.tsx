import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StudentAssignmentsPage from "@/app/student/assignments/page";

const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/student/assignments",
}));

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

describe("StudentAssignmentsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/student/submissions") return Promise.resolve({ data: submissions });
      return Promise.resolve({ data: assignments });
    });
  });

  it("shows only due (unsubmitted, before-deadline) assignments with a Due status by default", async () => {
    render(<StudentAssignmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Due Essay")).toBeInTheDocument();
    });

    const card = screen.getByText("Due Essay").closest(".sheet") as HTMLElement;
    expect(card.textContent).toContain("Due");
    expect(card.textContent).not.toContain("Submitted");
    expect(screen.queryByText("Submitted Report")).not.toBeInTheDocument();
    expect(screen.queryByText("Missed Homework")).not.toBeInTheDocument();
    expect(screen.queryByText("2 items")).not.toBeInTheDocument();
    expect(screen.getByText("1 items")).toBeInTheDocument();
  });

  it("shows submitted assignments with a Submitted status via the Submitted filter", async () => {
    render(<StudentAssignmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Due Essay")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Submitted" }));

    await waitFor(() => {
      expect(screen.getByText("Submitted Report")).toBeInTheDocument();
    });

    const card = screen.getByText("Submitted Report").closest(".sheet") as HTMLElement;
    expect(card.textContent).toContain("Submitted");
    expect(screen.queryByText("Due Essay")).not.toBeInTheDocument();
    expect(screen.queryByText("Missed Homework")).not.toBeInTheDocument();
  });

  it("shows overdue unsubmitted assignments without a Due status via the Overdue filter", async () => {
    render(<StudentAssignmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Due Essay")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Overdue" }));

    await waitFor(() => {
      expect(screen.getByText("Missed Homework")).toBeInTheDocument();
    });

    const card = screen.getByText("Missed Homework").closest(".sheet") as HTMLElement;
    expect(card.textContent).toContain("Overdue");
    expect(card.textContent).not.toContain("Due");
    expect(screen.queryByText("Due Essay")).not.toBeInTheDocument();
    expect(screen.queryByText("Submitted Report")).not.toBeInTheDocument();
  });
});
