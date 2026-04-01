import { pgTable, integer, numeric, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletTable = pgTable("wallet", {
  id: serial("id").primaryKey(),
  balance: numeric("balance", { precision: 16, scale: 2 }).notNull().default("1000000"),
  initialBalance: numeric("initial_balance", { precision: 16, scale: 2 }).notNull().default("1000000"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(walletTable);
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof walletTable.$inferSelect;
