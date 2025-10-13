<script setup lang="ts">
import ConfettiExplosion from 'vue-confetti-explosion'

const route = useRoute()
const {
  words,
  wordsInput,
  board,
  clicked,
  bingo,
  isExploding,
  createBoard,
  toggleCell,
  loadBoard
} = useBingoBoard()

const {
  shareableLink,
  isGenerating,
  generateShareLink,
  copyToClipboard
} = useShareBoard()

const copied = ref(false)

// Track if we're loading a shared board
const isLoadingShared = ref(false)
const loadError = ref<string | null>(null)

// Load board from URL on mount
onMounted(async () => {
  const id = route.query.id as string
  console.log('Route query ID:', id)
  if (id) {
    isLoadingShared.value = true
    loadError.value = null
    try {
      console.log('Fetching board with ID:', id)
      const data = await $fetch(`/api/boards/${id}`)
      console.log('Loaded board data:', data)
      if (data && data.words && Array.isArray(data.words) && data.words.length >= 24) {
        loadBoard(data)
        console.log('Board loaded successfully')
        console.log('Board state:', {
          boardLength: board.value.length,
          wordsCount: words.value.length,
          wordsInputLength: wordsInput.value.length
        })
      } else {
        loadError.value = 'Invalid board data'
        console.error('Invalid board data:', data)
      }
    } catch (error: any) {
      loadError.value = error.statusMessage || error.message || 'Failed to load board'
      console.error('Failed to load board:', error)
    } finally {
      isLoadingShared.value = false
    }
  }
})

async function handleCreateBoard() {
  try {
    createBoard()
    await generateShareLink(wordsInput.value.split('\n').filter(w => w.trim().length > 0), board.value)
  } catch (error) {
    console.error('Failed to create board:', error)
  }
}

function handleRegenerate() {
  try {
    createBoard()
  } catch (error) {
    console.error('Failed to regenerate board:', error)
  }
}

async function handleCopy() {
  const success = await copyToClipboard()
  if (success) {
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 container max-w-7xl mx-auto px-4 py-6 md:py-8">
      <!-- Header -->
      <header class="text-center mb-8 md:mb-12">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-1 bg-gradient-to-r from-[#FDC830] to-[#F37335] text-transparent bg-clip-text leading-tight pb-4">
          Only Bingo!
        </h1>
        <p class="text-base md:text-lg text-muted-foreground px-4">
          Create custom bingo boards and share them with friends
        </p>
      </header>

      <!-- Content -->
      <div :class="['grid gap-6 md:gap-8', board.length > 0 ? 'lg:grid-cols-[1fr_2fr_1fr]' : 'place-items-center']">
        <!-- Left spacer (desktop) -->
        <div v-if="board.length > 0" class="hidden lg:block" />

        <!-- Board or Input -->
        <div class="w-full max-w-2xl mx-auto lg:max-w-none">
          <!-- Loading State -->
          <div v-if="isLoadingShared" class="flex items-center justify-center p-12">
            <div class="text-center space-y-4">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDC830] mx-auto"></div>
              <p class="text-muted-foreground">Loading board...</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="loadError" class="p-8 bg-red-900/20 border border-red-800 rounded-lg">
            <p class="text-red-400 text-center">{{ loadError }}</p>
          </div>

          <!-- Input or Board -->
          <template v-else-if="board.length === 0">
            <WordInput v-model="wordsInput" :show-clear="true">
              <template #actions="{ isValid }">
                <Button
                  :disabled="!isValid"
                  @click="handleCreateBoard"
                  class="w-full sm:w-auto bg-gradient-to-r from-[#FDC830] to-[#F37335] hover:from-[#FDC830]/90 hover:to-[#F37335]/90 font-semibold px-8 py-3 text-base text-zinc-900"
                >
                  Create Board
                </Button>
              </template>
            </WordInput>
          </template>

          <template v-else>
            <BoardGrid
              :board="board"
              :clicked="clicked"
              :bingo="bingo"
              @cell-click="toggleCell"
            />
          </template>
        </div>

        <!-- Right sidebar (when board exists) -->
        <div v-if="board.length > 0" class="space-y-4 md:space-y-6 max-w-2xl mx-auto lg:max-w-none">
          <WordInput v-model="wordsInput" class="lg:sticky lg:top-4">
            <template #actions="{ isValid }">
              <Button
                :disabled="!isValid"
                @click="handleRegenerate"
                class="w-full sm:w-auto bg-gradient-to-r from-[#FDC830] to-[#F37335] hover:from-[#FDC830]/90 hover:to-[#F37335]/90 font-medium px-5 py-2 text-sm text-zinc-900"
              >
                Regenerate
              </Button>
            </template>
          </WordInput>

          <!-- Share Card -->
          <div v-if="isGenerating" class="animate-pulse">
            <div class="h-24 bg-zinc-800 rounded-lg" />
          </div>
          <Card v-else-if="shareableLink" class="p-4 md:p-6">
            <p class="text-sm text-muted-foreground mb-3">Share this board:</p>
            <Button
              @click="handleCopy"
              class="w-full bg-gradient-to-r from-[#FDC830] to-[#F37335] hover:from-[#FDC830]/90 hover:to-[#F37335]/90 font-semibold px-6 py-2.5 text-zinc-900"
            >
              <Icon v-if="copied" name="lucide:check" class="mr-2" />
              {{ copied ? 'Copied!' : 'Copy Share Link' }}
            </Button>
          </Card>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 text-center text-sm text-zinc-400 border-t border-zinc-800">
      <p>
        &copy; {{ new Date().getFullYear() }}
        <NuxtLink
          to="https://www.twitch.tv/ohitsjudd"
          external
          class="hover:text-zinc-200 transition-colors"
        >
          ohitsjudd
        </NuxtLink>
        · Drive-by reserved
      </p>
    </footer>

    <!-- Confetti Overlay -->
    <Teleport to="body">
      <div
        v-if="bingo && isExploding"
        class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <ConfettiExplosion
          :force="0.8"
          :duration="3000"
          :particle-count="250"
          :width="1600"
        />
        <div class="relative">
          <div class="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FDC830] to-[#F37335] animate-pulse-slow">
            BINGO!
          </div>
          <div class="absolute inset-0 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FDC830] to-[#F37335] blur-2xl">
            BINGO!
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
