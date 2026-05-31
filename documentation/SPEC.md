# Studs — Product Specification

**Version:** 0.2  
**Stack:** Vue 3 + TypeScript + Tailwind v4 + shadcn-vue  
**Author:** Robert Garrison

---

## Overview

A room-first floorplan design tool for single-family homes. Users compose layouts by creating dimensioned rooms and placing them on a fixed grid canvas, then furnishing each room with typed fixtures snapped to wall edges. Dead space is detected and surfaced automatically.

The guiding philosophy is **rooms first** — rather than drawing walls, users define rooms by name and dimension. The tool handles placement, collision, and boundary rendering from there.

---

## Tech Stack

| Layer         | Library                          |
| ------------- | -------------------------------- |
| Framework     | Vue 3 + TypeScript               |
| Build         | Vite                             |
| Styling       | Tailwind CSS v4                  |
| UI primitives | shadcn-vue (built on Reka UI)    |
| State         | Pinia                            |
| Utilities     | VueUse                           |
| Notifications | vue-sonner                       |
| Date handling | @midden/stamp                    |
| IDs           | uuid                             |
| Testing       | Vitest + Testing Library         |
| E2E           | Playwright                       |
| Linting       | ESLint + oxlint                  |
| Formatting    | Prettier                         |
| Git hooks     | Husky + lint-staged + commitlint |

---

## Canvas

### Grid

- Dynamic grid. 1 cell = 1 ft (imperial) or 0.5 m (metric).
- Grid lines rendered as SVG overlay; minor lines at every cell, major lines every 10 cells.
- Canvas target size is 4000px; grid expands/contracts dynamically with zoom (max 200×200 cells).
- Pan via middle mouse button or space+drag.
- Zoom via mouse wheel with zoom-to-cursor; zoom level persisted per project.

### Keyboard Shortcuts

| Key                       | Action              |
| ------------------------- | ------------------- |
| `r`                       | Add Room            |
| `p`                       | New Project         |
| `c`                       | Center on grid      |
| `f`                       | Fit to screen       |
| `0`                       | Reset zoom          |
| `+` / `-`                 | Zoom in / out       |
| `u i` / `u m`             | Switch units        |
| `t`                       | Toggle theme        |
| `b`                       | Toggle sidebar      |
| `g`                       | Toggle groups panel |
| `?`                       | Keyboard reference  |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo         |
| `Ctrl+S`                  | Export JSON         |
| `Ctrl+E`                  | Export SVG          |
| `Ctrl+Shift+O`            | Import JSON         |

### Units

- User-switchable: **Imperial** (ft/in) or **Metric** (m/cm).
- Unit preference stored per project; all dimension inputs and labels re-render on switch.
- Internal data model always stores dimensions in **centimeters** (integers). UI layer converts for display.

---

## Rooms

### Creating a Room

- "Add room" action (`r`) opens a dialog: **name**, **width**, **depth** (in current unit), **room type**, and wall boundary settings per wall.
- Room is placed near the existing floorplan bounding box on creation, not the grid origin.
- Rooms render as labeled rectangles. Label shows name + dimensions (e.g. `Kitchen · 12W × 10D ft`).

### Room Types

`bedroom` | `bathroom` | `kitchen` | `living` | `dining` | `garage` | `hallway` | `other`

### Wall Boundaries

Each of a room's four walls (N, S, E, W) has a boundary type:

| Boundary  | Rendered                  | Fixture placement | Dead space boundary |
| --------- | ------------------------- | ----------------- | ------------------- |
| `solid`   | Yes — solid line          | Yes               | Yes                 |
| `open`    | No                        | No                | No                  |
| `virtual` | No (dashed in SVG export) | Yes               | Yes                 |

### Editing a Room

- Double-click a room to open the edit dialog.
- Shift+click to add to selection.
- All fields are editable: name, type, dimensions, and wall boundaries per side.

### Drag and Drop

