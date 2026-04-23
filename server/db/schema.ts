import { pgTable, varchar, timestamp, json } from 'drizzle-orm/pg-core'

export const boards = pgTable('boards', {
  id: varchar('id', { length: 10 }).primaryKey(), // nanoid with length 10
  words: json('words').$type<string[]>().notNull(),
  board: json('board').$type<(string | null)[][]>().notNull(),
  freeSpaceText: varchar('free_space_text', { length: 30 }).default('FREE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Board = typeof boards.$inferSelect
export type NewBoard = typeof boards.$inferInsert
