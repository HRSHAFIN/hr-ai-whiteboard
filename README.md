# HR AI Whiteboard

An agentic AI whiteboard for turning ideas into structured diagrams, wireframes, notes, and documents — with Gemini built directly into the canvas.

**Live app:** [hr-ai-whiteboard.vercel.app](https://hr-ai-whiteboard.vercel.app)

---

## Overview

HR AI Whiteboard combines a full-featured drawing canvas ([Excalidraw](https://excalidraw.com)) with a Gemini-powered AI assistant, a lightweight docs mode, and a project dashboard — all behind Clerk authentication, persisted to a Neon Postgres database.

Each project ("whiteboard") can be worked on in two modes:

- **Whiteboard mode** — a full Excalidraw canvas with a custom left toolbar, a top-right Library/Help cluster, and a floating AI Helper panel.
- **Doc mode** — a plain-text notes editor with its own AI tools (Paraphraser, AI Humanizer) that show results side-by-side with the original text before you accept them.

## Features

### Whiteboard canvas
- Full Excalidraw drawing surface (shapes, freehand drawing, text, arrows, frames, images) with autosave.
- Custom left toolbar: selection/hand tools, a collapsible shape picker, brush size, stroke color, Notes and Emoji/Icon quick-insert popovers, Undo/Redo, and a **lock toggle** that freezes every other tool until unlocked.
- Opens with the Hand tool active by default.
- Custom top-right cluster for the Excalidraw Library sidebar and a Help popover (GitHub/portfolio links).
- Export the canvas to PNG.

### AI Helper (Gemini)
- **Diagrams** — describe an idea in plain English and get a real, editable flowchart, architecture diagram, web/mobile wireframe, mind map, or general diagram (not a static image).
- **Improve** — refine an already-generated diagram with a follow-up instruction.
- **Smart Notes** — reads a snapshot of the current whiteboard and turns it into styled, structured notes added back onto the canvas.
- **Paraphraser & AI Humanizer** (Doc mode) — rewrites your doc text and shows the result next to the original with Discard / Use-this-version actions, so nothing is overwritten silently.
- Falls back across multiple Gemini models (`gemini-3.6-flash` → `gemini-3.7-flash` → `gemini-3.1-flash-lite`) so a single model being at capacity or over its free-tier quota doesn't break generation.

### Dashboard
- All Files / Archive / Shared Files / Settings, with a searchable, filterable project grid.
- Create, rename, share (copy link), archive, and restore whiteboards.
- Deleting a file from **All Files** archives it (reversible); deleting from **Archive** permanently deletes it, gated behind a confirmation dialog.

### Platform
- Clerk-based sign in/sign up (GitHub, Google, email).
- Fully responsive across mobile, tablet, and desktop.
- Light-theme-locked (`color-scheme: light`) so mobile browsers' forced-dark mode can't invert the canvas UI.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4, [shadcn](https://ui.shadcn.com)-based component library (Base UI primitives) |
| Canvas | [Excalidraw](https://github.com/excalidraw/excalidraw) |
| Auth | [Clerk](https://clerk.com) |
| Database | [Neon](https://neon.tech) serverless Postgres via [Drizzle ORM](https://orm.drizzle.team) |
| AI | [Google Gemini](https://ai.google.dev) via `@google/genai` |
| Hosting | [Vercel](https://vercel.com) |

## Project structure

```
app/
├── page.tsx                    # Marketing landing page
├── layout.tsx                  # Root layout (Clerk provider, viewport, metadata)
├── icon.tsx / apple-icon.tsx    # Generated favicon
├── sign-in/, sign-up/           # Clerk auth pages
├── dashboard/
│   ├── layout.tsx               # Sidebar + header shell
│   ├── page.tsx                 # All Files
│   ├── archive/page.tsx         # Archived files
│   ├── shared/page.tsx          # Shared files (placeholder)
│   ├── settings/page.tsx        # Clerk UserProfile
│   └── actions.ts               # Server actions: create/rename/archive/restore/delete
├── workspace/[projectId]/
│   ├── page.tsx                 # Loads a whiteboard by id
│   └── actions.ts               # Server actions: save/rename
└── api/
    ├── ai/generate/route.ts     # Gemini generation endpoint (diagrams/notes/paraphrase/humanize)
    ├── users/route.ts
    └── whiteboards/route.ts     # Lists the signed-in user's whiteboards (archived or not)

components/
├── dashboard/                   # Sidebar, header, project cards/list, create dialog
├── workspace/                   # Editor shell, toolbar, AI sidebar, popovers
└── ui/                          # shadcn/Base UI component library

db/
├── index.ts                     # Drizzle + Neon client
└── schema.ts                    # users, whiteboards, posts tables

lib/
├── whiteboard-types.ts          # WhiteboardData shape persisted per project
├── ai-diagram-types.ts / ai-notes-types.ts / ai-doc-types.ts
├── excalidraw-fonts.ts          # Forces Excalifont/Virgil to load before AI content is added
├── excalidraw-layout.ts         # Insertion-point helper for generated content
├── quick-insert-data.ts         # Notes templates + emoji/icon picker data
└── get-db-user.ts               # Resolves the current Clerk user to a DB row

proxy.ts                         # Clerk middleware
drizzle.config.ts                # Drizzle Kit config
```

## Getting started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://clerk.com) application (GitHub/Google/email providers as desired)
- A [Google Gemini API key](https://ai.google.dev)

### Setup

```bash
git clone https://github.com/HRSHAFIN/hr-ai-whiteboard.git
cd hr-ai-whiteboard
npm install
cp .env.example .env.local   # then fill in the values below
```

### Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Neon Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `GEMINI_API_KEY` | Google Gemini API key |

### Database

```bash
npm run db:generate   # generate a migration from db/schema.ts
npm run db:push       # push the schema to your Neon database
npm run db:studio     # open Drizzle Studio to inspect data
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate a Drizzle migration |
| `npm run db:push` | Push schema changes to the database |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment

Deployed on [Vercel](https://vercel.com). Any push to `master` (or `vercel --prod`) redeploys [hr-ai-whiteboard.vercel.app](https://hr-ai-whiteboard.vercel.app); all environment variables above must be set in the Vercel project settings.

## License

© 2026 Md. Hasibur Rahman. All rights reserved.
