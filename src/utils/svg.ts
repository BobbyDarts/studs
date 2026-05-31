// utils/svg.ts
import type { Fixture } from "@/types/fixtures";
import type { WallKey } from "@/types/geometry";
import type { Project, Room } from "@/types/project";
import { cmToDisplay } from "@/utils/units";

// --- Constants ---

const CELL_SIZE = 40; // px per grid cell in the SVG output
const WALL_WIDTH = 2; // px
const OPEN_WALL_DASH = "6,4";
const GRID_COLOR = "#e5e7eb";
const WALL_COLOR = "#1f2937";
const VIRTUAL_WALL_COLOR = "#9ca3af";
const ROOM_FILL = "#f9fafb";
const ROOM_LABEL_COLOR = "#111827";
const DEAD_SPACE_FILL = "rgba(239,68,68,0.15)";
const DEAD_SPACE_STROKE = "#ef4444";

// --- Coordinate helpers ---

function cellToPx(cell: number): number {
  return cell * CELL_SIZE;
}

// --- Room rendering ---

function renderWall(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  boundary: "solid" | "open" | "virtual",
): string {
  if (boundary === "open") return "";

  const dash =
    boundary === "virtual" ? `stroke-dasharray="${OPEN_WALL_DASH}"` : "";
  const color = boundary === "virtual" ? VIRTUAL_WALL_COLOR : WALL_COLOR;

  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${WALL_WIDTH}" ${dash}/>`;
}

function renderRoom(room: Room, units: Project["units"]): string {
  const x = cellToPx(room.x);
  const y = cellToPx(room.y);
  const w = cellToPx(room.widthCm / 30.48); // cm → ft → cells (1 cell = 1 ft)
  const h = cellToPx(room.depthCm / 30.48);

  const fill = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ROOM_FILL}"/>`;

  const walls = [
    renderWall(x, y, x + w, y, room.walls.N), // N
    renderWall(x, y + h, x + w, y + h, room.walls.S), // S
    renderWall(x, y, x, y + h, room.walls.W), // W
    renderWall(x + w, y, x + w, y + h, room.walls.E), // E
  ].join("\n");

  const widthLabel = cmToDisplay(room.widthCm, units);
  const depthLabel = cmToDisplay(room.depthCm, units);
  const cx = x + w / 2;
  const cy = y + h / 2;

  const label = `
    <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="12"
      font-family="sans-serif" fill="${ROOM_LABEL_COLOR}" font-weight="500">${room.name}</text>
    <text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="10"
      font-family="sans-serif" fill="${VIRTUAL_WALL_COLOR}">${widthLabel} × ${depthLabel}</text>
  `;

  const fixtures = room.fixtures.map((f) => renderFixture(f, room)).join("\n");

  return `<g id="room-${room.id}">\n${fill}\n${walls}\n${label}\n${fixtures}\n</g>`;
}

// --- Fixture rendering ---

function fixtureOrigin(
  fixture: Fixture,
  room: Room,
): { x: number; y: number; angle: number } {
  const rx = cellToPx(room.x);
  const ry = cellToPx(room.y);
  const rw = cellToPx(room.widthCm / 30.48);
  const rh = cellToPx(room.depthCm / 30.48);
  const offset = cellToPx(fixture.offsetCm / 30.48);

  const positions: Record<WallKey, { x: number; y: number; angle: number }> = {
    N: { x: rx + offset, y: ry, angle: 0 },
    S: { x: rx + offset, y: ry + rh, angle: 180 },
    W: { x: rx, y: ry + offset, angle: 270 },
    E: { x: rx + rw, y: ry + offset, angle: 90 },
  };

  return positions[fixture.wall];
}

function renderFixture(fixture: Fixture, room: Room): string {
  const { x, y, angle } = fixtureOrigin(fixture, room);
  const symbol = fixtureSymbol(fixture);
  return `<g transform="translate(${x},${y}) rotate(${angle})">${symbol}</g>`;
}

function fixtureSymbol(fixture: Fixture): string {
  switch (fixture.type) {
    case "door":
      return renderDoorSymbol(fixture.subtype as string);
    case "window":
      return renderWindowSymbol();
    case "fireplace":
      return renderFireplaceSymbol();
    case "toilet":
      return renderToiletSymbol();
    case "sink":
      return renderSinkSymbol(fixture.subtype as string);
    case "bathtub":
      return renderBathtubSymbol();
    case "shower":
      return renderShowerSymbol();
    case "stairs":
      return renderStairsSymbol(fixture.subtype as string);
    default:
      return "";
  }
}

