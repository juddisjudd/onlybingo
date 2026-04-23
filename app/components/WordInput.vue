<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'

interface Props {
  showClear?: boolean
  showPreview?: boolean
  duplicateWords?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  showClear: false,
  showPreview: false,
  duplicateWords: () => []
})

const model = defineModel<string>({ required: true })
const freeSpaceText = defineModel<string>('freeSpaceText', { default: 'FREE' })

const hasDuplicates = computed(() => props.duplicateWords && props.duplicateWords.length > 0)

const STORAGE_KEY = 'onlybingo_word_list'
const FREE_SPACE_KEY = 'onlybingo_free_space_text'

const words = computed(() => {
  return model.value
    .split('\n')
    .map(w => w.trim())
    .filter(w => w.length > 0)
})

const wordCount = computed(() => words.value.length)

const isValid = computed(() => wordCount.value >= 24)

function clearList() {
  model.value = ''
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }
}

watch(model, (newValue) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, newValue)
    } catch (error) {
      console.error('Failed to save word list to localStorage:', error)
    }
  }
}, { immediate: false })

watch(freeSpaceText, (newValue) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FREE_SPACE_KEY, newValue)
    } catch (error) {
      console.error('Failed to save free space text to localStorage:', error)
    }
  }
}, { immediate: false })

onMounted(() => {
  if (typeof window !== 'undefined' && !model.value) {
    try {
      const savedWords = localStorage.getItem(STORAGE_KEY)
      if (savedWords) model.value = savedWords

      const savedFreeSpace = localStorage.getItem(FREE_SPACE_KEY)
      if (savedFreeSpace) freeSpaceText.value = savedFreeSpace
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Main content area -->
    <div :class="['grid gap-6', showPreview ? 'md:grid-cols-[5fr_2fr]' : '']">
      <!-- Textarea -->
      <textarea
        v-model="model"
        placeholder="Enter words, one per line... (Your list is auto-saved!)"
        :class="[
          'w-full p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-y backdrop-blur-sm transition-all duration-200',
          showPreview ? 'min-h-[350px] max-h-[450px]' : 'min-h-[400px] max-h-[600px]'
        ]"
      />
      
      <!-- Board Preview -->
      <div v-if="showPreview">
        <BoardPreview :words="words" :free-space-text="freeSpaceText" />
      </div>
    </div>

    <!-- Free space text -->
    <div class="flex items-center gap-3">
      <label class="text-xs text-zinc-400 whitespace-nowrap shrink-0">Free space text:</label>
      <input
        v-model="freeSpaceText"
        type="text"
        maxlength="30"
        placeholder="FREE"
        class="flex-1 max-w-[180px] px-3 py-1.5 text-xs bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
      />
    </div>

    <!-- Word count and action buttons -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="flex flex-col gap-1">
        <p class="text-xs sm:text-sm text-muted-foreground">
          <span class="font-medium">Words:</span>
          <span :class="['ml-1 font-semibold', isValid ? 'text-emerald-400' : 'text-red-400']">
            {{ wordCount }}
          </span>
          <span v-if="!isValid" class="text-red-400 ml-2">
            (minimum 24)
          </span>
        </p>
        <p v-if="hasDuplicates" class="text-xs text-amber-400 flex items-start gap-1">
          <Icon name="lucide:alert-triangle" class="w-3 h-3 mt-0.5 shrink-0" />
          <span>
            Duplicate words detected: {{ duplicateWords?.join(', ') }}
          </span>
        </p>
        <p class="text-[10px] text-zinc-500">
          ✓ Auto-saved to your browser
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <button
          v-if="showClear && wordCount > 0"
          class="text-sm font-medium px-6 py-2 rounded-md bg-zinc-800 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-zinc-700 hover:border-red-800 transition-all w-full sm:w-auto"
          @click="clearList"
        >
          Clear List
        </button>
        <slot name="actions" :is-valid="isValid" />
      </div>
    </div>
  </div>
</template>
