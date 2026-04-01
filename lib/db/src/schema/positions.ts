import { pgTable, text, integer, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const positionsTable = pgTable("positions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("LEGACY"),
  symbol: text("symbol").notNull(),
  stockName: text("stock_name").notNull(),
  quantity: integer("quantity").notNull(),
  avgBuyPrice: numeric("avg_buy_price", { precision: 12, scale: 2 }).notNull(),
  productType: text("product_type").notNull(), // INTRADAY | DELIVERY
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPositionSchema = createInsertSchema(positionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positionsTable.$inferSelect;
