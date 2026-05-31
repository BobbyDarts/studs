// /src/components/app/fixture/fixture-marker/renderer-registry.ts

import type { Component } from "vue";

import type { Fixture } from "@/types/fixtures";

import {
  BathroomRenderer,
  DoorRenderer,
  StructureRenderer,
  WindowRenderer,
} from "./renderers";

type RendererEntry = {
  match: (fixture: Fixture) => boolean;
  component: Component;
};

export const RENDERERS: RendererEntry[] = [
  {
    match: (f) => f.type === "door",
    component: DoorRenderer,
  },
  {
    match: (f) => f.type === "window",
    component: WindowRenderer,
  },
  {
    match: (f) =>
      f.type === "toilet" ||
      f.type === "sink" ||
      f.type === "bathtub" ||
      f.type === "shower",
    component: BathroomRenderer,
  },
  {
    match: (f) => f.type === "fireplace" || f.type === "stairs",
    component: StructureRenderer,
  },
];
