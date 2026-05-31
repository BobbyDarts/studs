// /src/types/fixtures/fixtures.ts

import type { WallKey } from "@/types/geometry";

export interface BaseFixture {
  id: string;
  wall: WallKey;
  offsetCm: number;
  facing?: "in" | "out";
}

export type DoorSubtype =
  | "standard"
  | "french"
  | "sliding"
  | "pocket"
  | "bifold";

export interface DoorFixture extends BaseFixture {
  type: "door";
  subtype?: DoorSubtype;
}

export type WindowSubtype = "standard" | "bay" | "casement" | "sliding";

export interface WindowFixture extends BaseFixture {
  type: "window";
  subtype?: WindowSubtype;
}

export type SinkSubtype = "standard" | "pedestal" | "double";

export interface SinkFixture extends BaseFixture {
  type: "sink";
  subtype?: SinkSubtype;
}

export type StairsSubtype = "straight" | "l-shaped" | "u-shaped";

export interface StairsFixture extends BaseFixture {
  type: "stairs";
  subtype?: StairsSubtype;
}

export interface ToiletFixture extends BaseFixture {
  type: "toilet";
}

export interface BathtubFixture extends BaseFixture {
  type: "bathtub";
}

export interface ShowerFixture extends BaseFixture {
  type: "shower";
}

export interface FireplaceFixture extends BaseFixture {
  type: "fireplace";
}

export type Fixture =
  | DoorFixture
  | WindowFixture
  | ToiletFixture
  | SinkFixture
  | BathtubFixture
  | ShowerFixture
  | FireplaceFixture
  | StairsFixture;

export type FixtureType = Fixture["type"];

export type FixtureSubtype =
  | DoorSubtype
  | WindowSubtype
  | SinkSubtype
  | StairsSubtype;
