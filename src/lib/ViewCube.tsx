import { useEffect, useMemo, useState } from "react";
import type { ViewCubeProps } from "./types";
import { ViewCubeHud } from "./ViewCubeHud";
import { ViewCubeOverlay } from "./ViewCubeOverlay";
import { useThree } from "@react-three/fiber";
import { resolveTarget } from "./TargetResolver";
import { isControlsLike, NavigationEngine } from "./NavigationEngine";

export function ViewCube(props: ViewCubeProps) {
  const {
    controlsRef,
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
    zoomStep = 1.1,
    size,
    snapSpeed,
    onFaceClick,
    onNavigateStart,
    onNavigateEnd,
  } = props;
  const { camera } = useThree();
  const [activeNavMode, setActiveNavMode] = useState<"rotate" | "pan" | null>(null);
  const engine = useMemo(() => new NavigationEngine(), []);

  const warn = import.meta.env.DEV ? (msg: string) => console.warn(msg) : undefined;

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

  return (
    <>
      <ViewCubeOverlay
        placement={placement}
        {...(offset !== undefined ? { offset } : {})}
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
      />
      <ViewCubeHud
        {...(controlsRef !== undefined ? { controlsRef } : {})}
        {...(target !== undefined ? { target } : {})}
        {...(focusRef !== undefined ? { focusRef } : {})}
        {...(labels !== undefined ? { labels } : {})}
        {...(size !== undefined ? { size } : {})}
        {...(snapSpeed !== undefined ? { snapSpeed } : {})}
        {...(onFaceClick !== undefined ? { onFaceClick } : {})}
        {...(onNavigateStart !== undefined ? { onNavigateStart } : {})}
        {...(onNavigateEnd !== undefined ? { onNavigateEnd } : {})}
      />
    </>
  );
}

export default ViewCube;
