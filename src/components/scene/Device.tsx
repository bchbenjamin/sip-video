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

type Vec3 = [number, number, number];

interface DeviceProps {
  isExploded: boolean;
  hovered: ModuleId | null;
  activeModule: ModuleId | null;
  setHovered: (id: ModuleId | null) => void;
  setActiveModule: (id: ModuleId | null) => void;
}

interface ModuleVisualProps {
  isHover: boolean;
  isActive: boolean;
}

interface ModuleGroupProps {
  id: ModuleId;
  index: number;
  y: number;
  hovered: ModuleId | null;
  activeModule: ModuleId | null;
  setHovered: (id: ModuleId | null) => void;
  setActiveModule: (id: ModuleId | null) => void;
  children: (state: { isHover: boolean; isActive: boolean }) => ReactNode;
}

interface AnimatedOffsetGroupProps {
  active: boolean;
  offset: Vec3;
  damping?: number;
  collapsedScale?: number;
  children: ReactNode;
}

const ACCENT = "#0055ff";
const DROP_DAMPING = 10;
const PART_DAMPING = 8.5;
const INTRO_DROP_HEIGHT = 7.2;

const MATERIALS = {
  pcbGreen: {
    color: "#1b5e20",
    roughness: 0.58,
    metalness: 0.12,
  },
  pcbDark: {
    color: "#1f2730",
    roughness: 0.6,
    metalness: 0.16,
  },
  silicon: {
    color: "#111111",
    roughness: 0.22,
    metalness: 0.88,
  },
  aluminum: {
    color: "#dde2ea",
    roughness: 0.24,
    metalness: 0.95,
  },
  copper: {
    color: "#c68440",
    roughness: 0.3,
    metalness: 0.95,
  },
  batteryBlue: {
    color: "#2b66d1",
    roughness: 0.42,
    metalness: 0.45,
  },
  gasketBlue: {
    color: "#2f70e8",
    roughness: 0.45,
    metalness: 0.08,
  },
  lensGlass: {
    color: "#050505",
    transmission: 1,
    opacity: 1,
    roughness: 0,
    ior: 1.5,
  },
} as const;

function CasingMaterial({ active, glow }: { active: boolean; glow: boolean }) {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const targetTransmission = active ? 0.9 : 0;
    const targetOpacity = active ? 0.2 : 1;
    const targetRoughness = active ? 0.1 : 0.65;
    const targetMetalness = active ? 0.08 : 0.3;

    materialRef.current.transmission = THREE.MathUtils.damp(
      materialRef.current.transmission,
      targetTransmission,
      8,
      delta
    );
    materialRef.current.opacity = THREE.MathUtils.damp(
      materialRef.current.opacity,
      targetOpacity,
      8,
      delta
    );
    materialRef.current.roughness = THREE.MathUtils.damp(
      materialRef.current.roughness,
      targetRoughness,
      8,
      delta
    );
    materialRef.current.metalness = THREE.MathUtils.damp(
      materialRef.current.metalness,
      targetMetalness,
      8,
      delta
    );
    materialRef.current.emissiveIntensity = THREE.MathUtils.damp(
      materialRef.current.emissiveIntensity,
      glow ? 0.08 : 0,
      10,
      delta
    );

    const shouldRenderTransparent =
      materialRef.current.transmission > 0.03 || materialRef.current.opacity < 0.98;
    materialRef.current.transparent = shouldRenderTransparent;
    materialRef.current.depthWrite = !shouldRenderTransparent;
  });

  return (
    <meshPhysicalMaterial
      ref={materialRef}
      color="#33363d"
      roughness={0.65}
      metalness={0.3}
      clearcoat={0.05}
      transmission={0}
      opacity={1}
      transparent={false}
      depthWrite
      ior={1.5}
      thickness={0.3}
      emissive={ACCENT}
      emissiveIntensity={0}
    />
  );
}

function HoverOutline({ active }: { active: boolean }) {
  if (!active) return null;
  return <Outlines thickness={2.4} color={ACCENT} transparent opacity={0.88} />;
}

function AnimatedOffsetGroup({
  active,
  offset,
  damping = PART_DAMPING,
  collapsedScale = 0.58,
  children,
}: AnimatedOffsetGroupProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const target = active ? offset : ([0, 0, 0] as Vec3);
    ref.current.position.x = THREE.MathUtils.damp(
      ref.current.position.x,
      target[0],
      damping,
      delta
    );
    ref.current.position.y = THREE.MathUtils.damp(
      ref.current.position.y,
      target[1],
      damping,
      delta
    );
    ref.current.position.z = THREE.MathUtils.damp(
      ref.current.position.z,
      target[2],
      damping,
      delta
    );

    const targetScale = active ? 1 : collapsedScale;
    ref.current.scale.x = THREE.MathUtils.damp(ref.current.scale.x, targetScale, damping, delta);
    ref.current.scale.y = THREE.MathUtils.damp(ref.current.scale.y, targetScale, damping, delta);
    ref.current.scale.z = THREE.MathUtils.damp(ref.current.scale.z, targetScale, damping, delta);
  });

  return <group ref={ref}>{children}</group>;
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
}: ModuleGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isHover = hovered === id;
  const isActive = activeModule === id;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const elapsed = state.clock.getElapsedTime();
    const dropDelay = index * 0.14;
    const introTargetY =
      elapsed < dropDelay ? y + INTRO_DROP_HEIGHT + index * 0.3 : y;

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      introTargetY,
      DROP_DAMPING,
      delta
    );

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      elapsed < dropDelay ? -0.12 : 0,
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
      position={[0, y + INTRO_DROP_HEIGHT + index * 0.3, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
    >
      {children({ isHover, isActive })}
    </group>
  );
}

function BaseModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox name="OuterCasing" args={[4.2, 1.06, 3.1]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <CasingMaterial active={isActive} glow={glow} />
        <HoverOutline active={glow} />
      </RoundedBox>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, -0.26, -0.2]}>
          <mesh position={[0, -0.08, -0.62]} castShadow>
            <boxGeometry args={[3, 0.2, 0.34]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} />
          </mesh>
          <mesh position={[-1.2, -0.02, -0.62]} castShadow>
            <boxGeometry args={[0.2, 0.42, 0.34]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} />
          </mesh>
          <mesh position={[1.2, -0.02, -0.62]} castShadow>
            <boxGeometry args={[0.2, 0.42, 0.34]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} />
          </mesh>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0.52, 0.14, 0.2]}>
          <RoundedBox args={[1.44, 0.09, 0.98]} radius={0.02} smoothness={3} position={[0.1, -0.06, 0.18]}>
            <meshPhysicalMaterial {...MATERIALS.pcbDark} />
          </RoundedBox>
          <RoundedBox args={[0.26, 0.06, 0.26]} radius={0.01} smoothness={3} position={[0.36, 0.02, 0.08]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
          <RoundedBox args={[0.2, 0.05, 0.18]} radius={0.01} smoothness={3} position={[-0.24, 0, 0.26]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[-0.56, 0.12, 0.22]}>
          {[
            [-0.28, -0.04, 0.18],
            [0, -0.04, 0.18],
            [-0.28, -0.04, -0.18],
            [0, -0.04, -0.18],
          ].map((p, i) => (
            <mesh key={i} position={p as Vec3} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.11, 0.11, 0.42, 32]} />
              <meshPhysicalMaterial {...MATERIALS.batteryBlue} />
            </mesh>
          ))}
        </AnimatedOffsetGroup>
      </group>
    </group>
  );
}

function SensorModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox name="OuterCasing" args={[3.8, 1.04, 2.9]} radius={0.07} smoothness={4} castShadow receiveShadow>
        <CasingMaterial active={isActive} glow={glow} />
        <HoverOutline active={glow} />
      </RoundedBox>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, 0, 0.56]}>
          <group position={[0, 0.1, 1.02]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.52, 0.52, 0.2, 64]} />
              <meshPhysicalMaterial {...MATERIALS.aluminum} color="#9aa3b1" />
            </mesh>
            <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.38, 0.38, 0.16, 64]} />
              <meshPhysicalMaterial {...MATERIALS.aluminum} color="#7c8593" />
            </mesh>
            <mesh position={[0, 0, 0.27]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.16, 64]} />
              <meshPhysicalMaterial {...MATERIALS.lensGlass} />
            </mesh>
          </group>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, -0.2, -0.24]}>
          <RoundedBox args={[1.24, 0.08, 0.7]} radius={0.02} smoothness={3} position={[0, -0.1, 0.74]}>
            <meshPhysicalMaterial {...MATERIALS.pcbGreen} />
          </RoundedBox>
          <RoundedBox args={[0.22, 0.06, 0.22]} radius={0.01} smoothness={3} position={[-0.24, -0.02, 0.74]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
          <mesh position={[0.24, -0.02, 0.74]} castShadow>
            <sphereGeometry args={[0.08, 24, 24]} />
            <meshPhysicalMaterial color="#f0f4f8" roughness={0.3} metalness={0.2} transmission={0.55} ior={1.4} />
          </mesh>
          <mesh position={[0.42, -0.06, 0.74]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.14, 24]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} />
          </mesh>
        </AnimatedOffsetGroup>
      </group>
    </group>
  );
}

function ComputeCommModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox name="OuterCasing" args={[3.9, 1.02, 2.9]} radius={0.07} smoothness={4} castShadow receiveShadow>
        <CasingMaterial active={isActive} glow={glow} />
        <HoverOutline active={glow} />
      </RoundedBox>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, -0.24, 0]}>
          <RoundedBox args={[2.5, 0.1, 2]} radius={0.02} smoothness={3} position={[0, -0.08, 0]} castShadow>
            <meshPhysicalMaterial {...MATERIALS.pcbGreen} />
          </RoundedBox>
          <RoundedBox args={[0.56, 0.08, 0.56]} radius={0.02} smoothness={3} position={[0, 0.02, 0]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
          <RoundedBox args={[0.32, 0.07, 0.26]} radius={0.01} smoothness={3} position={[-0.6, 0.01, 0.4]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
          <RoundedBox args={[0.32, 0.07, 0.26]} radius={0.01} smoothness={3} position={[0.66, 0.01, -0.42]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={i} position={[-0.95 + i * 0.1, 0.07, -0.9]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.08, 16]} />
              <meshPhysicalMaterial {...MATERIALS.copper} />
            </mesh>
          ))}
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, 0.36, 0.2]}>
          <RoundedBox args={[1.36, 0.16, 1.02]} radius={0.02} smoothness={3} position={[0, 0.16, 0]} castShadow>
            <meshPhysicalMaterial {...MATERIALS.aluminum} color="#aeb6c1" />
          </RoundedBox>
          <mesh position={[-0.36, 0.18, 0.36]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.52, 14]} />
            <meshPhysicalMaterial {...MATERIALS.copper} />
          </mesh>
          <mesh position={[0.34, 0.18, -0.34]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.48, 14]} />
            <meshPhysicalMaterial {...MATERIALS.copper} />
          </mesh>
          <mesh position={[-0.14, 0.2, 0.06]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.22, 12]} />
            <meshPhysicalMaterial {...MATERIALS.copper} />
          </mesh>
        </AnimatedOffsetGroup>
      </group>
    </group>
  );
}

function AudioModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox name="OuterCasing" args={[3.9, 0.98, 2.9]} radius={0.07} smoothness={4} castShadow receiveShadow>
        <CasingMaterial active={isActive} glow={glow} />
        <HoverOutline active={glow} />
      </RoundedBox>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, -0.18, 0]}>
          <RoundedBox args={[1.56, 0.09, 1.06]} radius={0.02} smoothness={3} position={[0, -0.08, 0]}>
            <meshPhysicalMaterial {...MATERIALS.pcbGreen} color="#195c2b" />
          </RoundedBox>
          <RoundedBox args={[0.34, 0.08, 0.34]} radius={0.01} smoothness={3} position={[0, 0.02, 0]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, 0, 0.5]}>
          <mesh position={[0, 0, 0.98]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.2, 56]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} color="#8f96a3" />
          </mesh>
          <mesh position={[0, 0, 1.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.2, 56]} />
            <meshPhysicalMaterial {...MATERIALS.silicon} color="#23262c" />
          </mesh>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, 0, -0.5]}>
          <mesh position={[0, 0, -0.98]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.2, 56]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} color="#8f96a3" />
          </mesh>
          <mesh position={[0, 0, -1.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.2, 56]} />
            <meshPhysicalMaterial {...MATERIALS.silicon} color="#23262c" />
          </mesh>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, 0.34, 0]}>
          <RoundedBox args={[0.84, 0.07, 0.48]} radius={0.02} smoothness={3} position={[0, 0.2, 0]}>
            <meshPhysicalMaterial {...MATERIALS.pcbDark} />
          </RoundedBox>
          {[-0.26, -0.08, 0.08, 0.26].map((x, i) => (
            <mesh key={i} position={[x, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.08, 16]} />
              <meshPhysicalMaterial {...MATERIALS.copper} color="#d8a12e" />
            </mesh>
          ))}
        </AnimatedOffsetGroup>
      </group>
    </group>
  );
}

function CoverModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox name="OuterCasing" args={[4.1, 0.28, 3.05]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <CasingMaterial active={isActive} glow={glow} />
        <HoverOutline active={glow} />
      </RoundedBox>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, -0.56, 0]}>
          {[
            [-1.74, 0.1, -1.26],
            [1.74, 0.1, -1.26],
            [-1.74, 0.1, 1.26],
            [1.74, 0.1, 1.26],
          ].map((p, i) => (
            <mesh key={i} position={p as Vec3} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.72, 24]} />
              <meshPhysicalMaterial {...MATERIALS.aluminum} />
            </mesh>
          ))}
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, -0.28, 0]}>
          <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.42, 0.055, 28, 92]} />
            <meshPhysicalMaterial {...MATERIALS.gasketBlue} />
          </mesh>
        </AnimatedOffsetGroup>
      </group>
    </group>
  );
}

const RENDERERS: Record<ModuleId, (props: ModuleVisualProps) => JSX.Element> = {
  base: BaseModule,
  sensor: SensorModule,
  compute: ComputeCommModule,
  audio: AudioModule,
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
      {MODULES.map((module, index) => {
        const Renderer = RENDERERS[module.id];

        return (
          <ModuleGroup
            key={module.id}
            id={module.id}
            index={index}
            y={positions[index]}
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
            color="#0055ff"
            lineWidth={2}
            dashed
            dashSize={0.15}
            gapSize={0.1}
            transparent
            opacity={0.6}
          />
        ))}
    </group>
  );
}
