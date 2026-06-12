import { useEffect, useState } from "react";
import type { ViewCubeCoord, ViewCubeHandle, ViewCubeProps } from "./types";
import { ViewCubeHud } from "./ViewCubeHud";

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
    size = 150,
    scale = 1,
    snapSpeed,
    theme = "dark",
    homeDir,
    homeUp,
    orbitStepDeg,
    onFaceClick,
    onNavigateStart,
    onNavigateEnd,
  } = props;

  const [snapRequest, setSnapRequest] = useState<{ coord: ViewCubeCoord; token: number } | null>(
    null
  );
  const [controlRequest, setControlRequest] = useState<{ action: string; token: number } | null>(
    null
  );

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
  }, [controlsRef, target, focusRef, warn]);

  const handleControlClick = (action: string) => {
    setControlRequest({ action, token: Date.now() });
  };

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
    <ViewCubeHud
      {...(controlsRef !== undefined ? { controlsRef } : {})}
      {...(target !== undefined ? { target } : {})}
      {...(focusRef !== undefined ? { focusRef } : {})}
      {...(labels !== undefined ? { labels } : {})}
      placement={placement}
      {...(offset !== undefined ? { offset } : {})}
      {...(size !== undefined ? { size } : {})}
      {...(scale !== undefined ? { scale } : {})}
      {...(snapSpeed !== undefined ? { snapSpeed } : {})}
      {...(onFaceClick !== undefined ? { onFaceClick } : {})}
      {...(onNavigateStart !== undefined ? { onNavigateStart } : {})}
      {...(onNavigateEnd !== undefined ? { onNavigateEnd } : {})}
      {...(snapRequest !== null ? { snapRequest } : {})}
      controlRequest={controlRequest}
      orbitStepDeg={orbitStepDeg}
      homeDir={homeDir}
      homeUp={homeUp}
      theme={theme}
      onControlClick={handleControlClick}
      className={className}
      style={style}
    />
  );
}

export default ViewCube;
