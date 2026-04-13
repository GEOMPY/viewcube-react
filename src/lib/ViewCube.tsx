import { useEffect, useMemo, useState } from "react";
import type { ViewCubeCoord, ViewCubeHandle, ViewCubeProps } from "./types";
import { ViewCubeHud } from "./ViewCubeHud";
import { ViewCubeOverlay } from "./ViewCubeOverlay";
import { useThree } from "@react-three/fiber";
import { resolveTarget } from "./TargetResolver";
import { isControlsLike, NavigationEngine } from "./NavigationEngine";

export function ViewCube(props: ViewCubeProps) {
  const {
    controlsRef,
    viewCubeRef,
    target,
    focusRef,
    labels,
    placement = "bottom-right",
    offset,
    className,
    style,
    showZoom = true,
    showRotate = true,
    showPan = true,
    showFit = false,
    zoomStep = 1.1,
    size = 150,
    snapSpeed,
    onFaceClick,
    onNavigateStart,
    onNavigateEnd,
  } = props;
  const { camera } = useThree();
  const [activeNavMode, setActiveNavMode] = useState<"rotate" | "pan" | null>(null);
  const [snapRequest, setSnapRequest] = useState<{ coord: ViewCubeCoord; token: number } | null>(
    null
  );
  const engine = useMemo(() => new NavigationEngine(), []);

  const warn = import.meta.env.DEV ? (msg: string) => console.warn(msg) : undefined;

  useEffect(() => {
    if (!warn) return;
    if (!controlsRef) {
      warn("[viewcube-react] controlsRef is not provided. Falling back to direct camera operations.");
    }
    if (target !== undefined && target !== null) {
      const isTuple =
        Array.isArray(target) &&
        target.length === 3 &&
        target.every((v) => typeof v === "number" && Number.isFinite(v));
      if (!isTuple) {
        warn("[viewcube-react] Invalid target tuple. Falling back.");
      }
    }
    if (focusRef && focusRef.current && !(focusRef.current instanceof Object)) {
      warn("[viewcube-react] focusRef.current is not an object. Falling back.");
    }
    if (showFit && !focusRef) {
      warn("[viewcube-react] showFit enabled without focusRef. Fit action is disabled by design.");
    }
  }, [controlsRef, target, focusRef, showFit, warn]);

  const getControls = () => {
    const maybe = controlsRef?.current;
    return isControlsLike(maybe) ? maybe : null;
  };

  const getResolvedTarget = () =>
    resolveTarget({
      ...(focusRef !== undefined ? { focusRef } : {}),
      ...(target !== undefined ? { target } : {}),
      ...(controlsRef !== undefined ? { controlsRef } : {}),
      ...(warn ? { onWarn: warn } : {}),
    });

  useEffect(() => {
    const controls = getControls();
    const previous = engine.applyInteractionMode(controls, activeNavMode);
    if (!controls || !previous) return;

    return () => {
      controls.enableRotate = previous.prevRotate;
      controls.enablePan = previous.prevPan;
      controls.update();
    };
  }, [activeNavMode, controlsRef, engine]);

  const handleZoom = (direction: "in" | "out") => {
    onNavigateStart?.({ reason: "zoom" });
    const resolvedTarget = getResolvedTarget();
    engine.zoom({
      camera,
      controls: getControls(),
      target: resolvedTarget,
      direction,
      zoomStep,
    });
    onNavigateEnd?.({ reason: "zoom" });
  };

  const handleToggleRotate = () => {
    onNavigateStart?.({ reason: "rotate" });
    setActiveNavMode((prev) => (prev === "rotate" ? null : "rotate"));
    onNavigateEnd?.({ reason: "rotate" });
  };

  const handleTogglePan = () => {
    onNavigateStart?.({ reason: "pan" });
    setActiveNavMode((prev) => (prev === "pan" ? null : "pan"));
    onNavigateEnd?.({ reason: "pan" });
  };

  const overlayOffset = useMemo(() => {
    if (!placement.includes("top")) return offset;
    const x = offset?.x;
    const yBase = offset?.y ?? 16;
    // Keep action controls visually below the cube for top placements.
    const y = yBase + Math.round(size * 0.55);
    return { ...(x !== undefined ? { x } : {}), y };
  }, [placement, offset, size]);

  useEffect(() => {
    if (!viewCubeRef) return;
    const handle: ViewCubeHandle = {
      snapTo: (coord: ViewCubeCoord) => {
        setSnapRequest({ coord, token: Date.now() });
      },
    };
    (viewCubeRef as { current: ViewCubeHandle | null }).current = handle;
    return () => {
      (viewCubeRef as { current: ViewCubeHandle | null }).current = null;
    };
  }, [viewCubeRef]);

  return (
    <>
      <ViewCubeOverlay
        placement={placement}
        {...(overlayOffset !== undefined ? { offset: overlayOffset } : {})}
        {...(className !== undefined ? { className } : {})}
        {...(style !== undefined ? { style } : {})}
        showZoom={showZoom}
        showRotate={showRotate}
        showPan={showPan}
        activeNavMode={activeNavMode}
        onZoomIn={() => handleZoom("in")}
        onZoomOut={() => handleZoom("out")}
        onToggleRotate={handleToggleRotate}
        onTogglePan={handleTogglePan}
        {...(warn ? { onWarn: warn } : {})}
      />
      <ViewCubeHud
        {...(controlsRef !== undefined ? { controlsRef } : {})}
        {...(target !== undefined ? { target } : {})}
        {...(focusRef !== undefined ? { focusRef } : {})}
        {...(labels !== undefined ? { labels } : {})}
        placement={placement}
        {...(offset !== undefined ? { offset } : {})}
        {...(size !== undefined ? { size } : {})}
        {...(snapSpeed !== undefined ? { snapSpeed } : {})}
        {...(onFaceClick !== undefined ? { onFaceClick } : {})}
        {...(onNavigateStart !== undefined ? { onNavigateStart } : {})}
        {...(onNavigateEnd !== undefined ? { onNavigateEnd } : {})}
        {...(snapRequest !== null ? { snapRequest } : {})}
      />
    </>
  );
}

export default ViewCube;
