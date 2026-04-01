import { pgTable, text, integer, timestamp, serial, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const watchlistTable = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
}, (t) => [
  unique().on(t.symbol),
]);

export const insertWatchlistSchema = createInsertSchema(watchlistTable).omit({ id: true, addedAt: true });
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Watchlist = typeof watchlistTable.$inferSelect;
