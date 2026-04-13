import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { resolveTarget } from "../src/lib/TargetResolver";

function makeRef<T>(value: T) {
  return { current: value };
}

describe("resolveTarget", () => {
  it("focusRef bounds center wins over tuple and controls target", () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
    mesh.position.set(10, 0, 0);

    const controlsRef = makeRef({ target: new THREE.Vector3(3, 3, 3) });
    const out = resolveTarget({
      focusRef: makeRef(mesh),
      target: [1, 1, 1],
      controlsRef,
    });

    expect(out.toArray()).toEqual([10, 0, 0]);
  });

  it("uses explicit target tuple when focusRef is absent", () => {
    const controlsRef = makeRef({ target: new THREE.Vector3(5, 5, 5) });
    const out = resolveTarget({ target: [1, 2, 3], controlsRef });
    expect(out.toArray()).toEqual([1, 2, 3]);
  });

  it("uses controls target when no focusRef and no valid tuple", () => {
    const controlsTarget = new THREE.Vector3(7, 8, 9);
    const out = resolveTarget({ controlsRef: makeRef({ target: controlsTarget }) });
    expect(out.toArray()).toEqual([7, 8, 9]);
  });

  it("falls back to origin when nothing is available", () => {
    const out = resolveTarget({});
    expect(out.toArray()).toEqual([0, 0, 0]);
  });

  it("returns copied vectors (mutating output does not mutate source)", () => {
    const controlsTarget = new THREE.Vector3(2, 3, 4);
    const out = resolveTarget({ controlsRef: makeRef({ target: controlsTarget }) });
    out.set(99, 99, 99);
    expect(controlsTarget.toArray()).toEqual([2, 3, 4]);
  });

  it("warns and falls back on invalid target tuple", () => {
    const warn = vi.fn();
    const out = resolveTarget({
      target: [Number.NaN, 1, 2] as unknown as [number, number, number],
      controlsRef: makeRef({ target: new THREE.Vector3(4, 4, 4) }),
      onWarn: warn,
    });

    expect(out.toArray()).toEqual([4, 4, 4]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("warns and falls back when focusRef bounds are empty", () => {
    const warn = vi.fn();
    const empty = new THREE.Object3D();
    const out = resolveTarget({
      focusRef: makeRef(empty),
      controlsRef: makeRef({ target: new THREE.Vector3(6, 6, 6) }),
      onWarn: warn,
    });

    expect(out.toArray()).toEqual([6, 6, 6]);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
