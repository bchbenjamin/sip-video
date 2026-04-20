import { ReactNode, useMemo, useRef } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Line, Outlines, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import {
  MODULES,
  ModuleId,
  computeAssembledY,
  computeExplodedY,
} from "./modules";

interface DeviceProps {
  isExploded: boolean;
  hovered: ModuleId | null;
  activeModule: ModuleId | null;
  setHovered: (id: ModuleId | null) => void;
  setActiveModule: (id: ModuleId | null) => void;
}

const ACCENT = "#1d5fcf";
const DAMPING = 10;
const INTRO_DROP_HEIGHT = 8.5;

interface ModuleWrapperProps {
  id: ModuleId;
  index: number;
  y: number;
  hovered: ModuleId | null;
  activeModule: ModuleId | null;
  setHovered: (id: ModuleId | null) => void;
  setActiveModule: (id: ModuleId | null) => void;
  children: (state: { isHover: boolean; isActive: boolean }) => ReactNode;
}

function ModuleGroup({
  id,
  index,
  y,
  hovered,
  activeModule,
  setHovered,
  setActiveModule,
  children,
}: ModuleWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isHover = hovered === id;
  const isActive = activeModule === id;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const elapsed = state.clock.getElapsedTime();
    const dropDelay = index * 0.16;
    const introTargetY =
      elapsed < dropDelay ? y + INTRO_DROP_HEIGHT + index * 0.45 : y;

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      introTargetY,
      DAMPING,
      delta
    );

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      elapsed < dropDelay ? -0.18 : 0,
      8,
      delta
    );
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(id);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(null);
    document.body.style.cursor = "auto";
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setActiveModule(activeModule === id ? null : id);
  };

  return (
    <group
      ref={groupRef}
      position={[0, y + INTRO_DROP_HEIGHT + index * 0.45, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
    >
      {children({ isHover, isActive })}
    </group>
  );
}

function HoverOutline({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return <Outlines thickness={2.6} color={ACCENT} transparent opacity={0.95} />;
}

interface ModuleVisualProps {
  isHover: boolean;
  isActive: boolean;
}

function BaseModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  const reveal = isActive ? 1 : 0;

  return (
    <group>
      <RoundedBox
        args={[4, 0.56, 3]}
        radius={0.08}
        smoothness={4}
        position={[0, -0.22, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#2b313a"
          roughness={0.75}
          metalness={0.15}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.1 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <RoundedBox
        args={[3.95, 0.36, 2.95]}
        radius={0.07}
        smoothness={4}
        position={[0, 0.34 + reveal * 0.5, 0]}
        castShadow
      >
        <meshPhysicalMaterial color="#3b424d" roughness={0.75} metalness={0.15} />
      </RoundedBox>

      <group position={[0, 0.05 + reveal * 0.12, 0]}>
        <RoundedBox args={[2.55, 0.14, 1.1]} radius={0.03} smoothness={4} castShadow>
          <meshPhysicalMaterial color="#4f5664" roughness={0.55} metalness={0.42} />
        </RoundedBox>

        {Array.from({ length: 8 }).map((_, i) => (
          <RoundedBox
            key={`sink-${i}`}
            args={[0.08, 0.25, 0.8]}
            radius={0.01}
            smoothness={4}
            position={[-0.9 + i * 0.26, 0.2, 0]}
          >
            <meshPhysicalMaterial color="#7f8897" roughness={0.35} metalness={0.78} />
          </RoundedBox>
        ))}
      </group>

      {[
        [-1.8, -0.6, -1.3],
        [1.8, -0.6, -1.3],
        [-1.8, -0.6, 1.3],
        [1.8, -0.6, 1.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 64]} />
          <meshPhysicalMaterial color="#111111" roughness={1} metalness={0.04} />
        </mesh>
      ))}

      <RoundedBox
        args={[0.1, 0.38, 0.6]}
        radius={0.02}
        smoothness={4}
        position={[2.04 + reveal * 0.4, -0.08, -0.64]}
      >
        <meshPhysicalMaterial color="#0f1115" roughness={0.5} metalness={0.6} />
      </RoundedBox>
      <RoundedBox
        args={[0.1, 0.3, 0.5]}
        radius={0.02}
        smoothness={4}
        position={[2.04 + reveal * 0.4, -0.08, 0.64]}
      >
        <meshPhysicalMaterial color="#0f1115" roughness={0.5} metalness={0.6} />
      </RoundedBox>

      {[-1.15, 1.15].map((z, i) => (
        <RoundedBox
          key={i}
          args={[3.2, 0.14, 0.18]}
          radius={0.03}
          smoothness={4}
          position={[0, 0.08, z]}
        >
          <meshPhysicalMaterial color="#2a2f38" roughness={0.8} metalness={0.12} />
        </RoundedBox>
      ))}

      <mesh position={[0, -0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 0.1]} />
        <meshPhysicalMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.45}
          roughness={0.45}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function SensorModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  const reveal = isActive ? 1 : 0;

  return (
    <group>
      <RoundedBox
        args={[3.8, 0.82, 2.8]}
        radius={0.07}
        smoothness={4}
        position={[0, -0.16, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#3b434f"
          roughness={0.75}
          metalness={0.15}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.1 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <RoundedBox
        args={[3.65, 0.34, 2.65]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.42 + reveal * 0.48, 0]}
        castShadow
      >
        <meshPhysicalMaterial color="#4e5867" roughness={0.75} metalness={0.15} />
      </RoundedBox>

      <group position={[0, 0.08, 1.36 + reveal * 0.54]}>
        <RoundedBox args={[2.42, 0.92, 0.94]} radius={0.1} smoothness={4} castShadow>
          <meshPhysicalMaterial color="#151a22" roughness={0.55} metalness={0.42} />
        </RoundedBox>

        <RoundedBox
          args={[1.7, 0.2, 0.64]}
          radius={0.05}
          smoothness={4}
          position={[0, 0.44, 0.18]}
          castShadow
        >
          <meshPhysicalMaterial color="#252c36" roughness={0.6} metalness={0.3} />
        </RoundedBox>

        <mesh position={[0, 0, 0.56 + reveal * 0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.68, 0.68, 0.36, 72]} />
          <meshPhysicalMaterial color="#0d1015" roughness={0.35} metalness={0.9} />
        </mesh>

        <mesh position={[0, 0, 0.71 + reveal * 0.52]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.52, 0.06, 24, 72]} />
          <meshPhysicalMaterial color="#5f6f83" roughness={0.3} metalness={0.88} />
        </mesh>

        <mesh position={[0, 0, 0.82 + reveal * 0.6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.45, 0.18, 72]} />
          <meshPhysicalMaterial
            color="#05080d"
            transmission={1}
            thickness={0.36}
            roughness={0.03}
            metalness={0.35}
            ior={1.52}
          />
        </mesh>

        <RoundedBox
          args={[1.5, 0.1, 0.56]}
          radius={0.02}
          smoothness={4}
          position={[0, -0.28, -0.16 - reveal * 0.2]}
        >
          <meshPhysicalMaterial color="#0f2c17" roughness={0.62} metalness={0.25} />
        </RoundedBox>

        {[[-0.52, -0.28], [-0.18, -0.28], [0.18, -0.28], [0.52, -0.28]].map(
          ([x, y], i) => (
            <RoundedBox
              key={`sensor-chip-${i}`}
              args={[0.22, 0.07, 0.13]}
              radius={0.01}
              smoothness={4}
              position={[x, y, -0.16 - reveal * 0.2]}
            >
              <meshPhysicalMaterial color="#161a21" roughness={0.42} metalness={0.62} />
            </RoundedBox>
          )
        )}
      </group>

      <mesh position={[1.04, 0.26, 1.96 + reveal * 0.46]}>
        <sphereGeometry args={[0.055, 24, 24]} />
        <meshPhysicalMaterial
          color="#2a0000"
          emissive="#ff0000"
          emissiveIntensity={glow ? 1.25 : 0.85}
          roughness={0.32}
          metalness={0.08}
        />
      </mesh>

      {[
        [-0.64, 0.28],
        [-0.64, -0.02],
        [-0.42, -0.24],
        [0.42, -0.24],
        [0.64, -0.02],
        [0.64, 0.28],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 1.88 + reveal * 0.34]}>
          <cylinderGeometry args={[0.055, 0.055, 0.06, 32]} />
          <meshPhysicalMaterial
            color="#d7dce5"
            emissive="#dce9ff"
            emissiveIntensity={0.24}
            roughness={0.42}
            metalness={0.3}
          />
        </mesh>
      ))}

      <mesh position={[1.2 + reveal * 0.2, -0.22, 1.3 + reveal * 0.18]} castShadow>
        <sphereGeometry args={[0.23, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#e8edf4"
          transmission={0.45}
          roughness={0.3}
          thickness={0.2}
          ior={1.4}
        />
      </mesh>
    </group>
  );
}

function ComputeModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  const reveal = isActive ? 1 : 0;

  return (
    <group>
      <RoundedBox args={[2.5, 0.1, 2]} radius={0.02} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#2a6b2b"
          roughness={0.72}
          metalness={0.12}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.12 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <RoundedBox
        args={[0.95, 0.07, 0.95]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.16 + reveal * 0.14, 0]}
        castShadow
      >
        <meshPhysicalMaterial color="#424a56" roughness={0.32} metalness={0.85} />
      </RoundedBox>

      {Array.from({ length: 6 }).map((_, i) => (
        <RoundedBox
          key={`hs-fin-${i}`}
          args={[0.1, 0.24, 0.82]}
          radius={0.01}
          smoothness={4}
          position={[-0.3 + i * 0.12, 0.34 + reveal * 0.22, 0]}
        >
          <meshPhysicalMaterial color="#8b94a3" roughness={0.35} metalness={0.88} />
        </RoundedBox>
      ))}

      {[
        [-0.76, 0.09, -0.52],
        [0.76, 0.09, -0.52],
        [-0.76, 0.09, 0.52],
        [0.76, 0.09, 0.52],
      ].map((p, i) => (
        <RoundedBox key={i} args={[0.34, 0.07, 0.22]} radius={0.01} smoothness={4} position={p as [number, number, number]}>
          <meshPhysicalMaterial color="#1a1d24" roughness={0.35} metalness={0.7} />
        </RoundedBox>
      ))}

      <RoundedBox args={[2, 0.08, 0.12]} radius={0.01} smoothness={4} position={[0, 0.1, -0.92]}>
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.4} metalness={0.5} />
      </RoundedBox>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[-0.95 + i * 0.1, 0.18, -0.92]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 64]} />
          <meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.25} />
        </mesh>
      ))}

      {[-0.5, -0.22, 0.06, 0.34].map((z, i) => (
        <RoundedBox
          key={`usb-${i}`}
          args={[0.22, 0.16, 0.17]}
          radius={0.01}
          smoothness={4}
          position={[1.22 + reveal * 0.52, 0.12, z]}
        >
          <meshPhysicalMaterial color="#bfc8d2" roughness={0.34} metalness={0.9} />
        </RoundedBox>
      ))}
      <RoundedBox
        args={[0.28, 0.2, 0.24]}
        radius={0.01}
        smoothness={4}
        position={[1.24 + reveal * 0.52, 0.14, 0.66]}
      >
        <meshPhysicalMaterial color="#c7ced8" roughness={0.32} metalness={0.92} />
      </RoundedBox>
    </group>
  );
}

function AudioModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  const reveal = isActive ? 1 : 0;

  return (
    <group>
      <RoundedBox
        args={[3.8, 0.72, 2.8]}
        radius={0.06}
        smoothness={4}
        position={[0, -0.02, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#2f343d"
          roughness={0.75}
          metalness={0.15}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.1 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <RoundedBox
        args={[3.6, 0.18, 2.5]}
        radius={0.04}
        smoothness={4}
        position={[0, 0.38 + reveal * 0.35, 0]}
      >
        <meshPhysicalMaterial color="#5c6675" roughness={0.52} metalness={0.44} />
      </RoundedBox>

      <group position={[0, 0, 1.34 + reveal * 0.38]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.14, 64]} />
          <meshPhysicalMaterial color="#1b2028" roughness={0.35} metalness={0.82} />
        </mesh>
        <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.35, 0.06, 24, 64]} />
          <meshPhysicalMaterial color="#3a404b" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.26, 0.24, 64]} />
          <meshPhysicalMaterial color="#1f242b" roughness={0.38} metalness={0.55} />
        </mesh>
        <mesh position={[0, 0, 0.22]} castShadow>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshPhysicalMaterial color="#2a3038" roughness={0.4} metalness={0.45} />
        </mesh>
      </group>

      <group position={[0, 0, -1.34 - reveal * 0.38]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.14, 64]} />
          <meshPhysicalMaterial color="#1b2028" roughness={0.35} metalness={0.82} />
        </mesh>
        <mesh position={[0, 0, -0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.35, 0.06, 24, 64]} />
          <meshPhysicalMaterial color="#3a404b" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, -0.13]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.26, 0.24, 64]} />
          <meshPhysicalMaterial color="#1f242b" roughness={0.38} metalness={0.55} />
        </mesh>
        <mesh position={[0, 0, -0.22]} castShadow>
          <sphereGeometry args={[0.09, 32, 32]} />
          <meshPhysicalMaterial color="#2a3038" roughness={0.4} metalness={0.45} />
        </mesh>
      </group>

      {Array.from({ length: 8 }).map((_, i) => {
        const y = -0.28 + i * 0.08;
        return (
          <RoundedBox
            key={`grille-front-${i}`}
            args={[0.9, 0.026, 0.05]}
            radius={0.01}
            smoothness={4}
            position={[0, y, 1.62 + reveal * 0.62]}
          >
            <meshPhysicalMaterial color="#5b6270" roughness={0.44} metalness={0.74} />
          </RoundedBox>
        );
      })}

      {Array.from({ length: 8 }).map((_, i) => {
        const y = -0.28 + i * 0.08;
        return (
          <RoundedBox
            key={`grille-back-${i}`}
            args={[0.9, 0.026, 0.05]}
            radius={0.01}
            smoothness={4}
            position={[0, y, -1.62 - reveal * 0.62]}
          >
            <meshPhysicalMaterial color="#5b6270" roughness={0.44} metalness={0.74} />
          </RoundedBox>
        );
      })}

      {[
        [-0.3, 0.45 + reveal * 0.22, -0.3],
        [0.3, 0.45 + reveal * 0.22, -0.3],
        [-0.3, 0.45 + reveal * 0.22, 0.3],
        [0.3, 0.45 + reveal * 0.22, 0.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshPhysicalMaterial color="#0f1318" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function CommModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  const reveal = isActive ? 1 : 0;

  return (
    <group>
      <RoundedBox
        args={[3.8, 0.86, 2.8]}
        radius={0.07}
        smoothness={4}
        position={[0, -0.08, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#2a2f37"
          roughness={0.75}
          metalness={0.15}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.1 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <RoundedBox
        args={[3.6, 0.2, 2.62]}
        radius={0.05}
        smoothness={4}
        position={[0, 0.42 + reveal * 0.34, 0]}
      >
        <meshPhysicalMaterial color="#465060" roughness={0.56} metalness={0.32} />
      </RoundedBox>

      <mesh position={[-1.58, 0.95 + reveal * 0.1, -1.2]} castShadow>
        <cylinderGeometry args={[0.13, 0.21, 0.46, 32]} />
        <meshPhysicalMaterial color="#1a1c20" metalness={0.84} roughness={0.32} />
      </mesh>
      <mesh position={[-1.58, 1.7 + reveal * 0.2, -1.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.11, 1.08, 32]} />
        <meshPhysicalMaterial color="#1a1c20" metalness={0.86} roughness={0.28} />
      </mesh>
      <mesh position={[-1.58, 2.28 + reveal * 0.2, -1.2]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshPhysicalMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.72} />
      </mesh>
      <mesh position={[1.58, 0.95 + reveal * 0.1, -1.2]} castShadow>
        <cylinderGeometry args={[0.13, 0.21, 0.46, 32]} />
        <meshPhysicalMaterial color="#1a1c20" metalness={0.84} roughness={0.32} />
      </mesh>
      <mesh position={[1.58, 1.7 + reveal * 0.2, -1.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.11, 1.08, 32]} />
        <meshPhysicalMaterial color="#1a1c20" metalness={0.86} roughness={0.28} />
      </mesh>
      <mesh position={[1.58, 2.28 + reveal * 0.2, -1.2]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshPhysicalMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.72} />
      </mesh>

      {[-0.25, 0, 0.25].map((x, i) => (
        <mesh key={`status-led-${i}`} position={[x, 0.12, 1.44 + reveal * 0.3]}>
          <sphereGeometry args={[0.05, 20, 20]} />
          <meshPhysicalMaterial
            color="#0b1f0b"
            emissive="#00ff00"
            emissiveIntensity={isActive ? 1.35 : 0.9}
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>
      ))}

      <mesh position={[-2.02 - reveal * 0.38, 0.02, 0]}>
        <boxGeometry args={[0.04, 0.56, 1.56]} />
        <meshPhysicalMaterial
          color="#adb4bf"
          transmission={0.48}
          roughness={0.1}
          metalness={0.15}
          ior={1.42}
          thickness={0.1}
        />
      </mesh>

      <RoundedBox
        args={[0.74, 0.44, 1.46]}
        radius={0.03}
        smoothness={4}
        position={[-1.5 - reveal * 0.42, -0.04, 0]}
      >
        <meshPhysicalMaterial
          color="#2257a0"
          emissive="#2b74d1"
          emissiveIntensity={0.22}
          roughness={0.45}
          metalness={0.4}
        />
      </RoundedBox>
    </group>
  );
}

function CoverModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  const reveal = isActive ? 1 : 0;

  return (
    <group>
      <RoundedBox
        args={[4, 0.2, 3]}
        radius={0.05}
        smoothness={4}
        position={[0, reveal * 0.55, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#2d343e"
          roughness={0.75}
          metalness={0.15}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.08 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <RoundedBox
        args={[3.65, 0.08, 2.7]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.09, 0]}
      >
        <meshPhysicalMaterial color="#13171d" roughness={0.85} metalness={0.08} />
      </RoundedBox>

      {[
        [-1.8, 0.12, -1.3],
        [1.8, 0.12, -1.3],
        [-1.8, 0.12, 1.3],
        [1.8, 0.12, 1.3],
      ].map((p, i) => (
        <mesh
          key={i}
          position={[p[0] + reveal * 0.08 * Math.sign(p[0]), p[1] + reveal * 0.62, p[2] + reveal * 0.08 * Math.sign(p[2])]}
          castShadow
        >
          <cylinderGeometry args={[0.08, 0.08, 0.06, 64]} />
          <meshPhysicalMaterial color="#c9cdd3" metalness={1} roughness={0.25} />
        </mesh>
      ))}

      <mesh position={[0, 0.111 + reveal * 0.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 0.05]} />
        <meshPhysicalMaterial color="#11151b" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
}

const RENDERERS: Record<ModuleId, (p: ModuleVisualProps) => JSX.Element> = {
  base: BaseModule,
  sensor: SensorModule,
  compute: ComputeModule,
  audio: AudioModule,
  comm: CommModule,
  cover: CoverModule,
};

export default function Device({
  isExploded,
  hovered,
  activeModule,
  setHovered,
  setActiveModule,
}: DeviceProps) {
  const assembled = useMemo(() => computeAssembledY(), []);
  const exploded = useMemo(() => computeExplodedY(), []);

  const totalAssembled =
    assembled[assembled.length - 1] + MODULES[MODULES.length - 1].height / 2;
  const yOffset = -totalAssembled / 2;

  const positions = MODULES.map((_, i) =>
    (isExploded ? exploded[i] : assembled[i]) + yOffset
  );

  return (
    <group>
      {MODULES.map((m, i) => {
        const Renderer = RENDERERS[m.id];
        return (
          <ModuleGroup
            key={m.id}
            id={m.id}
            index={i}
            y={positions[i]}
            hovered={hovered}
            activeModule={activeModule}
            setHovered={setHovered}
            setActiveModule={setActiveModule}
          >
            {(state) => <Renderer {...state} />}
          </ModuleGroup>
        );
      })}

      {isExploded &&
        MODULES.slice(0, -1).map((_, i) => (
          <Line
            key={`line-${i}`}
            points={[
              [0, positions[i], 0],
              [0, positions[i + 1], 0],
            ]}
            color={ACCENT}
            lineWidth={1.8}
            dashed
            dashSize={0.15}
            gapSize={0.1}
            transparent
            opacity={0.5}
          />
        ))}
    </group>
  );
}
