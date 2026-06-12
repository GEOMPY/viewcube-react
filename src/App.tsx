import { useRef, useState } from "react";
import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ViewCube } from "./lib/ViewCube";

function DemoModel({ modelRef }: { modelRef: RefObject<Group | null> }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 5]} intensity={1.2} />

      {/* Mesh behind the cube to validate event isolation via stopPropagation */}
      <group ref={modelRef}>
        <mesh position={[0, 0, -4]}>
          <torusKnotGeometry args={[1.2, 0.35, 120, 16]} />
          <meshStandardMaterial color="#7f8c8d" />
        </mesh>
      </group>
    </>
  );
}

function App() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const modelRef = useRef<Group | null>(null);
  const [lastClicked, setLastClicked] = useState<string>("None");

  const handlePieceClick = (piece: { coord: [number, number, number]; label: string }) => {
    const label = piece.label;
    const coord = piece.coord.join(", ");
    setLastClicked(`${label} [${coord}]`);
  };

  return (
    <main style={{ width: "100%", height: "100vh", margin: 0, fontFamily: "sans-serif" }}>
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, background: "#fff", color: "#000", padding: "8px 10px", borderRadius: 6, fontSize: 13 }}>
        Last cube click: {lastClicked}
      </div>
      <Canvas camera={{ position: [6, 6, 8], fov: 50 }}>
        <DemoModel modelRef={modelRef} />
        <OrbitControls ref={controlsRef} enableDamping />
        <ViewCube
          placement="top-right"
          controlsRef={controlsRef}
          focusRef={modelRef}
          // TODO: scale should also change the scale of those 8 buttons
          scale={3}
          theme="light"
          onFaceClick={handlePieceClick}
        />
      </Canvas>
    </main>
  );
}

export default App;
