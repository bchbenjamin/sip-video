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
      "Powder-coated base enclosure carries the power board, battery pack, and sealed side I/O routing for field deployment.",
    leftLabel: "Backplane",
    leftValue: "Rigid mounting cavity with integrated side I/O block",
    rightLabel: "Power",
    rightValue: "Power PCB plus four 18650 backup cells",
    summary: "Mechanical foundation and battery power subsystem.",
  },
  {
    id: "sensor",
    title: "Camera & Sensor Assembly",
    height: 1.04,
    technicalData:
      "Forward camera barrel and PIR motion dome open around a central CMOS board for early visual trigger detection.",
    leftLabel: "Optics",
    leftValue: "Stacked opaque lens barrel for forward capture",
    rightLabel: "Motion",
    rightValue: "PIR dome paired to central CMOS sensor board",
    summary: "Primary visual and motion ingress module.",
  },
  {
    id: "compute",
    title: "Edge Compute Core (Raspberry Pi)",
    height: 1.02,
    technicalData:
      "Raspberry Pi edge board performs local AI inference while the split heatsink shell exposes CPU, RAM, and comms hardware.",
    leftLabel: "Compute",
    leftValue: "Raspberry Pi PCB with CPU, RAM, and side I/O",
    rightLabel: "Comm",
    rightValue: "Integrated uplink hardware on the main logic board",
    summary: "Edge inference and communications backbone.",
  },
  {
    id: "audio",
    title: "Acoustic Deterrent & DSP Module",
    height: 0.98,
    technicalData:
      "Front and rear grille assemblies open around a DSP board with dual speaker-magnet deterrent hardware.",
    leftLabel: "DSP",
    leftValue: "Dedicated audio analysis and DSP control board",
    rightLabel: "Transducers",
    rightValue: "Dual speaker magnets plus top microphone ports",
    summary: "Acoustic analysis and deterrent output subsystem.",
  },
  {
    id: "cover",
    title: "Weatherproof Top Cover",
    height: 0.28,
    technicalData:
      "Chamfered weather lid lifts after screw release, leaving the sealing gasket hovering over the stack.",
    leftLabel: "Fastening",
    leftValue: "Four top-corner security fasteners",
    rightLabel: "Tamper",
    rightValue: "Neutral weather gasket ring beneath the lid",
    summary: "Weather sealing and tamper-resistant top assembly.",
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
