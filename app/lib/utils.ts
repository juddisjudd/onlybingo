import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function generateBingoBoard(words: string[]): (string | null)[][] {
  if (words.length < 24) {
    throw new Error('Need at least 24 words')
  }

  const shuffled = shuffleArray(words)
  const selected = shuffled.slice(0, 24)

  return [
    selected.slice(0, 5),
    selected.slice(5, 10),
    [...selected.slice(10, 12), null, ...selected.slice(12, 14)], // null = FREE
    selected.slice(14, 19),
    selected.slice(19, 24),
  ]
}
