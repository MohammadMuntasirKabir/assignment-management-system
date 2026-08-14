import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@/test-utils/mocks";
import { mockGet, mockPost, mockPut, mockDelete } from "@/test-utils/mocks";
import AdminTeacherAssignmentsPage from "@/app/admin/teacher-assignments/page";


jest.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    setSession: jest.fn(),
    user: { id: "u3", name: "Charlie", email: "admin@example.com", role: "Admin", createdAt: "2026-01-01T00:00:00Z" },
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
    put: (...args: unknown[]) => mockPut(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
  getErrorMessage: (err: unknown, fallback: string) =>
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback,
}));

const users = [
  { id: "u1", name: "Alice", email: "alice@example.com", role: 1, createdAt: "2026-01-01T00:00:00Z" },
  { id: "u2", name: "Bob", email: "bob@example.com", role: 2, createdAt: "2026-01-01T00:00:00Z" },
  { id: "u3", name: "Charlie", email: "charlie@example.com", role: 0, createdAt: "2026-01-01T00:00:00Z" },
];

const classSubjects = [
  { id: "cs1", classId: "c1", className: "Class 6", subjectId: "s1", subjectName: "English" },
  { id: "cs2", classId: "c2", className: "Class 7", subjectId: "s2", subjectName: "Math" },
];

const assignments = [
  { id: "ta1", teacherId: "u1", teacherName: "Alice", classSubjectId: "cs1", className: "Class 6", subjectName: "English", createdAt: "2026-01-01T00:00:00Z" },
];

describe("AdminTeacherAssignmentsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url === "/api/admin/teacher-assignments") return Promise.resolve({ data: assignments });
      if (url === "/api/admin/users") return Promise.resolve({ data: { items: users, total: users.length } });
      return Promise.resolve({ data: classSubjects });
    });
    mockPost.mockResolvedValue({ data: {} });
    mockPut.mockResolvedValue({ data: {} });
    mockDelete.mockResolvedValue({});
  });

  it("renders teacher assignments", async () => {
    render(<AdminTeacherAssignmentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
    expect(screen.getByText("Class 6")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("lists only teacher accounts in the assign modal", async () => {
    render(<AdminTeacherAssignmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Assign Teacher" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Assign Teacher" }));

    const teacherSelect = screen.getByLabelText("Teacher") as HTMLSelectElement;
    const options = Array.from(teacherSelect.options).map((o) => o.value);
    expect(options).toContain("u1");
    expect(options).not.toContain("u2");
    expect(options).not.toContain("u3");
  });

  it("assigns a teacher to a class-subject", async () => {
    render(<AdminTeacherAssignmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Assign Teacher" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Assign Teacher" }));
    fireEvent.change(screen.getByLabelText("Teacher"), { target: { value: "u1" } });
    fireEvent.change(screen.getByLabelText("Class–Subject"), { target: { value: "cs2" } });
    fireEvent.click(screen.getByRole("button", { name: "Assign" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/admin/assign-teacher", {
        teacherId: "u1",
        classSubjectId: "cs2",
      });
    });
  });

  it("edits a teacher assignment", async () => {
    render(<AdminTeacherAssignmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Edit Alice in Class 6 – English" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit Alice in Class 6 – English" }));
    fireEvent.change(screen.getByLabelText("Class–Subject"), { target: { value: "cs2" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("/api/admin/teacher-assignments/ta1", {
        teacherId: "u1",
        classSubjectId: "cs2",
      });
    });
  });

  it("removes a teacher assignment", async () => {
    render(<AdminTeacherAssignmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Remove Alice from Class 6 – English" })).toBeInTheDocument();
    });

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Remove Alice from Class 6 – English" }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/api/admin/teacher-assignments/ta1");
    });
    confirmSpy.mockRestore();
  });
});
