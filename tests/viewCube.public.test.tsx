import React, { act } from "react";
import { create } from "react-test-renderer";
import * as THREE from "three";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ViewCubeCoord, ViewCubeFaceClickPayload, ViewCubeHandle, ViewCubeProps } from "../src/lib/types";
import { ViewCube } from "../src/lib/ViewCube";

let overlayProps: Record<string, unknown> | null = null;
let hudProps: Record<string, unknown> | null = null;

vi.mock("@react-three/fiber", () => ({
  useThree: () => ({ camera: new THREE.PerspectiveCamera(50, 1, 0.1, 1000) }),
}));

vi.mock("../src/lib/ViewCubeOverlay", () => ({
  ViewCubeOverlay: (props: Record<string, unknown>) => {
    overlayProps = props;
    return null;
  },
}));

vi.mock("../src/lib/ViewCubeHud", () => ({
  ViewCubeHud: (props: Record<string, unknown>) => {
    hudProps = props;
    return null;
  },
}));

describe("ViewCube public component", () => {
  beforeEach(() => {
    overlayProps = null;
    hudProps = null;
    vi.restoreAllMocks();
  });

  it("normalizes default props for overlay toggles", async () => {
    await act(async () => {
      create(<ViewCube />);
    });

    expect(overlayProps).toBeTruthy();
    expect(overlayProps?.showZoom).toBe(true);
    expect(overlayProps?.showRotate).toBe(true);
    expect(overlayProps?.showPan).toBe(true);
  });

  it("wires navigate callback contract for overlay actions", async () => {
    const onNavigateStart = vi.fn();
    const onNavigateEnd = vi.fn();

    await act(async () => {
      create(<ViewCube onNavigateStart={onNavigateStart} onNavigateEnd={onNavigateEnd} />);
    });

    expect(typeof overlayProps?.onZoomIn).toBe("function");
    await act(async () => {
      (overlayProps?.onZoomIn as (() => void) | undefined)?.();
    });

    expect(onNavigateStart).toHaveBeenCalledWith({ reason: "zoom" });
    expect(onNavigateEnd).toHaveBeenCalledWith({ reason: "zoom" });
  });

  it("passes face callback through HUD payload shape", async () => {
    const onFaceClick = vi.fn();
    await act(async () => {
      create(<ViewCube onFaceClick={onFaceClick} />);
    });

    const payload: ViewCubeFaceClickPayload = { coord: [0, 1, 0], label: "TOP" };
    (hudProps?.onFaceClick as ((p: ViewCubeFaceClickPayload) => void) | undefined)?.(payload);
    expect(onFaceClick).toHaveBeenCalledWith(payload);
  });

  it("emits development warnings for invalid props", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const badFocusRef = { current: 1 } as unknown as React.RefObject<unknown>;

    await act(async () => {
      create(<ViewCube target={[1, 2, Number.NaN]} showFit focusRef={badFocusRef} />);
    });

    const messages = warn.mock.calls.map((call) => String(call[0]));
    expect(messages.some((m) => m.includes("controlsRef is not provided"))).toBe(true);
    expect(messages.some((m) => m.includes("Invalid target tuple"))).toBe(true);
    expect(messages.some((m) => m.includes("focusRef.current is not an object"))).toBe(true);
  });

  it("warns when showFit is enabled without focusRef", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await act(async () => {
      create(<ViewCube showFit />);
    });
    const messages = warn.mock.calls.map((call) => String(call[0]));
    expect(messages.some((m) => m.includes("showFit enabled without focusRef"))).toBe(true);
  });

  it("exposes imperative viewCubeRef snapTo and forwards snap request", async () => {
    const viewCubeRef = { current: null as ViewCubeHandle | null };
    await act(async () => {
      create(<ViewCube viewCubeRef={viewCubeRef} />);
    });

    expect(viewCubeRef.current).toBeTruthy();
    const coord: ViewCubeCoord = [1, 0, 0];
    await act(async () => {
      viewCubeRef.current?.snapTo(coord);
    });

    expect(hudProps?.snapRequest).toBeTruthy();
    expect((hudProps?.snapRequest as { coord: ViewCubeCoord }).coord).toEqual(coord);
  });

  it("applies className and style escape hatch to overlay", async () => {
    const style = { zIndex: 1234 };
    await act(async () => {
      create(<ViewCube className="host-class" style={style} />);
    });

    expect(overlayProps?.className).toBe("host-class");
    expect(overlayProps?.style).toEqual(style);
  });

  it("type-level public API compile check", () => {
    const props: ViewCubeProps = {
      placement: "bottom-right",
      offset: { x: 10, y: 12 },
      zoomStep: 1.1,
      onFaceClick: (_payload: ViewCubeFaceClickPayload) => {},
      viewCubeRef: { current: null as ViewCubeHandle | null },
    };
    expect(props.placement).toBe("bottom-right");
  });
});
