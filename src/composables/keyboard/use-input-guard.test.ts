// /src/composables/keyboard/use-input-guard.test.ts

import { describe, it, expect, beforeEach } from "vitest";

import { useInputGuard } from "./use-input-guard";

describe("useInputGuard", () => {
  beforeEach(() => {
    // Reset active element between tests
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  it("returns true when no input is focused", () => {
    const { notUsingInput } = useInputGuard();
    expect(notUsingInput.value).toBe(true);
  });

  it("returns false when an input is focused", () => {
    const { notUsingInput } = useInputGuard();
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    expect(notUsingInput.value).toBe(false);
    document.body.removeChild(input);
  });

  it("returns false when a textarea is focused", () => {
    const { notUsingInput } = useInputGuard();
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();
    expect(notUsingInput.value).toBe(false);
    document.body.removeChild(textarea);
  });

  it("returns false when a select is focused", () => {
    const { notUsingInput } = useInputGuard();
    const select = document.createElement("select");
    document.body.appendChild(select);
    select.focus();
    expect(notUsingInput.value).toBe(false);
    document.body.removeChild(select);
  });

  it("returns false when focused element is inside a dialog", () => {
    const { notUsingInput } = useInputGuard();
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const button = document.createElement("button");
    dialog.appendChild(button);
    document.body.appendChild(dialog);
    button.focus();
    expect(notUsingInput.value).toBe(false);
    document.body.removeChild(dialog);
  });
});
