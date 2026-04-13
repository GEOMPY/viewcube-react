import React, { act } from "react";
import { create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import {
  getActionButtonStyle,
  getOverlayWrapperStyle,
  resolvePortalParent,
  ViewCubeActions,
} from "../src/lib/ViewCubeOverlay";

describe("ViewCubeOverlay helpers", () => {
  it("returns placement styles for all corners", () => {
    const tl = getOverlayWrapperStyle({ placement: "top-left" });
    const tr = getOverlayWrapperStyle({ placement: "top-right" });
    const bl = getOverlayWrapperStyle({ placement: "bottom-left" });
    const br = getOverlayWrapperStyle({ placement: "bottom-right" });

    expect(tl.top).toBeDefined();
    expect(tl.left).toBeDefined();
    expect(tr.top).toBeDefined();
    expect(tr.right).toBeDefined();
    expect(bl.bottom).toBeDefined();
    expect(bl.left).toBeDefined();
    expect(br.bottom).toBeDefined();
    expect(br.right).toBeDefined();
  });

  it("enforces pointer-event layering contract", () => {
    const wrapper = getOverlayWrapperStyle({ placement: "bottom-right" });
    const button = getActionButtonStyle();
    expect(wrapper.pointerEvents).toBe("none");
    expect(button.pointerEvents).toBe("auto");
  });

  it("resolvePortalParent is null-safe", () => {
    expect(resolvePortalParent(null)).toBeNull();
  });
});

describe("ViewCubeActions callbacks", () => {
  it("invokes callbacks for visible actions", async () => {
    const onZoomIn = vi.fn();
    const onZoomOut = vi.fn();
    const onToggleRotate = vi.fn();
    const onTogglePan = vi.fn();

    let renderer: ReturnType<typeof create> | null = null;
    await act(async () => {
      renderer = create(
        <ViewCubeActions
          showZoom
          showRotate
          showPan
          activeNavMode={null}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onToggleRotate={onToggleRotate}
          onTogglePan={onTogglePan}
        />
      );
    });

    const buttons = renderer!.root.findAllByType("button");
    expect(buttons.length).toBeGreaterThan(0);

    await act(async () => {
      for (const b of buttons) b.props.onClick?.();
    });

    expect(onZoomIn).toHaveBeenCalledTimes(1);
    expect(onZoomOut).toHaveBeenCalledTimes(1);
    expect(onToggleRotate).toHaveBeenCalledTimes(1);
    expect(onTogglePan).toHaveBeenCalledTimes(1);
  });
});
