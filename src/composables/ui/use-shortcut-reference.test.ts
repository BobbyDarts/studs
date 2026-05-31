// /src/composables/ui/use-shortcut-reference.test.ts

import { describe, it, expect } from "vitest";

import { useShortcutReference } from "./use-shortcut-reference";

describe("useShortcutReference", () => {
  it("starts closed", () => {
    const { open } = useShortcutReference();
    expect(open.value).toBe(false);
  });

  it("openDialog sets open to true", () => {
    const { open, openDialog } = useShortcutReference();
    openDialog();
    expect(open.value).toBe(true);
  });

  it("closeDialog sets open to false", () => {
    const { open, openDialog, closeDialog } = useShortcutReference();
    openDialog();
    closeDialog();
    expect(open.value).toBe(false);
  });

  it("toggleDialog toggles open state", () => {
    const { open, toggleDialog } = useShortcutReference();
    expect(open.value).toBe(false);
    toggleDialog();
    expect(open.value).toBe(true);
    toggleDialog();
    expect(open.value).toBe(false);
  });
});
