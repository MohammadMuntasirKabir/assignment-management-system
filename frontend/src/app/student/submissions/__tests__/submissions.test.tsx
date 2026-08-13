import { render, screen, waitFor } from "@testing-library/react";
import StudentSubmissionsPage from "@/app/student/submissions/page";

const mockGet = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/student/submissions",
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

const baseSubmission = {
  studentId: "st1",
  studentName: "Alice",
  content: "My work",
  submittedAt: "2026-01-05T00:00:00Z",
  createdAt: "2026-01-05T00:00:00Z",
  updatedAt: "2026-01-05T00:00:00Z",
};

const submissions = [
  { ...baseSubmission, id: "s1", assignmentId: "a1", assignmentTitle: "Graded Essay", status: "Reviewed", marks: 85, feedback: "Good work" },
  { ...baseSubmission, id: "s2", assignmentId: "a2", assignmentTitle: "Pending Report", status: "Submitted", marks: null, feedback: null },
  { ...baseSubmission, id: "s3", assignmentId: "a3", assignmentTitle: "Draft Work", status: "Draft", marks: null, feedback: null },
];

describe("StudentSubmissionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: submissions });
  });

  it("shows the My Submissions header", async () => {
    render(<StudentSubmissionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Graded Essay")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: "My Submissions" })).toBeInTheDocument();
  });

  it("shows only submitted and graded assignments (excludes drafts)", async () => {
    render(<StudentSubmissionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Graded Essay")).toBeInTheDocument();
    });

    expect(screen.getByText("Pending Report")).toBeInTheDocument();
    expect(screen.queryByText("Draft Work")).not.toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("has no Status column and provides a View action to the assignment", async () => {
    render(<StudentSubmissionsPage />);

    await waitFor(() => {
      expect(screen.getByText("Graded Essay")).toBeInTheDocument();
    });

    expect(screen.queryByText("Status")).not.toBeInTheDocument();

    const viewLinks = screen.getAllByRole("link", { name: "View" });
    expect(viewLinks).toHaveLength(2);
    expect(viewLinks[0]).toHaveAttribute("href", "/student/assignments/a1");
    expect(viewLinks[1]).toHaveAttribute("href", "/student/assignments/a2");
  });
});
