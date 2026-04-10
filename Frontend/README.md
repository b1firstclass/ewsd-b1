# EWSD Frontend

Role-based university magazine frontend built with React, TypeScript, and Vite.

## Stack
- React 19
- TypeScript 5
- Vite 6
- TanStack Router + TanStack Query
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Axios

## Prerequisites
- Node.js 18+ (recommended)
- npm 9+

## Setup
```bash
npm install
```

## Run
```bash
npm run dev
```
Runs Vite in development mode, which reads `.env.development`.

## Build
```bash
npm run build
```
Builds for production, which reads `.env.production`.

## Preview Build
```bash
npm run preview
```

## Lint
```bash
npm run lint
```

## Environment
This app reads:
- `VITE_API_BASE_URL` (used by `src/lib/api/client.ts`)
- `VITE_APP_NAME` (defined in env files)

Current env files in repo:
- `.env.development`
- `.env.production`

## Routing and Roles
Routes are defined in `src/router/routeConfig.ts` using TanStack Router.

Main role areas:
- Student: dashboard, my submissions
- Coordinator: dashboard, review queue, guest list, analytics
- Manager: dashboard, export center
- Guest: dashboard, selected contributions
- Admin: system monitoring, contribution windows, user/role/faculty management

## Project Structure
```text
src/
  components/   # shared layout + UI components
  contexts/     # auth context and providers
  features/     # feature modules by domain/role
  hooks/        # shared hooks
  lib/          # API client, query client, shared utilities
  router/       # router config + provider
  styles/       # theme/styles
  types/        # TS domain types and constants
  utils/        # helper functions
```