- Rooms move freely during drag; snap to nearest valid non-overlapping position on drop.
- Drag is distinguished from click via a 4px pointer movement threshold.
- Grouped rooms move as a unit when any room in the group is dragged.

### Deleting a Room

- Delete room via the floating toolbar room actions menu.

---

## Room Groups

A **room group** is a named collection of rooms that can be moved, copied, and transformed together.

### Rules

- A room belongs to **at most one group**.
- Ungrouped rooms have `groupId: null`.
- Removing a room from a 2-member group dissolves the group automatically.

### Group Operations

| Operation | Description                                                                          |
| --------- | ------------------------------------------------------------------------------------ |
| Create    | Name a group and assign selected rooms to it (requires multi-select)                 |
| Rename    | Change a group's name                                                                |
| Delete    | Remove group record; rooms become ungrouped (optionally delete rooms too)            |
| Move      | Drag any grouped room to move the entire group                                       |
| Copy      | Duplicate all rooms with new ids, offset by bounding box width                       |
| Rotate    | Rotate all rooms around the group bounding box center (90° increments)               |
| Mirror H  | Flip all rooms in the group around the vertical axis                                 |
| Mirror V  | Flip all rooms in the group around the horizontal axis                               |
| Merge     | Combine two or more groups into a single named group                                 |
| Remove    | Remove a single room from the group; dissolves group if only one member would remain |

### Visual Indicators

- Grouped rooms share a unique pastel fill color per group, consistent across sessions.
- Hovering a grouped room shows a tooltip with the group name.
- The groups panel lists all groups with color swatches, room counts, and navigation.

---

## Fixtures

### Placement Rules

- Fixtures must be placed on a wall edge of a room (N / S / E / W).
- Right-click a room to add a fixture via the fixture dialog.
- Click a fixture marker to edit or delete it.
- Fixtures cannot be placed on `open` walls.
- `solid` and `virtual` walls both accept fixtures.

### Fixture Inventory

| Type      | Subtypes                                  |
| --------- | ----------------------------------------- |
| Door      | standard, french, sliding, pocket, bifold |
| Window    | standard, bay, casement, sliding          |
| Fireplace | —                                         |
| Toilet    | —                                         |
| Sink      | standard, pedestal, double                |
| Bathtub   | —                                         |
| Shower    | —                                         |
| Stairs    | straight, l-shaped, u-shaped              |

### Rendering

- Each type + subtype has a distinct floorplan SVG symbol based on standard architectural conventions.
- Symbols scale to grid cell size.
- Fixture layer renders above room blocks at `z-30`.

---

## Dead Space Detection

Dead space is detected reactively whenever rooms are moved, resized, added, or removed.

### Type A — Enclosed Gaps

Grid cells fully surrounded by room boundaries with no room label. Detected via flood-fill from the canvas border.

### Type B — Bounding Box Remainder

Any unassigned cell within the axis-aligned bounding box of all rooms combined.

### Display

- Both types are highlighted with distinct color overlays on the canvas.
- A summary panel at the bottom of the sidebar shows cell counts, visible only when dead space exists.
- Enclosed cells take priority over bounding box remainder.

---

## Persistence

### v1 — Local (current)

- Each project stored as a separate localStorage key: `studs-project-{id}`.
- Project list stored as `studs-projects` (array of summaries with id, name, updatedAt).
- Active project pointer stored as `studs-active-id`.
- Zoom level persisted per project inside the project data as `zoomLevel`.
- Auto-saves reactively on every change.
- **JSON export** — downloads as `.studs.json`.
- **JSON import** — loads a `.studs.json` file, adding it to the project list.
- **SVG export** — renders the canvas to a downloadable `.svg`.
- See `STORAGE.md` for a full catalog of localStorage keys.

### Future — Supabase

- Auth, multi-project cloud sync, collaborative editing.

---

## UI Layout

