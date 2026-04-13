import * as THREE from "three";
import type { RefObject } from "react";

export type ResolveTargetArgs = {
  focusRef?: RefObject<unknown> | null;
  target?: [number, number, number] | null;
  controlsRef?: RefObject<unknown> | null;
  onWarn?: (message: string) => void;
};

type ControlsLike = {
  target?: THREE.Vector3;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidTargetTuple(value: ResolveTargetArgs["target"]): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every(isFiniteNumber);
}

function resolveFromFocusRef(
  focusRef: ResolveTargetArgs["focusRef"],
  onWarn?: (message: string) => void
): THREE.Vector3 | null {
  const obj = focusRef?.current;
  if (!obj) return null;
  if (!(obj instanceof THREE.Object3D)) {
    onWarn?.("[viewcube-react] focusRef.current is not a THREE.Object3D. Falling back.");
    return null;
  }

  const box = new THREE.Box3().setFromObject(obj);
  if (box.isEmpty()) {
    onWarn?.("[viewcube-react] focusRef is set but has empty bounds. Falling back.");
    return null;
  }

  return box.getCenter(new THREE.Vector3());
}

export function resolveFocusCenter(
  focusRef: ResolveTargetArgs["focusRef"],
  onWarn?: (message: string) => void
): THREE.Vector3 | null {
  return resolveFromFocusRef(focusRef, onWarn);
}

function resolveFromControlsRef(controlsRef: ResolveTargetArgs["controlsRef"]): THREE.Vector3 | null {
  const controls = controlsRef?.current as ControlsLike | undefined;
  const controlsTarget = controls?.target;
  if (!controlsTarget || !(controlsTarget instanceof THREE.Vector3)) return null;
  return controlsTarget.clone();
}

export function resolveTarget({ focusRef, target, controlsRef, onWarn }: ResolveTargetArgs): THREE.Vector3 {
  const fromFocus = resolveFromFocusRef(focusRef, onWarn);
  if (fromFocus) return fromFocus;

  if (target !== undefined && target !== null && !isValidTargetTuple(target)) {
    onWarn?.("[viewcube-react] Invalid target tuple. Falling back.");
  }
  if (isValidTargetTuple(target)) {
    return new THREE.Vector3(target[0], target[1], target[2]);
  }

  const fromControls = resolveFromControlsRef(controlsRef);
  if (fromControls) return fromControls;

  return new THREE.Vector3(0, 0, 0);
}
