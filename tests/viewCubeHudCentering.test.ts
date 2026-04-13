import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { applyFocusCenterToControls } from "../src/lib/ViewCubeHud";

function makeRef<T>(value: T) {
  return { current: value };
}

describe("ViewCubeHud focus centering", () => {
  it("applies focus bounds center to controls target", () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
    mesh.position.set(5, -2, 3);
    const controls = {
      object: new THREE.PerspectiveCamera(),
      target: new THREE.Vector3(0, 0, 0),
      update: vi.fn(),
    };

    const applied = applyFocusCenterToControls({
      focusRef: makeRef(mesh),
      controlsRef: makeRef(controls),
    });

    expect(applied).toBe(true);
    expect(controls.target.toArray()).toEqual([5, -2, 3]);
    expect(controls.update).toHaveBeenCalledTimes(1);
  });

  it("returns false when controls are missing/invalid", () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    const applied = applyFocusCenterToControls({
      focusRef: makeRef(mesh),
      controlsRef: makeRef({}),
    });
    expect(applied).toBe(false);
  });

  it("returns false and warns for empty focus bounds", () => {
    const controls = {
      object: new THREE.PerspectiveCamera(),
      target: new THREE.Vector3(0, 0, 0),
      update: vi.fn(),
    };
    const warn = vi.fn();
    const applied = applyFocusCenterToControls({
      focusRef: makeRef(new THREE.Object3D()),
      controlsRef: makeRef(controls),
      onWarn: warn,
    });
    expect(applied).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(controls.update).not.toHaveBeenCalled();
  });
});
