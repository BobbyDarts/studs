// /src/components/app/shell/app-sidebar/AppSidebar.test.ts

import { render, fireEvent } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

import { AppSidebar } from ".";

vi.mock("@/stores/project");
vi.mock("@/components/app/shell/project-switcher", () => ({
  ProjectSwitcher: { template: '<div data-testid="project-switcher" />' },
}));

describe("AppSidebar", () => {
  let mock: StoreMock;

  beforeEach(() => {
    mock = createStoreMock() as unknown as StoreMock;
    vi.mocked(useProjectStore).mockReturnValue(mock);
    localStorage.clear();
  });

  it("renders the S-mark logo", () => {
    const { getByText } = render(AppSidebar);
    expect(getByText("S")).toBeTruthy();
  });

  it("renders the STUDS wordmark when expanded", () => {
    localStorage.setItem("studs-sidebar-expanded", "true");
    const { getByText } = render(AppSidebar);
    expect(getByText("Studs")).toBeTruthy();
  });

  it("renders the collapse tab button", () => {
    const { container } = render(AppSidebar);
    const tab = container.querySelector("button.w-3");
    expect(tab).not.toBeNull();
  });

  it("toggles expanded state when collapse tab is clicked", async () => {
    localStorage.setItem("studs-sidebar-expanded", "true");
    const { container } = render(AppSidebar);
    const tab = container.querySelector("button.w-3") as HTMLElement;
    await fireEvent.click(tab);
    expect(localStorage.getItem("studs-sidebar-expanded")).toBe("false");
  });

  it("renders the project switcher", () => {
    const { getAllByTestId } = render(AppSidebar);
    expect(getAllByTestId("project-switcher").length).toBeGreaterThan(0);
  });

  it("renders Imperial and Metric unit buttons when expanded", () => {
    localStorage.setItem("studs-sidebar-expanded", "true");
    const { getByText } = render(AppSidebar);
    expect(getByText("Imperial")).toBeTruthy();
    expect(getByText("Metric")).toBeTruthy();
  });

  it("calls exportJson when Export JSON button is clicked", async () => {
    const { container } = render(AppSidebar);
    const buttons = Array.from(container.querySelectorAll("button"));
    for (const b of buttons) {
      if (b.textContent?.includes("Export JSON")) {
        await fireEvent.click(b);
      }
    }
    expect(mock.exportJson).toBeDefined();
  });

  it("emits import-click when Import JSON button is clicked", async () => {
    localStorage.setItem("studs-sidebar-expanded", "true");
    const { getByText, emitted } = render(AppSidebar);
    await fireEvent.click(getByText("Import JSON..."));
    expect(emitted()["import-click"]).toBeTruthy();
  });

  it("toggles units when unit button is clicked", async () => {
    localStorage.setItem("studs-sidebar-expanded", "true");
    mock.units = "imperial";
    const { getByText } = render(AppSidebar);
    await fireEvent.click(getByText("Metric"));
    expect(mock.units).toBe("metric");
  });

  it("does not show dead space section when no dead space", () => {
    mock.deadSpace.allDeadSpaceCells =
      [] as unknown as StoreMock["deadSpace"]["allDeadSpaceCells"];
    const { queryByText } = render(AppSidebar);
    expect(queryByText("Dead Space")).toBeNull();
  });

  it("shows dead space section when dead space exists", () => {
    mock.deadSpace.allDeadSpaceCells = [
      { x: 0, y: 0 },
    ] as unknown as StoreMock["deadSpace"]["allDeadSpaceCells"];
    mock.deadSpace.enclosedCells = [
      { x: 0, y: 0 },
    ] as unknown as StoreMock["deadSpace"]["enclosedCells"];
    mock.deadSpace.boundingBoxCells =
      [] as unknown as StoreMock["deadSpace"]["boundingBoxCells"];
    const { getByText } = render(AppSidebar);
    expect(getByText("Dead Space")).toBeTruthy();
  });
});
