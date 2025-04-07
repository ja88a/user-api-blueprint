import { SQL, sql } from 'drizzle-orm'
import { AnyPgColumn } from 'drizzle-orm/pg-core'

export function lower(fieldValue: AnyPgColumn): SQL {
  return sql`lower(${fieldValue})`
}
