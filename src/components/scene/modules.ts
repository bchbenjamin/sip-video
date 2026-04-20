export type ModuleId = "base" | "sensor" | "compute" | "audio" | "cover";

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
    title: "Base Enclosure & Power",
    height: 1.06,
    technicalData:
      "Mounting backplane and SMPS battery-routing core for sealed field deployment reliability.",
    leftLabel: "Backplane",
    leftValue: "Rigid metallic mounting and interface bracket",
    rightLabel: "Power",
    rightValue: "Battery backup cells plus dark routing PCB",
    summary: "Physical foundation with internal mounting and power management stack.",
  },
  {
    id: "sensor",
    title: "Camera & Sensor Assembly",
    height: 1.04,
    technicalData:
      "High-resolution non-thermal video ingress with PIR and ultrasonic fusion for early trigger detection.",
    leftLabel: "Optics",
    leftValue: "Stacked lens cylinders for high-res capture",
    rightLabel: "Motion",
    rightValue: "PIR and ultrasonic sensing board",
    summary: "Forward visual and motion ingress stack for threat acquisition.",
  },
  {
    id: "compute",
    title: "Raspberry Pi & Comm Core",
    height: 1.02,
    technicalData:
      "Raspberry Pi edge core runs YOLO/CNN inference and secure 4G/LTE-Wi-Fi dispatch with sub-500ms alert targeting.",
    leftLabel: "Compute",
    leftValue: "Green main logic board with AI runtime",
    rightLabel: "Comm",
    rightValue: "Docked silver 4G/LTE and Wi-Fi uplink module",
    summary: "Combined edge inference and secure communications backbone.",
  },
  {
    id: "audio",
    title: "Audio & DSP Module",
    height: 0.98,
    technicalData:
      "Dedicated DSP board performs acoustic scene analysis while powering dual deterrent transducers.",
    leftLabel: "DSP",
    leftValue: "Audio signal processing and analysis PCB",
    rightLabel: "Transducers",
    rightValue: "Dual deterrent speakers plus microphone array",
    summary: "Acoustic intelligence and deterrent output subsystem.",
  },
  {
    id: "cover",
    title: "Weatherproof Top Cover",
    height: 0.28,
    technicalData:
      "IP66 top shield with long tamper-proof screws and a silicone weather gasket.",
    leftLabel: "Fastening",
    leftValue: "Four long anti-tamper security screws",
    rightLabel: "Tamper",
    rightValue: "Blue silicone environmental gasket ring",
    summary: "Apex weather shielding and tamper-protection assembly.",
  },
];

export const MODULE_BY_ID: Record<ModuleId, ModuleInfo> = MODULES.reduce(
  (acc, module) => {
    acc[module.id] = module;
    return acc;
  },
  {} as Record<ModuleId, ModuleInfo>
);

const ASSEMBLED_GAP = 0.1;
const EXPLODED_GAP = 1.35;

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
