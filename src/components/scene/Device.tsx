import { ReactNode, useMemo, useRef } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Cylinder, Outlines, RoundedBox } from "@react-three/drei";
import { motion } from "framer-motion-3d";
import * as THREE from "three";
import { MODULES, ModuleId, computeAssembledY } from "./modules";

type Vec3 = [number, number, number];

interface DeviceProps {
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

const ACCENT = "#d7d9de";
const INTRO_DROP_HEIGHT = 7.2;
const DROP_DAMPING = 10;
const SHELL_TRANSITION = {
  type: "spring",
  stiffness: 132,
  damping: 18,
  mass: 0.88,
};
const INTERNAL_TRANSITION = {
  type: "spring",
  stiffness: 118,
  damping: 16,
  mass: 0.74,
};

const MATERIALS = {
  shell: {
    color: "#333336",
    roughness: 0.8,
    metalness: 0.2,
  },
  shellDark: {
    color: "#242428",
    roughness: 0.82,
    metalness: 0.18,
  },
  pcbGreen: {
    color: "#1b5e20",
    roughness: 0.56,
    metalness: 0.12,
  },
  pcbBlue: {
    color: "#4b5058",
    roughness: 0.48,
    metalness: 0.18,
  },
  pcbRed: {
    color: "#8f2323",
    roughness: 0.5,
    metalness: 0.12,
  },
  silver: {
    color: "#d8dde5",
    roughness: 0.2,
    metalness: 0.8,
  },
  darkMetal: {
    color: "#3e434c",
    roughness: 0.28,
    metalness: 0.74,
  },
  silicon: {
    color: "#111214",
    roughness: 0.32,
    metalness: 0.38,
  },
  lens: {
    color: "#050505",
    roughness: 0,
    metalness: 0.2,
  },
  rubber: {
    color: "#141417",
    roughness: 0.92,
    metalness: 0.04,
  },
  gasket: {
    color: "#6d727b",
    roughness: 0.5,
    metalness: 0.06,
  },
  battery: {
    color: "#6f737b",
    roughness: 0.4,
    metalness: 0.42,
  },
  pir: {
    color: "#f2f4f6",
    roughness: 0.35,
    metalness: 0.04,
  },
} as const;

function HoverOutline({ active }: { active: boolean }) {
  if (!active) return null;
  return <Outlines thickness={1.35} color={ACCENT} transparent opacity={0.42} />;
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

function ShellMat({
  active = false,
  color = MATERIALS.shell.color,
}: {
  active?: boolean;
  color?: string;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={active ? 0.92 : MATERIALS.shell.roughness}
      metalness={active ? 0.06 : MATERIALS.shell.metalness}
      transparent={active}
      opacity={active ? 0.52 : 1}
      depthWrite={!active}
    />
  );
}

function MetalMat({
  color = MATERIALS.silver.color,
  roughness = MATERIALS.silver.roughness,
  metalness = MATERIALS.silver.metalness,
}: {
  color?: string;
  roughness?: number;
  metalness?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
    />
  );
}

function Board({
  args,
  position,
  color,
}: {
  args: Vec3;
  position: Vec3;
  color: string;
}) {
  return (
    <RoundedBox args={args} radius={0.02} smoothness={4} position={position} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.12} />
    </RoundedBox>
  );
}

function Chip({ args, position }: { args: Vec3; position: Vec3 }) {
  return (
    <RoundedBox args={args} radius={0.01} smoothness={3} position={position} castShadow receiveShadow>
      <meshStandardMaterial
        color={MATERIALS.silicon.color}
        roughness={MATERIALS.silicon.roughness}
        metalness={MATERIALS.silicon.metalness}
      />
    </RoundedBox>
  );
}

function BaseModule({ isHover, isActive }: ModuleVisualProps) {
  return (
    <group>
      <motion.group
        name="BaseShell"
        initial={false}
        animate={isActive ? { y: -1.2 } : { y: 0 }}
        transition={SHELL_TRANSITION}
      >
        <RoundedBox
          name="OuterShell"
          args={[4.24, 1.08, 3.18]}
          radius={0.1}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} />
          <HoverOutline active={isHover} />
        </RoundedBox>

        <RoundedBox
          name="IOBlock"
          args={[0.42, 0.34, 0.92]}
          radius={0.05}
          smoothness={4}
          position={[2.08, -0.04, 0.74]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} color={MATERIALS.shellDark.color} />
        </RoundedBox>

        {[
          [-1.62, -0.62, -1.18],
          [1.62, -0.62, -1.18],
          [-1.62, -0.62, 1.18],
          [1.62, -0.62, 1.18],
        ].map((position, index) => (
          <Cylinder
            key={index}
            args={[0.14, 0.14, 0.18, 24]}
            position={position as Vec3}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={MATERIALS.rubber.color}
              roughness={MATERIALS.rubber.roughness}
              metalness={MATERIALS.rubber.metalness}
            />
          </Cylinder>
        ))}
      </motion.group>

      <motion.group
        name="InternalTech"
        initial={false}
        animate={isActive ? { y: 0.18, scale: 1.03 } : { y: 0, scale: 1 }}
        transition={INTERNAL_TRANSITION}
      >
        <Board args={[1.92, 0.1, 1.26]} position={[-0.2, -0.02, 0]} color={MATERIALS.pcbGreen.color} />
        <Chip args={[0.42, 0.08, 0.4]} position={[0.2, 0.08, 0.18]} />
        <RoundedBox
          args={[0.3, 0.08, 0.18]}
          radius={0.01}
          smoothness={3}
          position={[-0.72, 0.06, -0.22]}
          castShadow
          receiveShadow
        >
          <MetalMat color="#c38d3d" roughness={0.28} metalness={0.86} />
        </RoundedBox>

        {[
          [-0.8, -0.06, 0.46],
          [-0.24, -0.06, 0.46],
          [-0.8, -0.06, -0.46],
          [-0.24, -0.06, -0.46],
        ].map((position, index) => (
          <Cylinder
            key={index}
            args={[0.17, 0.17, 0.72, 32]}
            position={position as Vec3}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={MATERIALS.battery.color}
              roughness={MATERIALS.battery.roughness}
              metalness={MATERIALS.battery.metalness}
            />
          </Cylinder>
        ))}
      </motion.group>
    </group>
  );
}

