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
  qrCodeUrl,
  duplicateWords,
  createBoard,
  toggleCell,
  loadBoard,
  generateQRCode
} = useBingoBoard()

const {
  shareableLink,
  isGenerating,
  generateShareLink,
  copyToClipboard
} = useShareBoard()

const copied = ref(false)
const showQR = ref(false)

// Track if we're loading a shared board
const isLoadingShared = ref(false)
const loadError = ref<string | null>(null)

// Load board from URL - use onMounted to avoid hydration mismatch
onMounted(async () => {
  const id = route.query.id as string
  if (id) {
    isLoadingShared.value = true
    loadError.value = null
    try {
      const data = await $fetch(`/api/boards/${id}`)
      if (data && data.words && Array.isArray(data.words) && data.words.length >= 24) {
        loadBoard(data)
      } else {
        loadError.value = 'Invalid board data'
      }
    } catch (error: unknown) {
      const err = error as { statusMessage?: string; message?: string }
      loadError.value = err.statusMessage || err.message || 'Failed to load board'
    } finally {
      isLoadingShared.value = false
    }
  }
})

async function handleCreateBoard() {
  try {
    createBoard()
    await generateShareLink(wordsInput.value.split('\n').filter(w => w.trim().length > 0), board.value)
    // Generate QR code after share link is created
    if (shareableLink.value) {
      await generateQRCode(shareableLink.value)
    }
  } catch (error) {
    console.error('Failed to create board:', error)
  }
}

async function toggleQRCode() {
  if (!showQR.value && !qrCodeUrl.value && shareableLink.value) {
    await generateQRCode(shareableLink.value)
  }
  showQR.value = !showQR.value
}

