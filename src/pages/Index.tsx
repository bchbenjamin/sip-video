import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import Device from "@/components/scene/Device";
import {
  ModuleId,
  MODULES,
  MODULE_BY_ID,
  computeAssembledY,
} from "@/components/scene/modules";
import "./Index.css";

const DEFAULT_CAMERA_POSITION = new THREE.Vector3(9.5, 6.2, 11.6);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

const assembledY = computeAssembledY();
const totalAssembled =
  assembledY[assembledY.length - 1] + MODULES[MODULES.length - 1].height / 2;
const yOffset = -totalAssembled / 2;

const MODULE_CENTER_Y: Record<ModuleId, number> = MODULES.reduce(
  (acc, module, index) => {
    acc[module.id] = assembledY[index] + yOffset;
    return acc;
  },
  {} as Record<ModuleId, number>
);

const FOCUS_OFFSET: Record<ModuleId, [number, number, number]> = {
  base: [5.1, 1.0, 5.7],
  sensor: [3.2, 0.38, 3.85],
  compute: [3.0, 0.52, 3.45],
  audio: [3.4, 0.72, 4.1],
  comm: [3.8, 0.88, 4.35],
  cover: [4.3, 0.82, 4.9],
};

interface CameraFocusControllerProps {
  activeModule: ModuleId | null;
  controlsRef: { current: any };
}

function CameraFocusController({
  activeModule,
  controlsRef,
}: CameraFocusControllerProps) {
  const { camera } = useThree();
  const desiredPosition = useRef(DEFAULT_CAMERA_POSITION.clone());
  const desiredTarget = useRef(DEFAULT_TARGET.clone());
  const focusDamping = 4.8;

  useFrame((_, delta) => {
    if (activeModule) {
      const y = MODULE_CENTER_Y[activeModule];
      const [x, yLift, z] = FOCUS_OFFSET[activeModule];
      desiredTarget.current.set(0, y, 0);
      desiredPosition.current.set(x, y + yLift, z);
    } else {
      desiredTarget.current.copy(DEFAULT_TARGET);
      desiredPosition.current.copy(DEFAULT_CAMERA_POSITION);
    }

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      desiredPosition.current.x,
      focusDamping,
      delta
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      desiredPosition.current.y,
      focusDamping,
      delta
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      desiredPosition.current.z,
      focusDamping,
      delta
    );

    const controls = controlsRef.current;
    if (controls?.target) {
      controls.target.x = THREE.MathUtils.damp(
        controls.target.x,
        desiredTarget.current.x,
        focusDamping,
        delta
      );
      controls.target.y = THREE.MathUtils.damp(
        controls.target.y,
        desiredTarget.current.y,
        focusDamping,
        delta
      );
      controls.target.z = THREE.MathUtils.damp(
        controls.target.z,
        desiredTarget.current.z,
        focusDamping,
        delta
      );
      controls.update();
    } else {
      camera.lookAt(desiredTarget.current);
    }
  });

  return null;
}

