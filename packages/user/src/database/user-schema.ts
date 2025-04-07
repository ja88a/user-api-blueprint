import {
  UserAccountStatusDefault,
  UserStatusDefault,
  UserTypeDefault,
} from '../data'
import { relations } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import {
  MODEL_VERSION_USER_ACCOUNTS,
  MODEL_VERSION_USERS,
} from './user-ds.constants'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),

  mv: integer('mv').default(MODEL_VERSION_USERS),
  status: varchar('status', { length: 64 }).default(UserStatusDefault).notNull(),

  handle: varchar('handle', { length: 64 }).notNull().unique(),

  name: varchar('name', { length: 64 }).notNull(),
  nameLast: varchar('name_last', { length: 128 }),

  type: varchar('type', { length: 32 }).default(UserTypeDefault).notNull(),

  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
})

/**
 * User Accounts table
 */
export const accounts = pgTable(
  'accounts',
  {
    id: serial('id').primaryKey(),

    mv: integer('mv').default(MODEL_VERSION_USER_ACCOUNTS),
    status: varchar('status', { length: 64 })
      .default(UserAccountStatusDefault)
      .notNull(),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id),

    type: varchar('type', { length: 32 }).notNull(),
    default: boolean('default'),

    identifier: varchar('identifier', { length: 128 }).notNull(),
    name: varchar('name', { length: 64 }),

    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  },
  (table) => ({
    accountUniqueIndex: uniqueIndex('accountUniqueIndex').on(
      table.userId,
      table.type,
      table.identifier,
    ),
  }),
)

/**
 * User relations
 */
export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}))

/**
 * Account relations
 */
export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}))