- **Left sidebar** (collapsible, 208px expanded / 48px collapsed, `b` to toggle): branding, project switcher, unit toggle, import/export actions, dead space summary. Collapses to an icon strip with popovers.
- **Canvas area** (flex-fill): scrollable grid with room blocks, dead space overlay, fixture markers.
- **Floating toolbar** (draggable, persisted position, contained within canvas area): undo/redo, zoom controls, room actions, group actions, groups panel toggle. All actions context-sensitive based on current selection.
- **Groups panel** (draggable, persisted position, `g` to toggle): lists all groups with color swatch, name, room count, and go-to button. Click a group row to select all its rooms.
- **Dialogs**: Room dialog, Fixture dialog, Confirm dialog, Group name dialog — centered modals.
- **Shortcut reference**: tabbed dialog (`?`) with sections for Canvas, Project, Edit, Units, General.
- **Room selection**: click to select, double-click to edit, Shift+click for multi-select. Selected rooms show a colored ring.

---

## Codebase Conventions

- File naming is kebab-case (`use-rooms.ts`, `room-block.vue`).
- Each component lives in its own folder with a barrel `index.ts`.
- Composables are organized into subdirectories: `canvas/`, `ui/`, `keyboard/`.
- Each subdirectory has a barrel `index.ts`; consumers import from the subdirectory.
- All dimensions stored internally in centimeters; UI layer converts for display.
- Types live in `src/types/`.
- Pure utility functions live in `src/utils/` and are fully unit tested.
- Tests are colocated with source files.
- Non-null assertions (`!`) preferred over optional chaining in tests where value is guaranteed.
- Unused parameters prefixed with `_`.
- `@typescript-eslint/consistent-type-imports` enforced — always use `import type` for type-only imports.
- `src/components/ui/` excluded from linting, formatting, and typecheck.
- Store mock factory in `src/test-utils/create-store-mock.ts` shared across all component tests.

---

## Data Model

All dimensions stored internally in **centimeters** as integers.

### Project

```ts
interface Project {
  id: string;
  name: string;
  units: "imperial" | "metric";
  rooms: Room[];
  groups: RoomGroup[];
  zoomLevel: number; // cellSizePx value, persisted per project
  createdAt: string; // ISO 8601
  updatedAt: string;
}
```

### Room

```ts
interface Room {
  id: string;
  name: string;
  type: RoomType;
  x: number; // grid-cell column (top-left origin)
  y: number; // grid-cell row (top-left origin)
  widthCm: number;
  depthCm: number;
  walls: RoomWalls; // { N, S, E, W: WallBoundary }
  groupId: string | null;
  fixtures: Fixture[];
}
```

### Fixture

```ts
interface Fixture {
  id: string;
  type: FixtureType;
  subtype: FixtureSubtype | undefined;
  wall: "N" | "S" | "E" | "W";
  offsetCm: number; // distance from room top-left corner along the wall
  facing?: "in" | "out";
}
```

### RoomGroup

```ts
interface RoomGroup {
  id: string;
  name: string;
  // membership derived from Room.groupId — no array stored here
}
```

---

