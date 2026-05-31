// /src/components/app/shell/project-switcher/ProjectSwitcher.test.ts

import { render, fireEvent, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import { createStoreMock } from "@/test-utils/create-store-mock";
import type { StoreMock } from "@/test-utils/create-store-mock";

import { ProjectSwitcher } from ".";

vi.mock("@/stores/project");

describe("ProjectSwitcher", () => {
  let mock: StoreMock;

  beforeEach(() => {
    mock = createStoreMock() as unknown as StoreMock;
    mock.projectName = "Test Project" as unknown as StoreMock["projectName"];
    mock.projectSummaries = [
      { id: "p1", name: "Test Project", updatedAt: "2026-01-01T00:00:00Z" },
      { id: "p2", name: "Second Project", updatedAt: "2026-01-02T00:00:00Z" },
    ] as unknown as StoreMock["projectSummaries"];
    mock.activeId = "p1" as unknown as StoreMock["activeId"];
    vi.mocked(useProjectStore).mockReturnValue(mock);
  });

  it("renders the project name", () => {
    const { getByDisplayValue } = render(ProjectSwitcher);
    expect(getByDisplayValue("Test Project")).toBeTruthy();
  });

  it("shows project list in popover when trigger clicked", async () => {
    const { getByText } = render(ProjectSwitcher);
    await fireEvent.click(getByText("▾"));
    await waitFor(() => {
      expect(getByText("Second Project")).toBeTruthy();
    });
  });

  it("calls switchProject when a project is clicked", async () => {
    const { getByText } = render(ProjectSwitcher);
    await fireEvent.click(getByText("▾"));
    await waitFor(() => getByText("Second Project"));
    await fireEvent.click(getByText("Second Project"));
    expect(mock.switchProject).toHaveBeenCalledWith("p2");
  });

  it("calls newProject when New Project is clicked", async () => {
    const { getByText } = render(ProjectSwitcher);
    await fireEvent.click(getByText("▾"));
    await waitFor(() => getByText("New Project"));
    await fireEvent.click(getByText("New Project"));
    expect(mock.newProject).toHaveBeenCalled();
  });

  it("shows delete button on hover for non-active projects", async () => {
    const { getByText, getAllByText } = render(ProjectSwitcher);
    await fireEvent.click(getByText("▾"));
    await waitFor(() => getByText("Second Project"));
    const deleteButtons = getAllByText("✕");
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});
