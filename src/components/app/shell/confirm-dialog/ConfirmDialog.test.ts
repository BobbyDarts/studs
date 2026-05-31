// /src/components/app/shell/confirm-dialog/ConfirmDialog.test.ts

import { render, fireEvent, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi } from "vitest";
import { ref } from "vue";

import { ConfirmDialog } from ".";

vi.mock("@/composables/ui", () => ({
  useConfirmDialog: vi.fn(() => ({
    open: ref(false),
    options: ref(null),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  })),
}));

describe("ConfirmDialog", () => {
  it("does not render content when closed", () => {
    const { queryByRole } = render(ConfirmDialog);
    expect(queryByRole("alertdialog")).toBeNull();
  });

  it("renders title and description when open", async () => {
    const { useConfirmDialog } = await import("@/composables/ui");
    vi.mocked(useConfirmDialog).mockReturnValue({
      open: ref(true),
      options: ref({
        title: "Delete room?",
        description: "This cannot be undone.",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        variant: "destructive" as const,
      }),
      onConfirm: vi.fn(),
      onCancel: vi.fn(),
      confirm: vi.fn(),
    });

    const { getByText } = render(ConfirmDialog);
    await waitFor(() => {
      expect(getByText("Delete room?")).toBeTruthy();
      expect(getByText("This cannot be undone.")).toBeTruthy();
    });
  });

  it("calls onConfirm when confirm button clicked", async () => {
    const onConfirm = vi.fn();
    const { useConfirmDialog } = await import("@/composables/ui");
    vi.mocked(useConfirmDialog).mockReturnValue({
      open: ref(true),
      options: ref({
        title: "Delete?",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        variant: "destructive" as const,
      }),
      onConfirm,
      onCancel: vi.fn(),
      confirm: vi.fn(),
    });

    const { getByText } = render(ConfirmDialog);
    await waitFor(() => getByText("Delete"));
    await fireEvent.click(getByText("Delete"));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("calls onCancel when cancel button clicked", async () => {
    const onCancel = vi.fn();
    const { useConfirmDialog } = await import("@/composables/ui");
    vi.mocked(useConfirmDialog).mockReturnValue({
      open: ref(true),
      options: ref({
        title: "Delete?",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        variant: "destructive" as const,
      }),
      onConfirm: vi.fn(),
      onCancel,
      confirm: vi.fn(),
    });

    const { getByText } = render(ConfirmDialog);
    await waitFor(() => getByText("Cancel"));
    await fireEvent.click(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
