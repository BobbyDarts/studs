// /src/utils/units.ts

import type { UnitSystem } from "@/types/units";

// Conversion constants
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const CM_PER_FOOT = CM_PER_INCH * INCHES_PER_FOOT; // 30.48
const CM_PER_METER = 100;

// --- To centimeters ---

export function ftToCm(ft: number): number {
  return ft * CM_PER_FOOT;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function mToCm(m: number): number {
  return m * CM_PER_METER;
}

// --- From centimeters ---

export function cmToFt(cm: number): number {
  return cm / CM_PER_FOOT;
}

export function cmToIn(cm: number): number {
  return cm / CM_PER_INCH;
}

export function cmToM(cm: number): number {
  return cm / CM_PER_METER;
}

// --- Formatted display strings ---

/**
 * Converts cm to a display string in the given unit system.
 * Imperial: "12'6"" (feet and inches)
 * Metric: "3.81 m"
 */
export function cmToDisplay(cm: number, units: UnitSystem): string {
  if (units === "metric") {
    return `${cmToM(cm).toFixed(2)} m`;
  }

  const totalInches = cmToIn(cm);
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = Math.round(totalInches % INCHES_PER_FOOT);

  // Due to rounding, we might end up with 12 inches, which should be
  // rolled over to 1 foot.
  if (inches === INCHES_PER_FOOT) {
    return `${feet + 1}'`;
  }

  if (inches === 0) return `${feet}'`;
  return `${feet}'${inches}"`;
}

/**
 * Converts a user-entered dimension to cm based on current unit system.
 * Expects a plain number (feet or meters — no inches component).
 * For imperial, use ftToCm directly; this is for single-field numeric inputs.
 */
export function displayToCm(value: number, units: UnitSystem): number {
  return units === "imperial" ? ftToCm(value) : mToCm(value);
}

/**
 * Returns the display label for the current unit system.
 */
export function unitLabel(units: UnitSystem): string {
  return units === "imperial" ? "ft" : "m";
}
