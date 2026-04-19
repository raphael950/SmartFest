import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'
import { readFileSync } from 'node:fs'

const readProjectDbEnv = () => {
  try {
    const file = readFileSync(app.makePath('.env'), 'utf8')

    return file.split(/\r?\n/).reduce<Record<string, string>>((values, line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        return values
      }

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) {
        return values
      }

      const key = trimmed.slice(0, separatorIndex).trim()
      if (!key.startsWith('PG_')) {
        return values
      }

      let value = trimmed.slice(separatorIndex + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      values[key] = value
      return values
    }, {})
  } catch {
    return {}
  }
}

const projectDbEnv = readProjectDbEnv()
const getDbEnv = (key: keyof typeof projectDbEnv) => projectDbEnv[key]

const dbConfig = defineConfig({
  connection: 'pg',

  connections: {
    /**
     * PostgreSQL connection pour Supabase
     */
    pg: {
      client: 'pg',
      connection: {
        host: getDbEnv('PG_HOST') ?? env.get('PG_HOST'),
        port: Number(getDbEnv('PG_PORT') ?? env.get('PG_PORT')),
        user: getDbEnv('PG_USER') ?? env.get('PG_USER'),
        password: getDbEnv('PG_PASSWORD') ?? env.get('PG_PASSWORD'),
        database: getDbEnv('PG_DB_NAME') ?? env.get('PG_DB_NAME'),
        ssl: {
          rejectUnauthorized: false,
        },
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: app.inDev,
    },
  },
})

export default dbConfig
