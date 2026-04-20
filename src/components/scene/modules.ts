export type ModuleId = "base" | "sensor" | "compute" | "audio" | "comm" | "cover";

export interface ModuleInfo {
  id: ModuleId;
  title: string;
  height: number;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  summary: string;
}

export const MODULES: ModuleInfo[] = [
  {
    id: "base",
    title: "Rugged Exterior Base",
    height: 1,
    leftLabel: "Protection",
    leftValue: "IP66 shell and vibration-damped feet",
    rightLabel: "Interfaces",
    rightValue: "Service I/O plus solar or mains inlet",
    summary: "Primary weather-sealed chassis and deployment foundation.",
  },
  {
    id: "sensor",
    title: "Visual and Motion Sensor Array",
    height: 1.2,
    leftLabel: "Imaging",
    leftValue: "Multi-element HD lens stack with anti-glare hood",
    rightLabel: "Motion",
    rightValue: "Wide-angle PIR dome for low-power trigger events",
    summary: "Front-facing camera optics and PIR sensing for scene capture.",
  },
  {
    id: "compute",
    title: "Raspberry Pi Compute Core",
    height: 0.1,
    leftLabel: "Processing",
    leftValue: "Edge AI inferencing and event filtering",
    rightLabel: "Expansion",
    rightValue: "GPIO header for external module integration",
    summary: "On-board compute plane that runs local decision logic.",
  },
  {
    id: "audio",
    title: "Acoustic Deterrent and DSP",
    height: 0.8,
    leftLabel: "Output",
    leftValue: "Dual directional speaker chambers",
    rightLabel: "Input",
    rightValue: "Top mic array for acoustic scene analysis",
    summary: "Audio deterrence and environmental sound monitoring module.",
  },
  {
    id: "comm",
    title: "Comm and Power Management",
    height: 1,
    leftLabel: "Network",
    leftValue: "Dual LTE or Wi-Fi antenna channels",
    rightLabel: "Power",
    rightValue: "Battery buffer visible through side diagnostics window",
    summary: "Connectivity gateway and regulated internal power routing.",
  },
  {
    id: "cover",
    title: "Weatherproof Top Cover",
    height: 0.2,
    leftLabel: "Security",
    leftValue: "Tamper-resistant screw points",
    rightLabel: "Shielding",
    rightValue: "Sealed cap with passive vent relief",
    summary: "Top environmental seal for long-term outdoor deployment.",
  },
];

export const MODULE_BY_ID: Record<ModuleId, ModuleInfo> = MODULES.reduce(
  (acc, module) => {
    acc[module.id] = module;
    return acc;
  },
  {} as Record<ModuleId, ModuleInfo>
);

const ASSEMBLED_GAP = 0.08;
const EXPLODED_GAP = 1.1;

function computeYPositions(gap: number): number[] {
  const positions: number[] = [];
  let cursor = 0;

  for (const module of MODULES) {
    const centerY = cursor + module.height / 2;
    positions.push(centerY);
    cursor += module.height + gap;
  }

  return positions;
}

export function computeAssembledY(): number[] {
  return computeYPositions(ASSEMBLED_GAP);
}

export function computeExplodedY(): number[] {
  return computeYPositions(EXPLODED_GAP);
}
