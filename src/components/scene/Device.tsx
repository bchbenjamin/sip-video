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

const ACCENT = "#0055ff";
const DROP_DAMPING = 10;
const PART_DAMPING = 9;
const INTRO_DROP_HEIGHT = 7.6;

const MATERIALS = {
  ruggedHousing: {
    color: "#333336",
    roughness: 0.85,
    metalness: 0.2,
    clearcoat: 0,
  },
  opticalGlass: {
    color: "#050505",
    transmission: 1,
    opacity: 1,
    roughness: 0,
    ior: 1.5,
  },
  pcbBoard: {
    color: "#1b5e20",
    roughness: 0.6,
    metalness: 0.1,
  },
  silicon: {
    color: "#111111",
    roughness: 0.2,
    metalness: 0.8,
  },
  fasteners: {
    color: "#cccccc",
    roughness: 0.3,
    metalness: 0.9,
  },
} as const;

function HousingMaterial({ glow }: { glow: boolean }) {
  return (
    <meshPhysicalMaterial
      {...MATERIALS.ruggedHousing}
      emissive={ACCENT}
      emissiveIntensity={glow ? 0.14 : 0}
    />
  );
}

interface AnimatedOffsetGroupProps {
  active: boolean;
  offset: Vec3;
  damping?: number;
  children: ReactNode;
}

function AnimatedOffsetGroup({
  active,
  offset,
  damping = PART_DAMPING,
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
  });

  return <group ref={ref}>{children}</group>;
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
      elapsed < dropDelay ? y + INTRO_DROP_HEIGHT + index * 0.34 : y;

    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      introTargetY,
      DROP_DAMPING,
      delta
    );

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      elapsed < dropDelay ? -0.14 : 0,
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
      position={[0, y + INTRO_DROP_HEIGHT + index * 0.34, 0]}
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
  return <Outlines thickness={2.4} color={ACCENT} transparent opacity={0.9} />;
}

interface ModuleVisualProps {
  isHover: boolean;
  isActive: boolean;
}

function BaseModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox args={[4, 0.92, 3]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <HousingMaterial glow={glow} />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      {[
        [-1.78, -0.56, -1.28],
        [1.78, -0.56, -1.28],
        [-1.78, -0.56, 1.28],
        [1.78, -0.56, 1.28],
      ].map((p, i) => (
        <mesh key={i} position={p as Vec3} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.18, 42]} />
          <meshPhysicalMaterial color="#161616" roughness={0.95} metalness={0.02} />
        </mesh>
      ))}

      <AnimatedOffsetGroup active={isActive} offset={[0.72, 0.2, 0]}>
        <group position={[1.92, -0.06, 0.52]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[0.62, 0.44]} />
            <meshPhysicalMaterial {...MATERIALS.pcbBoard} />
          </mesh>

          {[
            [-0.18, 0.08, -0.1],
            [0, 0.09, 0],
            [0.18, 0.1, 0.1],
          ].map((p, i) => (
            <mesh key={i} position={p as Vec3} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.16, 28]} />
              <meshPhysicalMaterial {...MATERIALS.fasteners} />
            </mesh>
          ))}
        </group>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[-0.82, 0.2, 0.3]}>
        <group position={[0, -0.14, -0.24]}>
          {[-0.36, -0.12, 0.12, 0.36].map((x, i) => (
            <mesh key={i} position={[x, 0, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.44, 36]} />
              <meshPhysicalMaterial
                {...MATERIALS.fasteners}
                color="#2f64c6"
                roughness={0.45}
                metalness={0.46}
              />
            </mesh>
          ))}
        </group>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0, -0.55]}>
        <group position={[0, -0.04, -1.58]}>
          {[-1.16, 1.16].map((x, i) => (
            <group key={i} position={[x, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.12, 0.52, 0.2]} />
                <meshPhysicalMaterial {...MATERIALS.fasteners} />
              </mesh>
              <mesh position={[0, -0.18, -0.2]} castShadow>
                <boxGeometry args={[0.4, 0.12, 0.32]} />
                <meshPhysicalMaterial {...MATERIALS.fasteners} />
              </mesh>
            </group>
          ))}
        </group>
      </AnimatedOffsetGroup>
    </group>
  );
}

function SensorModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox args={[3.8, 1.08, 2.8]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <HousingMaterial glow={glow} />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0, 0.56]}>
        <group position={[0, 0.12, 1.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.54, 0.54, 0.34, 64]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} color="#919aa8" />
          </mesh>

          <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.26, 64]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} color="#777f8d" />
          </mesh>

          <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.24, 0.18, 64]} />
            <meshPhysicalMaterial {...MATERIALS.opticalGlass} />
          </mesh>

          <mesh position={[0.72, 0.08, 0.18]}>
            <sphereGeometry args={[0.05, 24, 24]} />
            <meshPhysicalMaterial
              color="#210000"
              emissive="#ff1a1a"
              emissiveIntensity={1.35}
              roughness={0.35}
              metalness={0.05}
            />
          </mesh>
        </group>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0, -0.18, 0.28]}>
        <mesh position={[0, -0.28, 1.06]} castShadow>
          <sphereGeometry args={[0.22, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#f2f4f7"
            roughness={0.52}
            metalness={0.08}
            transmission={0.2}
            ior={1.4}
          />
        </mesh>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0.14, -0.34]}>
        <RoundedBox args={[1.24, 0.08, 0.72]} radius={0.02} smoothness={4} position={[0, 0.02, 0.9]}>
          <meshPhysicalMaterial {...MATERIALS.pcbBoard} />
        </RoundedBox>

        <RoundedBox
          args={[0.28, 0.05, 0.28]}
          radius={0.01}
          smoothness={4}
          position={[0, 0.1, 0.9]}
        >
          <meshPhysicalMaterial {...MATERIALS.silicon} />
        </RoundedBox>
      </AnimatedOffsetGroup>
    </group>
  );
}

function ComputeModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox args={[2.9, 0.22, 2.3]} radius={0.03} smoothness={4} position={[0, -0.08, 0]} castShadow>
        <HousingMaterial glow={glow} />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <AnimatedOffsetGroup active={isActive} offset={[0, -0.14, 0]}>
        <RoundedBox args={[2.56, 0.08, 2.02]} radius={0.02} smoothness={4} position={[0, 0.03, 0]} castShadow>
          <meshPhysicalMaterial {...MATERIALS.pcbBoard} />
        </RoundedBox>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0.24, 0]}>
        <RoundedBox args={[0.62, 0.1, 0.62]} radius={0.02} smoothness={4} position={[0, 0.12, 0]} castShadow>
          <meshPhysicalMaterial {...MATERIALS.fasteners} />
        </RoundedBox>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0.36, 0.15, 0]}>
        <RoundedBox
          args={[0.34, 0.07, 0.28]}
          radius={0.01}
          smoothness={4}
          position={[-0.38, 0.09, 0.42]}
        >
          <meshPhysicalMaterial {...MATERIALS.silicon} />
        </RoundedBox>
        <RoundedBox
          args={[0.34, 0.07, 0.28]}
          radius={0.01}
          smoothness={4}
          position={[0.42, 0.09, -0.42]}
        >
          <meshPhysicalMaterial {...MATERIALS.silicon} />
        </RoundedBox>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[-0.28, 0.1, 0]}>
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={i} position={[-0.72 + i * 0.095, 0.11, -0.9]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.1, 18]} />
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </mesh>
        ))}
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0.45, 0.12, 0]}>
        <RoundedBox args={[0.26, 0.18, 0.24]} radius={0.01} smoothness={4} position={[1.24, 0.04, -0.28]}>
          <meshPhysicalMaterial {...MATERIALS.fasteners} />
        </RoundedBox>
        <RoundedBox args={[0.26, 0.18, 0.24]} radius={0.01} smoothness={4} position={[1.24, 0.04, 0.1]}>
          <meshPhysicalMaterial {...MATERIALS.fasteners} />
        </RoundedBox>
      </AnimatedOffsetGroup>
    </group>
  );
}

function AudioModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox args={[3.8, 0.86, 2.8]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <HousingMaterial glow={glow} />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0, 0.42]}>
        <group position={[0, 0, 1.32]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.56, 0.56, 0.12, 64]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} color="#8b919c" />
          </mesh>

          <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.08, 64]} />
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </mesh>

          {Array.from({ length: 7 }).map((_, i) => (
            <RoundedBox
              key={i}
              args={[0.84, 0.02, 0.05]}
              radius={0.006}
              smoothness={3}
              position={[0, -0.18 + i * 0.06, 0.16]}
            >
              <meshPhysicalMaterial {...MATERIALS.fasteners} color="#9fa6b2" />
            </RoundedBox>
          ))}
        </group>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0, -0.42]}>
        <group position={[0, 0, -1.32]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.56, 0.56, 0.12, 64]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} color="#8b919c" />
          </mesh>

          <mesh position={[0, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.42, 0.08, 64]} />
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </mesh>

          {Array.from({ length: 7 }).map((_, i) => (
            <RoundedBox
              key={i}
              args={[0.84, 0.02, 0.05]}
              radius={0.006}
              smoothness={3}
              position={[0, -0.18 + i * 0.06, -0.16]}
            >
              <meshPhysicalMaterial {...MATERIALS.fasteners} color="#9fa6b2" />
            </RoundedBox>
          ))}
        </group>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0.16, 0]}>
        {[
          [-0.3, 0.43, -0.3],
          [0.3, 0.43, -0.3],
          [-0.3, 0.43, 0.3],
          [0.3, 0.43, 0.3],
        ].map((p, i) => (
          <mesh key={i} position={p as Vec3}>
            <sphereGeometry args={[0.045, 20, 20]} />
            <meshPhysicalMaterial {...MATERIALS.silicon} />
          </mesh>
        ))}
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0.24, 0]}>
        <RoundedBox args={[1.1, 0.08, 0.74]} radius={0.02} smoothness={4} position={[0, 0.08, 0]}>
          <meshPhysicalMaterial
            {...MATERIALS.pcbBoard}
            color="#18539b"
            roughness={0.58}
            metalness={0.15}
          />
        </RoundedBox>
      </AnimatedOffsetGroup>
    </group>
  );
}

function CommModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox args={[3.8, 1, 2.8]} radius={0.05} smoothness={4} castShadow receiveShadow>
        <HousingMaterial glow={glow} />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0.36, 0]}>
        <group position={[-1.5, 0.82, -1.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.2, 0.4, 28]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} color="#7d8694" />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.11, 1.04, 28]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} color="#7d8694" />
          </mesh>
        </group>

        <group position={[1.5, 0.82, -1.02]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.2, 0.4, 28]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} color="#7d8694" />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.11, 1.04, 28]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} color="#7d8694" />
          </mesh>
        </group>
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[0, 0, 0.22]}>
        {[
          { x: -0.25, color: "#00ff66" },
          { x: 0, color: "#00a3ff" },
          { x: 0.25, color: "#ffd600" },
        ].map((led, i) => (
          <mesh key={i} position={[led.x, 0.1, 1.46]}>
            <sphereGeometry args={[0.05, 20, 20]} />
            <meshPhysicalMaterial
              color="#1c1c1c"
              emissive={led.color}
              emissiveIntensity={1.35}
              roughness={0.25}
              metalness={0.1}
            />
          </mesh>
        ))}
      </AnimatedOffsetGroup>

      <AnimatedOffsetGroup active={isActive} offset={[-0.36, 0.18, 0]}>
        <RoundedBox args={[0.88, 0.24, 0.72]} radius={0.02} smoothness={4} position={[0.28, 0, 0]}> 
          <meshPhysicalMaterial {...MATERIALS.fasteners} />
        </RoundedBox>
      </AnimatedOffsetGroup>
    </group>
  );
}

function CoverModule({ isHover, isActive }: ModuleVisualProps) {
  const glow = isHover || isActive;

  return (
    <group>
      <RoundedBox args={[4, 0.24, 3]} radius={0.07} smoothness={4} castShadow receiveShadow>
        <HousingMaterial glow={glow} />
        <HoverOutline isActive={glow} />
      </RoundedBox>

      {[
        [-1.78, 0.14, -1.28],
        [1.78, 0.14, -1.28],
        [-1.78, 0.14, 1.28],
        [1.78, 0.14, 1.28],
      ].map((p, i) => (
        <AnimatedOffsetGroup key={i} active={isActive} offset={[0, 0.36, 0]}>
          <mesh position={p as Vec3} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.08, 36]} />
            <meshPhysicalMaterial {...MATERIALS.fasteners} />
          </mesh>
        </AnimatedOffsetGroup>
      ))}
    </group>
  );
}

const RENDERERS: Record<ModuleId, (props: ModuleVisualProps) => JSX.Element> = {
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
            opacity={0.8}
          />
        ))}
    </group>
  );
}
