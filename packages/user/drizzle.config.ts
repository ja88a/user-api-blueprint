import type { Config } from 'drizzle-kit'
import {
  databaseConnectURL,
  DB_DRIZZLE_KIT_DIALECT,
  DB_MIGRATION_DIR,
} from '../common/dc-database-client'
import { DB_NAME_DEFAULT } from './src/database/user-ds.constants'

// import * as dotenv from 'dotenv'
// dotenv.config()

export default {
  schema: './src/database/user-schema.ts',
  out: DB_MIGRATION_DIR,
  dialect: DB_DRIZZLE_KIT_DIALECT,
  dbCredentials: {
    url: databaseConnectURL(DB_NAME_DEFAULT),
  },
} satisfies Config