// Symbols are drawn assuming wall is at y=0, room interior is downward (positive y)
// Each symbol fits within a CELL_SIZE × CELL_SIZE bounding box

function renderDoorSymbol(subtype: string): string {
  const s = CELL_SIZE;
  switch (subtype) {
    case "french":
      // Two arcs opening inward
      return `
        <line x1="0" y1="0" x2="${s / 2}" y2="0" stroke="${WALL_COLOR}" stroke-width="${WALL_WIDTH}"/>
        <path d="M 0 0 A ${s / 2} ${s / 2} 0 0 1 0 ${s / 2}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
        <line x1="${s / 2}" y1="0" x2="${s}" y2="0" stroke="${WALL_COLOR}" stroke-width="${WALL_WIDTH}"/>
        <path d="M ${s} 0 A ${s / 2} ${s / 2} 0 0 0 ${s} ${s / 2}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
      `;
    case "sliding":
      return `
        <line x1="0" y1="0" x2="${s}" y2="0" stroke="${WALL_COLOR}" stroke-width="${WALL_WIDTH}"/>
        <rect x="${s * 0.1}" y="2" width="${s * 0.45}" height="${s * 0.2}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
        <rect x="${s * 0.45}" y="2" width="${s * 0.45}" height="${s * 0.2}" fill="none" stroke="${WALL_COLOR}" stroke-width="1" stroke-dasharray="3,2"/>
      `;
    default:
      // Standard: door panel + swing arc
      return `
        <line x1="0" y1="0" x2="${s}" y2="0" stroke="${WALL_COLOR}" stroke-width="${WALL_WIDTH}"/>
        <line x1="0" y1="0" x2="0" y2="${s}" stroke="${WALL_COLOR}" stroke-width="1"/>
        <path d="M 0 ${s} A ${s} ${s} 0 0 1 ${s} 0" fill="none" stroke="${WALL_COLOR}" stroke-width="1" stroke-dasharray="4,2"/>
      `;
  }
}

function renderWindowSymbol(): string {
  const s = CELL_SIZE;
  return `
    <line x1="0" y1="0" x2="${s}" y2="0" stroke="${WALL_COLOR}" stroke-width="${WALL_WIDTH}"/>
    <line x1="0" y1="4" x2="${s}" y2="4" stroke="${WALL_COLOR}" stroke-width="1"/>
    <line x1="0" y1="8" x2="${s}" y2="8" stroke="${WALL_COLOR}" stroke-width="1"/>
  `;
}

function renderFireplaceSymbol(): string {
  const s = CELL_SIZE;
  return `
    <rect x="0" y="0" width="${s}" height="${s * 0.4}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
    <rect x="${s * 0.2}" y="${s * 0.05}" width="${s * 0.6}" height="${s * 0.3}" fill="${GRID_COLOR}" stroke="${WALL_COLOR}" stroke-width="1"/>
  `;
}

function renderToiletSymbol(): string {
  const s = CELL_SIZE;
  return `
    <rect x="${s * 0.1}" y="0" width="${s * 0.8}" height="${s * 0.35}" rx="2" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
    <ellipse cx="${s / 2}" cy="${s * 0.7}" rx="${s * 0.38}" ry="${s * 0.28}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
  `;
}

function renderSinkSymbol(subtype: string): string {
  const s = CELL_SIZE;
  if (subtype === "double") {
    return `
      <rect x="0" y="0" width="${s}" height="${s * 0.5}" rx="2" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
      <line x1="${s / 2}" y1="0" x2="${s / 2}" y2="${s * 0.5}" stroke="${WALL_COLOR}" stroke-width="1"/>
      <circle cx="${s * 0.25}" cy="${s * 0.25}" r="3" fill="${WALL_COLOR}"/>
      <circle cx="${s * 0.75}" cy="${s * 0.25}" r="3" fill="${WALL_COLOR}"/>
    `;
  }
  return `
    <rect x="${s * 0.1}" y="0" width="${s * 0.8}" height="${s * 0.5}" rx="2" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
    <circle cx="${s / 2}" cy="${s * 0.25}" r="3" fill="${WALL_COLOR}"/>
  `;
}

