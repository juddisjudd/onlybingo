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

  async function saveBoardAsPng() {
    try {
      // Wait for Vue to finish rendering
      await nextTick()
      
      // Canvas-based rendering for reliable PNG export
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Could not get canvas context')
        return false
      }

      const cellSize = 120
      const gap = 8
      const padding = 20
      const gridSize = 5
      const totalSize = padding * 2 + gridSize * cellSize + (gridSize - 1) * gap

      canvas.width = totalSize
      canvas.height = totalSize

      // Background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, totalSize, totalSize)

      // Draw cells
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const x = padding + col * (cellSize + gap)
          const y = padding + row * (cellSize + gap)
          
          const isClicked = clicked.value[row]?.[col] ?? false
          const word = board.value[row]?.[col]
          const isFree = word === null

          // Cell background - semi-transparent blue for FREE, neutral for others
          if (isFree) {
            ctx.fillStyle = '#1e3a5f' // blue-600/30 approximation on black
          } else {
            ctx.fillStyle = '#18181b' // zinc-900
          }
          
          // Draw rounded rectangle
          const radius = 8
          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + cellSize - radius, y)
          ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + radius)
          ctx.lineTo(x + cellSize, y + cellSize - radius)
          ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize)
          ctx.lineTo(x + radius, y + cellSize)
          ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - radius)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
          ctx.fill()

          // Cell border
          if (isFree) {
            ctx.strokeStyle = '#3b82f680' // blue-500/50
          } else {
            ctx.strokeStyle = '#3f3f46' // zinc-700
          }
          ctx.lineWidth = 1
          ctx.stroke()

          // Text
          ctx.fillStyle = isFree ? '#93c5fd' : '#d4d4d8' // blue-300 for FREE, zinc-300 for others
          ctx.font = '500 12px system-ui, -apple-system, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          const displayText = isFree ? 'FREE' : (word || '')
          const maxWidth = cellSize - 16
          const lines = wrapText(ctx, displayText, maxWidth)
          const lineHeight = 14
          const totalTextHeight = lines.length * lineHeight
          const startY = y + (cellSize - totalTextHeight) / 2 + lineHeight / 2

          lines.forEach((line, i) => {
            ctx.fillText(line, x + cellSize / 2, startY + i * lineHeight, maxWidth)
          })

          // Draw X mark for clicked cells (not FREE)
          if (isClicked && !isFree) {
            const xPadding = cellSize * 0.15
            const x1 = x + xPadding
            const y1 = y + xPadding
            const x2 = x + cellSize - xPadding
            const y2 = y + cellSize - xPadding

            ctx.strokeStyle = '#34d399' // emerald-400
            ctx.lineWidth = 4
            ctx.lineCap = 'round'

            // First line of X (top-left to bottom-right)
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()

            // Second line of X (top-right to bottom-left)
            ctx.beginPath()
            ctx.moveTo(x2, y1)
            ctx.lineTo(x1, y2)
            ctx.stroke()
          }
        }
      }

      const link = document.createElement('a')
      link.download = `bingo-board-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      return true
    } catch (error) {
      console.error('Failed to save board as PNG:', error)
      return false
    }
  }

  // Helper function to wrap text into multiple lines
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }

    // Limit to 4 lines max
    if (lines.length > 4) {
      lines.length = 4
      lines[3] = lines[3].slice(0, -3) + '...'
    }

    return lines
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
    saveBoardAsPng,
  }
}
