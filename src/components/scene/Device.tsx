import { useMemo } from "react";
import { motion } from "framer-motion-3d";
import { Line, RoundedBox, Outlines } from "@react-three/drei";
import {
  MODULES,
  ModuleId,
  computeAssembledY,
  computeExplodedY,
} from "./modules";

interface DeviceProps {
  isExploded: boolean;
  hovered: ModuleId | null;
  setHovered: (id: ModuleId | null) => void;
}

const ACCENT = "#bb86fc";

const spring = { type: "spring" as const, stiffness: 80, damping: 18, mass: 1 };

interface ModuleWrapperProps {
  id: ModuleId;
  y: number;
  hovered: ModuleId | null;
  setHovered: (id: ModuleId | null) => void;
  children: (isHover: boolean) => React.ReactNode;
}

function ModuleGroup({ id, y, hovered, setHovered, children }: ModuleWrapperProps) {
  const isHover = hovered === id;
  return (
    <motion.group
      animate={{ y }}
      transition={spring}
      onPointerOver={(e: any) => {
        e.stopPropagation();
        setHovered(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e: any) => {
        e.stopPropagation();
        setHovered(null);
        document.body.style.cursor = "auto";
      }}
    >
      {children(isHover)}
    </motion.group>
  );
}

/** Reusable hover outline */
function HoverOutline({ isHover }: { isHover: boolean }) {
  if (!isHover) return null;
  return (
    <Outlines thickness={2} color={ACCENT} transparent opacity={0.9} />
  );
}

/** Group 1: Rugged Base Enclosure (carbon-fiber matte) */
function BaseModule({ isHover }: { isHover: boolean }) {
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
          emissiveIntensity={isHover ? 0.4 : 0}
        />
        <HoverOutline isHover={isHover} />
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
function SensorModule({ isHover }: { isHover: boolean }) {
  return (
    <group>
      <RoundedBox args={[3.8, 1.2, 2.8]} radius={0.07} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#2a2a2a"
          roughness={0.4}
          metalness={0.8}
          clearcoat={0.2}
          emissive={ACCENT}
          emissiveIntensity={isHover ? 0.3 : 0}
        />
        <HoverOutline isHover={isHover} />
      </RoundedBox>

      {/* Camera barrel */}
      <mesh position={[0, 0.15, 1.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.2, 64]} />
        <meshPhysicalMaterial color="#0a0a0a" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Camera glass lens */}
      <mesh position={[0, 0.15, 1.54]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.04, 64]} />
        <meshPhysicalMaterial
          color="#050505"
          transmission={1}
          opacity={1}
          metalness={0.9}
          roughness={0}
          ior={1.5}
          thickness={0.5}
          clearcoat={1}
        />
      </mesh>
      {/* Inner reflective ring */}
      <mesh position={[0, 0.15, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.34, 0.42, 64]} />
        <meshPhysicalMaterial color="#bb86fc" emissive={ACCENT} emissiveIntensity={0.5} side={2} />
      </mesh>

      {/* PIR frosted dome */}
      <mesh position={[0, -0.35, 1.42]} castShadow>
        <sphereGeometry args={[0.22, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#eeeeee"
          transmission={0.5}
          roughness={0.3}
          thickness={0.2}
          ior={1.4}
        />
      </mesh>
    </group>
  );
}

/** Group 3: Raspberry Pi Compute Core */
function ComputeModule({ isHover }: { isHover: boolean }) {
  return (
    <group>
      <RoundedBox args={[2.5, 0.1, 2]} radius={0.02} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1b5e20"
          roughness={0.6}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          emissive={ACCENT}
          emissiveIntensity={isHover ? 0.35 : 0}
        />
        <HoverOutline isHover={isHover} />
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
function AudioModule({ isHover }: { isHover: boolean }) {
  return (
    <group>
      <RoundedBox args={[3.8, 0.8, 2.8]} radius={0.06} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#2A2A2A"
          roughness={0.5}
          metalness={0.4}
          clearcoat={0.2}
          emissive={ACCENT}
          emissiveIntensity={isHover ? 0.35 : 0}
        />
        <HoverOutline isHover={isHover} />
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
function CommModule({ isHover }: { isHover: boolean }) {
  return (
    <group>
      <RoundedBox args={[3.8, 1, 2.8]} radius={0.07} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1c1c1c"
          roughness={0.7}
          metalness={0.2}
          clearcoat={0.1}
          emissive={ACCENT}
          emissiveIntensity={isHover ? 0.4 : 0}
        />
        <HoverOutline isHover={isHover} />
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
function CoverModule({ isHover }: { isHover: boolean }) {
  return (
    <group>
      <RoundedBox args={[4, 0.2, 3]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1c1c1c"
          roughness={0.7}
          metalness={0.2}
          clearcoat={0.1}
          emissive={ACCENT}
          emissiveIntensity={isHover ? 0.4 : 0}
        />
        <HoverOutline isHover={isHover} />
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

const RENDERERS: Record<ModuleId, (p: { isHover: boolean }) => JSX.Element> = {
  base: BaseModule,
  sensor: SensorModule,
  compute: ComputeModule,
  audio: AudioModule,
  comm: CommModule,
  cover: CoverModule,
};

export default function Device({ isExploded, hovered, setHovered }: DeviceProps) {
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
            setHovered={setHovered}
          >
            {(isHover) => <Renderer isHover={isHover} />}
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
            opacity={0.8}
          />
        ))}
    </group>
  );
}
