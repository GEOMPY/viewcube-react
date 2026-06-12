import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import {
  DRAG_THRESHOLD_PX,
  VC_COL_CORNER,
  VC_COL_EDGE,
  VC_COL_HOVER,
  VC_CORNER_R,
  VC_DEPTH,
  VC_EDGE_LENGTH,
  VC_EDGE_W,
  VC_FACE_W,
  VC_LABELS,
} from "./constants";
import type { CubePiecesProps, ViewCubeCoord, ViewCubePieceMeta, ViewCubePieceType } from "./types";
import { orientationForPiece } from "./math/orientationMath";

type PieceDef = ViewCubePieceMeta & { key: string };

function createFallbackTexture(): THREE.Texture {
  const data = new Uint8Array([255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

function makeLabelTexture(text: string): THREE.Texture {
  if (typeof document === "undefined") return createFallbackTexture();

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return createFallbackTexture();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, size - 8, size - 8);
  if (text) {
    ctx.fillStyle = "#333333";
    ctx.font = `bold 20px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2);
  }
  return new THREE.CanvasTexture(canvas);
}

function createOctagonGeometry(width: number, cut: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const half = width / 2;

  shape.moveTo(half - cut, half);
  shape.lineTo(-half + cut, half);
  shape.lineTo(-half, half - cut);
  shape.lineTo(-half, -half + cut);
  shape.lineTo(-half + cut, -half);
  shape.lineTo(half - cut, -half);
  shape.lineTo(half, -half + cut);
  shape.lineTo(half, half - cut);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth,
    bevelEnabled: false,
  });

  geometry.center();

  const posAttr = geometry.getAttribute("position");
  const uvAttr = geometry.getAttribute("uv");
  if (posAttr && uvAttr) {
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const u = x / width + 0.5;
      const v = y / width + 0.5;
      uvAttr.setXY(i, u, v);
    }
    uvAttr.needsUpdate = true;
  }

  return geometry;
}


export function createCubePieceDefs(labels?: Partial<Record<string, string>>): PieceDef[] {
  const out: PieceDef[] = [];
  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        if (x === 0 && y === 0 && z === 0) continue;
        const sum = Math.abs(x) + Math.abs(y) + Math.abs(z);
        const type: ViewCubePieceType = sum === 1 ? "face" : sum === 2 ? "edge" : "corner";
        const coord: ViewCubeCoord = [x, y, z];
        const key = `${x},${y},${z}`;
        const label = labels?.[key] ?? VC_LABELS[key] ?? key;
        out.push({
          id: key,
          key,
          type,
          coord,
          label,
        });
      }
    }
  }
  return out;
}

function getHitScale(type: ViewCubePieceType): number {
  if (type === "corner") return 1.0;
  if (type === "edge") return 1.0;
  return 1.0;
}

export function CubePieces(props: CubePiecesProps & { scale?: number }) {
  const {
    labels,
    dragThresholdPx = DRAG_THRESHOLD_PX,
    onPieceClick,
    groupRef,
    scale = 1,
  } = props;
  const pieces = useMemo(() => createCubePieceDefs(labels), [labels]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const dragStateRef = useRef<{ startX: number; startY: number; dragged: boolean } | null>(null);

  const faceGeo = useMemo(() => {
    const cut = VC_EDGE_W / Math.SQRT2;
    return createOctagonGeometry(VC_FACE_W, cut, VC_DEPTH);
  }, []);

  const edgeGeo = useMemo(() => {
    const cut = VC_EDGE_W / Math.SQRT2;
    const edgeLength = VC_FACE_W - 2 * cut;
    return new THREE.BoxGeometry(VC_EDGE_W, edgeLength, VC_DEPTH);
  }, []);

  const cornerGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(VC_EDGE_W, VC_EDGE_W, VC_DEPTH, 6);
    geo.rotateY(Math.PI / 6);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);

  const faceTextures = useMemo(() => {
    const textures: Record<string, THREE.Texture> = {};
    for (const piece of pieces) {
      if (piece.type === "face") {
        textures[piece.id] = makeLabelTexture(piece.label);
      }
    }
    return textures;
  }, [pieces]);

  useEffect(() => {
    return () => {
      faceGeo.dispose();
      edgeGeo.dispose();
      cornerGeo.dispose();
      Object.values(faceTextures).forEach((t) => t.dispose());
    };
  }, [faceGeo, edgeGeo, cornerGeo, faceTextures]);

  return (
    <group ref={groupRef ?? null} scale={[scale, scale, scale]}>
      {pieces.map((piece) => {
        const { position, quaternion } = orientationForPiece(piece.coord, piece.type);
        const geometry = piece.type === "face" ? faceGeo : piece.type === "edge" ? edgeGeo : cornerGeo;
        const hitScale = getHitScale(piece.type);

        return (
          <group
            key={piece.key}
            position={position}
            quaternion={quaternion}
            userData={{ id: piece.id, type: piece.type, coord: piece.coord, label: piece.label }}
          >
            <mesh
              geometry={geometry}
              scale={hitScale}
              onPointerEnter={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                setHoveredId(piece.id);
              }}
              onPointerLeave={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                setHoveredId((id) => (id === piece.id ? null : id));
              }}
              onPointerDown={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                dragStateRef.current = {
                  startX: event.clientX ?? 0,
                  startY: event.clientY ?? 0,
                  dragged: false,
                };
              }}
              onPointerMove={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                const s = dragStateRef.current;
                if (!s) return;
                const x = event.clientX ?? s.startX;
                const y = event.clientY ?? s.startY;
                if (Math.hypot(x - s.startX, y - s.startY) > dragThresholdPx) {
                  s.dragged = true;
                }
              }}
              onPointerUp={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                const s = dragStateRef.current;
                if (s && !s.dragged) onPieceClick?.(piece);
                dragStateRef.current = null;
              }}
            >
              <meshBasicMaterial visible={false} />
            </mesh>

            <mesh geometry={geometry}>
              {piece.type === "face" ? (
                <meshStandardMaterial
                  emissive={hoveredId === piece.id ? VC_COL_HOVER : 0x000000}
                  map={faceTextures[piece.id] ?? null}
                  roughness={0.3}
                  metalness={0.05}
                />
              ) : piece.type === "edge" ? (
                <meshStandardMaterial
                  color={VC_COL_EDGE}
                  emissive={hoveredId === piece.id ? VC_COL_HOVER : 0x000000}
                  roughness={0.5}
                  metalness={0}
                />
              ) : (
                <meshStandardMaterial
                  color={VC_COL_CORNER}
                  emissive={hoveredId === piece.id ? VC_COL_HOVER : 0x000000}
                  roughness={0.5}
                  metalness={0}
                />
              )}
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default CubePieces;
