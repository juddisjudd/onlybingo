<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  board: (string | null)[][]
  clicked: boolean[][]
  bingo: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cellClick: [row: number, col: number]
}>()

function getCellClass(row: number, col: number) {
  const isFree = props.board[row][col] === null
  
  return cn(
    'relative aspect-square flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-all duration-200 border overflow-hidden',
    {
      // Free space styling (always marked, non-interactive)
      'bg-blue-600/30 border-blue-500/50 text-blue-300 cursor-default': isFree,
      // Regular cells (interactive)
      'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 cursor-pointer hover:scale-[1.02]': !isFree,
    }
  )
}

function displayWord(word: string | null) {
  if (!word) return 'FREE'
  return word
}
</script>

<template>
  <div id="bingo-board" class="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-2xl mx-auto p-4 bg-black rounded-xl">
    <template v-for="(row, i) in board" :key="`row-${i}`">
      <button
        v-for="(word, j) in row"
        :key="`cell-${i}-${j}`"
        :class="getCellClass(i, j)"
        type="button"
        @click="word !== null && emit('cellClick', i, j)"
      >
        <span class="text-[8px] sm:text-[10px] md:text-xs text-center font-medium line-clamp-4 wrap-break-word hyphens-auto overflow-hidden w-full leading-[1.15]">
          {{ displayWord(word) }}
        </span>
        <!-- X overlay for clicked cells (not FREE) -->
        <svg
          v-if="clicked[i][j] && word !== null"
          class="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="15" y1="15" x2="85" y2="85"
            class="stroke-current text-emerald-400"
            stroke-width="6"
            stroke-linecap="round"
          />
          <line
            x1="85" y1="15" x2="15" y2="85"
            class="stroke-current text-emerald-400"
            stroke-width="6"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </template>
  </div>
</template>
