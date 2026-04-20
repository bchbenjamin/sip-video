## 1. Global Aesthetic & Advertisement-Grade Visuals
The 3D visualization operates as a photorealistic CAD demo utilizing an "Industrial Dark Studio" aesthetic.
* **Canvas & Background:** Deep industrial radial gradient (`#2A2A2A` to `#0A0A0A`) to make metallic and glass hardware highlights pop.
* **UI Overlay:** Monospace, crisp white text (`text-slate-100`) on dark frosted glass panels (`bg-black/60`, `backdrop-blur-md`, `border-slate-700`).
* **Materials (Strict PBR):** * *Outer Housings:* Matte die-cast aluminum (`color: "#333336"`, `roughness: 0.65`, `metalness: 0.3`). Must be 100% solid/opaque by default.
  * *Internal Tech:* Highly distinct, opaque materials—FR4 green PCBs, reflective silicon chips, and optical glass.
* **Environment:** Drei's `<Environment preset="studio" />` with strong directional rim lighting to separate the dark device from the dark background.

## 2. Core Architecture & "Dissection View" Logic
The hardware is divided into 5 primary structural modules based on the official system block diagrams. 

**The "Ghost Casing" Reveal Mechanic:**
Instead of merely zooming the camera, selecting (`onClick`) a module triggers a "Dissection View." The module's outer industrial casing dynamically transitions to a high-transmission glass material (`transmission: 0.9`, `opacity: 0.2`). Simultaneously, the dense internal technology stack housed inside expands outward along local axes, allowing viewers to inspect the internal computing and sensory hardware.

### Module 1: Base Enclosure & Power
* **Function:** Physical foundation, environmental seal, and power routing.
* **Outer Casing:** Rugged chamfered base with maintenance access panels.
* **Internal Tech (Revealed):** * Modular Interface/Backplane
  * Power Management & Battery Backup Module

### Module 2: Camera & Sensor Assembly
* **Function:** Visual threat detection and motion tracking.
* **Outer Casing:** Forward-facing sensor shroud.
* **Internal Tech (Revealed):** * High-Resolution, Non-Thermal Video Camera Sensor
  * PIR/Ultrasonic Motion Sensor Array

### Module 3: Edge Compute & Comm Core
* **Function:** Local ML inference (YOLO/CNN) and secure API alerts.
* **Outer Casing:** Central industrial housing.
* **Internal Tech (Revealed):** * Raspberry Pi Operating Environment (Main Logic Board)
  * Docked Communication Module (4G/LTE, Wi-Fi) for Secure Police Alert API Calls

### Module 4: Acoustic DSP & Deterrent Module
* **Function:** ML-generated animal deterrents and ambient acoustic analysis.
* **Outer Casing:** Vented housing for audio egress.
* **Internal Tech (Revealed):** * Audio & DSP Module PCB
  * Integrated High-Volume Deterrent Speakers
  * Microphone Array for Acoustic Scene Analysis

### Module 5: Weatherproof Top Cover
* **Function:** Tamper-proof apex shielding.
* **Outer Casing:** Chamfered IP66 lid.
* **Internal Tech (Revealed):** Tamper-proof mounting hardware and environmental gaskets.

## 3. Interactive UI & Presentation Mechanics
* **Global Exploded View:** Separates the 5 main modules vertically along the Y-axis to demonstrate the "Stackable Module Architecture."
* **Focus Reset:** Clicking the canvas background collapses all internal components and returns all ghosted casings to their solid, matte states.
* **Connecting Blueprint Lines:** During the global Explode, faint, dashed lines (`#0055ff`, `opacity: 0.6`) connect the Y-axis centers to reinforce the technical blueprint aesthetic.
* **Information Overlay:** Monospace, dark-slate text on translucent white panels (`bg-white/90`, `backdrop-blur`). Automatically updates to display the specific ML capabilities (e.g., sub-500ms latency, YOLOv8 visual detection) of the actively hovered/clicked module.