# AI-Powered Street Safety Device: 3D Hardware Prototype 🛡️

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Framer](https://img.shields.io/badge/Framer-black?style=for-the-badge&logo=framer&logoColor=blue)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

An immersive, interactive WebGL 3D hardware viewer for an AI-Powered Street Safety Device. This repository contains the source code for the prototype visualization used in project video presentations and demonstrations. 

Developed as part of a **Socially Impactful Project (SIP)** at the **Atria Institute of Technology**, this system is designed to address **SDG 12: Law Enforcement & Governance** by utilizing edge computing, multi-modal sensor arrays, and ML-generated acoustic deterrents to enhance public safety and mitigate human-wildlife conflicts.

## ✨ Features

* **Interactive 3D Environment:** Fully explorable programmatic 3D model with OrbitControls (pan, zoom, orbit).
* **Exploded View Animation:** Smooth, physics-based separation of the 6 core hardware modules along the Y-axis using `framer-motion-3d`, complete with glowing dashed connecting lines for a technical "blueprint" aesthetic.
* **Dynamic Hover States:** Interactive components that highlight on hover, updating a dynamic UI panel with detailed, module-specific engineering data (e.g., Edge Compute Core, Audio DSP).
* **High-Fidelity Rendering:** Utilizes Physically Based Rendering (PBR) materials, realistic environment mapping, and cyberpunk-inspired accent lighting against an AMOLED black canvas.
* **Modular Architecture:** Represents the hardware stack accurately, explicitly detailing the Raspberry Pi compute core and specialized sensor arrays (omitting thermal components per specification).

## 🛠️ Tech Stack

* **Core:** React 18, Vite
* **3D Rendering:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
* **Animation:** Framer Motion, Framer Motion 3D
* **Styling:** Tailwind CSS (for the 2D UI overlays)

## 🚀 Setup & Installation

This project uses [Vite](https://vitejs.dev/) for lightning-fast HMR and optimized builds. 

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v16+ recommended) and a package manager (`npm`, `yarn`, or `pnpm`) installed.

### 1. Clone the repository
```bash
git clone [https://github.com/bchbenjamin/sip-video.git](https://github.com/bchbenjamin/sip-video.git)
cd sip-video
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Start the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
The terminal will provide a `localhost` URL (usually `http://localhost:5173`). Open this in your browser to interact with the 3D prototype.

### 4. Build for Production
To generate a production-ready, minified build:
```bash
npm run build
```
The output will be generated in the `dist` folder, ready to be deployed to Vercel, Netlify, or GitHub Pages.

## 🗂️ Project Structure

* `src/components/scene/Device.tsx`: Contains the core React Three Fiber programmatic geometries, PBR materials, and hover logic.
* `src/components/scene/modules.ts`: Exports the exact metadata, height maps, and UI copy for the 6 hardware modules.
* `src/pages/Index.tsx`: The main Vite view, wrapping the `<Canvas>` and the absolute-positioned Tailwind UI overlay.

## 👨‍💻 Team

* **Team Lead:** B C H Benjamin
* **Team Members:** Saniya J, Aydin Hassan K S, Chandan B D, Chetan S, Rohan C
* **Faculty Guide:** Dr. Raghunandan G H

---
*Conceptualized for Vigyaanrang and academic project showcases.*