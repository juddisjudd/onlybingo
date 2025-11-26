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
  const isClicked = props.clicked[row][col]
  const isFree = props.board[row][col] === null
  
  return cn(
    'aspect-square flex items-center justify-center p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] border overflow-hidden',
    {
      // Bingo state (brighter blue glow)
      'bg-blue-500 border-blue-400 hover:bg-blue-400 shadow-lg shadow-blue-500/25 text-white': isClicked && props.bingo,
      // Clicked state (electric blue)
      'bg-blue-600 border-blue-500 hover:bg-blue-500 text-white': isClicked && !props.bingo,
      // Free space styling
      'bg-zinc-900 border-zinc-700 hover:bg-zinc-800': !isClicked && isFree,
      // Unclicked state
      'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700': !isClicked && !isFree,
    }
  )
}

function truncateWord(word: string | null, maxLength = 20) {
  if (!word) return 'FREE'
  return word.length > maxLength ? `${word.slice(0, maxLength)}...` : word
}
</script>

<template>
  <div class="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-2xl mx-auto">
    <template v-for="(row, i) in board" :key="`row-${i}`">
      <button
        v-for="(word, j) in row"
        :key="`cell-${i}-${j}`"
        :class="getCellClass(i, j)"
        type="button"
        @click="emit('cellClick', i, j)"
      >
        <span class="text-[10px] sm:text-xs md:text-sm text-center font-medium line-clamp-3 wrap-break-word overflow-hidden w-full leading-tight">
          {{ truncateWord(word) }}
        </span>
      </button>
    </template>
  </div>
</template>
