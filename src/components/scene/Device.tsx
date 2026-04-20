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
  selected: ModuleId | null;
  setHovered: (id: ModuleId | null) => void;
  setSelected: (id: ModuleId | null) => void;
}

const ACCENT = "#1d5fcf";
const DAMPING = 10;

interface ModuleWrapperProps {
  id: ModuleId;
  y: number;
  hovered: ModuleId | null;
  selected: ModuleId | null;
  setHovered: (id: ModuleId | null) => void;
  setSelected: (id: ModuleId | null) => void;
  children: (state: { isHover: boolean; isActive: boolean }) => ReactNode;
}

function ModuleGroup({
  id,
  y,
  hovered,
  selected,
  setHovered,
  setSelected,
  children,
}: ModuleWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isHover = hovered === id;
  const isActive = selected === id;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      y,
      DAMPING,
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
    setSelected(selected === id ? null : id);
  };

  return (
    <group
      ref={groupRef}
      position={[0, y, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
    >
      {children({ isHover, isActive })}
    </group>
  );
}

/** Reusable hover outline */
function HoverOutline({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;
  return (
    <Outlines thickness={2.6} color={ACCENT} transparent opacity={0.95} />
  );
}

interface ModuleVisualProps {
  isHover: boolean;
  isActive: boolean;
}

/** Group 1: Rugged Base Enclosure (carbon-fiber matte) */
function BaseModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  return (
    <group>
      <RoundedBox args={[4, 1, 3]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1c1c1c"
          roughness={0.7}
          metalness={0.2}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.32 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      {/* Rubber feet */}
      {[
        [-1.8, -0.6, -1.3],
        [1.8, -0.6, -1.3],
        [-1.8, -0.6, 1.3],
        [1.8, -0.6, 1.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 64]} />
          <meshPhysicalMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      ))}

      {/* I/O ports */}
      <RoundedBox args={[0.08, 0.4, 0.6]} radius={0.02} smoothness={4} position={[2.0, 0, -0.6]}>
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.5} metalness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.08, 0.3, 0.5]} radius={0.02} smoothness={4} position={[2.0, 0, 0.6]}>
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.5} metalness={0.6} />
      </RoundedBox>

      {/* Brand strip */}
      <mesh position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 0.1]} />
        <meshPhysicalMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Group 2: Camera & Sensor Assembly (brushed aluminum + glass + frosted dome) */
function SensorModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  return (
    <group>
      <RoundedBox args={[3.8, 1.2, 2.8]} radius={0.07} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#2f3642"
          roughness={0.36}
          metalness={0.72}
          clearcoat={0.22}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.24 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      {/* Camera housing with hood so it reads as a lens block instead of a knob */}
      <RoundedBox args={[2.25, 0.82, 0.78]} radius={0.09} smoothness={4} position={[0, 0.12, 1.5]} castShadow>
        <meshPhysicalMaterial color="#1c2029" roughness={0.25} metalness={0.82} clearcoat={0.35} />
      </RoundedBox>
      <RoundedBox args={[1.5, 0.18, 0.55]} radius={0.04} smoothness={4} position={[0, 0.53, 1.64]} castShadow>
        <meshPhysicalMaterial color="#12151b" roughness={0.3} metalness={0.75} clearcoat={0.2} />
      </RoundedBox>

      {/* Lens assembly */}
      <mesh position={[0, 0.12, 1.89]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.44, 0.44, 0.16, 64]} />
        <meshPhysicalMaterial color="#0e1117" roughness={0.22} metalness={0.96} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.12, 1.94]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.33, 0.43, 64]} />
        <meshPhysicalMaterial color="#2f87ff" emissive={ACCENT} emissiveIntensity={glow ? 0.65 : 0.35} side={2} />
      </mesh>
      <mesh position={[0, 0.12, 1.99]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.31, 0.08, 64]} />
        <meshPhysicalMaterial
          color="#06080d"
          transmission={1}
          opacity={1}
          metalness={0.55}
          roughness={0.03}
          ior={1.52}
          thickness={0.32}
          clearcoat={1}
        />
      </mesh>
      <mesh position={[0, 0.12, 1.955]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 64]} />
        <meshPhysicalMaterial color="#0a0c0f" roughness={0.15} metalness={0.6} />
      </mesh>

      {/* IR LEDs around lens */}
      {[
        [-0.58, 0.27],
        [-0.58, -0.03],
        [-0.39, -0.22],
        [0.39, -0.22],
        [0.58, -0.03],
        [0.58, 0.27],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 1.86]}>
          <cylinderGeometry args={[0.055, 0.055, 0.06, 32]} />
          <meshPhysicalMaterial color="#d7dce5" emissive="#dce9ff" emissiveIntensity={0.3} roughness={0.3} metalness={0.4} />
        </mesh>
      ))}

      {/* PIR frosted dome */}
      <mesh position={[1.15, -0.2, 1.35]} castShadow>
        <sphereGeometry args={[0.22, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
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

/** Group 3: Raspberry Pi Compute Core */
function ComputeModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  return (
    <group>
      <RoundedBox args={[2.5, 0.1, 2]} radius={0.02} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1b5e20"
          roughness={0.6}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.26 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      {/* CPU */}
      <RoundedBox args={[0.5, 0.08, 0.5]} radius={0.01} smoothness={4} position={[0, 0.09, 0]} castShadow>
        <meshPhysicalMaterial color="#222222" roughness={0.2} metalness={0.9} clearcoat={0.6} />
      </RoundedBox>
      {/* CPU label dot */}
      <mesh position={[0, 0.135, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshPhysicalMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.8} />
      </mesh>

      {/* RAM chips */}
      {[
        [-0.7, 0.085, -0.5],
        [0.7, 0.085, -0.5],
        [-0.7, 0.085, 0.5],
        [0.7, 0.085, 0.5],
      ].map((p, i) => (
        <RoundedBox
          key={i}
          args={[0.3, 0.06, 0.2]}
          radius={0.008}
          smoothness={4}
          position={p as [number, number, number]}
        >
          <meshPhysicalMaterial color="#111111" roughness={0.3} metalness={0.7} />
        </RoundedBox>
      ))}

      {/* GPIO header base */}
      <RoundedBox args={[2, 0.08, 0.12]} radius={0.01} smoothness={4} position={[0, 0.1, -0.92]}>
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.4} metalness={0.5} />
      </RoundedBox>
      {/* GPIO pins */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[-0.95 + i * 0.1, 0.18, -0.92]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 64]} />
          <meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.25} clearcoat={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/** Group 4: Audio & DSP Module */
function AudioModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  return (
    <group>
      <RoundedBox args={[3.8, 0.8, 2.8]} radius={0.06} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#2A2A2A"
          roughness={0.5}
          metalness={0.4}
          clearcoat={0.2}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.3 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      {/* Front speaker recess */}
      <mesh position={[0, 0, 1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 64]} />
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Front speaker mesh grid */}
      <mesh position={[0, 0, 1.43]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 64]} />
        <meshPhysicalMaterial color="#3a3a3a" wireframe roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Back speaker recess */}
      <mesh position={[0, 0, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 64]} />
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, -1.43]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 64]} />
        <meshPhysicalMaterial color="#3a3a3a" wireframe roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Mic array */}
      {[
        [-0.3, 0.41, -0.3],
        [0.3, 0.41, -0.3],
        [-0.3, 0.41, 0.3],
        [0.3, 0.41, 0.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <sphereGeometry args={[0.05, 32, 32]} />
          <meshPhysicalMaterial color="#000000" roughness={0.3} metalness={0.6} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
}

/** Group 5: Power & Communication */
function CommModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  return (
    <group>
      <RoundedBox args={[3.8, 1, 2.8]} radius={0.07} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1c1c1c"
          roughness={0.7}
          metalness={0.2}
          clearcoat={0.1}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.32 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      {/* Antennas */}
      <mesh position={[-1.6, 1.2, -1.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 64]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} roughness={0.25} clearcoat={0.5} />
      </mesh>
      <mesh position={[-1.6, 2.05, -1.2]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshPhysicalMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[1.6, 1.2, -1.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 64]} />
        <meshPhysicalMaterial color="#1a1a1a" metalness={0.9} roughness={0.25} clearcoat={0.5} />
      </mesh>
      <mesh position={[1.6, 2.05, -1.2]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshPhysicalMaterial color={ACCENT} emissive={ACCENT} emissiveIntensity={0.7} />
      </mesh>

      {/* Translucent side window */}
      <mesh position={[-1.91, 0, 0]}>
        <boxGeometry args={[0.02, 0.5, 1.5]} />
        <meshPhysicalMaterial
          color="#222222"
          transmission={0.7}
          opacity={1}
          roughness={0.1}
          metalness={0.3}
          ior={1.45}
          thickness={0.1}
        />
      </mesh>
      {/* Battery block */}
      <RoundedBox args={[0.6, 0.4, 1.4]} radius={0.03} smoothness={4} position={[-1.5, 0, 0]}>
        <meshPhysicalMaterial
          color="#0055AA"
          emissive="#0066cc"
          emissiveIntensity={0.25}
          roughness={0.4}
          metalness={0.5}
          clearcoat={0.4}
        />
      </RoundedBox>
    </group>
  );
}

/** Group 6: Top Cover */
function CoverModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;
  return (
    <group>
      <RoundedBox args={[4, 0.2, 3]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1c1c1c"
          roughness={0.7}
          metalness={0.2}
          clearcoat={0.1}
          emissive={ACCENT}
          emissiveIntensity={glow ? 0.32 : 0}
        />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      {/* Tamper-proof screws */}
      {[
        [-1.8, 0.12, -1.3],
        [1.8, 0.12, -1.3],
        [-1.8, 0.12, 1.3],
        [1.8, 0.12, 1.3],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 64]} />
          <meshPhysicalMaterial color="#cccccc" metalness={1} roughness={0.25} clearcoat={0.6} />
        </mesh>
      ))}

      {/* Subtle vent line */}
      <mesh position={[0, 0.111, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 0.05]} />
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.6} />
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
  selected,
  setHovered,
  setSelected,
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
            y={positions[i]}
            hovered={hovered}
            selected={selected}
            setHovered={setHovered}
            setSelected={setSelected}
          >
            {(state) => <Renderer {...state} />}
          </ModuleGroup>
        );
      })}

      {/* Connecting blueprint lines */}
      {isExploded &&
        MODULES.slice(0, -1).map((_, i) => (
          <Line
            key={`line-${i}`}
            points={[
              [0, positions[i], 0],
              [0, positions[i + 1], 0],
            ]}
            color={ACCENT}
            lineWidth={2}
            dashed
            dashSize={0.15}
            gapSize={0.1}
            transparent
            opacity={0.55}
          />
        ))}
    </group>
  );
}
