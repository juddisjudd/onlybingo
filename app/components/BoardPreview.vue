<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

interface Props {
  words: string[]
}

const props = defineProps<Props>()

// Generate a stable preview board from the first 24 words (no shuffle for preview)
const previewBoard = computed<(string | null)[][]>(() => {
  const wordList = props.words.slice(0, 24)
  
  // Fill with empty slots if not enough words
  while (wordList.length < 24) {
    wordList.push('')
  }
  
  return [
    wordList.slice(0, 5),
    wordList.slice(5, 10),
    [...wordList.slice(10, 12), null, ...wordList.slice(12, 14)], // null = FREE
    wordList.slice(14, 19),
    wordList.slice(19, 24),
  ]
})

const hasEnoughWords = computed(() => props.words.length >= 24)

function displayWord(word: string | null) {
  if (word === null) return 'FREE'
  if (!word) return ''
  return word
}

function getCellClass(word: string | null) {
  const isFree = word === null
  const isEmpty = word === ''
  
  return cn(
    'aspect-square flex items-center justify-center p-0.5 rounded-md text-[6px] sm:text-[7px] font-medium transition-all duration-200 border overflow-hidden',
    {
      // FREE space
      'bg-blue-600/30 border-blue-500/50 text-blue-300': isFree,
      // Empty slot (not enough words yet)
      'bg-zinc-800/30 border-zinc-700/30 border-dashed text-zinc-600': isEmpty,
      // Filled slot
      'bg-zinc-800/50 border-zinc-700/50 text-zinc-300': !isFree && !isEmpty,
    }
  )
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground font-medium">Board Preview</p>
      <p :class="['text-xs font-medium', hasEnoughWords ? 'text-emerald-400' : 'text-zinc-500']">
        {{ hasEnoughWords ? '✓ Ready to create!' : `${24 - words.length} more needed` }}
      </p>
    </div>
    
    <div class="grid grid-cols-5 gap-1.5 w-full aspect-square max-w-[350px]">
      <template v-for="(row, i) in previewBoard" :key="`row-${i}`">
        <div
          v-for="(word, j) in row"
          :key="`cell-${i}-${j}`"
          :class="getCellClass(word)"
          :title="word || (word === null ? 'FREE' : 'Empty')"
        >
          <span class="line-clamp-4 text-center leading-[1.1] wrap-break-word hyphens-auto w-full">
            {{ displayWord(word) }}
          </span>
        </div>
      </template>
    </div>
    
    <p class="text-xs text-zinc-500 italic">
      Final board will be shuffled randomly
    </p>
  </div>
</template>
