import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { DEFAULT_WHITEBOARD_DATA, type WhiteboardData } from "@/lib/whiteboard-types";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name"),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const whiteboards = pgTable("whiteboards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Untitled Whiteboard"),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id),
  data: jsonb("data").$type<WhiteboardData>().notNull().default(DEFAULT_WHITEBOARD_DATA),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: serial("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Whiteboard = typeof whiteboards.$inferSelect;
export type NewWhiteboard = typeof whiteboards.$inferInsert;
