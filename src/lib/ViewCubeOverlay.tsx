import { useState, useMemo, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import type { CSSProperties } from "react";
import type { ViewCubePlacement } from "./types";

type ViewCubeOverlayProps = {
  placement?: ViewCubePlacement | undefined;
  offset?: { x?: number; y?: number } | undefined;
  size?: number | undefined;
  scale?: number | undefined;
  theme?: "light" | "dark" | "auto" | undefined;
  onControlClick?: ((action: string) => void) | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  onWarn?: ((message: string) => void) | undefined;
};

const colors = {
  light: {
    fill: "rgba(186, 186, 192, 0.47)",
    stroke: "rgba(105, 105, 110, 0.67)",
    hoverFill: "rgba(0, 148, 255, 0.92)",
    hoverStroke: "rgba(105, 105, 110, 0.67)",
  },
  dark: {
    fill: "rgba(78, 78, 82, 0.49)",
    stroke: "rgba(42, 42, 46, 0.69)",
    hoverFill: "rgba(0, 148, 255, 0.92)",
    hoverStroke: "rgba(42, 42, 46, 0.69)",
  },
};

const BUTTONS = [
  {
    action: "orbit_u",
    points: "100,0 82,20 118,20",
    title: "Orbit Up",
  },
  {
    action: "orbit_d",
    points: "100,200 82,180 118,180",
    title: "Orbit Down",
  },
  {
    action: "orbit_l",
    points: "0,100 20,82 20,118",
    title: "Orbit Left",
  },
  {
    action: "orbit_r",
    points: "200,100 180,82 180,118",
    title: "Orbit Right",
  },
  {
    action: "roll_ccw",
    points: "33.4,33.4 41.7,26.0 50.8,19.7 60.6,14.5 71.0,10.5 74.7,21.9 65.7,25.7 57.2,30.1 49.2,35.6 41.9,41.9 46.2,46.2 25.3,53.2 29.3,29.6",
    title: "Roll Counter-Clockwise",
  },
  {
    action: "roll_cw",
    points: "166.6,33.4 158.3,26.0 149.2,19.7 139.4,14.5 129.0,10.5 125.3,21.9 134.3,25.7 142.8,30.1 150.8,35.6 158.1,41.9 153.8,46.2 174.7,53.2 170.7,29.6",
    title: "Roll Clockwise",
  },
  {
    action: "home",
    points: "168,168 183,162 168,156 153,162 168,168 153,162 153,180 168,186 168,168 168,186 183,180 183,162",
    title: "Home",
  },
  {
    action: "backside",
    points: "",
    title: "View Backside",
    isCircle: true,
  },
];

export function getOverlayWrapperStyle(args: {
  placement?: ViewCubePlacement | undefined;
  offset?: { x?: number; y?: number } | null | undefined;
  size?: number | undefined;
  style?: CSSProperties | null | undefined;
}): CSSProperties {
  const { placement, offset, size = 150, style } = args;

  const positionStyle: CSSProperties = {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 1000,
    width: `${size}px`,
    height: `${size}px`,
  };

  if (placement) {
    const x = offset?.x ?? 16;
    const y = offset?.y ?? 16;
    if (placement.includes("top")) positionStyle.top = `${y}px`;
    else positionStyle.bottom = `${y}px`;

    if (placement.includes("right")) positionStyle.right = `${x}px`;
    else positionStyle.left = `${x}px`;
  }

  return { ...positionStyle, ...(style ?? {}) };
}

export function resolvePortalParent(glDomElement: HTMLCanvasElement | null): HTMLElement | null {
  if (!glDomElement) return null;
  return glDomElement.parentElement;
}

function useThemeMode(theme: "light" | "dark" | "auto" = "dark"): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (theme !== "auto") {
      setMode(theme);
      return;
    }
    if (typeof window === "undefined") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setMode(e.matches ? "dark" : "light");
    };

    setMode(query.matches ? "dark" : "light");
    query.addEventListener("change", listener);
    return () => {
      query.removeEventListener("change", listener);
    };
  }, [theme]);

  return mode;
}

export function ViewCubeOverlay({
  placement,
  offset,
  size = 150,
  scale = 1,
  theme = "dark",
  onControlClick,
  className,
  style,
  onWarn,
}: ViewCubeOverlayProps) {
  const { gl } = useThree();
  const parent = resolvePortalParent(gl.domElement);
  const resolvedTheme = useThemeMode(theme);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const scaledSize = size * scale;

  const wrapperStyle = useMemo(
    () =>
      getOverlayWrapperStyle({
        size: scaledSize,
        style,
      }),
    [scaledSize, style]
  );

  if (!parent) {
    onWarn?.("[viewcube-react] Overlay portal parent not found. Overlay is skipped.");
    return null;
  }

  if (!parent.style.position || parent.style.position === "static") {
    parent.style.position = "relative";
  }

  const renderButton = (
    action: string,
    points: string,
    title: string,
    isCircle = false
  ) => {
    const isHovered = hoveredAction === action;
    const currentThemeColors = resolvedTheme === "dark" ? colors.dark : colors.light;
    const fill = isHovered ? currentThemeColors.hoverFill : currentThemeColors.fill;
    const stroke = isHovered ? currentThemeColors.hoverStroke : currentThemeColors.stroke;

    const commonProps = {
      fill,
      stroke,
      strokeWidth: 1.5,
      strokeLinejoin: "round" as const,
      strokeLinecap: "round" as const,
      style: {
        cursor: "pointer",
        pointerEvents: "auto" as const,
        transition: "fill 0.15s ease, stroke 0.15s ease",
      },
      onMouseEnter: () => setHoveredAction(action),
      onMouseLeave: () => setHoveredAction(prev => (prev === action ? null : prev)),
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onControlClick?.(action);
      },
    };

    if (isCircle) {
      return (
        <circle
          key={action}
          cx={187}
          cy={13}
          r={10}
          {...commonProps}
          data-testid={`control-btn-${action}`}
        >
          <title>{title}</title>
        </circle>
      );
    }

    return (
      <polygon
        key={action}
        points={points}
        {...commonProps}
        data-testid={`control-btn-${action}`}
      >
        <title>{title}</title>
      </polygon>
    );
  };

  return (
    <Html
      portal={{ current: parent }}
      transform={false}
      sprite={false}
      center
      zIndexRange={[1000, 0]}
      style={wrapperStyle}
    >
      <div className={className} style={{ pointerEvents: "none", width: "100%", height: "100%" }}>
        <svg
          width={scaledSize}
          height={scaledSize}
          viewBox="0 0 200 200"
          style={{
            display: "block",
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <g transform="translate(100, 100) scale(0.70) translate(-100, -100)">
            {BUTTONS.map(btn => renderButton(btn.action, btn.points, btn.title, btn.isCircle))}
          </g>
        </svg>
      </div>
    </Html>
  );
}

export default ViewCubeOverlay;
