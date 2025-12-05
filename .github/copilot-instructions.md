# Copilot Instructions for OnlyBingo

## Project Overview

A Nuxt 4 bingo board generator with shareable links. Users enter 24+ words, generate a randomized 5×5 board (center is FREE), and share via PostgreSQL-persisted short links. Each visitor who loads a shared link gets a **unique randomized board** from the same word list.

## Tech Stack

- **Runtime**: Bun (use `bun` not `npm`/`yarn`)
- **Framework**: Nuxt 4 with Vue 3 Composition API (`future.compatibilityVersion: 4`)
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite` (NOT the Nuxt module)
- **UI Primitives**: reka-ui for accessible unstyled components
- **Validation**: Zod v4 schemas
- **Icons**: `@nuxt/icon` with `lucide` icon set

## Architecture

```
app/                    # Nuxt 4 app directory (not src/)
├── pages/index.vue     # Single-page app, orchestrates all UI
├── composables/        # State management (auto-imported)
│   ├── useBingoBoard.ts   # Board state, cell clicks, QR generation
│   ├── useBingoCheck.ts   # Pure function for win detection
│   └── useShareBoard.ts   # API calls to persist/share boards
├── components/
│   ├── BoardGrid.vue      # 5×5 interactive grid
│   ├── WordInput.vue      # Textarea with localStorage persistence
│   └── ui/                # reka-ui based primitives (Button, Card)
└── lib/utils.ts        # cn(), shuffleArray(), generateBingoBoard()

server/
├── api/boards/
│   ├── index.post.ts   # POST / - create board, returns {id}
│   └── [id].get.ts     # GET /:id - fetch board by nanoid
├── db/
│   ├── index.ts        # Drizzle client export
│   └── schema.ts       # boards table definition
└── utils/validation.ts # Zod schemas for API validation
```

## Key Patterns

### Composables Pattern
All reactive state lives in composables, not components. Destructure on use:
```ts
const { board, clicked, bingo, toggleCell, createBoard, loadBoard } = useBingoBoard()
```

### Pure vs Stateful Functions
- `useBingoCheck(clicked)` - **pure function**, takes `boolean[][]`, returns `boolean`
- `useBingoBoard()` / `useShareBoard()` - **stateful composables** with refs

### Board Data Structure
```ts
board: (string | null)[][]  // 5×5 grid, null = FREE at [2][2]
clicked: boolean[][]        // Track marked cells, FREE starts true
words: string[]             // User's list (min 24, max 200)
```

### API Flow
1. User enters words → `createBoard()` calls `generateBingoBoard(words)` (shuffles, picks 24)
2. `generateShareLink(words, board)` → POST `/api/boards` → returns `nanoid(10)`
3. Share URL: `?id={nanoid}` → `onMounted` fetches via `$fetch('/api/boards/${id}')`
4. `loadBoard(data)` → **re-randomizes** from saved words (unique board per visitor)

### reka-ui Component Pattern
UI primitives use `Primitive` for polymorphic rendering:
```vue
<script setup lang="ts">
import { Primitive } from 'reka-ui'
import type { PrimitiveProps } from 'reka-ui'

interface Props extends PrimitiveProps {
  variant?: 'default' | 'outline'
}
const props = withDefaults(defineProps<Props>(), { as: 'button' })
</script>
<template>
  <Primitive :as="as" :as-child="asChild" :class="buttonClass"><slot /></Primitive>
</template>
```

### Styling Conventions
- Use `cn()` from `~/lib/utils` for conditional Tailwind classes
- Tailwind CSS 4 with `@theme` variables in `app/assets/css/main.css`
- **Dark theme only** - pure black background (`--background: 0 0% 0%`)
- Primary accent: `blue-500/600` for interactive elements
- Display font: `font-display` (Sofia Sans Condensed) for headings
- Headers: `font-black uppercase tracking-tight gradient-text`

### SSR/Hydration Safety
- Board loading in `onMounted()` to avoid hydration mismatch
- `<ClientOnly>` wrapper around interactive content
- localStorage access guarded with `typeof window !== 'undefined'`

## Commands

```bash
bun install           # Install dependencies
bun run dev           # Dev server at http://localhost:3000
bun run build         # Production build
bun run db:generate   # Generate migration from schema changes
bun run db:migrate    # Apply migrations
bun run db:studio     # Open Drizzle Studio GUI
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/onlybingo
SITE_URL=http://localhost:3000  # Used for share link generation
```

## Implementation Notes

- **Word persistence**: `WordInput.vue` auto-saves to `localStorage` key `onlybingo_word_list`
- **Duplicate detection**: `useBingoBoard` tracks `duplicateWords` via case-insensitive comparison
- **Cleanup**: `scripts/cleanup-old-boards.ts` deletes boards >48 hours old (cron job)
- **Validation**: Server uses Zod - words array (24-200 items), board 5×5 with nullables
- **IDs**: `nanoid(10)` for short, URL-safe board identifiers

## File Naming

- Components: PascalCase (`BoardGrid.vue`)
- Composables: camelCase with `use` prefix (`useBingoBoard.ts`)
- API routes: Nuxt file-based routing (`[id].get.ts`, `index.post.ts`)
- ESLint: `class` before event handlers (`@click`), prefer self-closing tags
