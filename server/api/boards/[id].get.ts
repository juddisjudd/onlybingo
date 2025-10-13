import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { boards } from '../../db/schema'
import { boardIdSchema } from '../../utils/validation'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    // Validate ID
    const validatedId = boardIdSchema.parse(id)

    // Query database
    const [board] = await db
      .select({
        words: boards.words,
        board: boards.board,
      })
      .from(boards)
      .where(eq(boards.id, validatedId))
      .limit(1)

    if (!board) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Board not found'
      })
    }

    return board
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid board ID'
      })
    }

    if (error.statusCode === 404) {
      throw error
    }

    console.error('Failed to fetch board:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch board'
    })
  }
})
