import * as THREE from "three";

const EPS = 1e-9;

function ensureFiniteVector3(v: THREE.Vector3, name: string): void {
  if (!Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(v.z)) {
    throw new Error(`${name} contains non-finite values.`);
  }
}

export function zoomCameraRelativeToTarget(
  cameraPosition: THREE.Vector3,
  target: THREE.Vector3,
  factor: number
): THREE.Vector3 {
  ensureFiniteVector3(cameraPosition, "cameraPosition");
  ensureFiniteVector3(target, "target");
  if (!Number.isFinite(factor) || factor <= 0) {
    throw new Error("factor must be a finite positive number.");
  }

  const relative = cameraPosition.clone().sub(target);
  // Avoid unstable zoom behavior when camera is already at the target.
  if (relative.lengthSq() <= EPS) {
    return cameraPosition.clone();
  }
  return target.clone().add(relative.multiplyScalar(factor));
}

export function fitDistanceForFov(size: THREE.Vector3, fovDeg: number, padding = 1.2): number {
  ensureFiniteVector3(size, "size");
  if (!Number.isFinite(fovDeg) || fovDeg <= 0 || fovDeg >= 180) {
    throw new Error("fovDeg must be in range (0, 180).");
  }
  if (!Number.isFinite(padding) || padding <= 0) {
    throw new Error("padding must be a finite positive number.");
  }

  const maxDim = Math.max(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z));
  if (maxDim <= EPS) return padding;
  // Vertical FOV framing approximation: distance = half-extent / tan(fov/2).
  const fovRad = THREE.MathUtils.degToRad(fovDeg);
  const distance = (maxDim * 0.5) / Math.tan(fovRad * 0.5);
  return distance * padding;
}

export function computeHomePosition(target: THREE.Vector3, distance: number): THREE.Vector3 {
  ensureFiniteVector3(target, "target");
  if (!Number.isFinite(distance) || distance <= 0) {
    throw new Error("distance must be a finite positive number.");
  }
  // Use standard isometric direction so home view is consistent across modules.
  const isoDirection = new THREE.Vector3(1, 1, 1).normalize();
  return target.clone().addScaledVector(isoDirection, distance);
}

export function rotateCameraAroundTarget(
  cameraPosition: THREE.Vector3,
  target: THREE.Vector3,
  axis: "x" | "y" | "z",
  degrees: number
): THREE.Vector3 {
  ensureFiniteVector3(cameraPosition, "cameraPosition");
  ensureFiniteVector3(target, "target");
  if (!Number.isFinite(degrees)) {
    throw new Error("degrees must be finite.");
  }

  const axisVec =
    axis === "x"
      ? new THREE.Vector3(1, 0, 0)
      : axis === "y"
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(0, 0, 1);

  const q = new THREE.Quaternion().setFromAxisAngle(axisVec, THREE.MathUtils.degToRad(degrees));
  const relative = cameraPosition.clone().sub(target).applyQuaternion(q);
  return target.clone().add(relative);
}

export function panCameraAndTarget(
  cameraPosition: THREE.Vector3,
  target: THREE.Vector3,
  delta: THREE.Vector3
): { cameraPosition: THREE.Vector3; target: THREE.Vector3 } {
  ensureFiniteVector3(cameraPosition, "cameraPosition");
  ensureFiniteVector3(target, "target");
  ensureFiniteVector3(delta, "delta");

  return {
    cameraPosition: cameraPosition.clone().add(delta),
    target: target.clone().add(delta),
  };
}
