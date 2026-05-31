// /src/components/app/shell/group-dialog/GroupDialog.test.ts

import { render, fireEvent, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";

import { GroupDialog } from "@/components/app/shell/group-dialog";

vi.mock("@/composables/ui", () => ({
  useGroupDialog: vi.fn(() => ({
    open: ref(false),
    options: ref(null),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  })),
}));

describe("GroupDialog", () => {
  it("does not render content when closed", () => {
    const { queryByText } = render(GroupDialog);
    expect(queryByText("Create Group")).toBeNull();
  });

  it("renders create title when open in create mode", async () => {
    const { useGroupDialog } = await import("@/composables/ui");
    vi.mocked(useGroupDialog).mockReturnValue({
      open: ref(true),
      options: ref({ mode: "create" }),
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      openGroupDialog: vi.fn(),
    } as unknown as ReturnType<typeof useGroupDialog>);

    const { getByText } = render(GroupDialog);
    await waitFor(() => expect(getByText("Create Group")).toBeTruthy());
  });

  it("renders rename title when open in rename mode", async () => {
    const { useGroupDialog } = await import("@/composables/ui");
    vi.mocked(useGroupDialog).mockReturnValue({
      open: ref(true),
      options: ref({ mode: "rename", initialName: "Old Name" }),
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      openGroupDialog: vi.fn(),
    } as unknown as ReturnType<typeof useGroupDialog>);

    const { getByText } = render(GroupDialog);
    await waitFor(() => expect(getByText("Rename Group")).toBeTruthy());
  });

  it("calls onConfirm with name when submitted", async () => {
    const onConfirm = vi.fn();
    const { useGroupDialog } = await import("@/composables/ui");
    vi.mocked(useGroupDialog).mockReturnValue({
      open: ref(true),
      options: ref({ mode: "create" }),
      onConfirm,
      onCancel: vi.fn(),
      openGroupDialog: vi.fn(),
    } as unknown as ReturnType<typeof useGroupDialog>);

    const { getByPlaceholderText, getByText } = render(GroupDialog);
    await waitFor(() => getByPlaceholderText("e.g. Master Suite"));
    await fireEvent.update(
      getByPlaceholderText("e.g. Master Suite"),
      "Master Suite",
    );
    await fireEvent.click(getByText("Create"));
    expect(onConfirm).toHaveBeenCalledWith("Master Suite");
  });

  it("calls onCancel when cancel clicked", async () => {
    const onCancel = vi.fn();
    const { useGroupDialog } = await import("@/composables/ui");
    vi.mocked(useGroupDialog).mockReturnValue({
      open: ref(true),
      options: ref({ mode: "create" }),
      onConfirm: vi.fn(),
      onCancel,
      openGroupDialog: vi.fn(),
    } as unknown as ReturnType<typeof useGroupDialog>);

    const { getByText } = render(GroupDialog);
    await waitFor(() => getByText("Cancel"));
    await fireEvent.click(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("disables submit when name is empty", async () => {
    const { useGroupDialog } = await import("@/composables/ui");
    vi.mocked(useGroupDialog).mockReturnValue({
      open: ref(true),
      options: ref({ mode: "create" }),
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      openGroupDialog: vi.fn(),
    } as unknown as ReturnType<typeof useGroupDialog>);

    const { getByRole } = render(GroupDialog);
    await waitFor(() => {
      const btn = getByRole("button", { name: "Create" });
      expect(btn.hasAttribute("disabled")).toBe(true);
    });
  });
});
