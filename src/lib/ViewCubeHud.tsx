import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Hud, OrthographicCamera } from "@react-three/drei";
import type * as THREE from "three";
import { CubePieces } from "./CubePieces";
import type { ViewCubeLabels, ViewCubeNavigatePayload, ViewCubePieceMeta } from "./types";
import { NavigationEngine, isControlsLike } from "./NavigationEngine";
import { resolveFocusCenter, resolveTarget } from "./TargetResolver";

type ViewCubeHudProps = {
  controlsRef?: RefObject<unknown>;
  target?: [number, number, number] | null;
  focusRef?: RefObject<unknown> | null;
  labels?: ViewCubeLabels;
  size?: number;
  snapSpeed?: number;
  onFaceClick?: (payload: { coord: [number, number, number]; label: string }) => void;
  onNavigateStart?: (payload: ViewCubeNavigatePayload) => void;
  onNavigateEnd?: (payload: ViewCubeNavigatePayload) => void;
};

export function applyFocusCenterToControls(args: {
  focusRef?: RefObject<unknown> | null;
  controlsRef?: RefObject<unknown>;
  onWarn?: (message: string) => void;
}): boolean {
  const { focusRef, controlsRef, onWarn } = args;
  const maybeControls = controlsRef?.current;
  if (!isControlsLike(maybeControls)) return false;
  if (!focusRef) return false;

  const center = resolveFocusCenter(focusRef, onWarn);
  if (!center) return false;

  maybeControls.target.copy(center);
  maybeControls.update();
  return true;
}

export function ViewCubeHud({
  controlsRef,
  target,
  focusRef,
  labels,
  size = 150,
  snapSpeed = 0.12,
  onFaceClick,
  onNavigateStart,
  onNavigateEnd,
}: ViewCubeHudProps) {
  const { camera: mainCamera } = useThree();
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const engineRef = useRef(new NavigationEngine({ snapLerp: snapSpeed }));

  useEffect(() => {
    engineRef.current.setSnapLerp(snapSpeed);
  }, [snapSpeed]);


  const warn = useMemo(
    () => (import.meta.env.DEV ? (msg: string) => console.warn(msg) : undefined),
    []
  );

  useEffect(() => {
    applyFocusCenterToControls({
      ...(focusRef !== undefined ? { focusRef } : {}),
      ...(controlsRef !== undefined ? { controlsRef } : {}),
      ...(warn ? { onWarn: warn } : {}),
    });
  }, [controlsRef, focusRef, warn]);
  
  const handlePieceClick = (piece: ViewCubePieceMeta) => {
    onFaceClick?.({ coord: piece.coord, label: piece.label });
    onNavigateStart?.({ reason: "face-click" });

    const resolvedTarget = resolveTarget({
      ...(focusRef !== undefined ? { focusRef } : {}),
      ...(target !== undefined ? { target } : {}),
      ...(controlsRef !== undefined ? { controlsRef } : {}),
      ...(warn ? { onWarn: warn } : {}),
    });

    engineRef.current.snapToCoord({
      coord: piece.coord,
      target: resolvedTarget,
      camera: mainCamera,
      onEnd: () => onNavigateEnd?.({ reason: "face-click" }),
    });
  };

  useFrame(() => {
    const maybeControls = controlsRef?.current;
    const controls = isControlsLike(maybeControls) ? maybeControls : null;
    engineRef.current.update(mainCamera, controls);

    if (cubeGroupRef.current) {
      engineRef.current.syncCubeQuaternion(cubeGroupRef.current.quaternion, mainCamera.quaternion);
    }
  });

  return (
    <Hud>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={size / 10} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 2, 2]} intensity={1.2} />
      <CubePieces
        {...(labels !== undefined ? { labels } : {})}
        onPieceClick={handlePieceClick}
        groupRef={cubeGroupRef}
      />
    </Hud>
  );
}

export default ViewCubeHud;
