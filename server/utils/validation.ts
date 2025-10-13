import { z } from 'zod'

export const createBoardSchema = z.object({
  words: z.array(z.string().min(1).max(100)).min(24).max(200),
  board: z.array(z.array(z.string().nullable()).length(5)).length(5)
})

export const boardIdSchema = z.string().min(8).max(12)
