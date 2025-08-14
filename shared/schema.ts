import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  color: text("color").notNull(), // hex color for the category
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  categoryId: varchar("category_id").references(() => categories.id),
  dueDate: timestamp("due_date"),
  position: integer("position").notNull().default(0), // for drag & drop ordering
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTaskSchema = insertTaskSchema.partial();

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Category = typeof categories.$inferSelect;
export type Task = typeof tasks.$inferSelect;

// Extended types for frontend use
export type TaskWithCategory = Task & {
  category?: Category;
};

export const priorityLevels = ["low", "medium", "high"] as const;
export type Priority = typeof priorityLevels[number];
