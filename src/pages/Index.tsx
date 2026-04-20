import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import Device from "@/components/scene/Device";
import { ModuleId, MODULE_BY_ID } from "@/components/scene/modules";
import "./Index.css";

const Index = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [hovered, setHovered] = useState<ModuleId | null>(null);
  const [selected, setSelected] = useState<ModuleId | null>(null);

  const activeModule = selected ? MODULE_BY_ID[selected] : null;

  return (
    <div className="scene-shell relative w-screen h-screen overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [10, 6, 12], fov: 40 }}
        onPointerMissed={() => setSelected(null)}
        className="scene-canvas"
      >
        <color attach="background" args={["#e7e7e7"]} />

        {/* Neutral daylight rig for lab-style rendering */}
        <ambientLight intensity={1.05} color="#ffffff" />
        <hemisphereLight args={["#f4f7fb", "#9aa4b2", 0.95]} />

        {/* Key and rim lights */}
        <directionalLight
          position={[-4, 10, -8]}
          intensity={1.75}
          color="#dbe6f5"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <directionalLight position={[8, 9, 6]} intensity={1.25} color="#ffffff" />
        <directionalLight position={[0, 2, 12]} intensity={0.85} color="#ffffff" />
        <directionalLight position={[0, -8, 4]} intensity={0.35} color="#edf2f9" />

        {/* Blueprint accent lights */}
        <pointLight position={[0, 1, 6]} intensity={1.8} color="#2f87ff" distance={24} decay={2} />
        <pointLight position={[-5, -2, 4]} intensity={1.0} color="#1550c8" distance={20} decay={2} />
        <pointLight position={[5, 3, 3]} intensity={0.85} color="#ffffff" distance={20} decay={2} />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={1.1} />
          <Device
            isExploded={isExploded}
            hovered={hovered}
            selected={selected}
            setHovered={setHovered}
            setSelected={setSelected}
          />
          <ContactShadows
            position={[0, -4, 0]}
            opacity={0.3}
            scale={20}
            blur={2.5}
            far={10}
            color="#747d87"
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
      <header className="scene-header absolute top-0 left-0 p-5 pointer-events-none select-none">
        <h1 className="scene-header-title text-slate-900 text-xs sm:text-sm tracking-widest">
          PROJECT: AI-POWERED STREET SAFETY DEVICE | HARDWARE PROTOTYPE
        </h1>
        <p className="scene-accent-text text-[10px] mt-1">
          ◉ LIVE INSPECTION MODE · TAP A MODULE TO PIN SIDE LABELS
        </p>
      </header>

      {activeModule && (
        <>
          <aside
            className="scene-card hidden md:block absolute left-4 top-1/2 -translate-y-1/2 max-w-[250px] rounded-lg border border-slate-300/90 bg-white/85 p-4 shadow-lg backdrop-blur"
          >
            <p className="text-[10px] tracking-[0.18em] text-slate-500">LEFT CHANNEL</p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">{activeModule.leftLabel}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-700">{activeModule.leftValue}</p>
          </aside>

          <aside
            className="scene-card hidden md:block absolute right-4 top-1/2 -translate-y-1/2 max-w-[250px] rounded-lg border border-slate-300/90 bg-white/85 p-4 shadow-lg backdrop-blur"
          >
            <p className="text-[10px] tracking-[0.18em] text-slate-500">RIGHT CHANNEL</p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">{activeModule.rightLabel}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-700">{activeModule.rightValue}</p>
          </aside>

          <div className="scene-mobile-stack md:hidden absolute left-3 right-3 bottom-20 grid grid-cols-1 gap-2">
            <div className="rounded-lg border border-slate-300/90 bg-white/90 p-3 shadow-lg backdrop-blur">
              <p className="text-[10px] tracking-[0.18em] text-slate-500">LEFT CHANNEL</p>
              <h2 className="mt-1 text-xs font-semibold text-slate-900">{activeModule.leftLabel}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{activeModule.leftValue}</p>
            </div>
            <div className="rounded-lg border border-slate-300/90 bg-white/90 p-3 shadow-lg backdrop-blur">
              <p className="text-[10px] tracking-[0.18em] text-slate-500">RIGHT CHANNEL</p>
              <h2 className="mt-1 text-xs font-semibold text-slate-900">{activeModule.rightLabel}</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{activeModule.rightValue}</p>
            </div>
          </div>

          <div className="scene-active-chip absolute left-1/2 top-5 -translate-x-1/2 rounded-lg border border-slate-300/80 bg-white/80 px-4 py-2 text-center shadow-sm">
            <p className="text-[10px] tracking-[0.18em] text-slate-500">ACTIVE MODULE</p>
            <p className="text-xs text-slate-900 mt-1">{activeModule.title}</p>
            <p className="text-[10px] text-slate-600 mt-1">{activeModule.summary}</p>
          </div>
        </>
      )}


      {/* Bottom-center toggle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsExploded((v) => !v)}
          className="scene-toggle-btn px-5 py-3 text-xs tracking-widest transition-colors duration-200"
        >
          {isExploded ? "▼ COLLAPSE VIEW" : "▲ TOGGLE EXPLODED VIEW"}
        </button>
      </div>

      {/* Bottom-left hint */}
      <div className="scene-hint absolute bottom-6 left-5 text-[10px] pointer-events-none">
        TAP · SELECT MODULE &nbsp;|&nbsp; DRAG · ORBIT &nbsp;|&nbsp; SCROLL · ZOOM
      </div>
    </div>
  );
};

export default Index;
