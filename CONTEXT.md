# CONTEXT.md: 3D Hardware Prototype Design Specification

## 1. Global Aesthetic & Design Language
The 3D visualization now uses an "Industrial Engineering Demo" aesthetic focused on matte materials, cinematic motion, and highly readable overlays.

* **Canvas & Background:** Neutral grey atmospheric gradient (roughly `#DFE3E8` -> `#C8CED5`) for cleaner hardware contrast in demos and recordings.
* **Primary Accent Color:** Blueprint Blue (`#1d5fcf`). Used for interaction highlights, metadata headers, and emissive details.
* **Typography:** Strictly Monospace (e.g., `Courier New`, `Fira Code`, or `Roboto Mono`). Reinforces the "developer/terminal" theme.
* **Materials (Three.js PBR):** Heavy use of `MeshPhysicalMaterial`.
  * Housings: Matte, high-roughness (`0.75`) with low-metalness (`0.15`) and no clearcoat for powder-coated aluminum/rugged polymer realism.
  * Lenses/Sensors: High-transmission, high-metalness to simulate glass and silicon.
* **Lighting Scene:**
  * Diffused ambient and hemisphere lights prevent harsh specular reflections.
  * Environment map uses Drei `Environment` with `preset="warehouse"` for realistic, broad industrial reflections.
  * Directional and low-intensity accent lights maintain form definition without gloss blowout.
  * Bloom post-processing is enabled to create optical glow for emissive accents and status LEDs.

## 2. Core Implemented Modules (The Vertical Stack)
The main unit is constructed programmatically using Vite/React Three Fiber. It consists of six vertically stacked modular groups.

### Group 1: Rugged Exterior Base (IP66)
* **Function:** The physical foundation and primary environmental seal.
* **Visual Implementation:** Flat, rounded rectangular box. Matte dark grey (`#1A1A1A`). Features four black cylindrical rubber feet and extruded side blocks representing I/O and Solar/Mains input ports.

### Group 2: Visual & Motion Sensor Array
* **Function:** Primary data gathering (excluding thermal, per strict design constraints).
* **Visual Implementation:** Matte charcoal split-shell housing with a pronounced camera carriage. Features an enlarged multi-stage lens barrel, focus ring, glass element, IR emitters, sensor PCB details, red recording LED, and a translucent PIR dome.

### Group 3: Raspberry Pi Compute Core
* **Function:** Edge AI processing and real-time ML inference.
* **Visual Implementation:** A flat circuit board plane colored deep green (`#1b5e20`). Populated with CPU, RAM chips, GPIO header, plus silver edge-mounted USB/Ethernet-like port blocks for immediate visual distinction.

### Group 4: Acoustic Deterrent & DSP Module
* **Function:** Audio generation for wildlife deterrence and acoustic scene analysis.
* **Visual Implementation:** Dark matte enclosure with front and rear realistic speaker drivers (outer ring, surround, cone, dust cap), detachable grille bars, and a top 4-point microphone array.

### Group 5: Comm & Power Management
* **Function:** Network gateway for police alerts and internal power routing.
* **Visual Implementation:** Matte black housing with dual antennas that are thicker at the base and tapered at the top. Includes a row of three green status LEDs and a translucent side window revealing an internal battery block.

### Group 6: Weatherproof Top Cover
* **Function:** Tamper-proof environmental shielding.
* **Visual Implementation:** A chamfered rectangular lid matching the base color, secured with four small metallic cylinders in the corners representing tamper-proof screws.

## 3. Interactive UI & Animation Mechanics
* **Exploded View Logic:** Driven by native React Three Fiber frame-loop damping. The global exploded toggle separates modules along Y while preserving stack proportions.
* **Micro-Exploded Focus Logic:** Selecting a module sets `activeModule`, smoothly moves the camera to a focused composition, and breaks only that module into separated internal parts.
* **Focus Reset:** Clicking the background (pointer miss) or using the `BACK` control clears `activeModule`, restores camera framing, and reassembles all micro-offset parts.
* **Startup Assembly Animation:** On initial mount, module groups drop in from above one-by-one with a short stagger, producing a cinematic assembly reveal.
* **Idle Auto-Rotation:** Orbit controls use `autoRotate` with a slow speed to keep the device gently spinning when idle.
* **Connecting Blueprint Lines:** Utilizing Drei's `<Line>` component. When exploded, faint, dashed blueprint lines (`opacity: ~0.55`, `dashSize: 0.15`) connect the center coordinates of each adjacent module.
* **Hover State (Raycasting):** `onPointerOver` triggers an emissive shift. The targeted module's material `emissive` property shifts to the blueprint accent for immediate affordance.
* **Tap/Click Selection State:** `onPointerDown` promotes the module to active focus view.
* **Information Overlay:** With the lighter background, overlays use darker text shades (`text-slate-*`) and semi-translucent light cards (`bg-white/78`) with blur for readability over 3D content.

## 4. Pending / Unimplemented Hardware Features
While the core computational stack is modeled, several physical elements outlined in the overarching system architecture (SIP documentation) are not yet represented in the 3D space:

* **Solar Panel Assembly:** The system documentation mentions solar linking. The base module has an input port, but the actual deployed solar panel extrusion and articulating mount are not modeled.
* **Mounting Brackets & Straps:** The heavy-duty metallic brackets and adjustable banding required to secure the IP66 enclosure to a standard municipal streetlamp or utility pole.
* **External Weatherproof Cabling:** The physical wire harnesses (power lines, external network tethers) connecting the unit to the grid or external hubs.
* **Main Edge Gateway Hub:** The larger, separate central processing unit often mounted lower on the pole (as seen in earlier system block diagrams) that aggregates data from multiple camera units. Currently, only the integrated camera/Pi unit is visualized.