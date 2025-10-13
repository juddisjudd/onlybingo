import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = useRuntimeConfig().databaseUrl

if (!connectionString) {
  console.error('❌ DATABASE_URL is missing from environment variables')
  console.error('Make sure DATABASE_URL is set in your .env file or production environment')
  throw new Error('DATABASE_URL environment variable is required')
}

// Log connection info (hiding password)
const sanitizedUrl = connectionString.replace(/:[^:@]+@/, ':****@')
console.log('✅ Database connection initialized:', sanitizedUrl)

// For migrations
export const migrationClient = postgres(connectionString, { max: 1 })

// For queries
const queryClient = postgres(connectionString)
export const db = drizzle(queryClient, { schema })
