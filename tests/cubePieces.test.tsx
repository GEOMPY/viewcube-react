import { create, type ReactTestInstance } from "react-test-renderer";
import React, { act } from "react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { CubePieces, createCubePieceDefs } from "../src/lib/CubePieces";

function meshNodes(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => n.type === "mesh");
}

function evt(x: number, y: number) {
  return { clientX: x, clientY: y, nativeEvent: { clientX: x, clientY: y } };
}

describe("CubePieces", () => {
  async function renderCube(props: ComponentProps<typeof CubePieces> = {}) {
    let renderer: ReturnType<typeof create> | null = null;
    await act(async () => {
      renderer = create(<CubePieces {...props} />);
    });
    return renderer!;
  }

  it("creates 26 logical pieces with metadata", () => {
    const pieces = createCubePieceDefs();
    expect(pieces).toHaveLength(26);
    const types = new Set(pieces.map((p) => p.type));
    expect(types.has("face")).toBe(true);
    expect(types.has("edge")).toBe(true);
    expect(types.has("corner")).toBe(true);
  });

  it("renders 26 meshes with metadata in userData", async () => {
    const r = await renderCube();
    const meshes = meshNodes(r.root);
    expect(meshes).toHaveLength(26);
    for (const m of meshes) {
      expect(typeof m.props.userData.id).toBe("string");
      expect(["face", "edge", "corner"]).toContain(m.props.userData.type);
      expect(Array.isArray(m.props.userData.coord)).toBe(true);
      expect(typeof m.props.userData.label).toBe("string");
    }
  });

  it("hover enter/leave affects only hovered piece material emissive", async () => {
    const r = await renderCube();
    const meshes = meshNodes(r.root);
    const first = meshes[0];
    const second = meshes[1];

    await act(async () => {
      first.props.onPointerEnter({ stopPropagation: () => {} });
    });

    const firstMat = first.findByType("meshStandardMaterial");
    const secondMat = second.findByType("meshStandardMaterial");
    expect(firstMat.props.emissive).not.toBe(0x000000);
    expect(secondMat.props.emissive).toBe(0x000000);

    await act(async () => {
      first.props.onPointerLeave({ stopPropagation: () => {} });
    });
    const firstMatAfter = first.findByType("meshStandardMaterial");
    expect(firstMatAfter.props.emissive).toBe(0x000000);
  });

  it("click emits piece payload and drag over threshold suppresses click", async () => {
    const onPieceClick = vi.fn();
    const r = await renderCube({ onPieceClick, dragThresholdPx: 5 });
    const first = meshNodes(r.root)[0];

    await act(async () => {
      first.props.onPointerDown({ ...evt(10, 10), stopPropagation: () => {} });
      first.props.onPointerUp({ stopPropagation: () => {} });
    });
    expect(onPieceClick).toHaveBeenCalledTimes(1);

    await act(async () => {
      first.props.onPointerDown({ ...evt(10, 10), stopPropagation: () => {} });
      first.props.onPointerMove({ ...evt(30, 30), stopPropagation: () => {} });
      first.props.onPointerUp({ stopPropagation: () => {} });
    });
    expect(onPieceClick).toHaveBeenCalledTimes(1);
  });

  it("pointer handlers stop propagation", async () => {
    const r = await renderCube();
    const first = meshNodes(r.root)[0];
    const stop = vi.fn();

    await act(async () => {
      first.props.onPointerEnter({ stopPropagation: stop });
      first.props.onPointerLeave({ stopPropagation: stop });
      first.props.onPointerDown({ ...evt(1, 1), stopPropagation: stop });
      first.props.onPointerMove({ ...evt(2, 2), stopPropagation: stop });
      first.props.onPointerUp({ stopPropagation: stop });
    });

    expect(stop).toHaveBeenCalledTimes(5);
  });

  it("keeps geometry/material object identity stable across rerenders", async () => {
    const r = await renderCube();
    const firstBefore = meshNodes(r.root)[0];
    const geoBefore = firstBefore.props.geometry;
    const matBefore = firstBefore.findByType("meshStandardMaterial").props.map;

    await act(async () => {
      r.update(<CubePieces />);
    });

    const firstAfter = meshNodes(r.root)[0];
    expect(firstAfter.props.geometry).toBe(geoBefore);
    expect(firstAfter.findByType("meshStandardMaterial").props.map).toBe(matBefore);
  });
});
