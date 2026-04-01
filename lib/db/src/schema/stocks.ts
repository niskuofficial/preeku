import { pgTable, text, integer, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stocksTable = pgTable("stocks", {
  symbol: text("symbol").primaryKey(),
  name: text("name").notNull(),
  exchange: text("exchange").notNull().default("NSE"),
  sector: text("sector").notNull(),
  currentPrice: numeric("current_price", { precision: 12, scale: 2 }).notNull(),
  previousClose: numeric("previous_close", { precision: 12, scale: 2 }).notNull(),
  high: numeric("high", { precision: 12, scale: 2 }).notNull(),
  low: numeric("low", { precision: 12, scale: 2 }).notNull(),
  volume: integer("volume").notNull().default(0),
  marketCap: numeric("market_cap", { precision: 20, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStockSchema = createInsertSchema(stocksTable);
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocksTable.$inferSelect;
