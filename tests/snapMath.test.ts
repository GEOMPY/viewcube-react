import { describe, expect, it } from "vitest";
import { labelFromCoord, snapFromCoord } from "../src/lib/math/snapMath";

describe("snapMath", () => {
  it("maps canonical face coord to normalized direction", () => {
    const result = snapFromCoord([0, 0, 1]);
    expect(result.position.x).toBeCloseTo(0);
    expect(result.position.y).toBeCloseTo(0);
    expect(result.position.z).toBeCloseTo(1);
  });

  it("uses top/bottom up-vector override for y-axis faces", () => {
    const top = snapFromCoord([0, 1, 0]);
    const bottom = snapFromCoord([0, -1, 0]);
    expect(top.up.toArray()).toEqual([0, 0, -1]);
    expect(bottom.up.toArray()).toEqual([0, 0, 1]);
  });

  it("uses default world-up for side faces", () => {
    const right = snapFromCoord([1, 0, 0]);
    expect(right.up.toArray()).toEqual([0, 1, 0]);
  });

  it("maps labels using defaults", () => {
    expect(labelFromCoord([0, 1, 0])).toBe("TOP");
    expect(labelFromCoord([1, 0, 0])).toBe("RIGHT");
  });

  it("throws for degenerate/invalid vectors", () => {
    expect(() => snapFromCoord([0, 0, 0])).toThrow();
    expect(() => snapFromCoord([Number.NaN, 0, 1])).toThrow();
  });
});
