# Storage

All localStorage keys used by Studs follow the `studs-*` naming convention.

---

## Project data

| Key                  | Type               | Owner            | Description                                                                                                                                                          |
| -------------------- | ------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `studs-projects`     | `ProjectSummary[]` | `use-project.ts` | List of all project summaries (id, name, updatedAt). Used to populate the project switcher.                                                                          |
| `studs-active-id`    | `string \| null`   | `use-project.ts` | ID of the currently active project. Set on project create, switch, and delete.                                                                                       |
| `studs-project-{id}` | `Project`          | `use-project.ts` | Full project data for each project, keyed by project ID. Includes rooms, groups, fixtures, units, zoom level, and timestamps. Auto-saves reactively on every change. |

## UI state

| Key                           | Type                       | Owner                                    | Description                                                                                                                                  |
| ----------------------------- | -------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `studs-sidebar-expanded`      | `boolean`                  | `AppSidebar.vue`, `CanvasView.vue`       | Whether the left sidebar is expanded or collapsed. Shared via VueUse `useStorage` — same key in both components gives the same reactive ref. |
| `studs-toolbar-position`      | `{ x: number; y: number }` | `FloatingToolbar.vue`                    | Position of the floating toolbar within the canvas area. Coordinates are relative to `<main>`, not the viewport.                             |
| `studs-groups-panel-position` | `{ x: number; y: number }` | `GroupsPanel.vue`                        | Position of the groups panel within the canvas area. Coordinates are relative to `<main>`, not the viewport.                                 |
| `studs-groups-panel-visible`  | `boolean`                  | `GroupsPanel.vue`, `FloatingToolbar.vue` | Whether the groups panel is visible. Shared via VueUse `useStorage`.                                                                         |

## Theme

| Key                   | Type                          | Owner                                      | Description                                        |
| --------------------- | ----------------------------- | ------------------------------------------ | -------------------------------------------------- |
| `vueuse-color-scheme` | `"light" \| "dark" \| "auto"` | VueUse `useColorMode` (via `use-theme.ts`) | Theme preference. Managed automatically by VueUse. |

---

## Notes

- All keys are set and read via VueUse `useStorage`, which handles JSON serialization automatically.
- UI state keys use the same key string in multiple components where shared state is needed — VueUse returns the same reactive ref for the same key.
- Project data keys are written directly via `localStorage.setItem` in `use-project.ts` for performance (avoids re-serializing the entire project list on every room change).
- To reset all UI state without losing project data, clear only the UI state keys listed above.
- To fully reset the app, clear all `studs-*` keys from localStorage.
