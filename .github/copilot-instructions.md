# Copilot Instructions for OnlyBingo

## Project Overview

A Nuxt 4 bingo board generator with shareable links. Users enter 24+ words, generate a randomized 5×5 board (center is FREE), and share via PostgreSQL-persisted short links.

## Tech Stack

- **Runtime**: Bun (use `bun` not `npm`/`yarn`)
- **Framework**: Nuxt 4 with Vue 3 Composition API
- **Database**: PostgreSQL + Drizzle ORM
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite` (not the Nuxt module)
- **UI Primitives**: reka-ui for accessible unstyled components
- **Validation**: Zod schemas

## Architecture

```
app/                    # Nuxt 4 app directory (not src/)
├── pages/index.vue     # Single-page app, all UI logic here
├── composables/        # State management via Vue composables
│   ├── useBingoBoard.ts   # Board state, cell clicks, QR generation
│   ├── useBingoCheck.ts   # Win detection (rows/cols/diagonals)
│   └── useShareBoard.ts   # API calls to persist boards
├── components/ui/      # reka-ui based primitives (Button, Card)
└── lib/utils.ts        # cn() helper, shuffleArray, generateBingoBoard

server/
├── api/boards/         # REST endpoints: POST / and GET /[id]
├── db/schema.ts        # Drizzle schema (boards table)
└── utils/validation.ts # Zod schemas for API validation
```

## Key Patterns

### Composables Pattern
All reactive state lives in composables, not components. Import and destructure:
```ts
const { board, clicked, bingo, toggleCell, createBoard } = useBingoBoard()
```

### reka-ui Components
UI primitives use reka-ui's `Primitive` component for polymorphism:
```vue
<Primitive :as="as" :as-child="asChild" :class="buttonClass">
  <slot />
</Primitive>
```

### Board Data Structure
- Board: `(string | null)[][]` - 5×5 grid, `null` = FREE space at [2][2]
- Clicked: `boolean[][]` - tracks marked cells, FREE starts as `true`
- Words: `string[]` - user's word list (min 24 required)

### API Flow
1. User enters words → `createBoard()` generates random 5×5 layout
2. `generateShareLink()` POSTs to `/api/boards` → returns nanoid(10)
3. Share URL: `?id={nanoid}` → `onMounted` fetches and calls `loadBoard()`
4. `loadBoard()` re-randomizes the board from saved words (each visitor gets unique arrangement)

### Styling Conventions
- Use `cn()` from `~/lib/utils` for conditional classes
- Tailwind CSS 4 syntax with `@theme` CSS variables in `main.css`
- Dark theme only - pure black background (#000)
- Primary accent: `yellow-400` for buttons and interactive elements
- Text: `gradient-text` class for headers (white to gray gradient)
- Display font: `font-display` (Sofia Sans Condensed) for headings
- Use `font-black` + `uppercase` + `tracking-tight` for display text

## Database Commands

```bash
bun run db:generate  # Generate migration from schema changes
bun run db:migrate   # Apply migrations
bun run db:studio    # Open Drizzle Studio GUI
```

Schema location: `server/db/schema.ts`
Migrations: `drizzle/migrations/`

## Development

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (http://localhost:3000)
```

Required `.env`:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/onlybingo
```

## Important Implementation Details

- **Bingo detection**: `useBingoCheck()` is a pure function, not a composable with state
- **Word persistence**: `WordInput.vue` auto-saves to localStorage (`onlybingo_word_list`)
- **Hydration safety**: Board loading happens in `onMounted` to avoid SSR mismatches
- **Cleanup script**: `scripts/cleanup-old-boards.ts` deletes boards >48 hours old (run via cron)
- **Tailwind v4**: Uses `@tailwindcss/vite` plugin directly, not `@nuxtjs/tailwindcss`

## File Naming & Conventions

- Components: PascalCase (`BoardGrid.vue`)
- Composables: camelCase with `use` prefix (`useBingoBoard.ts`)
- API routes: kebab-case with param syntax (`[id].get.ts`)
- ESLint: Attribute order matters (`class` before `@click`), use self-closing for non-void elements
