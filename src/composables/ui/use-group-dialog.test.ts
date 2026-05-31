// /src/composables/ui/use-group-dialog.test.ts

import { describe, it, expect, beforeEach } from "vitest";

import { useGroupDialog } from "@/composables/ui/use-group-dialog";

describe("useGroupDialog", () => {
  beforeEach(() => {
    const { onCancel } = useGroupDialog();
    onCancel();
  });

  it("starts closed", () => {
    const { open } = useGroupDialog();
    expect(open.value).toBe(false);
  });

  it("opens dialog on openGroupDialog call", () => {
    const { openGroupDialog, open } = useGroupDialog();
    void openGroupDialog({ mode: "create" });
    expect(open.value).toBe(true);
  });

  it("resolves name on onConfirm", async () => {
    const { openGroupDialog, onConfirm } = useGroupDialog();
    const promise = openGroupDialog({ mode: "create" });
    onConfirm("Master Suite");
    expect(await promise).toBe("Master Suite");
  });

  it("resolves null on onCancel", async () => {
    const { openGroupDialog, onCancel } = useGroupDialog();
    const promise = openGroupDialog({ mode: "create" });
    onCancel();
    expect(await promise).toBeNull();
  });

  it("closes dialog after confirm", async () => {
    const { openGroupDialog, onConfirm, open } = useGroupDialog();
    const promise = openGroupDialog({ mode: "create" });
    onConfirm("Test");
    await promise;
    expect(open.value).toBe(false);
  });

  it("closes dialog after cancel", async () => {
    const { openGroupDialog, onCancel, open } = useGroupDialog();
    const promise = openGroupDialog({ mode: "create" });
    onCancel();
    await promise;
    expect(open.value).toBe(false);
  });

  it("exposes mode in options", () => {
    const { openGroupDialog, options } = useGroupDialog();
    void openGroupDialog({ mode: "rename", initialName: "Old Name" });
    expect(options.value?.mode).toBe("rename");
    expect(options.value?.initialName).toBe("Old Name");
  });

  it("exposes groupIds for merge mode", () => {
    const { openGroupDialog, options } = useGroupDialog();
    void openGroupDialog({ mode: "merge", groupIds: ["g1", "g2"] });
    expect(options.value?.groupIds).toEqual(["g1", "g2"]);
  });
});
