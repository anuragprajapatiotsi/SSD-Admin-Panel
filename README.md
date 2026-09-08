# SSD Frontend

Purpose:

Fresh React/Vite/TypeScript frontend workspace for building SSD screens directly, screen by screen.

This folder follows the reference `ssd-fe/src/` structure while using SSD governance, database contracts, API contracts, and screen specifications as the source of truth.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- react-router/react-router-dom
- TanStack Query
- React Hook Form
- Zod
- lucide-react
- direct ECharts usage where approved

## Folder Structure

```text
src/api/
src/assets/
src/components/
src/hooks/
src/layouts/
src/lib/
src/pages/
src/providers/
src/routes/
src/stores/
```

## Development Rule

Build one workflow/screen at a time:

1. Read governance screen specification.
2. Read DB module contract.
3. Read API contract.
4. Create route/page shell.
5. Add fields, actions, alerts, and status states.
6. Wire API only after contracts are confirmed.
7. Update `ssd_ui/modules/<module>/` context files.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Current State

The current frontend contains only the base shell, route placeholders, theme tokens, and navigation draft. Left navigation is expected to change after review.
