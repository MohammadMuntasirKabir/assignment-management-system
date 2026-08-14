import { render, screen } from "@testing-library/react";
import Pagination from "@/components/Pagination";

describe("Pagination", () => {
  const onPageChange = jest.fn();

  beforeEach(() => {
    onPageChange.mockClear();
  });

  it("shows the current page, total pages, and record count", () => {
    render(<Pagination page={1} pageSize={20} total={55} onPageChange={onPageChange} />);

    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    expect(screen.getByText(/55 total/)).toBeInTheDocument();
  });

  it("disables Previous on the first page and lets Next advance", () => {
    render(<Pagination page={1} pageSize={20} total={55} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();

    screen.getByRole("button", { name: "Next" }).click();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables Next on the last page and lets Previous go back", () => {
    render(<Pagination page={3} pageSize={20} total={55} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();

    screen.getByRole("button", { name: "Previous" }).click();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables both buttons for a single page", () => {
    render(<Pagination page={1} pageSize={20} total={5} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
