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
      console.error('❌ Invalid board ID:', id, error.errors)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid board ID'
      })
    }

    if (error.statusCode === 404) {
      console.error('❌ Board not found:', id)
      throw error
    }

    console.error('❌ Failed to fetch board:', {
      boardId: id,
      error: error.message || error,
      stack: error.stack
    })
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch board'
    })
  }
})