## Project Structure

    src/
    ├── assets/
    │   └── main.css
    ├── components/
    │   ├── app/
    │   │   ├── canvas/
    │   │   │   ├── floorplan-canvas/ # FloorplanCanvas — scrollable canvas
    │   │   │   └── grid-overlay/     # GridOverlay — SVG grid lines
    │   │   ├── deadspace/
    │   │   │   └── dead-space-overlay/ # DeadSpaceOverlay — enclosed + remainder highlights
    │   │   ├── fixture/
    │   │   │   ├── fixture-dialog/   # FixtureDialog — add/edit fixture modal
    │   │   │   ├── fixture-layer/    # FixtureLayer — renders all fixture markers
    │   │   │   └── fixture-marker/   # FixtureMarker — individual fixture SVG symbol
    │   │   ├── room/
    │   │   │   ├── room-block/       # RoomBlock — draggable room rectangle
    │   │   │   ├── room-dialog/      # RoomDialog — add/edit room modal
    │   │   │   └── room-label/       # RoomLabel — name + dimensions label
    │   │   └── shell/
    │   │       ├── app-sidebar/      # AppSidebar — collapsible left sidebar
    │   │       ├── confirm-dialog/   # ConfirmDialog — reusable confirm modal
    │   │       ├── floating-toolbar/ # FloatingToolbar — draggable action toolbar
    │   │       ├── global-dialogs/   # GlobalDialogs — mounts all singleton dialogs
    │   │       ├── group-dialog/     # GroupDialog — group name input modal
    │   │       ├── groups-panel/     # GroupsPanel — draggable groups list panel
    │   │       ├── project-switcher/ # ProjectSwitcher — project list popover
    │   │       └── shortcut-reference-dialog/ # ShortcutReferenceDialog
    │   └── ui/                       # shadcn-vue primitives (excluded from lint/format)
    ├── composables/
    │   ├── canvas/
    │   │   ├── use-canvas-controls.ts
    │   │   ├── use-dead-space.ts
    │   │   ├── use-fixtures.ts
    │   │   ├── use-grid.ts
    │   │   ├── use-project.ts
    │   │   ├── use-rooms.ts
    │   │   └── use-selection.ts
    │   ├── keyboard/
    │   │   ├── use-input-guard.ts
    │   │   └── use-keyboard-shortcuts.ts
    │   └── ui/
    │       ├── use-confirm-dialog.ts
    │       ├── use-group-dialog.ts
    │       ├── use-shortcut-reference.ts
    │       └── use-theme.ts
    ├── lib/
    │   ├── dialog.ts                 # createDialogState factory
    │   └── utils.ts                  # shadcn cn() helper
    ├── router/
    │   └── index.ts
    ├── stores/
    │   └── project.ts
    ├── test-utils/
    │   └── create-store-mock.ts
    ├── types/
    │   ├── fixtures/
    │   │   └── fixtures.ts
    │   ├── geometry.ts
    │   ├── project.ts
    │   └── units.ts
    ├── utils/
    │   ├── geometry.ts
    │   ├── group-colors.ts           # Pastel color palette for group indicators
    │   ├── svg.ts
    │   └── units.ts
    └── views/
        └── CanvasView.vue

---

## Scope Boundaries

| Feature                                        | Status    |
| ---------------------------------------------- | --------- |
| Single-family home layouts                     | ✅ v1     |
| Dynamic grid canvas                            | ✅ v1     |
| Imperial + metric unit switching               | ✅ v1     |
| Room CRUD + drag and drop                      | ✅ v1     |
| Wall boundary types (solid / open / virtual)   | ✅ v1     |
| Room groups (full UI)                          | ✅ v1     |
| Fixture placement UI                           | ✅ v1     |
| Dead space detection (enclosed + bounding box) | ✅ v1     |
| Local persistence (multi-project)              | ✅ v1     |
| JSON export / import                           | ✅ v1     |
| SVG export                                     | ✅ v1     |
| Pan + zoom with zoom-to-cursor                 | ✅ v1     |
| Fit to screen + center on grid                 | ✅ v1     |
| Undo/redo                                      | ✅ v1     |
| Keyboard shortcuts + reference dialog          | ✅ v1     |
| Theme toggle (light/dark/system)               | ✅ v1     |
| Project switcher                               | ✅ v1     |
| Confirmation dialogs                           | ✅ v1     |
| Floating draggable toolbar                     | ✅ v1     |
| Collapsible sidebar                            | ✅ v1     |
| Groups list panel                              | ✅ v1     |
| Wall segment rendering                         | 🔲 future |
| Multi-story / floor support                    | 🔲 future |
| Freehand wall drawing                          | 🔲 future |
| Non-rectangular rooms                          | 🔲 future |
| PDF export                                     | 🔲 future |
| Supabase auth + cloud sync                     | 🔲 future |
| Collaborative editing                          | 🔲 future |
