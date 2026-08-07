import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/components/AuthProvider";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/components/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

const adminUser = {
  id: "1",
  name: "Admin",
  email: "admin@example.com",
  role: "Admin",
  createdAt: "",
};
const teacherUser = {
  id: "2",
  name: "Teacher",
  email: "teacher@example.com",
  role: "Teacher",
  createdAt: "",
};
const studentUser = {
  id: "3",
  name: "Student",
  email: "student@example.com",
  role: "Student",
  createdAt: "",
};

describe("DashboardLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when the user role is not allowed", () => {
    mockUseAuth.mockReturnValue({ user: studentUser, logout: jest.fn() });

    const { container } = render(
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders admin navigation items", () => {
    mockUseAuth.mockReturnValue({ user: adminUser, logout: jest.fn() });

    render(
      <DashboardLayout allowedRoles={["Admin"]}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "Classes" })).toHaveAttribute("href", "/admin/classes");
    expect(screen.getByRole("link", { name: "Subjects" })).toHaveAttribute("href", "/admin/subjects");
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("href", "/admin/users");
    expect(screen.getByRole("link", { name: "Class-Subjects" })).toHaveAttribute("href", "/admin/class-subjects");
    expect(screen.getByRole("link", { name: "Assignments" })).toHaveAttribute("href", "/admin/assignments");
    expect(screen.getByRole("link", { name: "Submissions" })).toHaveAttribute("href", "/admin/submissions");
  });

  it("renders teacher navigation items", () => {
    mockUseAuth.mockReturnValue({ user: teacherUser, logout: jest.fn() });

    render(
      <DashboardLayout allowedRoles={["Teacher"]}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText("Teacher Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My Assignments" })).toHaveAttribute("href", "/teacher/assignments");
    expect(screen.getByRole("link", { name: "Submissions" })).toHaveAttribute("href", "/teacher/submissions");
    expect(screen.queryByRole("link", { name: "Classes" })).not.toBeInTheDocument();
  });

  it("renders student navigation items", () => {
    mockUseAuth.mockReturnValue({ user: studentUser, logout: jest.fn() });

    render(
      <DashboardLayout allowedRoles={["Student"]}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText("Student Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Assignments" })).toHaveAttribute("href", "/student/assignments");
    expect(screen.getByRole("link", { name: "My Submissions" })).toHaveAttribute("href", "/student/submissions");
    expect(screen.queryByRole("link", { name: "Classes" })).not.toBeInTheDocument();
  });

  it("shows the user's name and a logout button", () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({ user: teacherUser, logout: mockLogout });

    render(
      <DashboardLayout allowedRoles={["Teacher"]}>
        <div>Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText("Teacher")).toBeInTheDocument();
    const logoutButton = screen.getByRole("button", { name: "Logout" });
    logoutButton.click();
    expect(mockLogout).toHaveBeenCalled();
  });
});
