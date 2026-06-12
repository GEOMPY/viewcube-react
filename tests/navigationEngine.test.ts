import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import { NavigationEngine, type ControlsLike } from "../src/lib/NavigationEngine";

function makeCamera() {
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  cam.position.set(10, 10, 10);
  cam.up.set(0, 1, 0);
  cam.lookAt(0, 0, 0);
  return cam;
}

function makeControls(camera: THREE.Camera): ControlsLike {
  return {
    object: camera,
    target: new THREE.Vector3(0, 0, 0),
    update: vi.fn(),
    enableRotate: true,
    enablePan: true,
  };
}

describe("NavigationEngine", () => {
  it("syncCubeQuaternion mirrors main camera inversely", () => {
    const engine = new NavigationEngine();
    const cameraQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.4, 0.2, -0.1));
    const cubeQ = new THREE.Quaternion();
    engine.syncCubeQuaternion(cubeQ, cameraQ);

    const expected = cameraQ.clone().invert();
    expect(cubeQ.angleTo(expected)).toBeLessThan(1e-6);
  });

  it("snap transition converges within epsilon and emits end callback", () => {
    const engine = new NavigationEngine({ snapLerp: 0.4, snapEps: 0.0001 });
    const camera = makeCamera();
    const onEnd = vi.fn();

    engine.startSnap({
      coord: [0, 1, 0],
      target: new THREE.Vector3(0, 0, 0),
      camera,
      onEnd,
    });

    let done = false;
    for (let i = 0; i < 120; i += 1) {
      done = engine.update(camera, null);
      if (done) break;
    }

    expect(done).toBe(true);
    expect(engine.hasActiveSnap()).toBe(false);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("zoom works through controls-first branch", () => {
    const engine = new NavigationEngine();
    const camera = makeCamera();
    const controls = makeControls(camera);
    const before = camera.position.clone();

    engine.zoom({
      camera,
      controls,
      target: new THREE.Vector3(0, 0, 0),
      direction: "in",
      zoomStep: 1.2,
    });

    expect(camera.position.distanceTo(new THREE.Vector3())).toBeLessThan(before.distanceTo(new THREE.Vector3()));
    expect(controls.update).toHaveBeenCalled();
  });

  it("zoom works without controls fallback branch", () => {
    const engine = new NavigationEngine();
    const camera = makeCamera();
    const before = camera.position.clone();

    engine.zoom({
      camera,
      controls: null,
      target: new THREE.Vector3(0, 0, 0),
      direction: "in",
      zoomStep: 1.2,
    });

    expect(camera.position.distanceTo(new THREE.Vector3())).toBeLessThan(before.distanceTo(new THREE.Vector3()));
  });

  it("goHome keeps distance and respects resolved target", () => {
    const engine = new NavigationEngine();
    const camera = makeCamera();
    const controls = makeControls(camera);
    const target = new THREE.Vector3(2, 3, 4);
    const beforeDistance = camera.position.distanceTo(target);

    engine.goHome({ camera, controls, target });

    const afterDistance = camera.position.distanceTo(target);
    expect(Math.abs(afterDistance - beforeDistance)).toBeLessThan(1e-6);
    expect(controls.target.toArray()).toEqual(target.toArray());
  });

  it("fitToFocus computes deterministic distance and applies pose", () => {
    const engine = new NavigationEngine();
    const camera = makeCamera();
    const controls = makeControls(camera);
    const focus = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 6), new THREE.MeshBasicMaterial());
    mesh.position.set(1, 2, 3);
    focus.add(mesh);
    const focusRef = { current: focus };

    const ok = engine.fitToFocus({ camera, controls, focusRef });

    expect(ok).toBe(true);
    expect(controls.update).toHaveBeenCalled();
    expect(controls.target.distanceTo(new THREE.Vector3(1, 2, 3))).toBeLessThan(1e-6);
  });

  it("fitToFocus warns and skips when focusRef is missing", () => {
    const engine = new NavigationEngine();
    const camera = makeCamera();
    const controls = makeControls(camera);
    const warn = vi.fn();
    const before = camera.position.clone();

    const ok = engine.fitToFocus({ camera, controls, focusRef: null, onWarn: warn });

    expect(ok).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(camera.position.toArray()).toEqual(before.toArray());
  });

  it("rotateStep and panStep change pose predictably", () => {
    const engine = new NavigationEngine();
    const camera = makeCamera();
    const controls = makeControls(camera);
    const target = new THREE.Vector3(0, 0, 0);
    const beforeRotate = camera.position.clone();

    engine.rotateStep({ camera, controls, target, axis: "y", degrees: 90 });

    expect(camera.position.distanceTo(beforeRotate)).toBeGreaterThan(0.01);
    const beforePan = camera.position.clone();
    const beforeTarget = controls.target.clone();

    engine.panStep({ camera, controls, target: beforeTarget, direction: "up", amount: 0.5 });

    expect(camera.position.distanceTo(beforePan)).toBeGreaterThan(0.01);
    expect(controls.target.distanceTo(beforeTarget)).toBeGreaterThan(0.01);
  });

  it("orbitOrRoll starts a snap animation state with target pose", () => {
    const engine = new NavigationEngine();
    const camera = makeCamera();
    const controls = makeControls(camera);
    const target = new THREE.Vector3(0, 0, 0);

    engine.orbitOrRoll({
      camera,
      controls,
      target,
      action: "orbit_u",
      orbitStepDeg: 15,
    });

    expect(engine.hasActiveSnap()).toBe(true);

    let done = false;
    for (let i = 0; i < 120; i += 1) {
      done = engine.update(camera, controls);
      if (done) break;
    }
    expect(done).toBe(true);
    expect(engine.hasActiveSnap()).toBe(false);
  });

  it("snapToCoord converges with controls and fallback parity", () => {
    const engineWithControls = new NavigationEngine({ snapLerp: 0.4, snapEps: 0.0001 });
    const engineFallback = new NavigationEngine({ snapLerp: 0.4, snapEps: 0.0001 });
    const controlsCamera = makeCamera();
    const fallbackCamera = makeCamera();
    const controls = makeControls(controlsCamera);
    const target = new THREE.Vector3(0, 0, 0);

    engineWithControls.snapToCoord({ coord: [1, 0, 0], target, camera: controlsCamera });
    engineFallback.snapToCoord({ coord: [1, 0, 0], target, camera: fallbackCamera });

    for (let i = 0; i < 120; i += 1) {
      engineWithControls.update(controlsCamera, controls);
      engineFallback.update(fallbackCamera, null);
      if (!engineWithControls.hasActiveSnap() && !engineFallback.hasActiveSnap()) break;
    }

    expect(controlsCamera.position.distanceTo(fallbackCamera.position)).toBeLessThan(1e-3);
    expect(controlsCamera.up.angleTo(fallbackCamera.up)).toBeLessThan(1e-3);
  });

  it("does not mutate camera when no active snap", () => {
    const engine = new NavigationEngine();
    const camera = makeCamera();
    const beforePos = camera.position.clone();
    const beforeUp = camera.up.clone();

    const result = engine.update(camera, null);

    expect(result).toBe(false);
    expect(camera.position.toArray()).toEqual(beforePos.toArray());
    expect(camera.up.toArray()).toEqual(beforeUp.toArray());
  });

  it("orbit_l and orbit_r rotate camera correctly around global Y", () => {
    const engine = new NavigationEngine({ snapLerp: 1.0 });
    const camera = makeCamera();
    const target = new THREE.Vector3(0, 0, 0);

    camera.position.set(0, 0, 10);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);

    engine.orbitOrRoll({
      camera,
      target,
      action: "orbit_l",
      orbitStepDeg: 15,
    });
    engine.update(camera, null);

    expect(camera.position.x).toBeLessThan(0);

    camera.position.set(0, 0, 10);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);

    engine.orbitOrRoll({
      camera,
      target,
      action: "orbit_r",
      orbitStepDeg: 15,
    });
    engine.update(camera, null);

    expect(camera.position.x).toBeGreaterThan(0);
  });

  it("roll_ccw and roll_cw rotate camera up vector correctly", () => {
    const engine = new NavigationEngine({ snapLerp: 1.0 });
    const camera = makeCamera();
    const target = new THREE.Vector3(0, 0, 0);

    camera.position.set(0, 0, 10);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);

    engine.orbitOrRoll({
      camera,
      target,
      action: "roll_ccw",
      orbitStepDeg: 15,
    });
    engine.update(camera, null);

    expect(camera.up.x).toBeGreaterThan(0);

    camera.position.set(0, 0, 10);
    camera.up.set(0, 1, 0);
    camera.lookAt(target);

    engine.orbitOrRoll({
      camera,
      target,
      action: "roll_cw",
      orbitStepDeg: 15,
    });
    engine.update(camera, null);

    expect(camera.up.x).toBeLessThan(0);
  });
});
