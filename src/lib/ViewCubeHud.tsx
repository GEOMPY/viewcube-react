import { useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Hud, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import { CubePieces } from "./CubePieces";
import type { ViewCubeLabels, ViewCubeNavigatePayload, ViewCubePieceMeta } from "./types";
import { NavigationEngine, isControlsLike } from "./NavigationEngine";
import { resolveFocusCenter, resolveTarget } from "./TargetResolver";
import { ViewCubeOverlay } from "./ViewCubeOverlay";

type ViewCubeHudProps = {
  controlsRef?: RefObject<unknown>;
  target?: [number, number, number] | null;
  focusRef?: RefObject<unknown> | null;
  labels?: ViewCubeLabels;
  placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  offset?: { x?: number; y?: number };
  size?: number;
  scale?: number;
  snapSpeed?: number;
  onFaceClick?: (payload: { coord: [number, number, number]; label: string }) => void;
  onNavigateStart?: (payload: ViewCubeNavigatePayload) => void;
  onNavigateEnd?: (payload: ViewCubeNavigatePayload) => void;
  snapRequest?: { coord: [number, number, number]; token: number } | null;
  controlRequest?: { action: string; token: number } | null;
  orbitStepDeg?: number | undefined;
  homeDir?: [number, number, number] | undefined;
  homeUp?: [number, number, number] | undefined;
  theme?: "light" | "dark" | "auto" | undefined;
  onControlClick?: ((action: string) => void) | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
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
  placement = "bottom-right",
  offset,
  size = 150,
  scale = 1,
  snapSpeed = 0.12,
  onFaceClick,
  onNavigateStart,
  onNavigateEnd,
  snapRequest,
  controlRequest,
  orbitStepDeg,
  homeDir,
  homeUp,
  theme,
  onControlClick,
  className,
  style,
}: ViewCubeHudProps) {
  const { camera: mainCamera, size: canvasSize } = useThree();
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

  useEffect(() => {
    if (!snapRequest) return;
    const resolvedTarget = resolveTarget({
      ...(focusRef !== undefined ? { focusRef } : {}),
      ...(target !== undefined ? { target } : {}),
      ...(controlsRef !== undefined ? { controlsRef } : {}),
      ...(warn ? { onWarn: warn } : {}),
    });
    engineRef.current.snapToCoord({
      coord: snapRequest.coord,
      target: resolvedTarget,
      camera: mainCamera,
      onEnd: () => onNavigateEnd?.({ reason: "face-click" }),
    });
  }, [snapRequest, focusRef, target, controlsRef, mainCamera, onNavigateEnd, warn]);

  useEffect(() => {
    if (!controlRequest) return;
    const resolvedTarget = resolveTarget({
      ...(focusRef !== undefined ? { focusRef } : {}),
      ...(target !== undefined ? { target } : {}),
      ...(controlsRef !== undefined ? { controlsRef } : {}),
      ...(warn ? { onWarn: warn } : {}),
    });

    let reason: "orbit" | "roll" | "backside" | "home" = "orbit";
    if (controlRequest.action.startsWith("roll")) reason = "roll";
    else if (controlRequest.action === "backside") reason = "backside";
    else if (controlRequest.action === "home") reason = "home";

    onNavigateStart?.({ reason });

    engineRef.current.orbitOrRoll({
      camera: mainCamera,
      controls: isControlsLike(controlsRef?.current) ? controlsRef.current : null,
      target: resolvedTarget,
      action: controlRequest.action as any,
      orbitStepDeg,
      homeDir,
      homeUp,
      onEnd: () => onNavigateEnd?.({ reason }),
    });
  }, [controlRequest, focusRef, target, controlsRef, mainCamera, orbitStepDeg, homeDir, homeUp, onNavigateStart, onNavigateEnd, warn]);
  
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

  const cubePosition = useMemo(() => {
    const hudZoom = size / 10;
    const halfW = canvasSize.width / (2 * hudZoom);
    const halfH = canvasSize.height / (2 * hudZoom);
    const marginX = (offset?.x ?? 16) / hudZoom;
    const marginY = (offset?.y ?? 16) / hudZoom;
    const halfSizeUnit = 5;
    const x = placement.includes("right")
      ? halfW - halfSizeUnit - marginX
      : -halfW + halfSizeUnit + marginX;
    const y = placement.includes("top")
      ? halfH - halfSizeUnit - marginY
      : -halfH + halfSizeUnit + marginY;
    return new THREE.Vector3(x, y, 0);
  }, [canvasSize.width, canvasSize.height, size, placement, offset]);

  return (
    <Hud>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={size / 2} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 2, 2]} intensity={1.2} />
      <group position={cubePosition}>
        <CubePieces
          {...(labels !== undefined ? { labels } : {})}
          onPieceClick={handlePieceClick}
          groupRef={cubeGroupRef}
          scale={scale}
        />
        <ViewCubeOverlay
          size={size}
          scale={scale}
          theme={theme}
          onControlClick={onControlClick}
          className={className}
          style={style}
          onWarn={warn}
        />
      </group>
    </Hud>
  );
}

export default ViewCubeHud;
