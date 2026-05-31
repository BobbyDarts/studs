# Studs

A room-first floorplan design tool for single-family homes. Instead of drawing walls, you define rooms by dimension and compose layouts on a fixed grid — then furnish each room with typed fixtures snapped to wall edges.

---

## Features

- **Room-first design** — add rooms by name and dimensions; no wall drawing required
- **Dynamic grid canvas** — 1 cell = 1 ft (imperial) or 0.5 m (metric), with major/minor grid lines; grid size expands/contracts with zoom level
- **Pan + zoom** — mouse wheel zoom with zoom-to-cursor, middle mouse / space+drag to pan, zoom level persisted per project
- **Fit to screen** — automatically zoom and scroll to fit all rooms in view (`f`)
- **Center on grid** — reposition all rooms to the center of the grid (`c`)
- **Drag and drop** — move rooms freely with snap-to-nearest-valid on drop
- **Wall boundaries** — each wall is `solid`, `open`, or `virtual` to support open-concept layouts
- **Room groups** — group rooms into named sets; move, copy, rotate, mirror, and merge groups
- **Groups panel** — floating panel listing all groups with color indicators and go-to navigation (`g`)
- **Fixture placement** — place typed fixtures on any valid wall edge with subtype support
- **Dead space detection** — flood-fill (enclosed gaps) and bounding-box remainder detection, highlighted on canvas
- **Unit switching** — toggle between imperial (ft/in) and metric (m/cm) at any time (`u i` / `u m`)
- **Multi-project support** — create and switch between multiple projects via the sidebar project switcher
- **Local persistence** — projects auto-save to `localStorage`; zoom level persisted per project
- **JSON export/import** — save and load `.studs.json` project files (`Ctrl+S` / `Ctrl+Shift+O`)
- **SVG export** — download a clean vector floorplan (`Ctrl+E`)
- **Undo/redo** — full undo/redo history for room and fixture changes (`Ctrl+Z` / `Ctrl+Shift+Z`)
- **Theme toggle** — light/dark mode with system preference support (`t`)
- **Keyboard shortcuts** — full keyboard shortcut support with in-app reference (`?`)
- **Collapsible sidebar** — collapses to an icon strip (`b`)
- **Floating draggable toolbar** — context-sensitive room and group actions

---

## Fixture inventory

| Type      | Subtypes                                  |
| --------- | ----------------------------------------- |
| Door      | Standard, French, Sliding, Pocket, Bifold |
| Window    | Standard, Bay, Casement, Sliding          |
| Fireplace | —                                         |
| Toilet    | —                                         |
| Sink      | Standard, Pedestal, Double                |
| Bathtub   | —                                         |
| Shower    | —                                         |
| Stairs    | Straight, L-shaped, U-shaped              |

---

## Tech stack

| Layer         | Library                                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/)                                                                  |
| Build         | [Vite](https://vitejs.dev/)                                                                                                                  |
| Styling       | [Tailwind CSS v4](https://tailwindcss.com/)                                                                                                  |
| UI primitives | [shadcn-vue](https://www.shadcn-vue.com/) (built on [Reka UI](https://reka-ui.com/))                                                         |
| State         | [Pinia](https://pinia.vuejs.org/)                                                                                                            |
| Utilities     | [VueUse](https://vueuse.org/)                                                                                                                |
| Notifications | [vue-sonner](https://vue-sonner.vercel.app/)                                                                                                 |
| Date handling | [@midden/stamp](https://www.npmjs.com/package/@midden/stamp)                                                                                 |
| IDs           | [uuid](https://www.npmjs.com/package/uuid)                                                                                                   |
| Testing       | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)                               |
| E2E           | [Playwright](https://playwright.dev/)                                                                                                        |
| Linting       | [ESLint](https://eslint.org/) + [oxlint](https://oxc.rs/docs/guide/usage/linter.html)                                                        |
| Formatting    | [Prettier](https://prettier.io/)                                                                                                             |
| Git hooks     | [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged) + [commitlint](https://commitlint.js.org/) |

---

## Keyboard shortcuts

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
| `?`                       | Keyboard shortcuts  |
| `Ctrl+Z` / `Ctrl+Shift+Z` | Undo / Redo         |
| `Ctrl+S`                  | Export JSON         |
| `Ctrl+E`                  | Export SVG          |
| `Ctrl+Shift+O`            | Import JSON         |

---

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint

# Full validation
npm run validate
```

---

## Scripts

| Script          | Description                                      |
| --------------- | ------------------------------------------------ |
| `dev`           | Start Vite dev server                            |
| `build`         | Type-check and build for production              |
| `test`          | Run Vitest in watch mode                         |
| `test:run`      | Run tests once                                   |
| `test:ui`       | Open Vitest UI                                   |
| `test:coverage` | Generate coverage report                         |
| `lint`          | oxlint + ESLint with auto-fix                    |
| `lint:check`    | oxlint + ESLint check only (used in CI)          |
| `format`        | Prettier write                                   |
| `format:check`  | Prettier check                                   |
| `typecheck`     | vue-tsc type check                               |
| `validate`      | lint:check + format:check + test:run + typecheck |

---

## Data model

Projects are stored internally with all dimensions in **centimeters** (integers). The UI layer converts to the active unit system for display and input. This ensures unit switching is lossless and the data model maps cleanly to a future Supabase backend.

Each project is stored as a separate localStorage key (`studs-project-{id}`), with a summary list (`studs-projects`) and active project pointer (`studs-active-id`). See `STORAGE.md` for a full catalog of all storage keys.

---

## Roadmap

- [x] Room CRUD + drag and drop
- [x] Wall boundary types (solid / open / virtual)
- [x] Room groups (full UI — create, rename, delete, copy, rotate, mirror, merge)
- [x] Fixture placement UI
- [x] Dead space detection + overlay
- [x] JSON + SVG export/import
- [x] Pan + zoom canvas with zoom-to-cursor
- [x] Fit to screen + center on grid
- [x] Dynamic grid size on zoom
- [x] Local persistence (multi-project)
- [x] Undo/redo
- [x] Keyboard shortcuts + reference dialog
- [x] Theme toggle (light/dark/system)
- [x] Project switcher
- [x] Confirmation dialogs for destructive actions
- [x] Floating draggable toolbar
- [x] Collapsible sidebar
- [x] Groups list panel

### Future

- [ ] Wall segment rendering (partial open/virtual boundaries)
- [ ] Multi-story / floor support
- [ ] Supabase auth + cloud sync
- [ ] Collaborative editing

---

## License

MIT © Robert Garrison
