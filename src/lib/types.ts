import type { CSSProperties, RefObject } from "react";
import type * as THREE from "three";

export type ViewCubePlacement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type ViewCubeCoord = [number, number, number];
export type ViewCubePieceType = "face" | "edge" | "corner";

export type ViewCubeHandle = {
  snapTo: (coord: ViewCubeCoord) => void;
};

export type ViewCubeFaceClickPayload = {
  coord: ViewCubeCoord;
  label: string;
};

export type ViewCubePieceMeta = {
  id: string;
  type: ViewCubePieceType;
  coord: ViewCubeCoord;
  label: string;
};

export type ViewCubeNavigatePayload = {
  reason: "face-click" | "orbit" | "roll" | "backside" | "home";
};

export type ViewCubeLabels = Partial<Record<string, string>>;

export type ViewCubeProps = {
  controlsRef?: RefObject<unknown>;
  viewCubeRef?: RefObject<ViewCubeHandle | null>;
  size?: number;
  scale?: number;
  placement?: ViewCubePlacement;
  offset?: { x?: number; y?: number };
  snapSpeed?: number;
  target?: ViewCubeCoord | null;
  focusRef?: RefObject<unknown> | null;
  theme?: "light" | "dark" | "auto";
  homeDir?: ViewCubeCoord;
  homeUp?: ViewCubeCoord;
  orbitStepDeg?: number;
  labels?: ViewCubeLabels;
  className?: string;
  style?: CSSProperties;
  onFaceClick?: (payload: ViewCubeFaceClickPayload) => void;
  onNavigateStart?: (payload: ViewCubeNavigatePayload) => void;
  onNavigateEnd?: (payload: ViewCubeNavigatePayload) => void;
};

export type CubePiecesProps = {
  labels?: ViewCubeLabels;
  dragThresholdPx?: number;
  onPieceClick?: (piece: ViewCubePieceMeta) => void;
  groupRef?: RefObject<THREE.Group | null>;
  scale?: number;
};
