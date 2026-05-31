// /src/composables/keyboard/use-keyboard-shortcuts.ts

import { onKeyStroke, useMagicKeys, useStorage, whenever } from "@vueuse/core";
import { logicAnd } from "@vueuse/math";
import { computed } from "vue";

import { useShortcutReference, useTheme } from "@/composables/ui";
import { useProjectStore } from "@/stores/project";

import { useInputGuard } from "./use-input-guard";

type Params = {
  openAddRoom: () => void;
  fitToScreen: () => void;
  centerOnGrid: () => void;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  // toggleTheme: () => void;
  // toggleSidebar: () => void;
  // toggleGroupsPanel: () => void;
};

const groupsPanelVisible = useStorage("studs-groups-panel-visible", true);
const sidebarExpanded = useStorage("studs-sidebar-expanded", true);
const { toggleTheme } = useTheme();

export function useKeyboardShortcuts(params: Params) {
  const store = useProjectStore();
  const { notUsingInput } = useInputGuard();
  const { toggleDialog } = useShortcutReference();

  // ---------------------------------------
  // SINGLE KEY SHORTCUTS (safe + reliable)
  // ---------------------------------------

  let uPressed = false;
  let uTimer: ReturnType<typeof setTimeout> | undefined;

  onKeyStroke((e) => {
    if (!notUsingInput.value) return;
    if (e.repeat) return;

    // IMPORTANT: allow Ctrl+Shift+I / Ctrl+O / etc to pass through magicKeys only
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const key = e.key;

    switch (key) {
      case "r":
        e.preventDefault();
        params.openAddRoom();
        break;

      case "p":
        e.preventDefault();
        store.newProject();
        break;

      case "f":
        e.preventDefault();
        params.fitToScreen();
        break;

      case "c":
        e.preventDefault();
        params.centerOnGrid();
        break;

      case "0":
        e.preventDefault();
        params.resetZoom();
        break;

      case "-":
        e.preventDefault();
        params.zoomOut();
        break;

      case "+":
        e.preventDefault();
        params.zoomIn();
        break;

      case "b":
        e.preventDefault();
        sidebarExpanded.value = !sidebarExpanded.value;
        break;

      case "g":
        e.preventDefault();
        groupsPanelVisible.value = !groupsPanelVisible.value;
        break;

      case "t":
        e.preventDefault();
        toggleTheme();
        break;

      case "?":
        e.preventDefault();
        toggleDialog();
        break;

      case "u":
        e.preventDefault();
        uPressed = true;
        clearTimeout(uTimer);
        uTimer = setTimeout(() => (uPressed = false), 500);
        break;

      case "i":
        if (uPressed) {
          e.preventDefault();
          uPressed = false;
          store.units = "imperial";
        }
        break;

      case "m":
        if (uPressed) {
          e.preventDefault();
          uPressed = false;
          store.units = "metric";
        }
        break;
    }
  });

  // ---------------------------------------
  // MODIFIER SHORTCUTS (Magic Keys)
  // ---------------------------------------

  const isDevToolsShortcut = (e: KeyboardEvent) => {
    return (
      e.key?.toLowerCase() === "i" ||
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
    );
  };

  const keys = useMagicKeys({
    passive: false,
    onEventFired(e) {
      if (e.type !== "keydown") return;

      // 🚫 never interfere with devtools shortcuts
      if (isDevToolsShortcut(e)) return;

      const k = e.key.toLowerCase();

      // Only block *actual handled combos*
      const blocked = ["s", "o", "z", "y", "i", "e"];

      if ((e.ctrlKey || e.metaKey) && blocked.includes(k)) {
        e.preventDefault();
      }
    },
  });

  // SAFELY unwrap (fix TS "possibly undefined")
  const ctrl = computed(() => keys.ctrl?.value ?? false);
  const meta = computed(() => keys.meta?.value ?? false);
  const shift = computed(() => keys.shift?.value ?? false);

  const z = computed(() => keys.z?.value ?? false);
  const y = computed(() => keys.y?.value ?? false);
  const s = computed(() => keys.s?.value ?? false);
  const o = computed(() => keys.o?.value ?? false);

  // Undo
  const undo = computed(
    () => (ctrl.value || meta.value) && z.value && !shift.value,
  );

  // Redo (Ctrl+Shift+Z OR Ctrl+Y)
  const redo = computed(
    () => (ctrl.value || meta.value) && ((shift.value && z.value) || y.value),
  );

  // Export / Import
  const exportJson = computed(
    () => (ctrl.value || meta.value) && s.value && !shift.value,
  );

  const exportSvg = computed(
    () => (ctrl.value || meta.value) && shift.value && s.value,
  );

  const importJson = computed(
    () => (ctrl.value || meta.value) && shift.value && o.value,
  );

  whenever(logicAnd(undo, notUsingInput), () => store.undo());
  whenever(logicAnd(redo, notUsingInput), () => store.redo());

  whenever(logicAnd(exportJson, notUsingInput), () => store.exportJson());
  whenever(logicAnd(exportSvg, notUsingInput), () => store.exportSvg());
  whenever(logicAnd(importJson, notUsingInput), () => {
    window.dispatchEvent(new CustomEvent("studs:import"));
  });
}
