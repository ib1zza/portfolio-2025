# Project Overview

[← Back to README](./README.md)

This project is an interactive 3D portfolio that recreates a classic Macintosh System 6/7-style desktop environment. It serves as both a showcase for technical skills and a nostalgic piece of interactive art.

## Tech Stack

The application is built using modern web technologies:

- **Framework:** React 19
- **Build Tool:** Vite 7
- **Language:** TypeScript 5.9
- **State Management:** Zustand 5
- **3D Rendering:** React Three Fiber (`@react-three/fiber`) & Three.js
- **Animations:** Framer Motion (`motion`)
- **Styling:** SCSS, CSS Custom Properties

## Product Concept & Main Features

The application operates fundamentally as a web-based "operating system" simulation.

Key user-facing features include:

- **Virtual Desktop:** A customizable workspace where users can arrange icons and windows.
- **Finder-style Icons:** Interactive icons for folders, files, and applications.
- **Window Management:** Movable and resizable windows that can be opened, closed, and layered.
- **Topbar Menu:** A global menu bar that offers context-sensitive actions depending on the active application.
- **Custom Pixel-Art Cursors:** Dynamic cursors that change based on interaction context.
- **Responsive UI Scaling:** The entire desktop environment scales smoothly across different device sizes.

## Built-in Apps

The desktop includes several fully-functional mini-applications:

- **Icon Painter:** A 32x32 pixel icon editor.
- **Dither Studio:** A tool for applying dithering algorithms to images.
- **Model Viewer:** An application for browsing 3D models using React Three Fiber.
- **Badge Generator:** A digital business card creator with QR code generation.

## Design Constraints and Aesthetic Goals

The project adheres strongly to the classic Macintosh aesthetic:

- **Monochrome / Restricted Palette:** True to System 6/7 roots, relying heavily on dithered patterns and crisp, high-contrast monochrome UI elements.
- **Pixel Perfection:** Cursors, icons, and UI borders are designed to look sharp and pixelated, avoiding soft anti-aliasing where possible.
- **Native Feel:** Interactions should mimic native OS behaviors—windows shouldn't feel like mere HTML elements, but rather like solid, draggable OS windows.

Any modifications or additions to the UI should strictly maintain this aesthetic, respecting layout constants and the established visual language.
