// /src/types/project.ts

import type { Fixture } from "./fixtures/fixtures";
import type { WallBoundary } from "./geometry";
import type { UnitSystem } from "./units";

export interface RoomWalls {
  N: WallBoundary;
  S: WallBoundary;
  E: WallBoundary;
  W: WallBoundary;
}

export type RoomType =
  | "bedroom"
  | "bathroom"
  | "kitchen"
  | "living"
  | "dining"
  | "garage"
  | "hallway"
  | "other";

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  x: number; // grid-cell column (top-left origin)
  y: number; // grid-cell row (top-left origin)
  widthCm: number;
  depthCm: number;
  walls: RoomWalls;
  groupId: string | null;
  fixtures: Fixture[];
}

export interface RoomGroup {
  id: string;
  name: string;
  // room membership is derived from Room.groupId — no array here
  // avoids dual-source-of-truth
}

export interface Project {
  id: string;
  name: string;
  units: UnitSystem;
  rooms: Room[];
  groups: RoomGroup[];
  zoomLevel: number;
  createdAt: string; // ISO 8601
  updatedAt: string;
}
