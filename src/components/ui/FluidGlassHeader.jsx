import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";

function GlassBar() {
  const ref = useRef(null);
  const { viewport } = useThree();

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.22) * 0.0025;
  });

  return (
    <mesh ref={ref}>
      <boxGeometry
        args={[Math.max(viewport.width, 1), viewport.height, 0.12]}
      />
      <MeshTransmissionMaterial
        transmission={1}
        roughness={0.03}
        thickness={0.7}
        ior={1.15}
        anisotropy={0.01}
        chromaticAberration={0}
        color="#ffffff"
        attenuationColor="#ffffff"
        attenuationDistance={0.7}
        transparent
        opacity={0.34}
        samples={4}
        resolution={256}
      />
    </mesh>
  );
}

export default function FluidGlassHeader({ active }) {
  return (
    <div
      className={`header-fluid-glass ${active ? "is-active" : ""}`}
      aria-hidden="true"
    >
      {active && (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 5], zoom: 100 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          fallback={<div className="header-fluid-glass-fallback" />}
        >
          <GlassBar />
        </Canvas>
      )}
    </div>
  );
}
