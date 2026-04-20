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
const SOLID_CASING_COLOR = "#333336";
const GHOST_CASING_COLOR = new THREE.Color("#ffffff");

const MATERIALS = {
  pcbGreen: {
    color: "#1b5e20",
    roughness: 0.56,
    metalness: 0.12,
  },
  pcbRed: {
    color: "#8f1d1d",
    roughness: 0.52,
    metalness: 0.12,
  },
  pcbBlue: {
    color: "#2d61bd",
    roughness: 0.5,
    metalness: 0.16,
  },
  pcbDark: {
    color: "#1f2730",
    roughness: 0.6,
    metalness: 0.16,
  },
  silicon: {
    color: "#111111",
    roughness: 0.28,
    metalness: 0.84,
  },
  aluminum: {
    color: "#dde2ea",
    roughness: 0.24,
    metalness: 0.94,
  },
  darkMetal: {
    color: "#4a515d",
    roughness: 0.34,
    metalness: 0.82,
  },
  rubber: {
    color: "#161619",
    roughness: 0.9,
    metalness: 0.08,
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

function CasingMaterial({
  active,
  solidColor = SOLID_CASING_COLOR,
  solidRoughness = 0.8,
  solidMetalness = 0.2,
}: {
  active: boolean;
  solidColor?: string;
  solidRoughness?: number;
  solidMetalness?: number;
}) {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const solidColorRef = useMemo(() => new THREE.Color(solidColor), [solidColor]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const targetTransmission = active ? 0.95 : 0;
    const targetOpacity = 1;
    const targetRoughness = active ? 0.1 : solidRoughness;
    const targetMetalness = active ? 0.1 : solidMetalness;

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
    materialRef.current.color.lerp(
      active ? GHOST_CASING_COLOR : solidColorRef,
      1 - Math.exp(-8 * delta)
    );

    const shouldRenderTransparent = active || materialRef.current.transmission > 0.02;
    materialRef.current.transparent = shouldRenderTransparent;
    materialRef.current.depthWrite = !shouldRenderTransparent;
  });

  return (
    <meshPhysicalMaterial
      ref={materialRef}
      color={solidColor}
      roughness={solidRoughness}
      metalness={solidMetalness}
      clearcoat={0.08}
      transmission={0}
      opacity={1}
      transparent={false}
      depthWrite
      ior={1.5}
      thickness={0.5}
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
  collapsedScale = 0.62,
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
      <group name="ExternalCasing">
        <RoundedBox name="MainHousing" args={[4.2, 1.06, 3.1]} radius={0.08} smoothness={4} castShadow receiveShadow>
          <CasingMaterial active={isActive} />
          <HoverOutline active={glow} />
        </RoundedBox>

        {[
          [-1.58, -0.62, -1.18],
          [1.58, -0.62, -1.18],
          [-1.58, -0.62, 1.18],
          [1.58, -0.62, 1.18],
        ].map((position, index) => (
          <mesh key={index} position={position as Vec3} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.18, 24]} />
            <meshPhysicalMaterial {...MATERIALS.rubber} />
          </mesh>
        ))}

        <RoundedBox
          name="IOPortBlock"
          args={[0.34, 0.26, 0.78]}
          radius={0.03}
          smoothness={3}
          position={[2.08, -0.08, 0.84]}
          castShadow
          receiveShadow
        >
          <CasingMaterial active={isActive} solidColor="#2a2a2d" solidRoughness={0.72} solidMetalness={0.24} />
        </RoundedBox>
      </group>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0.36, -0.16, 0.2]}>
          <RoundedBox args={[1.72, 0.1, 1.18]} radius={0.02} smoothness={3} position={[0.26, -0.08, 0.2]}>
            <meshPhysicalMaterial {...MATERIALS.pcbGreen} color="#1b5e20" />
          </RoundedBox>
          <RoundedBox args={[0.36, 0.08, 0.34]} radius={0.01} smoothness={3} position={[0.62, 0.01, 0.12]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[-0.64, 0.08, -0.2]}>
          {[
            [-0.3, -0.04, 0.2],
            [0, -0.04, 0.2],
            [-0.3, -0.04, -0.2],
            [0, -0.04, -0.2],
          ].map((p, i) => (
            <mesh key={i} position={p as Vec3} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.1, 0.54, 32]} />
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
      <group name="ExternalCasing">
        <RoundedBox name="MainHousing" args={[3.8, 1.04, 2.9]} radius={0.07} smoothness={4} castShadow receiveShadow>
          <CasingMaterial active={isActive} />
          <HoverOutline active={glow} />
        </RoundedBox>

        <mesh position={[0, 0.18, 1.52]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.36, 64]} />
          <CasingMaterial active={isActive} solidColor="#0f1013" solidRoughness={0.68} solidMetalness={0.22} />
        </mesh>
        <mesh position={[0, 0.18, 1.68]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.18, 64]} />
          <CasingMaterial active={isActive} solidColor="#181a1f" solidRoughness={0.62} solidMetalness={0.28} />
        </mesh>
        <mesh position={[0, 0.18, 1.79]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.06, 64]} />
          <meshPhysicalMaterial {...MATERIALS.lensGlass} />
        </mesh>

        <mesh position={[0, -0.22, 1.33]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <sphereGeometry args={[0.18, 30, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <CasingMaterial active={isActive} solidColor="#f2f4f6" solidRoughness={0.35} solidMetalness={0.05} />
        </mesh>

        <mesh position={[0.5, 0.36, 1.38]} castShadow>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color="#550000" emissive="#ff2a2a" emissiveIntensity={1.3} />
        </mesh>
      </group>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, -0.18, 0.42]}>
          <RoundedBox args={[1.04, 0.08, 0.56]} radius={0.02} smoothness={3} position={[0, -0.08, 0.86]}>
            <meshPhysicalMaterial {...MATERIALS.pcbRed} color="#8a1f20" />
          </RoundedBox>
          <RoundedBox args={[0.24, 0.06, 0.22]} radius={0.01} smoothness={3} position={[-0.24, -0.01, 0.86]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
          <RoundedBox args={[0.18, 0.05, 0.16]} radius={0.01} smoothness={3} position={[0.18, 0.01, 0.86]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
          <mesh position={[0.36, -0.02, 0.86]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.12, 24]} />
            <meshPhysicalMaterial {...MATERIALS.copper} />
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
      <group name="ExternalCasing">
        <RoundedBox name="MainHousing" args={[3.9, 1.02, 2.9]} radius={0.07} smoothness={4} castShadow receiveShadow>
          <CasingMaterial active={isActive} />
          <HoverOutline active={glow} />
        </RoundedBox>

        {[-0.9, -0.5, -0.1, 0.3, 0.7].map((z, index) => (
          <group key={index}>
            <RoundedBox
              args={[0.08, 0.56, 0.2]}
              radius={0.02}
              smoothness={2}
              position={[1.86, 0, z]}
              castShadow
            >
              <meshPhysicalMaterial {...MATERIALS.aluminum} color="#9da7b5" />
            </RoundedBox>
            <RoundedBox
              args={[0.08, 0.56, 0.2]}
              radius={0.02}
              smoothness={2}
              position={[-1.86, 0, z]}
              castShadow
            >
              <meshPhysicalMaterial {...MATERIALS.aluminum} color="#9da7b5" />
            </RoundedBox>
          </group>
        ))}

        {[-0.56, 0.56].map((x, index) => (
          <group key={index} position={[x, 0.98, -1.1]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.12, 24]} />
              <CasingMaterial active={isActive} solidColor="#25272d" solidRoughness={0.6} solidMetalness={0.28} />
            </mesh>
            <mesh position={[0, 0.68, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 1.3, 26]} />
              <CasingMaterial active={isActive} solidColor="#1a1b1f" solidRoughness={0.55} solidMetalness={0.25} />
            </mesh>
          </group>
        ))}
      </group>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, -0.22, 0.08]}>
          <RoundedBox args={[2.54, 0.1, 1.98]} radius={0.02} smoothness={3} position={[0, -0.08, 0]} castShadow>
            <meshPhysicalMaterial {...MATERIALS.pcbGreen} color="#1b5e20" />
          </RoundedBox>
          <RoundedBox args={[0.62, 0.12, 0.62]} radius={0.02} smoothness={3} position={[0, 0.03, 0]}>
            <meshPhysicalMaterial {...MATERIALS.aluminum} color="#d9dee5" />
          </RoundedBox>

          {[
            [-0.74, 0.02, 0.46],
            [-0.74, 0.02, 0.12],
            [-0.74, 0.02, -0.22],
            [0.74, 0.02, 0.46],
            [0.74, 0.02, 0.12],
            [0.74, 0.02, -0.22],
          ].map((p, i) => (
            <RoundedBox key={i} args={[0.26, 0.08, 0.2]} radius={0.01} smoothness={2} position={p as Vec3}>
              <meshPhysicalMaterial {...MATERIALS.silicon} />
            </RoundedBox>
          ))}
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, 0.36, 0.26]}>
          <RoundedBox args={[1.28, 0.12, 0.92]} radius={0.02} smoothness={3} position={[0, 0.15, 0]} castShadow>
            <meshPhysicalMaterial {...MATERIALS.aluminum} color="#c4cbd6" />
          </RoundedBox>
          <RoundedBox args={[0.36, 0.08, 0.26]} radius={0.01} smoothness={2} position={[-0.24, 0.23, 0.18]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
          <RoundedBox args={[0.28, 0.08, 0.2]} radius={0.01} smoothness={2} position={[0.28, 0.23, -0.16]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
        </AnimatedOffsetGroup>
      </group>
    </group>
  );
}

function AudioModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <group name="ExternalCasing">
        <RoundedBox name="MainHousing" args={[3.9, 0.98, 2.9]} radius={0.07} smoothness={4} castShadow receiveShadow>
          <CasingMaterial active={isActive} />
          <HoverOutline active={glow} />
        </RoundedBox>

        {[1, -1].map((zSign, index) => (
          <group key={index}>
            <mesh position={[0, 0, zSign * 1.46]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.52, 0.52, 0.14, 56]} />
              <CasingMaterial active={isActive} solidColor="#24262b" solidRoughness={0.72} solidMetalness={0.18} />
            </mesh>
            <mesh position={[0, 0, zSign * 1.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.44, 0.44, 0.04, 56]} />
              <meshStandardMaterial color="#808896" roughness={0.34} metalness={0.82} wireframe />
            </mesh>
          </group>
        ))}

        {[-0.48, -0.16, 0.16, 0.48].map((x, index) => (
          <mesh key={index} position={[x, 0.47, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 18]} />
            <meshPhysicalMaterial color="#0b0b0d" roughness={0.88} metalness={0.05} />
          </mesh>
        ))}
      </group>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, -0.16, 0]}>
          <RoundedBox args={[1.72, 0.1, 1.12]} radius={0.02} smoothness={3} position={[0, -0.08, 0]}>
            <meshPhysicalMaterial {...MATERIALS.pcbBlue} color="#2d61bd" />
          </RoundedBox>
          <RoundedBox args={[0.36, 0.08, 0.34]} radius={0.01} smoothness={3} position={[0, 0.01, 0]}>
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </RoundedBox>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, 0.02, 0.46]}>
          <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.26, 56]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} color="#9ba2ae" />
          </mesh>
          <mesh position={[0, 0, 1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.2, 56]} />
            <meshPhysicalMaterial {...MATERIALS.darkMetal} color="#3b404a" />
          </mesh>
        </AnimatedOffsetGroup>

        <AnimatedOffsetGroup active={isActive} offset={[0, 0.02, -0.46]}>
          <mesh position={[0, 0, -0.9]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.26, 56]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} color="#9ba2ae" />
          </mesh>
          <mesh position={[0, 0, -1.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.2, 56]} />
            <meshPhysicalMaterial {...MATERIALS.darkMetal} color="#3b404a" />
          </mesh>
        </AnimatedOffsetGroup>
      </group>
    </group>
  );
}

function CoverModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <group name="ExternalCasing">
        <RoundedBox name="MainHousing" args={[4.1, 0.28, 3.05]} radius={0.08} smoothness={4} castShadow receiveShadow>
          <CasingMaterial active={isActive} />
          <HoverOutline active={glow} />
        </RoundedBox>

        {[
          [-1.74, 0.22, -1.26],
          [1.74, 0.22, -1.26],
          [-1.74, 0.22, 1.26],
          [1.74, 0.22, 1.26],
        ].map((p, i) => (
          <mesh key={i} position={p as Vec3} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.18, 24]} />
            <meshPhysicalMaterial {...MATERIALS.aluminum} color="#d9dfe8" />
          </mesh>
        ))}
      </group>

      <group name="InternalTech">
        <AnimatedOffsetGroup active={isActive} offset={[0, -0.22, 0]}>
          <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.42, 0.03, 28, 92]} />
            <meshPhysicalMaterial {...MATERIALS.gasketBlue} color="#2f70e8" />
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
