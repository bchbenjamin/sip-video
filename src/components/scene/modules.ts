export type ModuleId = "base" | "sensor" | "compute" | "audio" | "comm" | "cover";

export interface ModuleInfo {
  id: ModuleId;
  title: string;
  height: number;
  technicalData: string;
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  summary: string;
}

export const MODULES: ModuleInfo[] = [
  {
    id: "base",
    title: "Base Enclosure (Power & Mount)",
    height: 1.02,
    technicalData:
      "Integrates SMPS and battery backup. Features rugged pole/wall mounting brackets.",
    leftLabel: "Power Core",
    leftValue: "SMPS input conditioning and backup reserve",
    rightLabel: "Mounting",
    rightValue: "Pole and wall bracket integration rails",
    summary: "Primary ruggedized foundation and power stabilization layer.",
  },
  {
    id: "sensor",
    title: "Visual & Motion Sensor Array",
    height: 1.16,
    technicalData:
      "HD/4K IP Camera and PIR motion sensor for continuous monitoring and threat verification.",
    leftLabel: "Imaging",
    leftValue: "Multi-stage optical barrel and sensor board",
    rightLabel: "Detection",
    rightValue: "PIR dome for non-thermal motion events",
    summary: "Primary visual pipeline with PIR-assisted threat verification.",
  },
  {
    id: "compute",
    title: "Edge Compute Core (Raspberry Pi)",
    height: 0.32,
    technicalData:
      "Raspberry Pi processing unit executing real-time object detection and behavioral anomaly ML models.",
    leftLabel: "Compute",
    leftValue: "On-device inference and anomaly filtering",
    rightLabel: "I/O",
    rightValue: "GPIO and Ethernet/USB interface block",
    summary: "Edge inference tray for low-latency AI decisions.",
  },
  {
    id: "audio",
    title: "Acoustic Deterrent & DSP",
    height: 0.9,
    technicalData:
      "Generates ML-driven acoustic deterrents and analyzes ambient acoustic data (e.g., distress sounds).",
    leftLabel: "Deterrent",
    leftValue: "Dual directional speaker drivers",
    rightLabel: "Capture",
    rightValue: "Top MEMS microphone array and DSP board",
    summary: "Audio output and acoustic intelligence processing module.",
  },
  {
    id: "comm",
    title: "Comm Gateway",
    height: 1.0,
    technicalData:
      "Manages 4G/5G/Wi-Fi telemetry, routing secure REST/MQTT alerts to emergency services.",
    leftLabel: "Telemetry",
    leftValue: "4G/5G and Wi-Fi gateway control",
    rightLabel: "Routing",
    rightValue: "Secure MQTT and REST dispatch integration",
    summary: "Network uplink and emergency routing gateway layer.",
  },
  {
    id: "cover",
    title: "Top Cover",
    height: 0.24,
    technicalData:
      "IP66-rated weather seal with tamper-proof fastening hardware.",
    leftLabel: "Seal",
    leftValue: "Weatherproof mechanical cap",
    rightLabel: "Tamper",
    rightValue: "Fastener lock points and gasket compression",
    summary: "Environmental top seal and tamper-protection assembly.",
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
