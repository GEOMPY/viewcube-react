import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { orientationForPiece } from "../src/lib/math/orientationMath";

function forwardFromQuaternion(q: THREE.Quaternion): THREE.Vector3 {
  return new THREE.Vector3(0, 0, 1).applyQuaternion(q).normalize();
}

describe("orientationMath", () => {
  it("orients canonical faces outward", () => {
    const top = orientationForPiece([0, 1, 0], "face");
    const front = orientationForPiece([0, 0, 1], "face");
    const right = orientationForPiece([1, 0, 0], "face");

    expect(forwardFromQuaternion(top.quaternion).distanceTo(new THREE.Vector3(0, 1, 0))).toBeLessThan(1e-6);
    expect(forwardFromQuaternion(front.quaternion).distanceTo(new THREE.Vector3(0, 0, 1))).toBeLessThan(1e-6);
    expect(forwardFromQuaternion(right.quaternion).distanceTo(new THREE.Vector3(1, 0, 0))).toBeLessThan(1e-6);
  });

  it("orients representative edges outward", () => {
    const yz = orientationForPiece([0, 1, 1], "edge");
    const xz = orientationForPiece([1, 0, 1], "edge");
    const xy = orientationForPiece([1, 1, 0], "edge");

    expect(forwardFromQuaternion(yz.quaternion).distanceTo(new THREE.Vector3(0, 1, 1).normalize())).toBeLessThan(1e-6);
    expect(forwardFromQuaternion(xz.quaternion).distanceTo(new THREE.Vector3(1, 0, 1).normalize())).toBeLessThan(1e-6);
    expect(forwardFromQuaternion(xy.quaternion).distanceTo(new THREE.Vector3(1, 1, 0).normalize())).toBeLessThan(1e-6);
  });

  it("orients representative corners outward", () => {
    const c1 = orientationForPiece([1, 1, 1], "corner");
    const c2 = orientationForPiece([-1, 1, 1], "corner");
    const c3 = orientationForPiece([1, -1, -1], "corner");

    expect(forwardFromQuaternion(c1.quaternion).distanceTo(new THREE.Vector3(1, 1, 1).normalize())).toBeLessThan(1e-6);
    expect(forwardFromQuaternion(c2.quaternion).distanceTo(new THREE.Vector3(-1, 1, 1).normalize())).toBeLessThan(1e-6);
    expect(forwardFromQuaternion(c3.quaternion).distanceTo(new THREE.Vector3(1, -1, -1).normalize())).toBeLessThan(1e-6);
  });

  it("returns finite and deterministic quaternions", () => {
    const a = orientationForPiece([1, 1, 0], "edge").quaternion;
    const b = orientationForPiece([1, 1, 0], "edge").quaternion;
    expect(Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.z) && Number.isFinite(a.w)).toBe(true);
    expect(a.equals(b)).toBe(true);
  });
});