function renderBathtubSymbol(): string {
  const s = CELL_SIZE;
  return `
    <rect x="0" y="0" width="${s}" height="${s * 0.6}" rx="4" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
    <circle cx="${s / 2}" cy="${s * 0.15}" r="${s * 0.1}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
  `;
}

function renderShowerSymbol(): string {
  const s = CELL_SIZE;
  return `
    <rect x="0" y="0" width="${s}" height="${s}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
    <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.2}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
    <line x1="${s * 0.3}" y1="${s * 0.3}" x2="${s * 0.7}" y2="${s * 0.7}" stroke="${WALL_COLOR}" stroke-width="0.5"/>
    <line x1="${s * 0.7}" y1="${s * 0.3}" x2="${s * 0.3}" y2="${s * 0.7}" stroke="${WALL_COLOR}" stroke-width="0.5"/>
  `;
}

function renderStairsSymbol(subtype: string): string {
  const s = CELL_SIZE;
  const steps = 5;
  const stepH = s / steps;

  if (subtype === "l-shaped") {
    return `
      <rect x="0" y="0" width="${s}" height="${s}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
      ${Array.from(
        { length: steps },
        (_, i) =>
          `<line x1="0" y1="${i * stepH}" x2="${s - i * (s / steps)}" y2="${i * stepH}" stroke="${WALL_COLOR}" stroke-width="0.5"/>`,
      ).join("\n")}
    `;
  }

  // Straight (default) and U-shaped both render as parallel treads for now
  return `
    <rect x="0" y="0" width="${s}" height="${s}" fill="none" stroke="${WALL_COLOR}" stroke-width="1"/>
    ${Array.from(
      { length: steps },
      (_, i) =>
        `<line x1="0" y1="${i * stepH}" x2="${s}" y2="${i * stepH}" stroke="${WALL_COLOR}" stroke-width="0.5"/>`,
    ).join("\n")}
  `;
}

// --- Dead space rendering ---

export function renderDeadSpaceCells(
  cells: { x: number; y: number }[],
): string {
  return cells
    .map(({ x, y }) => {
      const px = cellToPx(x);
      const py = cellToPx(y);
      return `<rect x="${px}" y="${py}" width="${CELL_SIZE}" height="${CELL_SIZE}"
      fill="${DEAD_SPACE_FILL}" stroke="${DEAD_SPACE_STROKE}" stroke-width="0.5"/>`;
    })
    .join("\n");
}

// --- Grid rendering ---

function renderGrid(width: number, height: number): string {
  const lines: string[] = [];

  for (let x = 0; x <= width; x++) {
    const px = cellToPx(x);
    const isMajor = x % 10 === 0;
    lines.push(`<line x1="${px}" y1="0" x2="${px}" y2="${cellToPx(height)}"
      stroke="${GRID_COLOR}" stroke-width="${isMajor ? 0.75 : 0.5}"/>`);
  }

  for (let y = 0; y <= height; y++) {
    const py = cellToPx(y);
    const isMajor = y % 10 === 0;
    lines.push(`<line x1="0" y1="${py}" x2="${cellToPx(width)}" y2="${py}"
      stroke="${GRID_COLOR}" stroke-width="${isMajor ? 0.75 : 0.5}"/>`);
  }

  return lines.join("\n");
}

// --- Main export ---

export function projectToSvg(
  project: Project,
  deadSpaceCells: { x: number; y: number }[] = [],
  canvasWidth = 50, // grid cells
  canvasHeight = 50,
): string {
  const pxW = cellToPx(canvasWidth);
  const pxH = cellToPx(canvasHeight);

  const grid = renderGrid(canvasWidth, canvasHeight);
  const dead = renderDeadSpaceCells(deadSpaceCells);
  const rooms = project.rooms
    .map((r) => renderRoom(r, project.units))
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 ${pxW} ${pxH}">
  <rect width="${pxW}" height="${pxH}" fill="white"/>
  <g id="grid">${grid}</g>
  <g id="dead-space">${dead}</g>
  <g id="rooms">${rooms}</g>
</svg>`;
}

export function downloadSvg(
  project: Project,
  deadSpaceCells: { x: number; y: number }[] = [],
): void {
  const svg = projectToSvg(project, deadSpaceCells);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}
