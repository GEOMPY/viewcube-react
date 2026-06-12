export { ViewCube } from "./lib/ViewCube";
export { ViewCubeHud } from "./lib/ViewCubeHud";
export { ViewCubeOverlay, getOverlayWrapperStyle, resolvePortalParent } from "./lib/ViewCubeOverlay";
export { CubePieces, createCubePieceDefs } from "./lib/CubePieces";
export {
  VC_OFFSET,
  VC_FACE_W,
  VC_EDGE_LENGTH,
  VC_EDGE_W,
  VC_DEPTH,
  VC_CORNER_R,
  VC_COL_EDGE,
  VC_COL_CORNER,
  VC_COL_HOVER,
  VC_LABELS,
  DRAG_THRESHOLD_PX,
  SNAP_LERP_DEFAULT,
  SNAP_EPS_DEFAULT,
} from "./lib/constants";
export { keyFromCoord, labelFromCoord, snapFromCoord } from "./lib/math/snapMath";
export {
  zoomCameraRelativeToTarget,
  fitDistanceForFov,
  computeHomePosition,
  rotateCameraAroundTarget,
  panCameraAndTarget,
} from "./lib/math/cameraMath";
export { orientationForPiece } from "./lib/math/orientationMath";
export { resolveTarget } from "./lib/TargetResolver";
export { NavigationEngine, isControlsLike } from "./lib/NavigationEngine";
export { applyFocusCenterToControls } from "./lib/ViewCubeHud";
export type {
  ViewCubeProps,
  ViewCubePlacement,
  ViewCubeCoord,
  ViewCubeHandle,
  ViewCubeFaceClickPayload,
  ViewCubeNavigatePayload,
  ViewCubeLabels,
  ViewCubePieceMeta,
  ViewCubePieceType,
  CubePiecesProps,
} from "./lib/types";
export type { ResolveTargetArgs } from "./lib/TargetResolver";
