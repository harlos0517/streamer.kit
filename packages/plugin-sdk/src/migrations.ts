import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface PluginMigration {
  name: string
  sql: string
}

// Reads drizzle-kit-generated .sql files from a migrations directory, in
// filename order (drizzle-kit's numeric prefixes - 0000_, 0001_, ... - sort
// correctly as plain strings). Runtime never generates migrations itself
// (4.9: production install doesn't regenerate migrations) - this only reads
// files a plugin author already committed to their package.
export const loadMigrations = (migrationsDirUrl: string | URL): PluginMigration[] => {
  const dir = fileURLToPath(migrationsDirUrl)
  return readdirSync(dir)
    .filter(file => file.endsWith('.sql'))
    .sort()
    .map(file => ({ name: file, sql: readFileSync(resolve(dir, file), 'utf-8') }))
}
