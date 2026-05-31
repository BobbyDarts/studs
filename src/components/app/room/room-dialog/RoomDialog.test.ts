// /src/components/app/room/room-dialog/RoomDialog.test.ts

import { render, fireEvent, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useProjectStore } from "@/stores/project";
import {
  createStoreMock,
  type StoreMock,
} from "@/test-utils/create-store-mock";

import { RoomDialog } from ".";

vi.mock("@/stores/project");
vi.mock("@/composables/ui", () => ({
  useConfirmDialog: vi.fn(() => ({
    confirm: vi.fn().mockResolvedValue(true),
  })),
}));

const baseRoom = {
  id: "r1",
  name: "Bedroom",
  type: "bedroom" as const,
  x: 0,
  y: 0,
  widthCm: 304.8,
  depthCm: 304.8,
  walls: { N: "solid", S: "solid", E: "solid", W: "solid" } as const,
  groupId: null,
  fixtures: [],
};

describe("RoomDialog", () => {
  let mock: ReturnType<typeof createStoreMock>;

  beforeEach(() => {
    mock = createStoreMock();
    vi.mocked(useProjectStore).mockReturnValue(mock as unknown as StoreMock);
  });

  it("renders add title when no room prop", async () => {
    const { getByRole } = render(RoomDialog, { props: { open: true } });
    await waitFor(() =>
      expect(getByRole("heading", { name: "Add Room" })).toBeTruthy(),
    );
  });

  it("renders edit title when room prop provided", async () => {
    const { getByRole } = render(RoomDialog, {
      props: { open: true, room: baseRoom },
    });
    await waitFor(() =>
      expect(getByRole("heading", { name: "Edit Room" })).toBeTruthy(),
    );
  });

  it("populates name field when editing", async () => {
    const { getByLabelText } = render(RoomDialog, {
      props: { open: true, room: baseRoom },
    });
    await waitFor(() => {
      const input = getByLabelText("Name") as HTMLInputElement;
      expect(input.value).toBe("Bedroom");
    });
  });

  it("disables submit when name is empty", async () => {
    const { getByRole } = render(RoomDialog, { props: { open: true } });
    await waitFor(() => {
      const btn = getByRole("button", { name: "Add Room" });
      expect(btn.hasAttribute("disabled")).toBe(true);
    });
  });

  it("calls addRoom on submit when no room prop", async () => {
    const { getByPlaceholderText, getByRole } = render(RoomDialog, {
      props: { open: true },
    });
    await waitFor(() => getByPlaceholderText("e.g. Primary Bedroom"));
    await fireEvent.update(
      getByPlaceholderText("e.g. Primary Bedroom"),
      "New Room",
    );
    const btn = getByRole("button", { name: "Add Room" });
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("calls updateRoom on submit when editing", async () => {
    const { getByText } = render(RoomDialog, {
      props: { open: true, room: baseRoom },
    });
    await waitFor(() => getByText("Save"));
    await fireEvent.click(getByText("Save"));
    expect(mock.rooms.updateRoom).toHaveBeenCalledWith(
      "r1",
      expect.objectContaining({ name: "Bedroom" }),
    );
  });

  it("calls removeRoom after delete confirmed", async () => {
    const { getByText } = render(RoomDialog, {
      props: { open: true, room: baseRoom },
    });
    await waitFor(() => getByText("Delete"));
    await fireEvent.click(getByText("Delete"));
    await waitFor(() =>
      expect(mock.rooms.removeRoom).toHaveBeenCalledWith("r1"),
    );
  });

  it("does not call removeRoom when delete cancelled", async () => {
    const { useConfirmDialog } = await import("@/composables/ui");
    vi.mocked(useConfirmDialog).mockReturnValue({
      confirm: vi.fn().mockResolvedValue(false),
    } as unknown as ReturnType<typeof useConfirmDialog>);

    const { getByText } = render(RoomDialog, {
      props: { open: true, room: baseRoom },
    });
    await waitFor(() => getByText("Delete"));
    await fireEvent.click(getByText("Delete"));
    await waitFor(() => expect(mock.rooms.removeRoom).not.toHaveBeenCalled());
  });
});
