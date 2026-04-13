import * as THREE from "three";
import { VC_LABELS } from "../constants";

export type SnapResult = {
  position: THREE.Vector3;
  up: THREE.Vector3;
  label: string;
};

export function keyFromCoord(coord: [number, number, number]): string {
  return `${coord[0]},${coord[1]},${coord[2]}`;
}

export function labelFromCoord(coord: [number, number, number]): string {
  const key = keyFromCoord(coord);
  return VC_LABELS[key] ?? key;
}

export function snapFromCoord(coord: [number, number, number]): SnapResult {
  const [cx, cy, cz] = coord;
  const len = Math.sqrt(cx * cx + cy * cy + cz * cz);

  if (!Number.isFinite(len) || len <= 0) {
    throw new Error("Invalid coord: zero-length or non-finite vector.");
  }

  const nx = cx / len;
  const ny = cy / len;
  const nz = cz / len;

  const position = new THREE.Vector3(nx, ny, nz);
  // Top/bottom views need Z-up to keep labels visually upright after snap.
  const up =
    cx === 0 && cz === 0
      ? new THREE.Vector3(0, 0, cy > 0 ? -1 : 1)
      : new THREE.Vector3(0, 1, 0);

  return {
    position,
    up,
    label: labelFromCoord(coord),
  };
}
