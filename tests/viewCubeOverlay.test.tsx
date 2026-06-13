import React, { act } from "react";
import { create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import {
  getOverlayWrapperStyle,
  resolvePortalParent,
  ViewCubeOverlay,
} from "../src/lib/ViewCubeOverlay";

vi.mock("@react-three/fiber", () => {
  const fakeElement = {
    parentElement: {
      style: { position: "relative" },
    },
  };
  return {
    useThree: () => ({ gl: { domElement: fakeElement as any } }),
  };
});

vi.mock("@react-three/drei", () => ({
  Html: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={style}>{children}</div>
  ),
}));

describe("ViewCubeOverlay helpers", () => {
  it("returns placement styles for all corners", () => {
    const tl = getOverlayWrapperStyle({ placement: "top-left", size: 100 });
    const tr = getOverlayWrapperStyle({ placement: "top-right", size: 100 });
    const bl = getOverlayWrapperStyle({ placement: "bottom-left", size: 100 });
    const br = getOverlayWrapperStyle({ placement: "bottom-right", size: 100 });

    expect(tl.top).toBeDefined();
    expect(tl.left).toBeDefined();
    expect(tr.top).toBeDefined();
    expect(tr.right).toBeDefined();
    expect(bl.bottom).toBeDefined();
    expect(bl.left).toBeDefined();
    expect(br.bottom).toBeDefined();
    expect(br.right).toBeDefined();
    expect(tl.width).toBe("100px");
    expect(tl.height).toBe("100px");
  });

  it("enforces pointer-event layering contract", () => {
    const wrapper = getOverlayWrapperStyle({ placement: "bottom-right", size: 150 });
    expect(wrapper.pointerEvents).toBe("none");
  });

  it("resolvePortalParent is null-safe", () => {
    expect(resolvePortalParent(null)).toBeNull();
  });
});

describe("ViewCubeOverlay SVG controls", () => {
  it("renders 8 control buttons and handles clicks", async () => {
    const onControlClick = vi.fn();

    let renderer: ReturnType<typeof create> | null = null;
    await act(async () => {
      renderer = create(
        <ViewCubeOverlay
          placement="bottom-right"
          size={150}
          onControlClick={onControlClick}
        />
      );
    });

    const root = renderer!.root;
    const polygons = root.findAllByType("polygon");
    const circles = root.findAllByType("circle");

    expect(polygons.length).toBe(7); // 7 polygon buttons
    expect(circles.length).toBe(1);  // 1 circle button (backside)

    const orbitUp = polygons.find(p => p.props["data-testid"] === "control-btn-orbit_u");
    expect(orbitUp).toBeDefined();

    const mockEvent = { stopPropagation: vi.fn() };
    await act(async () => {
      orbitUp?.props.onClick?.(mockEvent);
    });

    expect(onControlClick).toHaveBeenCalledWith("orbit_u");
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("applies scale to wrapper style and SVG dimensions", async () => {
    let renderer: ReturnType<typeof create> | null = null;
    await act(async () => {
      renderer = create(
        <ViewCubeOverlay
          placement="bottom-right"
          size={150}
          scale={3}
        />
      );
    });

    const root = renderer!.root;
    const htmlDiv = root.findByType("div");
    expect(htmlDiv.props.style.width).toBe("450px");
    expect(htmlDiv.props.style.height).toBe("450px");

    const svg = root.findByType("svg");
    expect(svg.props.width).toBe(450);
    expect(svg.props.height).toBe(450);
  });
});
