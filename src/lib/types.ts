import type { CSSProperties, MutableRefObject } from "react";

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
  reason: "face-click" | "home" | "fit" | "zoom" | "rotate" | "pan";
};

export type ViewCubeLabels = Partial<Record<string, string>>;

export type ViewCubeProps = {
  controlsRef?: MutableRefObject<unknown>;
  viewCubeRef?: MutableRefObject<ViewCubeHandle | null>;
  size?: number;
  placement?: ViewCubePlacement;
  offset?: { x?: number; y?: number };
  snapSpeed?: number;
  target?: ViewCubeCoord | null;
  focusRef?: MutableRefObject<unknown> | null;
  showZoom?: boolean;
  showHome?: boolean;
  showRotate?: boolean;
  showPan?: boolean;
  showFit?: boolean;
  zoomStep?: number;
  rotateStepDeg?: number;
  panStepWorld?: number;
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
};
  