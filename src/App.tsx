import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { CubePieces } from "./lib/CubePieces";
import type { ViewCubePieceMeta } from "./lib/types";

function DemoModel() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />

      {/* Mesh behind the cube to validate event isolation via stopPropagation */}
      <mesh position={[0, 0, -4]}>
        <torusKnotGeometry args={[1.2, 0.35, 120, 16]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
    </>
  );
}

function App() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [lastClicked, setLastClicked] = useState<string>("None");

  const handlePieceClick = (piece: ViewCubePieceMeta) => {
    const label = piece.label;
    const coord = piece.coord.join(", ");
    setLastClicked(`${label} [${coord}]`);
  };

  return (
    <main style={{ width: "100%", height: "100vh", margin: 0, fontFamily: "sans-serif" }}>
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, background: "#111", color: "#fff", padding: "8px 10px", borderRadius: 6, fontSize: 13 }}>
        Last cube click: {lastClicked}
      </div>
      <Canvas camera={{ position: [6, 6, 8], fov: 50 }}>
        <DemoModel />
        <CubePieces onPieceClick={handlePieceClick} />
        <OrbitControls ref={controlsRef} enableDamping />
      </Canvas>
    </main>
  );
}

export default App;
