import { generateBingoBoard } from '~/lib/utils'
import QRCode from 'qrcode'

export function useBingoBoard() {
  const words = ref<string[]>([])
  const wordsInput = ref('')
  const board = ref<(string | null)[][]>([])
  const clicked = ref<boolean[][]>([])
  const bingo = ref(false)
  const isExploding = ref(false)
  const qrCodeUrl = ref<string>('')
  const duplicateWords = ref<string[]>([])

  // Watch words input and parse
  watch(wordsInput, (value) => {
    words.value = value
      .split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 0)

    // Check for duplicates
    checkForDuplicates()
  })

  function checkForDuplicates() {
    const wordCounts = new Map<string, number>()

    // Count occurrences of each normalized word
    for (const word of words.value) {
      const normalized = word.toLowerCase().trim()
      wordCounts.set(normalized, (wordCounts.get(normalized) || 0) + 1)
    }

    // Find words that appear more than once
    const dupes: string[] = []
    for (const word of words.value) {
      const normalized = word.toLowerCase().trim()
      if (wordCounts.get(normalized)! > 1 && !dupes.includes(word)) {
        dupes.push(word)
      }
    }

    duplicateWords.value = dupes
  }

  function createBoard() {
    if (words.value.length < 24) {
      throw new Error('Need at least 24 words')
    }

    board.value = generateBingoBoard(words.value)
    clicked.value = Array(5).fill(null).map(() => Array(5).fill(false))
    // Mark FREE space as clicked
    if (clicked.value[2]) {
      clicked.value[2][2] = true
    }
    bingo.value = false
    isExploding.value = false
  }

  function toggleCell(row: number, col: number) {
    const rowData = clicked.value[row]
    if (rowData) {
      rowData[col] = !rowData[col]
      checkForBingo()
    }
  }

  function checkForBingo() {
    const hasBingo = useBingoCheck(clicked.value)

    if (hasBingo && !bingo.value) {
      bingo.value = true
      isExploding.value = true
      setTimeout(() => {
        isExploding.value = false
      }, 3000)
    } else {
      bingo.value = hasBingo
    }
  }

  function loadBoard(data: { words: string[], board: (string | null)[][] }) {
    // Set words first
    words.value = [...data.words]
    wordsInput.value = data.words.join('\n')

    // Generate a random board from the words instead of using the saved board
    board.value = generateBingoBoard(data.words)

    // Initialize clicked state
    clicked.value = Array(5).fill(null).map(() => Array(5).fill(false))
    // Mark FREE space as clicked
    if (clicked.value[2]) {
      clicked.value[2][2] = true
    }

    // Reset bingo state
    bingo.value = false
    isExploding.value = false
  }

  async function generateQRCode(url: string) {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      qrCodeUrl.value = qrDataUrl
      return qrDataUrl
    } catch (error) {
      console.error('Failed to generate QR code:', error)
      qrCodeUrl.value = ''
      return ''
    }
  }

  return {
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
    generateQRCode,
  }
}
