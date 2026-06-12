import * as THREE from "three";
import type { RefObject } from "react";
import type { ViewCubeCoord } from "./types";
import { SNAP_EPS_DEFAULT, SNAP_LERP_DEFAULT } from "./constants";
import { snapFromCoord } from "./math/snapMath";
import {
  computeHomePosition,
  fitDistanceForFov,
  panCameraAndTarget,
  rotateCameraAroundTarget,
  zoomCameraRelativeToTarget,
} from "./math/cameraMath";

export type ControlsLike = {
  object: THREE.Camera;
  target: THREE.Vector3;
  update: () => void;
  enableRotate?: boolean;
  enablePan?: boolean;
};

type SnapState = {
  targetPosition: THREE.Vector3;
  targetUp: THREE.Vector3;
  lookAt: THREE.Vector3;
  onEnd?: () => void;
};

export function isControlsLike(value: unknown): value is ControlsLike {
  if (!value || typeof value !== "object") return false;
  const controls = value as Partial<ControlsLike>;
  return (
    !!controls.object &&
    controls.object instanceof THREE.Camera &&
    !!controls.target &&
    controls.target instanceof THREE.Vector3 &&
    typeof controls.update === "function"
  );
}

export class NavigationEngine {
  private snap: SnapState | null = null;
  private snapLerp = SNAP_LERP_DEFAULT;
  private snapEps = SNAP_EPS_DEFAULT;

  constructor(options?: { snapLerp?: number; snapEps?: number }) {
    if (options?.snapLerp) this.snapLerp = options.snapLerp;
    if (options?.snapEps) this.snapEps = options.snapEps;
  }

  setSnapLerp(value: number): void {
    if (Number.isFinite(value) && value > 0 && value < 1) {
      this.snapLerp = value;
    }
  }

  syncCubeQuaternion(cubeQuaternion: THREE.Quaternion, cameraQuaternion: THREE.Quaternion): void {
    cubeQuaternion.copy(cameraQuaternion).invert();
  }

  applyInteractionMode(
    controls: ControlsLike | null | undefined,
    mode: "rotate" | "pan" | null
  ): { prevRotate: boolean; prevPan: boolean } | null {
    if (!controls) return null;
    const prevRotate = controls.enableRotate ?? true;
    const prevPan = controls.enablePan ?? true;
    if (mode === "rotate") {
      controls.enableRotate = true;
      controls.enablePan = false;
    } else if (mode === "pan") {
      controls.enableRotate = false;
      controls.enablePan = true;
    } else {
      controls.enableRotate = true;
      controls.enablePan = true;
    }
    controls.update();
    return { prevRotate, prevPan };
  }

  private applyPose(
    camera: THREE.Camera,
    controls: ControlsLike | null | undefined,
    nextCameraPos: THREE.Vector3,
    nextTarget: THREE.Vector3,
    nextUp?: THREE.Vector3
  ): void {
    if (controls) {
      controls.object.position.copy(nextCameraPos);
      controls.target.copy(nextTarget);
      if (nextUp) controls.object.up.copy(nextUp);
      controls.update();
      return;
    }
    camera.position.copy(nextCameraPos);
    if (nextUp) camera.up.copy(nextUp);
    camera.lookAt(nextTarget);
  }

  zoom(args: {
    camera: THREE.Camera;
    controls?: ControlsLike | null;
    target: THREE.Vector3;
    direction: "in" | "out";
    zoomStep: number;
  }): void {
    const { camera, controls, target, direction, zoomStep } = args;
    const factor = direction === "in" ? 1 / zoomStep : zoomStep;
    const sourcePos = controls ? controls.object.position : camera.position;
    const nextPos = zoomCameraRelativeToTarget(sourcePos, target, factor);
    this.applyPose(camera, controls, nextPos, target);
  }

  goHome(args: {
    camera: THREE.Camera;
    controls?: ControlsLike | null;
    target: THREE.Vector3;
    minDistance?: number;
  }): void {
    const { camera, controls, target, minDistance = 1 } = args;
    const sourcePos = controls ? controls.object.position : camera.position;
    const radius = sourcePos.distanceTo(target);
    const distance = Math.max(radius, minDistance);
    const nextPos = computeHomePosition(target, distance);
    this.applyPose(camera, controls, nextPos, target);
  }

