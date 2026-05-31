// /src/components/app/fixture/fixture-dialog/FixtureDialog.test.ts

import { render, fireEvent, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

import { FixtureDialog } from ".";

vi.mock("@/stores/project");
vi.mock("@/composables/ui", () => ({
  useConfirmDialog: vi.fn(() => ({
    confirm: vi.fn().mockResolvedValue(true),
  })),
}));

const baseRoom = {
  id: "r1",
  name: "Bathroom",
  type: "bathroom" as const,
  x: 0,
  y: 0,
  widthCm: 243.84,
  depthCm: 243.84,
  walls: { N: "solid", S: "solid", E: "solid", W: "solid" } as const,
  groupId: null,
  fixtures: [],
};

const baseFixture = {
  id: "f1",
  type: "door" as const,
  subtype: "standard" as const,
  wall: "N" as const,
  offsetCm: 60.96,
  facing: undefined,
};

describe("FixtureDialog", () => {
  let mock: ReturnType<typeof createStoreMock>;

  beforeEach(() => {
    mock = createStoreMock();
    vi.mocked(useProjectStore).mockReturnValue(mock as unknown as StoreMock);
  });

  it("renders add title when no fixture prop", async () => {
    const { getByRole } = render(FixtureDialog, {
      props: { open: true, room: baseRoom },
    });
    await waitFor(() =>
      expect(getByRole("heading", { name: "Add Fixture" })).toBeTruthy(),
    );
  });

  it("renders edit title when fixture prop provided", async () => {
    const { getByRole } = render(FixtureDialog, {
      props: { open: true, room: baseRoom, fixture: baseFixture },
    });
    await waitFor(() =>
      expect(getByRole("heading", { name: "Edit Fixture" })).toBeTruthy(),
    );
  });

  it("Add Fixture button exists when no fixture prop", async () => {
    const { getByRole } = render(FixtureDialog, {
      props: { open: true, room: baseRoom },
    });
    await waitFor(() => getByRole("button", { name: "Add Fixture" }));
    expect(getByRole("button", { name: "Add Fixture" })).toBeTruthy();
  });

  it("calls updateFixture on submit when editing", async () => {
    const { getByText } = render(FixtureDialog, {
      props: { open: true, room: baseRoom, fixture: baseFixture },
    });
    await waitFor(() => getByText("Save"));
    await fireEvent.click(getByText("Save"));
    expect(mock.fixtures.updateFixture).toHaveBeenCalledWith(
      baseRoom,
      "f1",
      expect.objectContaining({ type: "door" }),
    );
  });

  it("calls removeFixture after delete confirmed", async () => {
    const { getByText } = render(FixtureDialog, {
      props: { open: true, room: baseRoom, fixture: baseFixture },
    });
    await waitFor(() => getByText("Delete"));
    await fireEvent.click(getByText("Delete"));
    await waitFor(() =>
      expect(mock.fixtures.removeFixture).toHaveBeenCalledWith(baseRoom, "f1"),
    );
  });

  it("does not call removeFixture when delete cancelled", async () => {
    const { useConfirmDialog } = await import("@/composables/ui");
    vi.mocked(useConfirmDialog).mockReturnValue({
      confirm: vi.fn().mockResolvedValue(false),
    } as unknown as ReturnType<typeof useConfirmDialog>);

    const { getByText } = render(FixtureDialog, {
      props: { open: true, room: baseRoom, fixture: baseFixture },
    });
    await waitFor(() => getByText("Delete"));
    await fireEvent.click(getByText("Delete"));
    await waitFor(() =>
      expect(mock.fixtures.removeFixture).not.toHaveBeenCalled(),
    );
  });

  it("filters wall choices using wallAcceptsFixtures", async () => {
    const room = {
      ...baseRoom,
      walls: { N: "open", S: "solid", E: "solid", W: "solid" } as const,
    };
    mock.fixtures.wallAcceptsFixtures = vi.fn((_r, w) => w !== "N");
    render(FixtureDialog, { props: { open: true, room } });
    await waitFor(() => {
      expect(mock.fixtures.wallAcceptsFixtures).toHaveBeenCalledWith(room, "N");
      expect(mock.fixtures.wallAcceptsFixtures).toHaveBeenCalledWith(room, "S");
      expect(mock.fixtures.wallAcceptsFixtures).toHaveBeenCalledWith(room, "E");
      expect(mock.fixtures.wallAcceptsFixtures).toHaveBeenCalledWith(room, "W");
    });
  });
});
