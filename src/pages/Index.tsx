import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, ContactShadows, Environment } from "@react-three/drei";
import type CameraControlsImpl from "camera-controls";
import Device from "@/components/scene/Device";
import {
  ModuleId,
  MODULE_BY_ID,
  MODULES,
  computeAssembledY,
} from "@/components/scene/modules";
import "./Index.css";

const DEFAULT_CAMERA_POSITION: [number, number, number] = [9.2, 4.8, 10.6];
const DEFAULT_CAMERA_TARGET: [number, number, number] = [0, -0.1, 0];

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
    position: [6.4, 1.45, 6.8],
    target: [0, -0.04, 0],
  },
  sensor: {
    position: [5.4, 1.28, 5.8],
    target: [0, 0.02, 0.92],
  },
  compute: {
    position: [5.6, 1.3, 5.9],
    target: [0, 0.02, 0],
  },
  audio: {
    position: [5.5, 1.22, 5.7],
    target: [0, 0, 0],
  },
  cover: {
    position: [4.9, 1.06, 5.2],
    target: [0, -0.06, 0],
  },
};

const Index = () => {
  const [hovered, setHovered] = useState<ModuleId | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const controlsRef = useRef<CameraControlsImpl | null>(null);

  const panelModuleId = activeModule ?? hovered;
  const panelInfo = panelModuleId ? MODULE_BY_ID[panelModuleId] : null;

  const centeredModuleY = useMemo(() => {
    const assembledY = computeAssembledY();
    const totalAssembled =
      assembledY[assembledY.length - 1] + MODULES[MODULES.length - 1].height / 2;
    const yOffset = -totalAssembled / 2;

    return assembledY.map((value) => value + yOffset);
  }, []);

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
    <div className="scene-shell relative h-screen w-screen overflow-hidden">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: DEFAULT_CAMERA_POSITION, fov: 34 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={resetFocus}
        className="scene-canvas"
      >
        <ambientLight intensity={0.2} color="#eef3ff" />
        <directionalLight
          position={[8, 12, 9]}
          intensity={2.2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-8, 4, -7]} intensity={0.72} color="#c6d0de" />
        <directionalLight position={[0, 8, -10]} intensity={0.5} color="#7b8797" />

        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.9} />
          <Device
            hovered={hovered}
            activeModule={activeModule}
            setHovered={setHovered}
            setActiveModule={setActiveModule}
          />
          <ContactShadows
            position={[0, -2.55, 0]}
            opacity={0.34}
            scale={16.5}
            blur={1.85}
            far={7}
            color="#0f1114"
          />
        </Suspense>

        <CameraControls
          ref={controlsRef}
          makeDefault
          smoothTime={0.72}
          draggingSmoothTime={0.1}
          minPolarAngle={0.18}
          maxPolarAngle={Math.PI / 2 - 0.08}
          minDistance={3.6}
          maxDistance={20}
        />
      </Canvas>

      <header className="scene-header pointer-events-none absolute left-0 top-0 select-none p-5 text-white">
        <h1 className="scene-header-title text-xs tracking-widest text-slate-100 sm:text-sm">
          PROJECT: AI-POWERED STREET SAFETY DEVICE | HARDWARE PROTOTYPE
        </h1>
        <p className="mt-1 text-[10px] text-slate-100">
          MECHANICAL DISSECTION VIEW | CLICK MODULE TO SPLIT HOUSING
        </p>
      </header>

      {panelInfo && (
        <>
          <aside className="scene-card absolute left-4 top-1/2 hidden w-[300px] -translate-y-1/2 rounded-lg border border-slate-700 bg-black/80 p-4 text-slate-100 shadow-xl backdrop-blur-md lg:block">
            <p className="text-[10px] tracking-[0.18em] text-slate-200">MODULE OVERVIEW</p>
            <h2 className="mt-2 text-sm font-semibold text-white">{panelInfo.title}</h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-100">{panelInfo.summary}</p>
            <p className="mt-4 text-[10px] tracking-[0.16em] text-slate-200">STATE</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-100">
              {activeModule
                ? "Shell components displaced. Internal hardware exposed for inspection."
                : "Hovering module preview. Click to engage mechanical split."}
            </p>
          </aside>

          <aside className="scene-card absolute right-4 top-1/2 hidden w-[370px] -translate-y-1/2 rounded-lg border border-slate-700 bg-black/80 p-4 text-slate-100 shadow-xl backdrop-blur-md md:block">
            <p className="text-[10px] tracking-[0.18em] text-slate-200">TECHNICAL DATA</p>
            <h2 className="mt-2 text-sm font-semibold text-white">{panelInfo.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-100">{panelInfo.technicalData}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-700 pt-4">
              <div>
                <p className="text-[10px] tracking-[0.16em] text-slate-300">{panelInfo.leftLabel}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-100">{panelInfo.leftValue}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.16em] text-slate-300">{panelInfo.rightLabel}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-100">{panelInfo.rightValue}</p>
              </div>
            </div>
          </aside>

          <div className="scene-mobile-stack absolute bottom-20 left-3 right-3 rounded-lg border border-slate-700 bg-black/80 p-3 text-slate-100 shadow-xl backdrop-blur-md md:hidden">
            <p className="text-[10px] tracking-[0.18em] text-slate-200">TECHNICAL DATA</p>
            <h2 className="mt-1 text-xs font-semibold text-white">{panelInfo.title}</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-100">{panelInfo.technicalData}</p>
          </div>

          <button
            onClick={resetFocus}
            className="absolute right-5 top-5 rounded-md border border-slate-700 bg-black/80 px-3 py-2 text-[11px] tracking-widest text-white shadow-xl backdrop-blur-md transition-colors hover:bg-black/90"
          >
            RESET
          </button>
        </>
      )}

      <div className="scene-hint pointer-events-none absolute bottom-6 left-5 text-[10px] text-slate-100">
        TAP | SPLIT MODULE | DRAG | ORBIT | SCROLL | ZOOM | CLICK BACKGROUND | RESET
      </div>
    </div>
  );
};

export default Index;
