import { render, screen } from "@testing-library/react";
import Pagination from "@/components/Pagination";

describe("Pagination", () => {
  const onPageChange = jest.fn();

  beforeEach(() => {
    onPageChange.mockClear();
  });

  it("shows the showing-range summary and record count", () => {
    render(<Pagination page={1} pageSize={20} total={55} onPageChange={onPageChange} />);

    expect(screen.getByText("Showing 1–20 of 55")).toBeInTheDocument();
  });

  it("renders the startech-style PREV and NEXT labels", () => {
    render(<Pagination page={1} pageSize={20} total={55} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toHaveTextContent("PREV");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveTextContent("NEXT");
  });

  it("lets Next advance and marks the active page", () => {
    render(<Pagination page={1} pageSize={20} total={55} onPageChange={onPageChange} />);

    screen.getByRole("button", { name: "Next page" }).click();
    expect(onPageChange).toHaveBeenCalledWith(2);

    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  });

  it("disables Next on the last page and lets Previous go back", () => {
    render(<Pagination page={3} pageSize={20} total={55} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();

    screen.getByRole("button", { name: "Previous page" }).click();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("shows numbered page buttons within a window and collapses with an ellipsis", () => {
    render(<Pagination page={5} pageSize={10} total={200} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Page 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 6" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 20" })).toBeInTheDocument();
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
  });

  it("disables both buttons for a single page", () => {
    render(<Pagination page={1} pageSize={20} total={5} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
