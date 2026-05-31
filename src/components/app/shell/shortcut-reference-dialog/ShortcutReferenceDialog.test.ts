// /src/components/app/shell/shortcut-reference-dialog/ShortcutReferenceDialog.test.ts

import { render, waitFor } from "@testing-library/vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

import { useShortcutReference } from "@/composables/ui";

import { ShortcutReferenceDialog } from ".";

vi.mock("@/composables/ui", () => ({
  useShortcutReference: vi.fn(() => ({
    open: { value: false },
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
    toggleDialog: vi.fn(),
  })),
}));

const mockedUseShortcutReference = vi.mocked(useShortcutReference);

describe("ShortcutReferenceDialog", () => {
  beforeEach(() => {
    mockedUseShortcutReference.mockReturnValue({
      open: ref(false),
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      toggleDialog: vi.fn(),
    });
  });

  it("does not render dialog content when closed", () => {
    const { queryByText } = render(ShortcutReferenceDialog);
    expect(queryByText("Keyboard Shortcuts")).toBeNull();
  });

  it("renders dialog content when open", async () => {
    mockedUseShortcutReference.mockReturnValueOnce({
      open: ref(true),
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      toggleDialog: vi.fn(),
    });
    const { getByText } = render(ShortcutReferenceDialog);
    await waitFor(() => expect(getByText("Keyboard Shortcuts")).toBeTruthy());
  });

  it("shows all shortcut sections when open", async () => {
    mockedUseShortcutReference.mockReturnValueOnce({
      open: ref(true),
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      toggleDialog: vi.fn(),
    });
    const { getByText } = render(ShortcutReferenceDialog);
    await waitFor(() => {
      expect(getByText("Canvas")).toBeTruthy();
      expect(getByText("Project")).toBeTruthy();
      expect(getByText("Edit")).toBeTruthy();
      expect(getByText("General")).toBeTruthy();
    });
  });
});
