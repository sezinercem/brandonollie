import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: integer("expires_at").notNull(),
}, (table) => [index("idx_rate_limits_expires_at").on(table.expiresAt)]);
