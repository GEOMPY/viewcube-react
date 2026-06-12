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

  it("normalizes default props for theme and size", async () => {
    await act(async () => {
      create(<ViewCube />);
    });

    expect(hudProps).toBeTruthy();
    expect(hudProps?.theme).toBe("dark");
    expect(hudProps?.size).toBe(150);
  });

  it("wires navigate callback contract for overlay control click", async () => {
    await act(async () => {
      create(<ViewCube />);
    });

    expect(typeof hudProps?.onControlClick).toBe("function");
    await act(async () => {
      (hudProps?.onControlClick as ((action: string) => void) | undefined)?.("orbit_u");
    });

    expect(hudProps?.controlRequest).toBeTruthy();
    expect((hudProps?.controlRequest as { action: string }).action).toBe("orbit_u");
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
      create(<ViewCube target={[1, 2, Number.NaN]} focusRef={badFocusRef} />);
    });

    const messages = warn.mock.calls.map((call) => String(call[0]));
    expect(messages.some((m) => m.includes("controlsRef is not provided"))).toBe(true);
    expect(messages.some((m) => m.includes("Invalid target tuple"))).toBe(true);
    expect(messages.some((m) => m.includes("focusRef.current is not an object"))).toBe(true);
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

  it("forwards home and orbit step props to the HUD", async () => {
    const homeDir: ViewCubeCoord = [1, 1, 1];
    const homeUp: ViewCubeCoord = [0, 1, 0];
    await act(async () => {
      create(<ViewCube homeDir={homeDir} homeUp={homeUp} orbitStepDeg={20} scale={1.25} />);
    });

    expect(hudProps?.homeDir).toEqual(homeDir);
    expect(hudProps?.homeUp).toEqual(homeUp);
    expect(hudProps?.orbitStepDeg).toBe(20);
    expect(hudProps?.scale).toBe(1.25);
  });

  it("applies className and style escape hatch to overlay", async () => {
    const style = { zIndex: 1234 };
    await act(async () => {
      create(<ViewCube className="host-class" style={style} />);
    });

    expect(hudProps?.className).toBe("host-class");
    expect(hudProps?.style).toEqual(style);
  });

  it("type-level public API compile check", () => {
    const props: ViewCubeProps = {
      placement: "bottom-right",
      offset: { x: 10, y: 12 },
      onFaceClick: (_payload: ViewCubeFaceClickPayload) => {},
      viewCubeRef: { current: null as ViewCubeHandle | null },
      theme: "light",
      orbitStepDeg: 15,
      homeDir: [0, 1, 0],
      homeUp: [0, 0, 1],
    };
    expect(props.placement).toBe("bottom-right");
    expect(props.theme).toBe("light");
  });
});
