import { generateBingoBoard } from '~/lib/utils'

export function useBingoBoard() {
  const words = ref<string[]>([])
  const wordsInput = ref('')
  const board = ref<(string | null)[][]>([])
  const clicked = ref<boolean[][]>([])
  const bingo = ref(false)
  const isExploding = ref(false)

  // Watch words input and parse
  watch(wordsInput, (value) => {
    words.value = value
      .split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 0)
  })

  function createBoard() {
    if (words.value.length < 24) {
      throw new Error('Need at least 24 words')
    }

    board.value = generateBingoBoard(words.value)
    clicked.value = Array(5).fill(null).map(() => Array(5).fill(false))
    // Mark FREE space as clicked
    clicked.value[2][2] = true
    bingo.value = false
    isExploding.value = false
  }

  function toggleCell(row: number, col: number) {
    clicked.value[row][col] = !clicked.value[row][col]
    checkForBingo()
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
    words.value = data.words
    wordsInput.value = data.words.join('\n')
    // Generate a random board from the words instead of using the saved board
    board.value = generateBingoBoard(data.words)
    clicked.value = Array(5).fill(null).map(() => Array(5).fill(false))
    // Mark FREE space as clicked
    clicked.value[2][2] = true
    bingo.value = false
    isExploding.value = false
  }

  return {
    words,
    wordsInput,
    board,
    clicked,
    bingo,
    isExploding,
    createBoard,
    toggleCell,
    loadBoard,
  }
}
