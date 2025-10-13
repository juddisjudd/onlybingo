export function useBingoCheck(clicked: boolean[][]): boolean {
  // Check rows
  for (let i = 0; i < 5; i++) {
    if (clicked[i].every(Boolean)) return true
  }

  // Check columns
  for (let i = 0; i < 5; i++) {
    if (clicked.every(row => row[i])) return true
  }

  // Check diagonals
  if (clicked.every((row, i) => row[i])) return true
  if (clicked.every((row, i) => row[4 - i])) return true

  return false
}