async function handleRegenerate() {
  try {
    createBoard()
    // Update the share link with the new board
    await generateShareLink(wordsInput.value.split('\n').filter(w => w.trim().length > 0), board.value)
    // Regenerate QR code with the new share link
    if (shareableLink.value) {
      await generateQRCode(shareableLink.value)
    }
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

function handleGoHome() {
  // Clear all board state
  board.value = []
  words.value = []
  wordsInput.value = ''
  clicked.value = []
  bingo.value = false
  isExploding.value = false
  shareableLink.value = ''
  loadError.value = null

  // Navigate to home (removes query params)
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 container max-w-7xl mx-auto px-4 py-6 md:py-8">
      <!-- Header -->
      <header class="text-center mb-8 md:mb-12">
        <button
          class="inline-block group border-none bg-transparent p-0 m-0 cursor-pointer"
          @click="handleGoHome"
        >
          <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-black mb-1 gradient-text leading-tight pb-4 uppercase tracking-tight drop-shadow-lg">
            Only Bingo!
          </h1>
        </button>
        <p class="text-base md:text-lg text-zinc-400 px-4">
          Create custom bingo boards and share them with friends
        </p>
      </header>

      <!-- Content -->
      <ClientOnly>
        <div :class="['grid gap-6 md:gap-8', board.length > 0 ? 'lg:grid-cols-[1fr_2fr_1fr]' : 'place-items-center']">
          <!-- Left spacer (desktop) -->
          <div v-if="board.length > 0" class="hidden lg:block" />

          <!-- Board or Input -->
          <div class="w-full max-w-2xl mx-auto lg:max-w-none">
            <!-- Loading State -->
            <div v-if="isLoadingShared" class="flex items-center justify-center p-12">
              <div class="text-center space-y-4">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
                <p class="text-zinc-400">Loading board...</p>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="loadError" class="p-8 bg-red-900/20 border border-red-800 rounded-lg">
              <p class="text-red-400 text-center">{{ loadError }}</p>
            </div>

            <!-- Input or Board -->
            <template v-else-if="board.length === 0">
              <WordInput v-model="wordsInput" :show-clear="true" :duplicate-words="duplicateWords">
                <template #actions="{ isValid }">
                  <Button
                    :disabled="!isValid"
                    class="w-full sm:w-auto font-medium px-6 py-2 text-sm rounded-md transition-all bg-zinc-800 hover:bg-blue-950/50 text-blue-400 hover:text-blue-300 border border-zinc-700 hover:border-blue-600"
                    @click="handleCreateBoard"
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
            <WordInput v-model="wordsInput" :duplicate-words="duplicateWords" class="lg:sticky lg:top-4">
              <template #actions="{ isValid }">
                <Button
                  :disabled="!isValid"
                  class="w-full sm:w-auto font-medium px-4 py-1.5 text-sm rounded-md transition-all bg-zinc-800 hover:bg-blue-950/50 text-blue-400 hover:text-blue-300 border border-zinc-700 hover:border-blue-600"
                  @click="handleRegenerate"
                >
                  Regenerate
                </Button>
              </template>
            </WordInput>

            <!-- Share Card -->
            <Card v-if="shareableLink || isGenerating" class="p-4 md:p-6 space-y-4">
              <div>
                <p class="text-sm text-muted-foreground mb-3">Share this board:</p>
                <div class="space-y-2">
                  <!-- Skeleton buttons during loading -->
                  <template v-if="isGenerating">
                    <div class="w-full h-9 bg-zinc-800 rounded-md animate-pulse" />
                    <div class="w-full h-9 bg-zinc-800 rounded-md animate-pulse" />
                  </template>
                  <template v-else>
                    <Button
                      class="w-full font-medium px-4 py-2 text-sm rounded-md transition-all bg-zinc-800 hover:bg-blue-950/50 text-blue-400 hover:text-blue-300 border border-zinc-700 hover:border-blue-600"
                      @click="handleCopy"
                    >
                      <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="mr-2 h-4 w-4 shrink-0" />
                      {{ copied ? 'Copied!' : 'Copy Link' }}
                    </Button>
                    <Button
                      variant="outline"
                      class="w-full"
                      @click="toggleQRCode"
                    >
                      <Icon :name="showQR ? 'lucide:x' : 'lucide:qr-code'" class="mr-2" />
                      {{ showQR ? 'Hide QR Code' : 'Show QR Code' }}
                    </Button>
                  </template>
                </div>
              </div>

              <!-- QR Code Display -->
              <div v-if="showQR && qrCodeUrl && !isGenerating" class="pt-2 border-t border-zinc-800">
                <p class="text-xs text-muted-foreground mb-3 text-center">Scan to share</p>
                <div class="flex justify-center">
                  <img :src="qrCodeUrl" alt="QR Code" class="rounded-lg bg-white p-2 w-32 h-32 object-contain">
                </div>
              </div>
            </Card>
          </div>
        </div>
        <template #fallback>
          <div class="flex items-center justify-center p-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </template>
      </ClientOnly>
    </main>

    <!-- Footer -->
    <footer class="py-6 text-center text-sm text-zinc-400 border-t border-zinc-800">
      <p class="flex items-center justify-center gap-2">
        &copy; {{ new Date().getFullYear() }}
        <NuxtLink
          to="https://www.twitch.tv/ohitsjudd"
          external
          class="hover:text-zinc-200 transition-colors"
        >
          ohitsjudd
        </NuxtLink>
        <span>·</span>
        <NuxtLink
          to="https://github.com/juddisjudd/onlybingo"
          external
          class="hover:text-zinc-200 transition-colors flex items-center gap-1"
        >
          <Icon name="lucide:github" class="w-4 h-4" />
          Open Source
        </NuxtLink>
      </p>
    </footer>

    <!-- Confetti Overlay -->
    <Teleport to="body">
      <div
        v-if="bingo && isExploding"
        class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-xs" />
        <ConfettiExplosion
          :force="0.8"
          :duration="3000"
          :particle-count="250"
          :width="1600"
        />
        <div class="relative">
          <div class="font-display text-8xl md:text-9xl font-black gradient-text animate-pulse-slow uppercase tracking-tight drop-shadow-lg">
            BINGO!
          </div>
          <div class="absolute inset-0 font-display text-8xl md:text-9xl font-black text-blue-500/30 blur-2xl uppercase tracking-tight">
            BINGO!
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
