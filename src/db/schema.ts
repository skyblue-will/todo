import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
