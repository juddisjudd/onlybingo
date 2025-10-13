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
  return cn(
    'aspect-square flex items-center justify-center p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 border border-zinc-700 overflow-hidden',
    {
      'bg-yellow-600 hover:bg-yellow-700': props.clicked[row][col] && !props.bingo,
      'bg-green-600 hover:bg-green-700': props.clicked[row][col] && props.bingo,
      'bg-zinc-800 hover:bg-zinc-700': !props.clicked[row][col],
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
      <div
        v-for="(word, j) in row"
        :key="`cell-${i}-${j}`"
        :class="getCellClass(i, j)"
        @click="emit('cellClick', i, j)"
      >
        <span class="text-[10px] sm:text-xs md:text-sm text-center font-medium line-clamp-3 break-words overflow-hidden w-full leading-tight">
          {{ truncateWord(word) }}
        </span>
      </div>
    </template>
  </div>
</template>
