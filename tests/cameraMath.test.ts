import * as THREE from "three";
import { describe, expect, it } from "vitest";
import {
  computeHomePosition,
  fitDistanceForFov,
  panCameraAndTarget,
  rotateCameraAroundTarget,
  zoomCameraRelativeToTarget,
} from "../src/lib/math/cameraMath";

describe("cameraMath", () => {
  it("zooms camera relative to target with vector factor", () => {
    const camera = new THREE.Vector3(10, 0, 0);
    const target = new THREE.Vector3(0, 0, 0);
    const zoomedIn = zoomCameraRelativeToTarget(camera, target, 0.5);
    const zoomedOut = zoomCameraRelativeToTarget(camera, target, 2);
    expect(zoomedIn.distanceTo(target)).toBeCloseTo(5);
    expect(zoomedOut.distanceTo(target)).toBeCloseTo(20);
  });

  it("fit distance is positive and finite for valid inputs", () => {
    const size = new THREE.Vector3(100, 10, 5);
    const distance = fitDistanceForFov(size, 50);
    expect(Number.isFinite(distance)).toBe(true);
    expect(distance).toBeGreaterThan(0);
  });

  it("fit distance increases for portrait aspect to avoid horizontal clipping", () => {
    const size = new THREE.Vector3(100, 10, 5);
    const landscape = fitDistanceForFov(size, 50, 1.5);
    const portrait = fitDistanceForFov(size, 50, 0.6);
    expect(portrait).toBeGreaterThan(landscape);
  });

  it("computeHomePosition returns isometric offset from target", () => {
    const target = new THREE.Vector3(1, 2, 3);
    const home = computeHomePosition(target, 10);
    expect(home.distanceTo(target)).toBeCloseTo(10);
  });

  it("rotate around target preserves radius", () => {
    const camera = new THREE.Vector3(10, 0, 0);
    const target = new THREE.Vector3(0, 0, 0);
    const rotated = rotateCameraAroundTarget(camera, target, "y", 90);
    expect(rotated.distanceTo(target)).toBeCloseTo(10);
  });

  it("pan preserves camera-target delta", () => {
    const camera = new THREE.Vector3(10, 5, 1);
    const target = new THREE.Vector3(1, 1, 1);
    const deltaBefore = camera.clone().sub(target);
    const out = panCameraAndTarget(camera, target, new THREE.Vector3(2, 3, 4));
    const deltaAfter = out.cameraPosition.clone().sub(out.target);
    expect(deltaAfter.distanceTo(deltaBefore)).toBeCloseTo(0);
  });

  it("throws on invalid/degenerate numeric inputs", () => {
    expect(() => fitDistanceForFov(new THREE.Vector3(1, 1, 1), 0)).toThrow();
    expect(() => fitDistanceForFov(new THREE.Vector3(1, 1, 1), 180)).toThrow();
    expect(() => fitDistanceForFov(new THREE.Vector3(1, 1, 1), 50, 0)).toThrow();
    expect(() => zoomCameraRelativeToTarget(new THREE.Vector3(1, 1, 1), new THREE.Vector3(), 0)).toThrow();
    expect(() =>
      panCameraAndTarget(new THREE.Vector3(Number.NaN, 0, 0), new THREE.Vector3(), new THREE.Vector3())
    ).toThrow();
  });
});
