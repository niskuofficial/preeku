import { pgTable, text, integer, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  stockName: text("stock_name").notNull(),
  orderType: text("order_type").notNull(), // MARKET | LIMIT
  side: text("side").notNull(), // BUY | SELL
  productType: text("product_type").notNull(), // INTRADAY | DELIVERY
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  executedPrice: numeric("executed_price", { precision: 12, scale: 2 }),
  status: text("status").notNull().default("PENDING"), // PENDING | EXECUTED | CANCELLED
  totalValue: numeric("total_value", { precision: 16, scale: 2 }).notNull(),
  pnl: numeric("pnl", { precision: 16, scale: 2 }),
  placedAt: timestamp("placed_at").notNull().defaultNow(),
  executedAt: timestamp("executed_at"),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, placedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