function SensorModule({ isHover, isActive }: ModuleVisualProps) {
  return (
    <group>
      <motion.group
        name="BackShell"
        initial={false}
        animate={isActive ? { z: -1.35 } : { z: 0 }}
        transition={SHELL_TRANSITION}
      >
        <RoundedBox
          args={[3.72, 1.04, 1.34]}
          radius={0.08}
          smoothness={5}
          position={[0, 0, -0.7]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} />
          <HoverOutline active={isHover} />
        </RoundedBox>
      </motion.group>

      <motion.group
        name="FrontPlate"
        initial={false}
        animate={isActive ? { z: 1.8 } : { z: 0 }}
        transition={SHELL_TRANSITION}
      >
        <RoundedBox
          args={[3.72, 1.04, 1.34]}
          radius={0.08}
          smoothness={5}
          position={[0, 0, 0.7]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} color="#38383c" />
          <HoverOutline active={isHover} />
        </RoundedBox>

        <Cylinder
          args={[0.5, 0.5, 0.4, 48]}
          position={[0, 0.18, 1.5]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} color="#15161a" />
        </Cylinder>
        <Cylinder
          args={[0.34, 0.34, 0.22, 48]}
          position={[0, 0.18, 1.72]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} color="#0f1013" />
        </Cylinder>
        <Cylinder
          args={[0.22, 0.22, 0.06, 48]}
          position={[0, 0.18, 1.86]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={MATERIALS.lens.color}
            roughness={MATERIALS.lens.roughness}
            metalness={MATERIALS.lens.metalness}
          />
        </Cylinder>
        <mesh position={[0, -0.24, 1.36]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.22, 30, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={MATERIALS.pir.color}
            roughness={MATERIALS.pir.roughness}
            metalness={MATERIALS.pir.metalness}
          />
        </mesh>
      </motion.group>

      <motion.group
        name="InternalTech"
        initial={false}
        animate={isActive ? { z: 0.12, scale: 1.06 } : { z: 0, scale: 1 }}
        transition={INTERNAL_TRANSITION}
      >
        <Board args={[1.08, 0.08, 0.62]} position={[0, -0.02, 0.38]} color={MATERIALS.pcbRed.color} />
        <Chip args={[0.28, 0.06, 0.24]} position={[-0.22, 0.06, 0.42]} />
        <Chip args={[0.18, 0.05, 0.18]} position={[0.22, 0.06, 0.4]} />
        <Cylinder
          args={[0.05, 0.05, 0.14, 20]}
          position={[0.4, 0.02, 0.38]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <MetalMat color="#c38d3d" roughness={0.26} metalness={0.92} />
        </Cylinder>
      </motion.group>
    </group>
  );
}

function ComputeModule({ isHover, isActive }: ModuleVisualProps) {
  return (
    <group>
      <motion.group
        name="LeftShell"
        initial={false}
        animate={isActive ? { x: -2.06 } : { x: 0 }}
        transition={SHELL_TRANSITION}
      >
        <RoundedBox
          args={[1.96, 1.02, 2.92]}
          radius={0.08}
          smoothness={5}
          position={[-0.98, 0, 0]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} />
          <HoverOutline active={isHover} />
        </RoundedBox>

        {[-0.92, -0.48, -0.04, 0.4, 0.84].map((z, index) => (
          <RoundedBox
            key={index}
            args={[0.09, 0.58, 0.18]}
            radius={0.02}
            smoothness={3}
            position={[-1.92, 0, z]}
            castShadow
            receiveShadow
          >
            <MetalMat />
          </RoundedBox>
        ))}
      </motion.group>

      <motion.group
        name="RightShell"
        initial={false}
        animate={isActive ? { x: 2.06 } : { x: 0 }}
        transition={SHELL_TRANSITION}
      >
        <RoundedBox
          args={[1.96, 1.02, 2.92]}
          radius={0.08}
          smoothness={5}
          position={[0.98, 0, 0]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} color="#38383c" />
          <HoverOutline active={isHover} />
        </RoundedBox>

        {[-0.92, -0.48, -0.04, 0.4, 0.84].map((z, index) => (
          <RoundedBox
            key={index}
            args={[0.09, 0.58, 0.18]}
            radius={0.02}
            smoothness={3}
            position={[1.92, 0, z]}
            castShadow
            receiveShadow
          >
            <MetalMat />
          </RoundedBox>
        ))}
      </motion.group>

      <motion.group
        name="InternalTech"
        initial={false}
        animate={isActive ? { y: 0.06, scale: 1.04 } : { y: 0, scale: 1 }}
        transition={INTERNAL_TRANSITION}
      >
        <Board args={[2.56, 0.1, 1.98]} position={[0, -0.04, 0]} color={MATERIALS.pcbGreen.color} />
        <RoundedBox
          args={[0.7, 0.14, 0.7]}
          radius={0.02}
          smoothness={4}
          position={[0, 0.1, 0]}
          castShadow
          receiveShadow
        >
          <MetalMat />
        </RoundedBox>

        {[
          [-0.78, 0.06, 0.5],
          [-0.78, 0.06, 0.14],
          [-0.78, 0.06, -0.22],
          [0.76, 0.06, 0.5],
          [0.76, 0.06, 0.14],
          [0.76, 0.06, -0.22],
        ].map((position, index) => (
          <Chip key={index} args={[0.28, 0.08, 0.22]} position={position as Vec3} />
        ))}

        <RoundedBox
          args={[0.46, 0.1, 0.3]}
          radius={0.02}
          smoothness={3}
          position={[1.02, 0.08, -0.62]}
          castShadow
          receiveShadow
        >
          <MetalMat color="#aab4c0" roughness={0.28} metalness={0.74} />
        </RoundedBox>
        <RoundedBox
          args={[0.34, 0.1, 0.22]}
          radius={0.02}
          smoothness={3}
          position={[-1.04, 0.08, -0.62]}
          castShadow
          receiveShadow
        >
          <MetalMat color="#c2c8d1" roughness={0.26} metalness={0.72} />
        </RoundedBox>
      </motion.group>
    </group>
  );
}

function AudioModule({ isHover, isActive }: ModuleVisualProps) {
  return (
    <group>
      <group name="MainHousing">
        <RoundedBox
          args={[3.82, 0.98, 1.62]}
          radius={0.07}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} />
          <HoverOutline active={isHover} />
        </RoundedBox>
        <RoundedBox
          args={[3.82, 0.98, 1.62]}
          radius={0.07}
          smoothness={5}
          position={[0, 0, 0.64]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} color="#38383c" />
          <HoverOutline active={isHover} />
        </RoundedBox>

        {[-0.52, -0.18, 0.18, 0.52].map((x, index) => (
          <Cylinder
            key={index}
            args={[0.03, 0.03, 0.08, 18]}
            position={[x, 0.48, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#0b0b0d" roughness={0.9} metalness={0.04} />
          </Cylinder>
        ))}
      </group>

      <motion.group
        name="FrontPlate"
        initial={false}
        animate={isActive ? { z: 1.2 } : { z: 0 }}
        transition={SHELL_TRANSITION}
      >
        <Cylinder
          args={[0.56, 0.56, 0.14, 56]}
          position={[0, 0, 1.48]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} color={MATERIALS.shellDark.color} />
        </Cylinder>
        <Cylinder
          args={[0.46, 0.46, 0.05, 56]}
          position={[0, 0, 1.58]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#818997" roughness={0.3} metalness={0.82} wireframe />
        </Cylinder>
      </motion.group>

      <motion.group
        name="RearPlate"
        initial={false}
        animate={isActive ? { z: -1.2 } : { z: 0 }}
        transition={SHELL_TRANSITION}
      >
        <Cylinder
          args={[0.56, 0.56, 0.14, 56]}
          position={[0, 0, -1.48]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} color={MATERIALS.shellDark.color} />
        </Cylinder>
        <Cylinder
          args={[0.46, 0.46, 0.05, 56]}
          position={[0, 0, -1.58]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#818997" roughness={0.3} metalness={0.82} wireframe />
        </Cylinder>
      </motion.group>

      <motion.group
        name="InternalTech"
        initial={false}
        animate={isActive ? { scale: 1.05 } : { scale: 1 }}
        transition={INTERNAL_TRANSITION}
      >
        <Board args={[1.78, 0.1, 1.14]} position={[0, -0.06, 0]} color={MATERIALS.pcbBlue.color} />
        <Chip args={[0.38, 0.08, 0.34]} position={[0, 0.04, 0]} />

        <group>
          <Cylinder
            args={[0.34, 0.34, 0.28, 56]}
            position={[0, 0, 0.82]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
          >
            <MetalMat />
          </Cylinder>
          <Cylinder
            args={[0.26, 0.26, 0.22, 56]}
            position={[0, 0, 1.02]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
          >
            <MetalMat
              color={MATERIALS.darkMetal.color}
              roughness={MATERIALS.darkMetal.roughness}
              metalness={MATERIALS.darkMetal.metalness}
            />
          </Cylinder>
        </group>

        <group>
          <Cylinder
            args={[0.34, 0.34, 0.28, 56]}
            position={[0, 0, -0.82]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
          >
            <MetalMat />
          </Cylinder>
          <Cylinder
            args={[0.26, 0.26, 0.22, 56]}
            position={[0, 0, -1.02]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
            receiveShadow
          >
            <MetalMat
              color={MATERIALS.darkMetal.color}
              roughness={MATERIALS.darkMetal.roughness}
              metalness={MATERIALS.darkMetal.metalness}
            />
          </Cylinder>
        </group>
      </motion.group>
    </group>
  );
}

function CoverModule({ isHover, isActive }: ModuleVisualProps) {
  return (
    <group>
      {[
        [-1.72, 0.22, -1.26],
        [1.72, 0.22, -1.26],
        [-1.72, 0.22, 1.26],
        [1.72, 0.22, 1.26],
      ].map((position, index) => (
        <motion.group
          key={index}
          name={`Screw${index + 1}`}
          initial={false}
          animate={isActive ? { y: 1.1 } : { y: 0 }}
          transition={SHELL_TRANSITION}
        >
          <Cylinder
            args={[0.07, 0.07, 0.2, 24]}
            position={position as Vec3}
            castShadow
            receiveShadow
          >
            <MetalMat />
          </Cylinder>
        </motion.group>
      ))}

      <motion.group
        name="TopLid"
        initial={false}
        animate={isActive ? { y: 1.54 } : { y: 0 }}
        transition={SHELL_TRANSITION}
      >
        <RoundedBox
          args={[4.12, 0.3, 3.06]}
          radius={0.08}
          smoothness={5}
          castShadow
          receiveShadow
        >
          <ShellMat active={isActive} />
          <HoverOutline active={isHover} />
        </RoundedBox>
      </motion.group>

      <motion.group
        name="InternalTech"
        initial={false}
        animate={isActive ? { y: -0.06 } : { y: 0 }}
        transition={INTERNAL_TRANSITION}
      >
        <RoundedBox
          args={[2.62, 0.04, 0.08]}
          radius={0.02}
          smoothness={3}
          position={[0, -0.06, 1.16]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={MATERIALS.gasket.color}
            roughness={MATERIALS.gasket.roughness}
            metalness={MATERIALS.gasket.metalness}
          />
        </RoundedBox>
        <RoundedBox
          args={[2.62, 0.04, 0.08]}
          radius={0.02}
          smoothness={3}
          position={[0, -0.06, -1.16]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={MATERIALS.gasket.color}
            roughness={MATERIALS.gasket.roughness}
            metalness={MATERIALS.gasket.metalness}
          />
        </RoundedBox>
        <RoundedBox
          args={[0.08, 0.04, 2.26]}
          radius={0.02}
          smoothness={3}
          position={[1.28, -0.06, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={MATERIALS.gasket.color}
            roughness={MATERIALS.gasket.roughness}
            metalness={MATERIALS.gasket.metalness}
          />
        </RoundedBox>
        <RoundedBox
          args={[0.08, 0.04, 2.26]}
          radius={0.02}
          smoothness={3}
          position={[-1.28, -0.06, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={MATERIALS.gasket.color}
            roughness={MATERIALS.gasket.roughness}
            metalness={MATERIALS.gasket.metalness}
          />
        </RoundedBox>
      </motion.group>
    </group>
  );
}

const RENDERERS: Record<ModuleId, (props: ModuleVisualProps) => ReactNode> = {
  base: BaseModule,
  sensor: SensorModule,
  compute: ComputeModule,
  audio: AudioModule,
  cover: CoverModule,
};

export default function Device({
  hovered,
  activeModule,
  setHovered,
  setActiveModule,
}: DeviceProps) {
  const assembled = useMemo(() => computeAssembledY(), []);

  const totalAssembled =
    assembled[assembled.length - 1] + MODULES[MODULES.length - 1].height / 2;
  const yOffset = -totalAssembled / 2;

  const positions = MODULES.map((_, i) => assembled[i] + yOffset);

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
    </group>
  );
}
