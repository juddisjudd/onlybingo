<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'

interface Props {
  showClear?: boolean
  duplicateWords?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  showClear: false,
  duplicateWords: () => []
})

const model = defineModel<string>({ required: true })

const hasDuplicates = computed(() => props.duplicateWords && props.duplicateWords.length > 0)

const STORAGE_KEY = 'onlybingo_word_list'

const wordCount = computed(() => {
  return model.value
    .split('\n')
    .map(w => w.trim())
    .filter(w => w.length > 0)
    .length
})

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

// Save to localStorage whenever the word list changes
watch(model, (newValue) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, newValue)
    } catch (error) {
      console.error('Failed to save word list to localStorage:', error)
    }
  }
}, { immediate: false })

// Load from localStorage on mount if model is empty
onMounted(() => {
  if (typeof window !== 'undefined' && !model.value) {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        model.value = saved
      }
    } catch (error) {
      console.error('Failed to load word list from localStorage:', error)
    }
  }
})
</script>

<template>
  <div class="space-y-4">
    <textarea
      v-model="model"
      placeholder="Enter words, one per line... (Your list is auto-saved!)"
      class="w-full min-h-[300px] max-h-[600px] p-4 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-y backdrop-blur-sm transition-all duration-200"
    />

    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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

      <div class="flex items-center gap-2">
        <button
          v-if="showClear && wordCount > 0"
          class="text-sm font-medium px-6 py-2 rounded-md bg-zinc-800 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-zinc-700 hover:border-red-800 transition-all"
          @click="clearList"
        >
          Clear List
        </button>
        <slot name="actions" :is-valid="isValid" />
      </div>
    </div>
  </div>
</template>
