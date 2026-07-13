# Documentation

Welcome to the documentation for this project. This directory contains a complete, accurate, and connected set of guides covering the architecture, systems, and maintenance workflows for the application.

## Navigation Map

Here is an overview of the documentation files available to help you navigate and understand the project:

- [**Project Overview**](./project-overview.md)
  A high-level explanation of the project, including the tech stack, product concept, main user-facing features, built-in apps, and aesthetic goals.

- [**Architecture**](./architecture.md)
  Details on the overall architecture and how major systems relate to each other, complete with Mermaid diagrams.

- [**File Map**](./file-map.md)
  An index of important directories and files, highlighting where agents or developers should inspect first for common tasks. Includes the full directory visual tree and key utility specifications.

- [**Runtime Flow**](./runtime-flow.md)
  Explanation of how the application starts, renders, and operates at runtime, from initialization to desktop interaction.

- [**State Management**](./state-management.md)
  Documentation on the Zustand usage within the project, specifically `useFileSystem` and `useWindowManager`, along with key TypeScript types and detailed local storage persistence metadata.

- [**UI System**](./ui-system.md)
  Detailed explanation of the desktop metaphor, topbar, window system, custom cursors, scaling system, and global SCSS style token presets.

- [**SPA Routing & SEO**](./routing-and-seo.md)
  Details on the path-based routing (deep-linking), window-to-URL sync, and build-time static HTML metadata pre-rendering.

- [**Apps**](./apps.md)
  Documentation on the built-in applications, including their purpose, components, state dependencies, and asset dependencies.

- [**Assets and Models**](./assets-and-models.md)
  Documentation on static assets in `public/`, conventions for adding/removing assets, and warnings about dynamically referenced files.

- [**Build and Deployment**](./build-and-deployment.md)
  Instructions for development, build, lint, preview, and deployment behaviors on Vercel and GitHub Pages.

- [**Agent Guide**](./agent-guide.md)
  A practical guide aimed specifically at AI coding agents and developers working in this repository to ensure safe edit rules and avoid breaking changes.

- [**Easter Eggs**](./easter-eggs.md)
  Description of the 5 implemented desktop secrets and interactive easter eggs (HyperCard Stack, Time Machine HD, Special Menu, Trash Bomb, etc.) along with development guidelines for future additions.

- [**Testing Coverage Plan**](./plans/plan-testing-coverage.md)
  The target-driven roadmap to achieving 90% test coverage across utility modules, custom hooks, and components.

- [**Topbar Dynamic Features**](./plans/topbar-dynamic-features.md)
  Ideas and concepts for making the Topbar component more dynamic, including app-specific menus and context-sensitive File/Edit menus.

- [**Topbar Implementation Plan**](./plans/topbar-dynamic-features-implementation-plan.md)
  Detailed step-by-step implementation plan for the dynamic topbar feature.

- [**Maintenance**](./maintenance.md)
  Common maintenance workflows such as dependency updates, documentation updates, performance/bundle reviews, and cleanup.