  fitToFocus(args: {
    camera: THREE.Camera;
    controls?: ControlsLike | null;
    focusRef?: RefObject<unknown> | null;
    onWarn?: (message: string) => void;
    padding?: number;
  }): boolean {
    const { camera, controls, focusRef, onWarn, padding = 1.2 } = args;
    const obj = focusRef?.current;
    if (!(obj instanceof THREE.Object3D)) {
      onWarn?.("[viewcube-react] fitToFocus skipped: focusRef.current is missing.");
      return false;
    }

    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) {
      onWarn?.("[viewcube-react] fitToFocus skipped: focusRef bounds are empty.");
      return false;
    }

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const perspective = camera as THREE.PerspectiveCamera;
    const fov = Number.isFinite(perspective.fov) ? perspective.fov : 50;
    const aspect = Number.isFinite(perspective.aspect) ? perspective.aspect : 1;
    const distance = fitDistanceForFov(size, fov, aspect, padding);
    const nextPos = computeHomePosition(center, distance);
    this.applyPose(camera, controls, nextPos, center);
    return true;
  }

  rotateStep(args: {
    camera: THREE.Camera;
    controls?: ControlsLike | null;
    target: THREE.Vector3;
    axis: "x" | "y" | "z";
    degrees: number;
  }): void {
    const { camera, controls, target, axis, degrees } = args;
    const sourcePos = controls ? controls.object.position : camera.position;
    const nextPos = rotateCameraAroundTarget(sourcePos, target, axis, degrees);
    this.applyPose(camera, controls, nextPos, target);
  }

  panStep(args: {
    camera: THREE.Camera;
    controls?: ControlsLike | null;
    target: THREE.Vector3;
    direction: "up" | "down" | "left" | "right";
    amount: number;
  }): void {
    const { camera, controls, target, direction, amount } = args;
    const sourceCamera = controls ? controls.object : camera;
    const sourcePos = sourceCamera.position;

    const up = sourceCamera.up.clone().normalize();
    const viewDir = target.clone().sub(sourcePos).normalize();
    const right = viewDir.clone().cross(up).normalize();
    const sign = direction === "up" || direction === "right" ? 1 : -1;
    const base = direction === "up" || direction === "down" ? up : right;
    const delta = base.multiplyScalar(sign * amount);

    const out = panCameraAndTarget(sourcePos, target, delta);
    this.applyPose(camera, controls, out.cameraPosition, out.target);
  }

  snapToCoord(args: { coord: ViewCubeCoord; target: THREE.Vector3; camera: THREE.Camera; onEnd?: () => void }): void {
    const { position, up } = snapFromCoord(args.coord);
    const radius = args.camera.position.distanceTo(args.target);
    this.snap = {
      targetPosition: position.clone().multiplyScalar(radius).add(args.target),
      targetUp: up.clone(),
      lookAt: args.target.clone(),
      ...(args.onEnd ? { onEnd: args.onEnd } : {}),
    };
  }

  orbitOrRoll(args: {
    camera: THREE.Camera;
    controls?: ControlsLike | null | undefined;
    target: THREE.Vector3;
    action: "orbit_u" | "orbit_d" | "orbit_l" | "orbit_r" | "roll_ccw" | "roll_cw" | "backside" | "home";
    orbitStepDeg?: number | undefined;
    homeDir?: ViewCubeCoord | undefined;
    homeUp?: ViewCubeCoord | undefined;
    onEnd?: (() => void) | undefined;
  }): void {
    const { camera, controls, target, action, orbitStepDeg = 15, homeDir, homeUp, onEnd } = args;

    if (action === "home") {
      const radius = (controls ? controls.object.position : camera.position).distanceTo(target);
      const defaultHomeDir = new THREE.Vector3(-1, -1, -1).normalize();
      const defaultHomeUp = new THREE.Vector3(0, 1, 0);

      const hDir = homeDir
        ? new THREE.Vector3(homeDir[0], homeDir[1], homeDir[2]).normalize()
        : defaultHomeDir;
      const hUp = homeUp
        ? new THREE.Vector3(homeUp[0], homeUp[1], homeUp[2]).normalize()
        : defaultHomeUp;

      const targetPosition = target.clone().sub(hDir.multiplyScalar(radius));
      this.snap = {
        targetPosition,
        targetUp: hUp,
        lookAt: target.clone(),
        ...(onEnd ? { onEnd } : {}),
      };
      return;
    }

    const pos = (controls ? controls.object.position : camera.position).clone();
    const radius = pos.distanceTo(target);
    const D = target.clone().sub(pos).normalize();
    const U = (controls ? controls.object.up : camera.up).clone().normalize();

    let R = D.clone().cross(U);
    if (R.lengthSq() < 1e-6) {
      const fallbackUp = Math.abs(D.y) > 0.95 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0);
      R = D.clone().cross(fallbackUp);
    }
    R.normalize();

    const orthoU = R.clone().cross(D).normalize();

    const step = (orbitStepDeg * Math.PI) / 180;
    const nd = D.clone();
    const nu = orthoU.clone();

    switch (action) {
      case "orbit_u":
        nd.applyAxisAngle(R, -step);
        nu.applyAxisAngle(R, -step);
        break;
      case "orbit_d":
        nd.applyAxisAngle(R, step);
        nu.applyAxisAngle(R, step);
        break;
      case "orbit_l":
        nd.applyAxisAngle(new THREE.Vector3(0, 1, 0), -step);
        nu.applyAxisAngle(new THREE.Vector3(0, 1, 0), -step);
        break;
      case "orbit_r":
        nd.applyAxisAngle(new THREE.Vector3(0, 1, 0), step);
        nu.applyAxisAngle(new THREE.Vector3(0, 1, 0), step);
        break;
      case "roll_ccw":
        nu.applyAxisAngle(D, step);
        break;
      case "roll_cw":
        nu.applyAxisAngle(D, -step);
        break;
      case "backside":
        nd.negate();
        break;
    }

    nd.normalize();
    nu.normalize();

    const targetPosition = target.clone().sub(nd.multiplyScalar(radius));
    this.snap = {
      targetPosition,
      targetUp: nu,
      lookAt: target.clone(),
      ...(onEnd ? { onEnd } : {}),
    };
  }

  startSnap(args: { coord: ViewCubeCoord; target: THREE.Vector3; camera: THREE.Camera; onEnd?: () => void }): void {
    this.snapToCoord(args);
  }

  hasActiveSnap(): boolean {
    return this.snap !== null;
  }

  update(camera: THREE.Camera, controls?: ControlsLike | null): boolean {
    if (!this.snap) return false;

    const { targetPosition, targetUp, lookAt } = this.snap;

    if (controls) {
      controls.target.copy(lookAt);
      controls.object.position.lerp(targetPosition, this.snapLerp);
      controls.object.up.lerp(targetUp, this.snapLerp);
      controls.update();

      if (
        controls.object.position.distanceTo(targetPosition) < this.snapEps &&
        controls.object.up.angleTo(targetUp) < this.snapEps
      ) {
        controls.object.position.copy(targetPosition);
        controls.object.up.copy(targetUp);
        controls.update();
        const done = this.snap;
        this.snap = null;
        done?.onEnd?.();
        return true;
      }
      return false;
    }

    camera.position.lerp(targetPosition, this.snapLerp);
    camera.up.lerp(targetUp, this.snapLerp);
    camera.lookAt(lookAt);
    if (camera.position.distanceTo(targetPosition) < this.snapEps && camera.up.angleTo(targetUp) < this.snapEps) {
      camera.position.copy(targetPosition);
      camera.up.copy(targetUp);
      camera.lookAt(lookAt);
      const done = this.snap;
      this.snap = null;
      done?.onEnd?.();
      return true;
    }
    return false;
  }
}
