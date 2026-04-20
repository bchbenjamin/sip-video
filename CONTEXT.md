# CONTEXT.md: 3D Hardware Prototype Current Implementation

## 1. Visual Direction
- Scene uses a clinical radial light gradient from white center to cool grey edge.
- Overlay UI uses strict dark-slate typography on high-contrast white cards.
- Accent color for interaction and blueprint lines is blueprint blue (`#0055ff`).

## 2. 3D Modules
The device is composed of six stacked modules in `src/components/scene/modules.ts`:
1. `base`
2. `sensor`
3. `compute`
4. `audio`
5. `comm`
6. `cover`

Global explode/collapse uses dynamic Y positions from `computeAssembledY()` and `computeExplodedY()`.

## 3. Material Presets
`src/components/scene/Device.tsx` centralizes reusable physical materials:
- Rugged Housing: `#333336`, roughness `0.85`, metalness `0.2`, clearcoat `0`
- Optical Glass: `#050505`, transmission `1`, opacity `1`, roughness `0`, IOR `1.5`
- PCB Board: `#1b5e20`, roughness `0.6`, metalness `0.1`
- Silicon/IC: `#111111`, roughness `0.2`, metalness `0.8`
- Fasteners: `#cccccc`, roughness `0.3`, metalness `0.9`

All module geometry uses physically based materials (`meshPhysicalMaterial`) and avoids simple single-box placeholders.

## 4. Interaction Model
- Hovering sets `hovered` module state and applies blue edge outline.
- Clicking toggles `activeModule`.
- Active module triggers micro-explode behavior via animated local offset groups.
- Clicking empty canvas resets hover and focus state.

## 5. Camera and Framing
- `CameraControls` is used for smooth focus transitions.
- Default view: `[10, 6, 12]` with `fov: 38`.
- Focus view uses per-module offsets plus dynamic Y-center anchors.
- `BACK` resets focus to default camera framing.

## 6. Lighting and Environment
- Lighting is a neutral daylight rig: ambient + hemisphere + dual directional lights.
- Environment map uses Drei `Environment` preset `studio`.
- Contact shadows are enabled for grounded CAD-like depth.

## 7. Overlay Data
`modules.ts` includes:
- `title`, `summary`
- `leftLabel`, `leftValue`
- `rightLabel`, `rightValue`
- `technicalData` (exact module technical statement)

UI behavior:
- Desktop left card: module overview and focus state.
- Desktop right card: technical data text.
- Mobile bottom card: condensed technical data.
- Panels appear for hovered or active modules.
