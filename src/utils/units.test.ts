// /src/utils/units.test.ts
import { describe, it, expect } from "vitest";

import {
  ftToCm,
  inToCm,
  mToCm,
  cmToFt,
  cmToIn,
  cmToM,
  cmToDisplay,
  displayToCm,
  unitLabel,
} from "@/utils/units";

describe("ftToCm", () => {
  it("converts 1 foot to 30.48 cm", () => {
    expect(ftToCm(1)).toBeCloseTo(30.48);
  });

  it("converts 0 to 0", () => {
    expect(ftToCm(0)).toBe(0);
  });

  it("converts 10 feet correctly", () => {
    expect(ftToCm(10)).toBeCloseTo(304.8);
  });
});

describe("inToCm", () => {
  it("converts 1 inch to 2.54 cm", () => {
    expect(inToCm(1)).toBeCloseTo(2.54);
  });

  it("converts 12 inches to 30.48 cm", () => {
    expect(inToCm(12)).toBeCloseTo(30.48);
  });
});

describe("mToCm", () => {
  it("converts 1 meter to 100 cm", () => {
    expect(mToCm(1)).toBe(100);
  });

  it("converts 0.5 meters to 50 cm", () => {
    expect(mToCm(0.5)).toBe(50);
  });
});

describe("cmToFt", () => {
  it("converts 30.48 cm to 1 foot", () => {
    expect(cmToFt(30.48)).toBeCloseTo(1);
  });
});

describe("cmToIn", () => {
  it("converts 2.54 cm to 1 inch", () => {
    expect(cmToIn(2.54)).toBeCloseTo(1);
  });
});

describe("cmToM", () => {
  it("converts 100 cm to 1 meter", () => {
    expect(cmToM(100)).toBe(1);
  });
});

describe("cmToDisplay", () => {
  it("formats metric correctly", () => {
    expect(cmToDisplay(381, "metric")).toBe("3.81 m");
  });

  it("formats imperial feet only when no remainder inches", () => {
    expect(cmToDisplay(304.8, "imperial")).toBe("10'");
  });

  it("formats imperial feet and inches", () => {
    expect(cmToDisplay(381, "imperial")).toBe("12'6\"");
  });

  it("formats 0 cm as metric 0.00 m", () => {
    expect(cmToDisplay(0, "metric")).toBe("0.00 m");
  });

  it("formats 0 cm as imperial 0 feet", () => {
    expect(cmToDisplay(0, "imperial")).toBe("0'");
  });
});

describe("displayToCm", () => {
  it("converts imperial feet to cm", () => {
    expect(displayToCm(10, "imperial")).toBeCloseTo(304.8);
  });

  it("converts metric meters to cm", () => {
    expect(displayToCm(3, "metric")).toBe(300);
  });
});

describe("unitLabel", () => {
  it("returns ft for imperial", () => {
    expect(unitLabel("imperial")).toBe("ft");
  });

  it("returns m for metric", () => {
    expect(unitLabel("metric")).toBe("m");
  });
});
