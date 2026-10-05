# Repository Guidelines

## Project Structure

AuraMusic is split into two independently managed Node packages. `frontend/` contains the React and Vite application; its pages, reusable components, context, and utilities live in `frontend/src/`, with static assets in `frontend/public/`. Browser tests and Playwright configuration are in `frontend/tests/` and `frontend/playwright.config.ts`. `server/` contains the TypeScript Express and Socket.IO service, organized into `routes/`, `controller/`, `services/`, `sockets/`, `config/`, `database/`, and `types/`. Docker and CI configuration are at the repository root and in `.github/workflows/`.

## Build, Test, and Development

Run package commands from the corresponding directory:

- `cd frontend && npm run dev` starts the Vite development server at `http://localhost:5173`.
- `cd frontend && npm run build` creates the production frontend bundle; `npm run preview` serves it locally.
- `cd frontend && npm run lint` runs ESLint.
- `cd frontend && npx playwright install chromium && npm run test:e2e` installs the browser (once) and runs end-to-end tests.
- `cd server && npm run dev` starts the backend with file watching; `npm start` starts it without watch mode.
- `cd server && npm run build` compiles TypeScript into `server/dist/`.
- `docker compose up -d --build` builds and starts the configured services.

The server's `npm test` script is currently a placeholder; add meaningful tests before relying on it.

## Code Style

Use TypeScript for frontend and backend changes where practical, avoid `any`, and follow existing formatting: two-space indentation, semicolons in TypeScript/TSX, and single quotes in frontend JavaScript/JSX. Use PascalCase for React components and camelCase for functions, variables, and utility files. Run frontend ESLint before submitting. `CONTRIBUTING.md` also calls for Prettier formatting.

## Testing

Add or update Playwright scenarios in `frontend/tests/` for user-facing flows, and keep the Chromium project passing. For backend changes, build with `cd server && npm run build`; the repository does not currently define a backend test suite or coverage threshold.

## Commits and Pull Requests

Recent history uses concise Conventional Commit prefixes such as `feat:`, `fix:`, `test:`, `refactor:`, and `chore:`. Use that pattern with an imperative summary. PRs should explain the change and its rationale, link related issues, describe verification performed, and include screenshots for visible UI changes. Ensure relevant CI checks pass.

## Configuration

Keep credentials and local environment values in untracked `.env` files; never commit secrets. Configure the database, Redis, and OAuth values required by the backend before running the full application.
