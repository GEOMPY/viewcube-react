import { create, type ReactTestInstance } from "react-test-renderer";
import React, { act } from "react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { CubePieces, createCubePieceDefs } from "../src/lib/CubePieces";

function pieceGroups(root: ReactTestInstance): ReactTestInstance[] {
  return root.findAll((n) => n.type === "group" && Boolean(n.props.userData?.id));
}

function pieceMeshes(piece: ReactTestInstance): ReactTestInstance[] {
  return piece.findAllByType("mesh");
}

function hitMesh(piece: ReactTestInstance): ReactTestInstance {
  return pieceMeshes(piece).find((mesh) => mesh.findAllByType("meshBasicMaterial").length > 0) ??
    pieceMeshes(piece)[0];
}

function visualMesh(piece: ReactTestInstance): ReactTestInstance {
  return pieceMeshes(piece).find((mesh) => mesh.findAllByType("meshStandardMaterial").length > 0) ??
    pieceMeshes(piece)[0];
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
    const pieces = pieceGroups(r.root);
    expect(pieces).toHaveLength(26);
    for (const piece of pieces) {
      expect(typeof piece.props.userData.id).toBe("string");
      expect(["face", "edge", "corner"]).toContain(piece.props.userData.type);
      expect(Array.isArray(piece.props.userData.coord)).toBe(true);
      expect(typeof piece.props.userData.label).toBe("string");
    }
  });

  it("hover enter/leave affects only hovered piece material emissive", async () => {
    const r = await renderCube();
    const pieces = pieceGroups(r.root);
    const first = pieces[0];
    const second = pieces[1];

    await act(async () => {
      hitMesh(first).props.onPointerEnter({ stopPropagation: () => {} });
    });

    const firstMat = visualMesh(first).findByType("meshStandardMaterial");
    const secondMat = visualMesh(second).findByType("meshStandardMaterial");
    expect(firstMat.props.emissive).not.toBe(0x000000);
    expect(secondMat.props.emissive).toBe(0x000000);

    await act(async () => {
      hitMesh(first).props.onPointerLeave({ stopPropagation: () => {} });
    });
    const firstMatAfter = first.findByType("meshStandardMaterial");
    expect(firstMatAfter.props.emissive).toBe(0x000000);
  });

  it("click emits piece payload and drag over threshold suppresses click", async () => {
    const onPieceClick = vi.fn();
    const r = await renderCube({ onPieceClick, dragThresholdPx: 5 });
    const first = pieceGroups(r.root)[0];
    const hit = hitMesh(first);

    await act(async () => {
      hit.props.onPointerDown({ ...evt(10, 10), stopPropagation: () => {} });
      hit.props.onPointerUp({ stopPropagation: () => {} });
    });
    expect(onPieceClick).toHaveBeenCalledTimes(1);

    await act(async () => {
      hit.props.onPointerDown({ ...evt(10, 10), stopPropagation: () => {} });
      hit.props.onPointerMove({ ...evt(30, 30), stopPropagation: () => {} });
      hit.props.onPointerUp({ stopPropagation: () => {} });
    });
    expect(onPieceClick).toHaveBeenCalledTimes(1);
  });

  it("pointer handlers stop propagation", async () => {
    const r = await renderCube();
    const first = pieceGroups(r.root)[0];
    const hit = hitMesh(first);
    const stop = vi.fn();

    await act(async () => {
      hit.props.onPointerEnter({ stopPropagation: stop });
      hit.props.onPointerLeave({ stopPropagation: stop });
      hit.props.onPointerDown({ ...evt(1, 1), stopPropagation: stop });
      hit.props.onPointerMove({ ...evt(2, 2), stopPropagation: stop });
      hit.props.onPointerUp({ stopPropagation: stop });
    });

    expect(stop).toHaveBeenCalledTimes(5);
  });

  it("keeps geometry/material object identity stable across rerenders", async () => {
    const r = await renderCube();
    const firstBefore = pieceGroups(r.root)[0];
    const visualBefore = visualMesh(firstBefore);
    const geoBefore = visualBefore.props.geometry;
    const matBefore = visualBefore.findByType("meshStandardMaterial").props.map;

    await act(async () => {
      r.update(<CubePieces />);
    });

    const firstAfter = pieceGroups(r.root)[0];
    const visualAfter = visualMesh(firstAfter);
    expect(visualAfter.props.geometry).toBe(geoBefore);
    expect(visualAfter.findByType("meshStandardMaterial").props.map).toBe(matBefore);
  });
});
