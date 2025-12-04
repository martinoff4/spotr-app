# Repository Guidelines

## Project Structure & Module Organization
`app/` drives Expo Router navigation, so add screens there using the file-based route rules (e.g., `app/(tabs)/discover.tsx`). Shared, presentation-ready building blocks live in `components/`, while feature logic, navigation stacks, and storage helpers sit under `src/` (see `src/navigation`, `src/screens`, `src/store`, `src/utils`). Global context providers (such as `SpotsContext`) live in `src/context`, design tokens are centralized in `src/theme`, and static assets stay in `assets/`. Scripts like `scripts/reset-project.js` are reserved for tooling and should not import app modules.

## Build, Test, and Development Commands
- `npm start` – Launch the Expo dev server with Metro, QR codes, and web preview.
- `npm run android` / `npm run ios` – Build and install a development client on the respective simulator or device.
- `npm run web` – Serve the project via Expo’s web target for quick layout checks.
- `npm run lint` – Run `expo lint` (ESLint + Expo config) across the repo; treat all warnings as blockers.
- `npm run reset-project` – Move starter code to `app-example/` and bootstrap a clean `app/` directory.

## Coding Style & Naming Conventions
Use TypeScript for new files unless the platform forces plain JavaScript. Follow the existing two-space indentation and single-quote style. Components and contexts are `PascalCase` (`RootNavigator`, `SpotsProvider`), hooks are `useCamelCase`, and files that export React components should mirror the component name. Keep styles colocated via `StyleSheet.create`, but share palettes and spacing through `src/theme`. Run `npm run lint` before every commit to preserve formatting and Expo’s ESLint rules.

## Testing Guidelines
An automated test runner is not configured yet, so manual QA happens through `npm start` on the platform you’re changing. When adding tests, colocate `*.test.tsx` files next to the unit under test and rely on `@testing-library/react-native` plus Jest’s Expo preset; wire a future `npm test` script to keep CI simple. Prioritize navigation flows, context reducers, and data transformers in `src/utils`/`src/store`, and document any gaps in the pull request.

## Commit & Pull Request Guidelines
Keep commits focused and message subjects in the imperative mood with optional type scopes (`feat: add profile tabs`, `fix(navigation): guard null params`). Reference issue IDs in the body when available. Pull requests should include: a concise summary, screenshots or screen recordings for visual tweaks, test evidence (manual steps or future Jest output), and a checklist of affected platforms (iOS, Android, Web). Link any config changes to the relevant environment files so reviewers can validate secrets.

## Security & Configuration Tips
Secrets and environment flags should flow through `react-native-config`; store them in untracked `.env.*` files and document required keys in `expo-env.d.ts` for typing. Never commit API keys or service credentials—redact them from screenshots as well. When debugging, prefer temporary `.env.local` overrides instead of editing `constants/`. Audit third-party packages before adding them to `package.json` to keep the Expo bundle lean and review any permission changes in `app.json`.
