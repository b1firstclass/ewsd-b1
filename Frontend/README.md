# EWSD Frontend

Modern React + Vite + TypeScript frontend with Tailwind CSS v4 and shadcn/ui components.

## Tech Stack
- React 19 + Vite 7
- TypeScript
- Tailwind CSS v4
- shadcn/ui + Radix UI

## Getting Started

### Requirements
- Node.js 18+ (recommended)
- npm 9+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## Project Structure
```
src/
  components/
    common/        # Reusable layout and UI building blocks
    ui/            # shadcn/ui primitives
  contexts/        # React contexts (auth, etc.)
  features/        # Feature modules
  pages/           # Page-level components
  routes/          # Route config and guards
  lib/             # Helpers and utilities
```

## Environment Variables
Create a `.env` file if you need API configuration:
```
VITE_API_URL=https://your-api.example.com
```

## Notes
- Tailwind theme tokens live in `src/index.css`.
- UI primitives are in `src/components/ui`.
