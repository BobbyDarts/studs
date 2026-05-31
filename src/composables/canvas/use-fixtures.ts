// /src/composables/canvas/use-fixtures.ts

import { v4 as uuidv4 } from "uuid";

import type { FixtureType, FixtureSubtype, Fixture } from "@/types/fixtures";
import type { WallKey } from "@/types/geometry";
import type { Room } from "@/types/project";

export function useFixtures() {
  function addFixture(
    room: Room,
    params: {
      type: FixtureType;
      subtype?: FixtureSubtype;
      wall: WallKey;
      offsetCm: number;
      facing?: "in" | "out";
    },
  ): Fixture {
    const fixture = {
      id: uuidv4(),
      type: params.type,
      subtype: params.subtype,
      wall: params.wall,
      offsetCm: params.offsetCm,
      facing: params.facing,
    } as Fixture;

    room.fixtures = [...room.fixtures, fixture];
    return fixture;
  }

  function updateFixture(
    room: Room,
    fixtureId: string,
    updates: Partial<Omit<Fixture, "id">>,
  ): void {
    const fixture = room.fixtures.find((f) => f.id === fixtureId);
    if (!fixture) return;
    Object.assign(fixture, updates);
  }

  function removeFixture(room: Room, fixtureId: string): void {
    room.fixtures = room.fixtures.filter((f) => f.id !== fixtureId);
  }

  function fixturesOnWall(room: Room, wall: WallKey): Fixture[] {
    return room.fixtures.filter((f) => f.wall === wall);
  }

  /**
   * After a room is resized, fixtures whose offset exceeds the new wall
   * length are flagged as invalid.
   */
  function validateFixtures(room: Room): Fixture[] {
    return room.fixtures.filter((f) => {
      const wallLength =
        f.wall === "N" || f.wall === "S" ? room.widthCm : room.depthCm;
      return f.offsetCm > wallLength;
    });
  }

  /**
   * Returns true if a wall boundary allows fixture placement.
   * Open walls cannot have fixtures; solid and virtual can.
   */
  function wallAcceptsFixtures(room: Room, wall: WallKey): boolean {
    return room.walls[wall] !== "open";
  }

  return {
    addFixture,
    updateFixture,
    removeFixture,
    fixturesOnWall,
    validateFixtures,
    wallAcceptsFixtures,
  };
}
