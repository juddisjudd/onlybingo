import { nanoid } from 'nanoid'
import { db } from '../../db'
import { boards } from '../../db/schema'
import { createBoardSchema } from '../../utils/validation'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Validate input
    const validated = createBoardSchema.parse(body)

    // Generate unique ID (10 characters)
    const id = nanoid(10)

    // Insert into database
    await db.insert(boards).values({
      id,
      words: validated.words,
      board: validated.board,
    })

    return { id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid board data',
        data: error.errors
      })
    }

    console.error('Failed to create board:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create board'
    })
  }
})
