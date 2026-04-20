import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type CameraControlsImpl from "camera-controls";
import Device from "@/components/scene/Device";
import {
  ModuleId,
  MODULE_BY_ID,
  MODULES,
  computeAssembledY,
  computeExplodedY,
} from "@/components/scene/modules";
import "./Index.css";

const DEFAULT_CAMERA_POSITION: [number, number, number] = [10, 6, 12];
const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, 0, 0];

const MODULE_INDEX: Record<ModuleId, number> = {
  base: 0,
  sensor: 1,
  compute: 2,
  audio: 3,
  cover: 4,
};

const MODULE_CAMERA_PRESETS: Record<
  ModuleId,
  {
    position: [number, number, number];
    target: [number, number, number];
  }
> = {
  base: {
    position: [6.8, 1.55, 6.8],
    target: [0, 0.02, 0.12],
  },
  sensor: {
    position: [5.9, 1.75, 6.3],
    target: [0, 0.08, 0.96],
  },
  compute: {
    position: [6.2, 1.85, 6.0],
    target: [0, 0.04, 0.05],
  },
  audio: {
    position: [6.1, 1.78, 6.0],
    target: [0, 0.02, 0],
  },
  cover: {
    position: [6.4, 1.42, 6.2],
    target: [0, 0, 0],
  },
};

const Index = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [hovered, setHovered] = useState<ModuleId | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const controlsRef = useRef<CameraControlsImpl | null>(null);

  const panelModuleId = activeModule ?? hovered;
  const panelInfo = panelModuleId ? MODULE_BY_ID[panelModuleId] : null;

  const centeredModuleY = useMemo(() => {
    const assembledY = computeAssembledY();
    const yValues = isExploded ? computeExplodedY() : assembledY;
    const totalAssembled =
      assembledY[assembledY.length - 1] + MODULES[MODULES.length - 1].height / 2;
    const yOffset = -totalAssembled / 2;

    return yValues.map((value) => value + yOffset);
  }, [isExploded]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (!activeModule) {
      void controls.setLookAt(
        DEFAULT_CAMERA_POSITION[0],
        DEFAULT_CAMERA_POSITION[1],
        DEFAULT_CAMERA_POSITION[2],
        DEFAULT_CAMERA_TARGET[0],
        DEFAULT_CAMERA_TARGET[1],
        DEFAULT_CAMERA_TARGET[2],
        true
      );
      return;
    }

    const preset = MODULE_CAMERA_PRESETS[activeModule];
    const moduleY = centeredModuleY[MODULE_INDEX[activeModule]];

    void controls.setLookAt(
      preset.position[0],
      preset.position[1] + moduleY,
      preset.position[2],
      preset.target[0],
      preset.target[1] + moduleY,
      preset.target[2],
      true
    );
  }, [activeModule, centeredModuleY]);

  const resetFocus = () => {
    setActiveModule(null);
    setHovered(null);
  };

  return (
    <div className="scene-shell relative w-screen h-screen overflow-hidden">
      <Canvas
        shadows
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={resetFocus}
        className="scene-canvas"
      >
        <ambientLight intensity={0.82} color="#ffffff" />
        <hemisphereLight args={["#ffffff", "#b0b7c1", 0.8]} />
        <directionalLight
          position={[7, 10, 6]}
          intensity={1.5}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-7, 5, -6]} intensity={0.6} color="#d0d7df" />

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
            opacity={0.34}
            scale={19.5}
            blur={2.1}
            far={9.5}
            color="#141414"
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

      <header className="scene-header absolute top-0 left-0 p-5 pointer-events-none select-none text-white">
        <h1 className="scene-header-title text-slate-100 text-xs sm:text-sm tracking-widest">
          PROJECT: AI-POWERED STREET SAFETY DEVICE | HARDWARE PROTOTYPE
        </h1>
        <p className="text-slate-100 text-[10px] mt-1">
          ◉ DISSECTION VIEW · CLICK MODULES TO REVEAL INTERNAL TECH
        </p>
      </header>

      {panelInfo && (
        <>
          <aside
            className="scene-card hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 w-[300px] rounded-lg border border-slate-700 bg-black/60 p-4 text-slate-100 shadow-xl backdrop-blur-md"
          >
            <p className="text-[10px] tracking-[0.18em] text-slate-100">MODULE OVERVIEW</p>
            <h2 className="mt-2 text-sm font-semibold text-white">{panelInfo.title}</h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-100">{panelInfo.summary}</p>
            <p className="mt-4 text-[10px] tracking-[0.16em] text-slate-100">ACTIVE STATE</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-100">
              {activeModule
                ? "Ghost casing active: internal tech expanded"
                : "Hover to inspect module technical details"}
            </p>
          </aside>

          <aside
            className="scene-card hidden md:block absolute right-4 top-1/2 -translate-y-1/2 w-[370px] rounded-lg border border-slate-700 bg-black/60 p-4 text-slate-100 shadow-xl backdrop-blur-md"
          >
            <p className="text-[10px] tracking-[0.18em] text-slate-100">TECHNICAL DATA</p>
            <h2 className="mt-2 text-sm font-semibold text-white">{panelInfo.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-100">{panelInfo.technicalData}</p>
          </aside>

          <div className="scene-mobile-stack md:hidden absolute left-3 right-3 bottom-20 rounded-lg border border-slate-700 bg-black/60 p-3 text-slate-100 shadow-xl backdrop-blur-md">
            <p className="text-[10px] tracking-[0.18em] text-slate-100">TECHNICAL DATA</p>
            <h2 className="mt-1 text-xs font-semibold text-white">{panelInfo.title}</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-100">{panelInfo.technicalData}</p>
          </div>

          <button
            onClick={resetFocus}
            className="absolute right-5 top-5 rounded-md border border-slate-700 bg-black/60 px-3 py-2 text-[11px] tracking-widest text-white shadow-xl backdrop-blur-md transition-colors hover:bg-black/75"
          >
            RESET
          </button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsExploded((v) => !v)}
          className="scene-toggle-btn border border-slate-700 bg-black/60 px-5 py-3 text-xs tracking-widest text-white shadow-xl backdrop-blur-md transition-colors duration-200 hover:bg-black/75"
        >
          {isExploded ? "▼ COLLAPSE VIEW" : "▲ TOGGLE EXPLODED VIEW"}
        </button>
      </div>

      <div className="scene-hint absolute bottom-6 left-5 text-[10px] pointer-events-none text-slate-100">
        TAP · DISSECT MODULE &nbsp;|&nbsp; DRAG · ORBIT &nbsp;|&nbsp; SCROLL · ZOOM
      </div>
    </div>
  );
};

export default Index;
