// /src/composables/ui/use-confirm-dialog.test.ts

import { describe, it, expect, beforeEach } from "vitest";

import { useConfirmDialog } from "@/composables/ui/use-confirm-dialog";

describe("useConfirmDialog", () => {
  beforeEach(() => {
    // Reset singleton state
    const { onCancel } = useConfirmDialog();
    onCancel();
  });

  it("starts closed", () => {
    const { open } = useConfirmDialog();
    expect(open.value).toBe(false);
  });

  it("opens dialog on confirm call", () => {
    const { confirm, open } = useConfirmDialog();
    void confirm({ title: "Delete?" });
    expect(open.value).toBe(true);
  });

  it("resolves true on onConfirm", async () => {
    const { confirm, onConfirm } = useConfirmDialog();
    const promise = confirm({ title: "Delete?" });
    onConfirm();
    expect(await promise).toBe(true);
  });

  it("resolves false on onCancel", async () => {
    const { confirm, onCancel } = useConfirmDialog();
    const promise = confirm({ title: "Delete?" });
    onCancel();
    expect(await promise).toBe(false);
  });

  it("closes dialog after confirm", async () => {
    const { confirm, onConfirm, open } = useConfirmDialog();
    const promise = confirm({ title: "Delete?" });
    onConfirm();
    await promise;
    expect(open.value).toBe(false);
  });

  it("closes dialog after cancel", async () => {
    const { confirm, onCancel, open } = useConfirmDialog();
    const promise = confirm({ title: "Delete?" });
    onCancel();
    await promise;
    expect(open.value).toBe(false);
  });

  it("sets checkboxValue to checkboxDefault on open", () => {
    const { confirm, checkboxValue } = useConfirmDialog();
    void confirm({ title: "Delete?", checkboxDefault: true });
    expect(checkboxValue.value).toBe(true);
  });

  it("setCheckboxValue updates checkboxValue", () => {
    const { setCheckboxValue, checkboxValue } = useConfirmDialog();
    setCheckboxValue(true);
    expect(checkboxValue.value).toBe(true);
  });

  it("exposes options after opening", () => {
    const { confirm, options } = useConfirmDialog();
    void confirm({ title: "Delete?", description: "This cannot be undone." });
    expect(options.value?.title).toBe("Delete?");
    expect(options.value?.description).toBe("This cannot be undone.");
  });
});
