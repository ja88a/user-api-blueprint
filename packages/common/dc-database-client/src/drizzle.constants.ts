// export const PG_CONNECTION = 'PG_CONNECTION'
export const NEST_DRIZZLE_OPTIONS = 'NEST_DRIZZLE_OPTIONS'
export const DRIZZLE_ORM = 'DRIZZLE_ORM'

/** Default database client / driver name */
export const DB_DRIVER_DEFAULT = 'postgres-js'

/** Default database client / driver name for the drizzle-kit ops */
export const DB_DRIVER_DRIZZLE_KIT = 'pg'

/** Default DB dialect for the drizzle-kit ops */
export const DB_DRIZZLE_KIT_DIALECT = 'postgresql'

/** Default directory for the generated database migration scripts */
export const DB_MIGRATION_DIR = './migration'

/** Default database name */
const DB_NAME_DEFAULT = 'tuba'

/**
 * Compute the PostgreSQL DB connection URL for a given database name, based on
 * the provided environment variables.
 * @param dbName the target DB name - if none is provided, use the env one or the default database name
 * @return the connection URL for the given database name
 */
export const databaseConnectURL = (dbName: string | undefined): string => {
  const encodedPwd = encodeURIComponent(process.env.DATABASE_USER_PWD)
  return (
    'postgresql://' +
    process.env.DATABASE_USER_NAME +
    ':' +
    encodedPwd +
    '@' +
    process.env.DATABASE_ENDPOINT +
    '/' +
    (dbName || process.env.DATABASE_DB_NAME || DB_NAME_DEFAULT)
  )
}
