import * as THREE from "three";
import { VC_OFFSET } from "../constants";
import type { ViewCubeCoord, ViewCubePieceType } from "../types";

type OrientationResult = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
};

const EPS = 1e-9;

function normalizeSafe(v: THREE.Vector3): THREE.Vector3 {
  const len = v.length();
  if (!Number.isFinite(len) || len <= EPS) {
    throw new Error("Invalid piece coordinate for orientation.");
  }
  return v.multiplyScalar(1 / len);
}

function orthonormalBasisFromForwardAndHint(
  forward: THREE.Vector3,
  upHint: THREE.Vector3
): { right: THREE.Vector3; up: THREE.Vector3; forward: THREE.Vector3 } {
  const f = normalizeSafe(forward.clone());
  let uHint = normalizeSafe(upHint.clone());

  let right = uHint.clone().cross(f);
  if (right.lengthSq() <= EPS) {
    uHint = new THREE.Vector3(1, 0, 0);
    right = uHint.clone().cross(f);
    if (right.lengthSq() <= EPS) {
      uHint = new THREE.Vector3(0, 0, 1);
      right = uHint.clone().cross(f);
    }
  }
  right = normalizeSafe(right);
  const up = normalizeSafe(f.clone().cross(right));
  return { right, up, forward: f };
}

function upHintForFace([x, y, z]: ViewCubeCoord): THREE.Vector3 {
  if (x === 0 && z === 0) {
    return new THREE.Vector3(0, 0, y > 0 ? -1 : 1);
  }
  return new THREE.Vector3(0, 1, 0);
}

function upHintForEdge([x, y, z]: ViewCubeCoord): THREE.Vector3 {
  if (x === 0) return new THREE.Vector3(1, 0, 0);
  if (y === 0) return new THREE.Vector3(0, 1, 0);
  return new THREE.Vector3(0, 0, 1);
}

function upHintForCorner([, y]: ViewCubeCoord): THREE.Vector3 {
  return new THREE.Vector3(0, y < 0 ? -1 : 1, 0);
}

export function orientationForPiece(coord: ViewCubeCoord, type: ViewCubePieceType): OrientationResult {
  const [x, y, z] = coord;
  const offset = type === "face" ? VC_OFFSET : 0.92;
  const position = new THREE.Vector3(x * offset, y * offset, z * offset);
  const forward = new THREE.Vector3(x, y, z);

  const upHint =
    type === "face" ? upHintForFace(coord) : type === "edge" ? upHintForEdge(coord) : upHintForCorner(coord);

  const { right, up, forward: f } = orthonormalBasisFromForwardAndHint(forward, upHint);
  const mat = new THREE.Matrix4().makeBasis(right, up, f);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(mat);

  return { position, quaternion };
}
