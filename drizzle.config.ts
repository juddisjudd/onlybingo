import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './drizzle/migrations',
  dbCredentials: {
    // Bun automatically loads .env files
    url: process.env.DATABASE_URL || ''
  }
})
