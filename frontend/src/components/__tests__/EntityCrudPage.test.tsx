import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@/test-utils/mocks";
import { mockGet, mockDelete, mockPost, mockPut } from "@/test-utils/mocks";
import EntityCrudPage from "@/components/EntityCrudPage";

interface Entity {
  id: string;
  name: string;
  description: string;
}

function renderPage() {
  return render(
    <EntityCrudPage<Entity, { name: string; description: string }>
      title="Manage Things"
      entityName="Thing"
      emptyText="No things yet."
      apiPath="/api/admin/things"
      createDto={() => ({ name: "", description: "" })}
      toDto={(item) => ({ name: item.name, description: item.description })}
      listLabel="Name"
    />
  );
}

describe("EntityCrudPage error paths", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the fallback message when loading fails", async () => {
    mockGet.mockRejectedValue(new Error("network down"));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Failed to load things")).toBeInTheDocument();
    });
  });

  it("shows the API detail message when loading fails", async () => {
    mockGet.mockRejectedValue({ response: { data: { message: "unauthorized" } } });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("unauthorized")).toBeInTheDocument();
    });
  });

  it("renders the empty state when there are no items", async () => {
    mockGet.mockResolvedValue({ data: [] });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("No things yet.")).toBeInTheDocument();
    });
  });

  it("shows the delete failure via alert", async () => {
    mockGet.mockResolvedValue({ data: [{ id: "1", name: "Alpha", description: "" }] });
    mockDelete.mockRejectedValue({ response: { data: { message: "in use" } } });
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Alpha" }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("/api/admin/things/1");
    });
    expect(alertSpy).toHaveBeenCalledWith("in use");

    confirmSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("alerts with the fallback when create fails", async () => {
    mockGet.mockResolvedValue({ data: [] });
    mockPost.mockRejectedValue(new Error("bad"));
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add Thing" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Thing" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Failed to save");
    });

    alertSpy.mockRestore();
  });

  it("posts the dto on successful create", async () => {
    mockGet.mockResolvedValue({ data: [] });
    mockPost.mockResolvedValue({ data: {} });
    mockPut.mockResolvedValue({ data: {} });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add Thing" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Thing" }));
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "Beta" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/admin/things", {
        name: "Beta",
        description: "",
      });
    });
  });
});
