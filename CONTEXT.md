## 1. Visual Direction
The scene uses an industrial dark studio look for a CAD-style product reveal.

- Background: deep radial gradient from #2A2A2A at center to #0A0A0A at edges.
- UI: white/slate text on dark frosted cards for dark-mode readability.
- Environment: `<Environment preset="studio" />` stays active so glass and metal show high-quality reflections.

## 2. Ghost Casing Material Contract (Canonical)
Every module has a casing material that switches between two explicit states.

### Solid state (default)
- `color="#333336"`
- `roughness={0.8}`
- `metalness={0.2}`
- `transparent={false}`
- `transmission={0}`
- `opacity={1}`

### Ghost state (on module click)
- `color="#ffffff"`
- `roughness={0.1}`
- `metalness={0.1}`
- `transparent={true}`
- `transmission={0.95}`
- `opacity={1}`
- `ior={1.5}`
- `thickness={0.5}`

Notes:
- Blue tint must not be present in ghost mode.
- External casing goes to clear glass while internals remain distinct and opaque.

## 3. Structural Rule: ExternalCasing vs InternalTech
Each module is built as one group with two required sub-collections:

1. `ExternalCasing`
- Contains the main enclosure and protruding external physical features.
- These features do not separate on click.
- They are part of the casing visual transition behavior.

2. `InternalTech`
- Contains PCB, chips, wiring, magnets, and internal sub-assemblies.
- These parts animate outward when active and collapse when inactive.

## 4. Module Geometry Blueprint

### Module 1: Base Enclosure & Power
- ExternalCasing: chamfered matte dark grey box, four cylindrical rubber feet, side extruded I/O block.
- InternalTech: green power PCB (#1b5e20) and four blue 18650 battery cylinders.

### Module 2: Camera & Sensor Assembly
- ExternalCasing: prominent front camera barrel (stacked cylinders), reflective inner lens face, frosted white PIR dome below, tiny red emissive recording LED.
- InternalTech: compact red CMOS PCB behind the camera barrel location.

### Module 3: Edge Compute & Comm Core
- ExternalCasing: matte housing with inset metallic heat-sink ridges on side faces.
- ExternalCasing: two distinct tall cylindrical antennas protruding from top/back to communicate 4G/Wi-Fi capability.
- InternalTech: large green Raspberry Pi board, central silver CPU square, surrounding black RAM chips, and elevated smaller silver comm PCB.

### Module 4: Acoustic Deterrent & DSP
- ExternalCasing: front and rear recessed circular speaker grille regions with wireframe/grid treatment plus four tiny top mic pinholes.
- InternalTech: blue DSP board and two heavy silver/dark speaker magnet cylinders behind the grille zones.

### Module 5: Weatherproof Top Cover
- ExternalCasing: thinner chamfered lid with four metallic corner screws.
- InternalTech: thin blue gasket ring outline that drops slightly on activation.

## 5. Interaction and Camera Behavior

- Module click:
1. Activates that module.
2. ExternalCasing transitions to ghost glass state.
3. InternalTech expands outward.
4. Camera smoothly interpolates to a module-specific framing target.

- Background click (`onPointerMissed`) or RESET:
1. Clears active module.
2. Returns camera to default global framing.
3. Restores casing to solid matte state.
4. Collapses internal offsets back into place.

- Exploded view toggle:
- Keeps module stacking demonstration and dashed blueprint connector lines.

## 6. Verification Checklist

1. At scene load, all casings are matte solid dark grey with no ghost tint.
2. On click, selected module casing becomes clear glass and internals separate.
3. Camera smoothly reframes selected module.
4. Background click restores default camera and fully resets active dissection.
5. External features are physically present per module spec, including Module 3 dual antennas.