import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import Device from "@/components/scene/Device";
import { ModuleId } from "@/components/scene/modules";

const MONO = `'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, monospace`;

const Index = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [hovered, setHovered] = useState<ModuleId | null>(null);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ backgroundColor: "#000000", fontFamily: MONO }}
    >
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [10, 6, 12], fov: 40 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#000000"]} />

        {/* Global illumination — cranked up for max visibility */}
        <ambientLight intensity={1.6} color="#ffffff" />
        <hemisphereLight args={["#ffffff", "#1a1a2a", 1.2]} />

        {/* Rim light from top-back */}
        <directionalLight
          position={[-4, 10, -8]}
          intensity={2.4}
          color="#e8f0ff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Key fill from top-right */}
        <directionalLight position={[8, 9, 6]} intensity={1.6} color="#ffffff" />
        {/* Front fill so faces aren't dark */}
        <directionalLight position={[0, 2, 12]} intensity={1.2} color="#ffffff" />
        {/* Bottom bounce */}
        <directionalLight position={[0, -8, 4]} intensity={0.5} color="#ffffff" />

        {/* Purple accents */}
        <pointLight position={[0, 1, 6]} intensity={3.5} color="#bb86fc" distance={24} decay={2} />
        <pointLight position={[-5, -2, 4]} intensity={1.6} color="#a200ff" distance={20} decay={2} />
        <pointLight position={[5, 3, 3]} intensity={1.4} color="#ffffff" distance={20} decay={2} />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={1.4} />
          <Device
            isExploded={isExploded}
            hovered={hovered}
            setHovered={setHovered}
          />
          <ContactShadows
            position={[0, -4, 0]}
            opacity={0.55}
            scale={20}
            blur={2.5}
            far={10}
            color="#000000"
          />
        </Suspense>

        <OrbitControls
          enableZoom
          enablePan
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={6}
          maxDistance={30}
        />
      </Canvas>

      {/* Top-left header */}
      <header
        className="absolute top-0 left-0 p-5 pointer-events-none select-none"
        style={{ fontFamily: MONO }}
      >
        <h1
          className="text-white text-xs sm:text-sm tracking-widest"
          style={{ textShadow: "0 0 12px rgba(187,134,252,0.4)" }}
        >
          PROJECT: AI-POWERED STREET SAFETY DEVICE | HARDWARE PROTOTYPE
        </h1>
        <p className="text-[10px] mt-1" style={{ color: "#bb86fc" }}>
          ◉ LIVE INSPECTION MODE
        </p>
      </header>


      {/* Bottom-center toggle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsExploded((v) => !v)}
          className="px-5 py-3 text-xs tracking-widest text-white transition-colors duration-200"
          style={{
            fontFamily: MONO,
            background: "rgba(0,0,0,0.7)",
            border: "1px solid #bb86fc",
            backdropFilter: "blur(6px)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#bb86fc";
            (e.currentTarget as HTMLButtonElement).style.color = "#000000";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.7)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
          }}
        >
          {isExploded ? "▼ COLLAPSE VIEW" : "▲ TOGGLE EXPLODED VIEW"}
        </button>
      </div>

      {/* Bottom-left hint */}
      <div
        className="absolute bottom-6 left-5 text-[10px] pointer-events-none"
        style={{ fontFamily: MONO, color: "rgba(255,255,255,0.4)" }}
      >
        DRAG · ORBIT &nbsp;|&nbsp; SCROLL · ZOOM &nbsp;|&nbsp; RIGHT-DRAG · PAN
      </div>
    </div>
  );
};

export default Index;
