import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { CSSProperties } from "react";
import type { ViewCubePlacement } from "./types";

type OverlayActionProps = {
  showZoom?: boolean;
  showRotate?: boolean;
  showPan?: boolean;
  activeNavMode?: "rotate" | "pan" | null;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onToggleRotate?: () => void;
  onTogglePan?: () => void;
};

export function getOverlayWrapperStyle(args: {
  placement: ViewCubePlacement;
  offset?: { x?: number; y?: number } | null;
  style?: CSSProperties | null;
}): CSSProperties {
  const { placement, offset, style } = args;
  const x = offset?.x ?? 16;
  const y = offset?.y ?? 16;

  const positionStyle: CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 1000,
    ...(placement.includes("top") ? { top: `${y}px` } : { bottom: `${y}px` }),
    ...(placement.includes("right") ? { right: `${x}px` } : { left: `${x}px` }),
  };

  return { ...positionStyle, ...(style ?? {}) };
}

export function getActionButtonStyle(): CSSProperties {
  return {
    pointerEvents: "auto",
    background: "#111",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 6,
    minWidth: 32,
    height: 30,
    cursor: "pointer",
    fontSize: 13,
    lineHeight: 1,
  };
}

export function resolvePortalParent(glDomElement: HTMLCanvasElement | null): HTMLElement | null {
  if (!glDomElement) return null;
  return glDomElement.parentElement;
}

export function ViewCubeActions({
  showZoom = true,
  showRotate = true,
  showPan = true,
  activeNavMode = null,
  onZoomIn,
  onZoomOut,
  onToggleRotate,
  onTogglePan,
}: OverlayActionProps) {
  const buttonStyle = getActionButtonStyle();
  const colStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
  const panelStyle: CSSProperties = {
    pointerEvents: "none",
    display: "flex",
    gap: 8,
    alignItems: "center",
    background: "rgba(0,0,0,0.25)",
    borderRadius: 8,
    padding: 6,
  };

  return (
    <div style={panelStyle}>
      {showZoom ? (
        <div style={colStyle}>
          <button type="button" style={buttonStyle} onClick={onZoomIn} title="Zoom In">
            +
          </button>
          <button type="button" style={buttonStyle} onClick={onZoomOut} title="Zoom Out">
            -
          </button>
        </div>
      ) : null}

      {showRotate ? (
        <div style={colStyle}>
          <button
            type="button"
            style={{
              ...buttonStyle,
              ...(activeNavMode === "rotate" ? { background: "#0d6efd" } : {}),
            }}
            onClick={onToggleRotate}
            title="Rotate mode"
          >
            Rotate
          </button>
        </div>
      ) : null}

      {showPan ? (
        <div style={colStyle}>
          <button
            type="button"
            style={{
              ...buttonStyle,
              ...(activeNavMode === "pan" ? { background: "#0d6efd" } : {}),
            }}
            onClick={onTogglePan}
            title="Pan mode"
          >
            Pan
          </button>
        </div>
      ) : null}
    </div>
  );
}

type ViewCubeOverlayProps = OverlayActionProps & {
  placement?: ViewCubePlacement;
  offset?: { x?: number; y?: number };
  className?: string;
  style?: CSSProperties;
};

export function ViewCubeOverlay({
  placement = "bottom-right",
  offset,
  className,
  style,
  ...actions
}: ViewCubeOverlayProps) {
  const { gl } = useThree();
  const parent = resolvePortalParent(gl.domElement);

  const wrapperStyle = useMemo(
    () =>
      getOverlayWrapperStyle({
        placement,
        ...(offset !== undefined ? { offset } : {}),
        ...(style !== undefined ? { style } : {}),
      }),
    [placement, offset, style]
  );

  if (!parent) return null;

  if (!parent.style.position || parent.style.position === "static") {
    parent.style.position = "relative";
  }

  return (
    <Html
      portal={{ current: parent }}
      transform={false}
      sprite={false}
      zIndexRange={[1000, 0]}
      style={wrapperStyle}
    >
      <div className={className} style={{ pointerEvents: "none" }}>
        <ViewCubeActions {...actions} />
      </div>
    </Html>
  );
}

export default ViewCubeOverlay;
