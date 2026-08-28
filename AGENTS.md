# Repository Guidelines

## Project Structure & Module Organization
This repo hosts multiple services. The primary UI lives in `react-frontend/` and is a Vite + React app.
- `react-frontend/src/` React components, hooks, Redux store, and feature modules.
- `react-frontend/src/features/` domain UI (observer, pilot, camera-controls, listeners).
- `react-frontend/tests/` integration harnesses and shared test helpers.
- `compose/` Docker/Nginx assets used by `docker-compose.yml`.
- Root config and scripts (for example, `configEnv-pilot.js`, `configEnv-observer.js`, `docker-build-prod-image.sh`).

## Build, Test, and Development Commands
Run these from the noted directory.
```sh
# repo root
docker-compose up        # start all services in a dev network

# react-frontend/
npm install              # install dependencies
npm run dev              # local dev server (Vite)
npm run build            # production build
npm run preview          # serve the build locally
npm run test             # vitest run
```

## Coding Style & Naming Conventions
- Indentation: 2 spaces in JS/JSX/TSX (match existing files).
- Components/hooks: `PascalCase` for components, `useThing` for hooks.
- Tests: colocate with source (`*.test.tsx`) or place in `react-frontend/tests/`.
- Keep changes focused; avoid reformatting unrelated code.

## Testing Guidelines
Tests run with Vitest. Prefer adding coverage for new hooks/components.
- Unit/component tests: `react-frontend/src/**/**/*.test.tsx`.
- Shared/test harnesses: `react-frontend/tests/`.
Run locally with `npm run test` from `react-frontend/`.

## Commit & Pull Request Guidelines
Recent history uses short, imperative summaries (e.g., “Add …”, “Adopt …”).
- Use a concise subject line; include context in the body if needed.
- PRs should describe the UI/behavior change, link issues if relevant, and include screenshots/GIFs for visual updates.

## Configuration Notes
Runtime config is injected via `react-frontend/public/configEnv.js` and production templates under `configEnv-*.js`. When changing config keys, update both the runtime file and any docker/runtime usage.
