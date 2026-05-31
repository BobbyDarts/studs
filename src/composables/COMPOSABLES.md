# Composables

This directory contains all Vue composables for the app. Each composable encapsulates a specific concern and is designed to be called from components or other composables.

Each subdirectory has a barrel `index.ts` that re-exports its composables. Consumers should import from the subdirectory, not individual files:

```ts
import { useProject } from "@/composables/canvas";
import { useTheme } from "@/composables/ui";
import { useInputGuard } from "@/composables/keyboard";
```

---

## `canvas/`

Composables that own the core domain logic of the floorplan editor — rooms, fixtures, grid math, dead space detection, and top-level project state. These are the heart of the app.

### `use-project`

Top-level orchestrator. Wires together all canvas composables and owns multi-project localStorage persistence. Handles project CRUD (`newProject`, `switchProject`, `deleteProject`), hydration and serialization (`hydrateProject`, `buildProjectData`, `saveCurrentProject`), JSON and SVG export/import, undo/redo history via `useRefHistory`, and group management (`createGroup`, `renameGroup`, `deleteGroup`, `mergeGroups`, `removeFromGroup`). All other canvas composables are initialized here and exposed through the Pinia store.

### `use-grid`

Grid math and zoom state. Owns `cellSizePx` (the single source of truth for zoom level), computes `cols` and `rows` dynamically based on canvas target size, and exposes coordinate conversion (`pixelToCell`, `cellToPixel`), snapping (`snapPixelToGrid`), bounds checking (`isWithinCanvas`), and zoom control (`zoom`, `resetZoom`, `fitToScreen`, `zoomPercent`). Grid size is dynamic — zooming out expands the grid up to a 200×200 cell cap.

### `use-rooms`

Room CRUD, drag-and-drop, placement, and group operations. Owns the `rooms` array (the primary reactive state of the app). Exposes `addRoom`, `updateRoom`, `removeRoom`, `mirrorRoom`, `roomById`, `roomsByGroup`, `boundingBoxOfRooms`, placement helpers (`canPlace`, `findFreePosition`, `snapToNearestValid`), drag handlers (`startDrag`, `moveDrag`, `endDrag`), group drag handlers (`startGroupDrag`, `moveGroupDrag`, `endGroupDrag`), `centerOnGrid`, and group operations (`assignGroup`, `moveGroup`, `copyGroup`, `rotateGroup`, `mirrorGroup`). New rooms are placed near the existing floorplan bounding box rather than the grid origin. During drag, rooms move freely and snap to the nearest valid non-overlapping position on drop.

### `use-fixtures`

Fixture CRUD and wall placement validation. Exposes `addFixture`, `updateFixture`, `removeFixture`, `fixturesOnWall`, `validateFixtures`, and `wallAcceptsFixtures` (returns `true` for `solid` and `virtual` walls, `false` for `open`). Fixtures live inside their parent room's `fixtures` array — this composable operates on rooms by reference.

### `use-dead-space`

Reactive dead space detection. Runs whenever rooms change and detects two types of dead space: enclosed cells (flood-fill from canvas border — any interior cell unreachable from the border) and bounding box remainder cells (unassigned cells within the axis-aligned bounding box of all rooms). Exposes `enclosedCells`, `boundingBoxCells`, and `allDeadSpaceCells` (enclosed takes priority — cells flagged as both are only shown once, as enclosed).

### `use-canvas-controls`

Viewport manipulation. Owns all zoom, fit, center, and scroll-to-rooms logic so that keyboard shortcuts and UI buttons call the same functions. Reads from the Pinia store directly to avoid Pinia's ref unwrapping issues. Exposes `fitToScreen`, `centerOnGrid`, `resetZoom`, `zoomIn`, `zoomOut`, and `scrollToRooms`. Always pass a `getScroller` getter that returns the scrollable canvas element.

### `use-selection`

Singleton selection state — `selectedIds` lives at module level so all callers share the same instance. Tracks which room IDs are selected and derives available actions based on selection state. Single selection enables `canEdit`, `canDelete`, `canAddFixture`, `canMirrorRoom`. Multi-selection enables `canCreateGroup`. Grouped selection (all selected rooms share one group) enables `canRenameGroup`, `canDeleteGroup`, `canMoveGroup`, `canCopyGroup`, `canRotateGroup`, `canMirrorGroup`. Multiple groups selected enables `canMergeGroups`. Single grouped room enables `canRemoveFromGroup`. Operations: `select(id)` replaces selection, `selectMany(ids)` replaces with multiple, `shiftSelect(id)` toggles membership, `clearSelection()`, `isSelected(id)`.

---

## `ui/`

Singleton composables that manage the open/close state of global UI elements. State is shared across all callers — calling the composable from multiple components gives the same instance.

### `use-shortcut-reference`

Singleton dialog state for the keyboard shortcut reference dialog. Exposes `open`, `openDialog()`, `closeDialog()`, and `toggleDialog()`.

### `use-confirm-dialog`

Singleton promise-based confirmation dialog built on `createDialogState` from `src/lib/dialog.ts`. `confirm(options)` opens the dialog and returns `Promise<boolean>` — resolves `true` on confirm, `false` on cancel. Supports an optional `checkboxLabel` and `checkboxDefault` for additional user input (e.g. "also delete rooms"). Checkbox state accessible via `checkboxValue` ref and `setCheckboxValue` setter. Used in `FloatingToolbar` for all destructive actions.

### `use-group-dialog`

Singleton promise-based name-input dialog for group operations. `openGroupDialog(options)` opens the dialog and returns `Promise<string | null>` — resolves with the entered name on confirm, `null` on cancel. Supports three modes: `create`, `rename`, `merge`. `initialName` pre-populates the input for rename. Used in `FloatingToolbar` for Create Group, Rename Group, and Merge Groups actions.

### `use-theme`

Wraps VueUse's `useColorMode` to provide app-level theme toggling. Respects system preference via `usePreferredDark`. Exposes `toggleTheme()`, `themeMode` (`"light" | "dark"`), `themeText`, and `themeIcon` (a Lucide icon component). Theme preference is persisted to localStorage automatically via VueUse.

---

## `keyboard/`

Composables responsible for registering and guarding keyboard interactions.

### `use-input-guard`

Returns a computed `notUsingInput` boolean that is `true` when the currently focused element is not an `INPUT`, `TEXTAREA`, or `SELECT`, and is not inside a `[role="dialog"]`. Used by `use-keyboard-shortcuts` to prevent shortcuts from firing while the user is typing or interacting with a dialog.

### `use-keyboard-shortcuts`

Registers all keyboard shortcuts for the app. Single-key shortcuts (`r`, `p`, `c`, `f`, `0`, `+`, `-`, `t`, `?`, `b`, `g`, `u i`, `u m`) use `onKeyStroke` for synchronous modifier checking and reliable `preventDefault`. Modifier combos (`Ctrl/Cmd+Z`, `Ctrl/Cmd+S`, etc.) use `useMagicKeys` with `onEventFired` for `preventDefault` on browser-intercepted shortcuts. Accepts a `Params` object with callbacks for actions that require component-level context: `openAddRoom`, `fitToScreen`, `centerOnGrid`, `resetZoom`, `zoomIn`, `zoomOut`, `toggleTheme`, `toggleSidebar`, `toggleGroupsPanel`.
