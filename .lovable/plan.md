
## Plan v3: Interactive 3D Hardware Prototype Viewer — "AI-Powered Street Safety Device"

All five corrections incorporated: corrected title, dynamic spacing, exact panel copy, Vite alignment, and mandatory connecting lines.

### Stack (Vite + React 18, exact pinned versions)
- `@react-three/fiber@^8.18`
- `@react-three/drei@^9.122.0`
- `three@^0.160`
- `framer-motion@^11`
- `framer-motion-3d@^11`

Pure Vite SPA — `Index.tsx` is the existing react-router page (not Next). No SSR concerns; canvas mounts client-side directly.

### Files
- **Rewrite** `src/pages/Index.tsx` — full-viewport `<Canvas>` + HTML overlay (header, info panel, toggle).
- **New** `src/components/scene/Device.tsx` — six stacked modules + connecting lines + hover/explode logic.
- **New** `src/components/scene/modules.ts` — module metadata array (id, label, description, height, builder).

### UI Overlay (HTML, monospace)
- **Top-left header** (corrected): `PROJECT: AI-POWERED STREET SAFETY DEVICE | HARDWARE PROTOTYPE`
- **Right-side panel** (~320px, translucent black, 1px purple border, monospace): shows active module label + description; defaults to "Hover a module to inspect."
- **Bottom-center button**: `TOGGLE EXPLODED VIEW` — `rgba(0,0,0,0.7)` bg, 1px `#bb86fc` border, fills purple on hover.

### Module Metadata + Exact Hover Copy
1. **Rugged Exterior Base (IP66)** — "Weatherproof foundation rated for outdoor deployment in all environmental conditions."
2. **Visual & Motion Sensor Array (Non-Thermal)** — "Visual & Motion Array: Integrates HD video feeds with motion sensor data to improve threat detection accuracy."
3. **Raspberry Pi Compute Core** — "Edge Compute Core: Runs real-time ML algorithms to analyze video data for suspicious behavior autonomously."
4. **Acoustic Deterrent & DSP Module** — "Audio DSP: Implements ML algorithms to generate specific deterrent signals and warning noises for wild animals."
5. **Comm & Power Management** — "Network Gateway: Facilitates real-time network communication to automatically alert police and emergency services."
6. **Weatherproof Top Cover** — "Tamper-proof sealed lid securing the internal stack against intrusion and weather."

### Dynamic Y-Axis Spacing
Computed from each module's actual height — no hardcoded offsets:

```text
assembledY[i] = sum(heights[0..i-1]) + heights[i] / 2
explodedY[i]  = assembledY[i] + i * (avgHeight * EXPLODE_MULTIPLIER)
EXPLODE_MULTIPLIER = 1.5
```

Tuning the single multiplier rebalances the entire exploded view uniformly.

### Mandatory Connecting Lines (Blueprint Vibe)
Using Drei's `<Line>`:
- Rendered only when `isExploded === true`.
- One dashed segment per adjacent module pair, joining their centers.
- Style: `color="#bb86fc"`, `lineWidth={1}`, `dashed`, `dashSize={0.15}`, `gapSize={0.1}`, `transparent`, `opacity ≈ 0.6`.
- Opacity fades in/out via Framer Motion alongside the explode animation.

### Scene & Lighting
- AMOLED black canvas (`#000000`).
- Ambient `#ffffff` @ 0.2; directional from top-right with soft shadows; purple point light `#bb86fc` front-bottom for rim glow.
- `OrbitControls`: zoom + pan enabled; `minPolarAngle ≈ 0.1`, `maxPolarAngle ≈ π/2 - 0.05`.

### Geometry (primitives only, per original spec)
Each group built from boxes/cylinders/spheres: rounded base + rubber feet + I/O ports, charcoal sensor box with glass lens cylinder + white PIR dome (no thermal), green PCB with silver CPU + black RAM + ribbed GPIO, dark plastic block with mesh speaker cylinders + 4-mic array, matte housing with two tall antennas + translucent window over blue battery, chamfered top lid with 4 tamper screws.

### Interaction
- `motion.group` per module animates `position-y` between assembled and exploded targets (spring easing).
- `onPointerOver/Out` per group sets hovered id → primary material gains `emissive="#bb86fc"`, `emissiveIntensity={0.5}`; right panel updates to that module's description.
- Toggle button flips `isExploded` state; lines + Y positions animate together.
