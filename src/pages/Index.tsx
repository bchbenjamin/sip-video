import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import Device from "@/components/scene/Device";
import {
  ModuleId,
  MODULES,
  MODULE_BY_ID,
  computeAssembledY,
  computeExplodedY,
} from "@/components/scene/modules";
import "./Index.css";

const DEFAULT_CAMERA_POSITION: [number, number, number] = [10, 6, 12];
const DEFAULT_TARGET: [number, number, number] = [0, 0, 0];

const FOCUS_OFFSET: Record<ModuleId, [number, number, number]> = {
  base: [5.2, 0.95, 5.5],
  sensor: [3.25, 0.42, 3.7],
  compute: [3.0, 0.48, 3.35],
  audio: [3.45, 0.68, 4.0],
  comm: [3.75, 0.84, 4.2],
  cover: [4.2, 0.78, 4.7],
};

const Index = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [hovered, setHovered] = useState<ModuleId | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const controlsRef = useRef<any>(null);

  const assembledCenters = useMemo(() => {
    const assembledY = computeAssembledY();
    const totalAssembled =
      assembledY[assembledY.length - 1] + MODULES[MODULES.length - 1].height / 2;
    const yOffset = -totalAssembled / 2;

    return MODULES.reduce((acc, module, index) => {
      acc[module.id] = assembledY[index] + yOffset;
      return acc;
    }, {} as Record<ModuleId, number>);
  }, []);

  const explodedCenters = useMemo(() => {
    const explodedY = computeExplodedY();
    const totalExploded =
      explodedY[explodedY.length - 1] + MODULES[MODULES.length - 1].height / 2;
    const yOffset = -totalExploded / 2;

    return MODULES.reduce((acc, module, index) => {
      acc[module.id] = explodedY[index] + yOffset;
      return acc;
    }, {} as Record<ModuleId, number>);
  }, []);

  const moduleCenters = isExploded ? explodedCenters : assembledCenters;

  const panelModuleId = activeModule ?? hovered;
  const panelInfo = panelModuleId ? MODULE_BY_ID[panelModuleId] : null;

  const resetFocus = () => {
    setActiveModule(null);
    setHovered(null);
  };

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (activeModule) {
      const y = moduleCenters[activeModule];
      const [x, yLift, z] = FOCUS_OFFSET[activeModule];

      controls.setLookAt(x, y + yLift, z, 0, y, 0, true);
      return;
    }

    controls.setLookAt(
      DEFAULT_CAMERA_POSITION[0],
      DEFAULT_CAMERA_POSITION[1],
      DEFAULT_CAMERA_POSITION[2],
      DEFAULT_TARGET[0],
      DEFAULT_TARGET[1],
      DEFAULT_TARGET[2],
      true
    );
  }, [activeModule, moduleCenters]);

  return (
    <div className="scene-shell relative w-screen h-screen overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={resetFocus}
        className="scene-canvas"
      >
        {/* CAD-style daylight rig */}
        <ambientLight intensity={0.82} color="#ffffff" />
        <hemisphereLight args={["#ffffff", "#b0b7c1", 0.8]} />
        <directionalLight
          position={[7, 10, 6]}
          intensity={1.2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-7, 5, -6]} intensity={0.45} color="#d0d7df" />

        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.72} />
          <Device
            isExploded={isExploded}
            hovered={hovered}
            activeModule={activeModule}
            setHovered={setHovered}
            setActiveModule={setActiveModule}
          />
          <ContactShadows
            position={[0, -4, 0]}
            opacity={0.28}
            scale={19.5}
            blur={2.1}
            far={9.5}
            color="#9fa6ae"
          />
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={0.42}
              luminanceThreshold={0.28}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>

        <CameraControls
          ref={controlsRef}
          makeDefault
          smoothTime={0.75}
          draggingSmoothTime={0.1}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={4.2}
          maxDistance={28}
        />
      </Canvas>

      {/* Top-left header */}
      <header className="scene-header absolute top-0 left-0 p-5 pointer-events-none select-none text-slate-800">
        <h1 className="scene-header-title text-slate-800 text-xs sm:text-sm tracking-widest">
          PROJECT: AI-POWERED STREET SAFETY DEVICE | HARDWARE PROTOTYPE
        </h1>
        <p className="text-slate-800 text-[10px] mt-1">
          ◉ CAD INSPECTION MODE · CLICK A MODULE TO REVEAL INTERNALS
        </p>
      </header>

      {panelInfo && (
        <>
          <aside
            className="scene-card hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 w-[280px] rounded-lg border border-slate-200 bg-white/95 p-4 text-slate-800 shadow-xl"
          >
            <p className="text-[10px] tracking-[0.18em] text-slate-800">MODULE OVERVIEW</p>
            <h2 className="mt-2 text-sm font-semibold text-slate-800">{panelInfo.title}</h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-800">{panelInfo.summary}</p>
            <p className="mt-4 text-[10px] tracking-[0.16em] text-slate-800">FOCUS MODE</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-800">
              {activeModule ? "Micro-exploded subcomponents active" : "Hover for specs, click for micro-explode"}
            </p>
          </aside>

          <aside
            className="scene-card hidden md:block absolute right-4 top-1/2 -translate-y-1/2 w-[360px] rounded-lg border border-slate-200 bg-white/95 p-4 text-slate-800 shadow-xl"
          >
            <p className="text-[10px] tracking-[0.18em] text-slate-800">TECHNICAL DATA</p>
            <h2 className="mt-2 text-sm font-semibold text-slate-800">{panelInfo.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-800">{panelInfo.technicalData}</p>
          </aside>

          <div className="scene-mobile-stack md:hidden absolute left-3 right-3 bottom-20 rounded-lg border border-slate-200 bg-white/95 p-3 text-slate-800 shadow-xl">
            <p className="text-[10px] tracking-[0.18em] text-slate-800">TECHNICAL DATA</p>
            <h2 className="mt-1 text-xs font-semibold text-slate-800">{panelInfo.title}</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-800">{panelInfo.technicalData}</p>
          </div>

          <button
            onClick={resetFocus}
            className="absolute right-5 top-5 rounded-md border border-slate-300 bg-white/95 px-3 py-2 text-[11px] tracking-widest text-slate-800 shadow-xl transition-colors hover:bg-slate-100"
          >
            BACK
          </button>
        </>
      )}


      {/* Bottom-center toggle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsExploded((v) => !v)}
          className="scene-toggle-btn border border-slate-300 bg-white/95 px-5 py-3 text-xs tracking-widest text-slate-800 shadow-xl transition-colors duration-200 hover:bg-slate-100"
        >
          {isExploded ? "▼ COLLAPSE VIEW" : "▲ TOGGLE EXPLODED VIEW"}
        </button>
      </div>

      {/* Bottom-left hint */}
      <div className="scene-hint absolute bottom-6 left-5 text-[10px] pointer-events-none text-slate-800">
        TAP · SELECT MODULE &nbsp;|&nbsp; DRAG · ORBIT &nbsp;|&nbsp; SCROLL · ZOOM
      </div>
    </div>
  );
};

export default Index;
