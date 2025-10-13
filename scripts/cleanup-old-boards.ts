#!/usr/bin/env bun

/**
 * Cleanup script to delete bingo boards older than 48 hours
 * Run this as a cron job in Coolify
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { boards } from '../server/db/schema'
import { sql } from 'drizzle-orm'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const client = postgres(DATABASE_URL)
const db = drizzle(client)

async function cleanupOldBoards() {
  try {
    console.log('🧹 Starting cleanup of boards older than 48 hours...')

    const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
    const cutoffTimestamp = cutoffDate.toISOString()

    console.log(`Cutoff date: ${cutoffTimestamp}`)

    const result = await db
      .delete(boards)
      .where(sql`${boards.createdAt} < ${cutoffTimestamp}`)
      .returning({ id: boards.id })

    console.log(`✅ Deleted ${result.length} board(s) older than 48 hours`)

    if (result.length > 0) {
      console.log('Deleted board IDs:', result.map(r => r.id).join(', '))
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

cleanupOldBoards()
