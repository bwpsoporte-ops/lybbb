import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  date,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).notNull().default('OWNER'), // OWNER, PARTNER
  coupleId: uuid('couple_id'), // To link partners
  mustChangePassword: boolean('must_change_password').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const incomes = pgTable('incomes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 100 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  date: date('date').notNull(),
  visibility: varchar('visibility', { length: 50 }).notNull().default('PRIVATE'), // PRIVATE, SHARED
  isRecurring: boolean('is_recurring').default(false).notNull(),
  recurrenceFrequency: varchar('recurrence_frequency', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const creditCards = pgTable('credit_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  bank: varchar('bank', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  lastFour: varchar('last_four', { length: 4 }).notNull(),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }).notNull(),
  balance: numeric('balance', { precision: 12, scale: 2 }).notNull(),
  cutDate: date('cut_date').notNull(),
  dueDate: date('due_date').notNull(),
  minPayment: numeric('min_payment', { precision: 12, scale: 2 }).default('0'),
  visibility: varchar('visibility', { length: 50 }).notNull().default('PRIVATE'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
  targetDate: date('target_date').notNull(),
  currentAmount: numeric('current_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  visibility: varchar('visibility', { length: 50 }).notNull().default('PRIVATE'),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'), // ACTIVE, COMPLETED, PAUSED, CANCELLED
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }).notNull(),
  date: date('date').notNull(),
  visibility: varchar('visibility', { length: 50 }).notNull().default('PRIVATE'),
  cardId: uuid('card_id').references(() => creditCards.id),
  projectId: uuid('project_id').references(() => projects.id),
  splitType: varchar('split_type', { length: 50 }), // 50/50, 70/30, etc.
  splitData: jsonb('split_data'), // stores details of who owes what
  receiptUrl: text('receipt_url'),
  ocrStatus: varchar('ocr_status', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const fixedExpenses = pgTable('fixed_expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  dayOfMonth: numeric('day_of_month').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('ACTIVE'), // ACTIVE, PAUSED, FINISHED, OVERDUE
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const coupleBalances = pgTable('couple_balances', {
  id: uuid('id').primaryKey().defaultRandom(),
  coupleId: uuid('couple_id').notNull(),
  payerId: uuid('payer_id').notNull().references(() => users.id),
  owerId: uuid('ower_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  expenseId: uuid('expense_id').references(() => expenses.id),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // PENDING, PARTIAL, SETTLED
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const coupleBalancesRelations = relations(coupleBalances, ({ one }) => ({
  expense: one(expenses, {
    fields: [coupleBalances.expenseId],
    references: [expenses.id],
  }),
  payer: one(users, {
    fields: [coupleBalances.payerId],
    references: [users.id],
  }),
  ower: one(users, {
    fields: [coupleBalances.owerId],
    references: [users.id],
  }),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  incomes: many(incomes),
  expenses: many(expenses),
  projects: many(projects),
  creditCards: many(creditCards),
  fixedExpenses: many(fixedExpenses),
}));
