# CONTEXT.md: 3D Hardware Prototype Design Specification

## 1. Global Aesthetic & Design Language
The 3D visualization employs a "Technical Blueprint / Cyberpunk" aesthetic to emphasize the engineering and computational nature of the device.

* **Canvas & Background:** AMOLED Black (`#000000`). Designed to provide maximum contrast for glowing elements and prevent screen glare during presentations.
* **Primary Accent Color:** Neon/Glowing Purple (`#bb86fc`). Used for interactive states, UI borders, emissive highlights, and programmatic lighting.
* **Typography:** Strictly Monospace (e.g., `Courier New`, `Fira Code`, or `Roboto Mono`). Reinforces the "developer/terminal" theme.
* **Materials (Three.js PBR):** * Heavy use of `MeshPhysicalMaterial`.
  * Housings: Matte, high-roughness (`0.7-0.8`), low-metalness (`0.2`) to simulate rugged, weather-resistant polymers and coated aluminum.
  * Lenses/Sensors: High-transmission, high-metalness to simulate glass and silicon.
* **Lighting Scene:**
  * Low ambient light (`0.2`) to maintain the dark theme.
  * Sharp top-right directional light to cast subtle contact shadows.
  * A vibrant purple point light positioned front-bottom to wash the underside and textures with the primary accent color.

## 2. Core Implemented Modules (The Vertical Stack)
The main unit is constructed programmatically using Vite/React Three Fiber. It consists of six vertically stacked modular groups.

### Group 1: Rugged Exterior Base (IP66)
* **Function:** The physical foundation and primary environmental seal.
* **Visual Implementation:** Flat, rounded rectangular box. Matte dark grey (`#1A1A1A`). Features four black cylindrical rubber feet and extruded side blocks representing I/O and Solar/Mains input ports.

### Group 2: Visual & Motion Sensor Array
* **Function:** Primary data gathering (excluding thermal, per strict design constraints).
* **Visual Implementation:** Metallic charcoal casing (`#2a2a2a`). Features a high-transmission glass cylinder representing the HD lens and a translucent white dome representing the PIR motion sensor.

### Group 3: Raspberry Pi Compute Core
* **Function:** Edge AI processing and real-time ML inference.
* **Visual Implementation:** A flat circuit board plane colored deep green (`#1b5e20`). Populated with a highly reflective silver CPU square, surrounding black RAM chips, and a ribbed black strip representing the GPIO header.

### Group 4: Acoustic Deterrent & DSP Module
* **Function:** Audio generation for wildlife deterrence and acoustic scene analysis.
* **Visual Implementation:** Dark plastic block. Features two dark metallic cylinders on the front/back with wireframe/grid textures to represent speaker mesh. The top surface includes a 4-dot microphone array.

### Group 5: Comm & Power Management
* **Function:** Network gateway for police alerts and internal power routing.
* **Visual Implementation:** Matte black housing. Features two tall, thin metallic cylinders acting as 4G/LTE/Wi-Fi antennas. A subtle translucent window on the side reveals an internal blue battery block.

### Group 6: Weatherproof Top Cover
* **Function:** Tamper-proof environmental shielding.
* **Visual Implementation:** A chamfered rectangular lid matching the base color, secured with four small metallic cylinders in the corners representing tamper-proof screws.

## 3. Interactive UI & Animation Mechanics
* **Exploded View Logic:** Driven by `framer-motion-3d`. When triggered, the modules separate along the Y-axis. The spacing is calculated dynamically based on a multiplier (`EXPLODE_MULTIPLIER = 1.5`) and the aggregate height of the bounding boxes to prevent unnatural stretching.
* **Connecting Blueprint Lines:** Utilizing Drei's `<Line>` component. When exploded, faint, dashed purple lines (`opacity: 0.6`, `dashSize: 0.15`) connect the center coordinates of each adjacent module.
* **Hover State (Raycasting):** `onPointerOver` triggers an emissive shift. The targeted module's material `emissive` property shifts to `#bb86fc` with an intensity of `0.4` to `0.5`, ensuring the base texture remains visible.
* **Information Overlay:** A 2D HTML layer (using Drei's `<Html>` or absolute CSS positioning) tracks the active hover state and dynamically routes the corresponding technical description into the right-side glassmorphism panel.

## 4. Pending / Unimplemented Hardware Features
While the core computational stack is modeled, several physical elements outlined in the overarching system architecture (SIP documentation) are not yet represented in the 3D space:

* **Solar Panel Assembly:** The system documentation mentions solar linking. The base module has an input port, but the actual deployed solar panel extrusion and articulating mount are not modeled.
* **Mounting Brackets & Straps:** The heavy-duty metallic brackets and adjustable banding required to secure the IP66 enclosure to a standard municipal streetlamp or utility pole.
* **External Weatherproof Cabling:** The physical wire harnesses (power lines, external network tethers) connecting the unit to the grid or external hubs.
* **Main Edge Gateway Hub:** The larger, separate central processing unit often mounted lower on the pole (as seen in earlier system block diagrams) that aggregates data from multiple camera units. Currently, only the integrated camera/Pi unit is visualized.