const Index = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [hovered, setHovered] = useState<ModuleId | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const controlsRef = useRef<any>(null);

  const activeInfo = activeModule ? MODULE_BY_ID[activeModule] : null;

  const resetFocus = () => {
    setActiveModule(null);
    setHovered(null);
  };

  return (
    <div className="scene-shell relative w-screen h-screen overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [10, 6, 12], fov: 40 }}
        onPointerMissed={resetFocus}
        className="scene-canvas"
      >
        <CameraFocusController
          activeModule={activeModule}
          controlsRef={controlsRef}
        />
        <color attach="background" args={["#d8dce0"]} />

        {/* Diffused industrial daylight rig */}
        <ambientLight intensity={0.82} color="#f8fafc" />
        <hemisphereLight args={["#f1f5f9", "#9ca3af", 0.92]} />
        <directionalLight
          position={[6, 11, 6]}
          intensity={1.35}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-8, 7, -5]}
          intensity={0.55}
          color="#a7b0bb"
        />
        <pointLight
          position={[1.8, 2.2, 5.8]}
          intensity={0.7}
          color="#1d5fcf"
          distance={20}
          decay={2}
        />
        <pointLight
          position={[-2.2, 1.4, 4.8]}
          intensity={0.48}
          color="#00c853"
          distance={18}
          decay={2}
        />

        <Suspense fallback={null}>
          <Environment preset="warehouse" environmentIntensity={0.72} />
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
            scale={19}
            blur={2.4}
            far={9.5}
            color="#8c949f"
          />
          <EffectComposer multisampling={4}>
            <Bloom
              intensity={0.55}
              luminanceThreshold={0.34}
              luminanceSmoothing={0.85}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.5}
          enableZoom
          enablePan={!activeModule}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={activeModule ? 2.8 : 6}
          maxDistance={activeModule ? 15 : 30}
        />
      </Canvas>

      {/* Top-left header */}
      <header className="scene-header absolute top-0 left-0 p-5 pointer-events-none select-none">
        <h1 className="scene-header-title text-[#1d5fcf] text-xs sm:text-sm tracking-widest">
          PROJECT: AI-POWERED STREET SAFETY DEVICE | HARDWARE PROTOTYPE
        </h1>
        <p className="text-slate-700 text-[10px] mt-1">
          ◉ LIVE INSPECTION MODE · TAP A MODULE TO REVEAL INTERNALS
        </p>
      </header>

      {activeInfo && (
        <>
          <aside
            className="scene-card hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 max-w-[250px] rounded-lg border border-slate-400/80 bg-white/78 p-4 shadow-xl backdrop-blur-md"
          >
            <p className="text-[10px] tracking-[0.18em] text-[#1d5fcf]">FOCUS SIGNAL</p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">{activeInfo.leftLabel}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-700">{activeInfo.leftValue}</p>
          </aside>

          <aside
            className="scene-card hidden md:block absolute right-4 top-1/2 -translate-y-1/2 w-[295px] rounded-lg border border-slate-400/80 bg-white/78 p-4 shadow-xl backdrop-blur-md"
          >
            <p className="text-[10px] tracking-[0.18em] text-[#1d5fcf]">ACTIVE MODULE</p>
            <h2 className="mt-2 text-sm font-semibold text-slate-900">{activeInfo.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-700">{activeInfo.summary}</p>
            <p className="mt-4 text-[10px] tracking-[0.16em] text-[#1d5fcf]">KEY CHANNEL</p>
            <h3 className="mt-1 text-xs font-semibold text-slate-900">{activeInfo.rightLabel}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">{activeInfo.rightValue}</p>
          </aside>

          <div className="scene-mobile-stack md:hidden absolute left-3 right-3 bottom-20 rounded-lg border border-slate-400/80 bg-white/82 p-3 shadow-lg backdrop-blur-md">
            <p className="text-[10px] tracking-[0.18em] text-[#1d5fcf]">ACTIVE MODULE</p>
            <h2 className="mt-1 text-xs font-semibold text-slate-900">{activeInfo.title}</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{activeInfo.summary}</p>
            <p className="mt-3 text-[10px] tracking-[0.18em] text-[#1d5fcf]">{activeInfo.leftLabel}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{activeInfo.leftValue}</p>
            <p className="mt-3 text-[10px] tracking-[0.18em] text-[#1d5fcf]">{activeInfo.rightLabel}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{activeInfo.rightValue}</p>
          </div>

          <button
            onClick={resetFocus}
            className="absolute right-5 top-5 rounded-md border border-slate-500/70 bg-white/78 px-3 py-2 text-[11px] tracking-widest text-slate-800 backdrop-blur-md transition-colors hover:bg-slate-800 hover:text-white"
          >
            BACK
          </button>
        </>
      )}


      {/* Bottom-center toggle */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setIsExploded((v) => !v)}
          className="scene-toggle-btn px-5 py-3 text-xs tracking-widest transition-colors duration-200 border border-slate-500/70 bg-white/78 text-slate-800 backdrop-blur-md hover:bg-slate-800 hover:text-white"
        >
          {isExploded ? "▼ COLLAPSE VIEW" : "▲ TOGGLE EXPLODED VIEW"}
        </button>
      </div>

      {/* Bottom-left hint */}
      <div className="scene-hint absolute bottom-6 left-5 text-[10px] pointer-events-none text-slate-700">
        TAP · SELECT MODULE &nbsp;|&nbsp; DRAG · ORBIT &nbsp;|&nbsp; SCROLL · ZOOM
      </div>
    </div>
  );
};

export default Index;
