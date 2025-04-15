import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Defining DateRange type for use in the application
export interface DateRange {
  from: Date;
  to?: Date;
}

// Define user preferences interface
export interface UserPreferences {
  avatar?: string;
  arabicScript?: string;
  translation?: string;
  reciter?: string;
  notifications?: {
    dailyReminder?: boolean;
    prayerAlerts?: boolean;
    weeklyDigest?: boolean;
  };
}

// Users table - storing app users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  location: jsonb("location"),  // For storing latitude, longitude, city, country
  language: text("language").default("en"),
  theme: text("theme").default("light"),
  preferences: jsonb("preferences").$type<UserPreferences>(), // Type-safe preferences
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  location: true,
  language: true,
  theme: true,
  preferences: true
});

// Bookmarks table - storing saved Quran verses, hadiths, etc.
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // quran, hadith
  reference: jsonb("reference").notNull(), // {surah: 1, ayah: 1} or {collection: "bukhari", number: "1"}
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  userId: true,
  type: true,
  reference: true,
  note: true
});

// Prayer times settings
export const prayerSettings = pgTable("prayer_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  calculationMethod: text("calculation_method").default("MWL"), // MWL, ISNA, Egypt, etc.
  asrMethod: text("asr_method").default("Standard"), // Standard or Hanafi
  adjustments: jsonb("adjustments"), // For storing custom time adjustments
  notificationsEnabled: boolean("notifications_enabled").default(true)
});

export const insertPrayerSettingsSchema = createInsertSchema(prayerSettings).pick({
  userId: true,
  calculationMethod: true,
  asrMethod: true,
  adjustments: true,
  notificationsEnabled: true
});

// Reading progress (Quran, Hadith)
export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // quran, hadith
  lastRead: jsonb("last_read").notNull(), // {surah: 1, ayah: 1} or {collection: "bukhari", number: "1"}
  completionPercentage: integer("completion_percentage").default(0),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertReadingProgressSchema = createInsertSchema(readingProgress).pick({
  userId: true,
  type: true,
  lastRead: true,
  completionPercentage: true
});

// Questions asked by users
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  status: text("status").default("pending"), // pending, answered
  createdAt: timestamp("created_at").defaultNow(),
  answeredAt: timestamp("answered_at")
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  userId: true,
  question: true,
  answer: true,
  status: true
});

// Search history
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  query: text("query").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertSearchHistorySchema = createInsertSchema(searchHistory).pick({
  userId: true,
  query: true
});

// Define a client schema for backward compatibility
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  status: text("status").default("lead"), // lead, active, past
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertClientSchema = createInsertSchema(clients).pick({
  userId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  status: true,
  notes: true
});

// Export types for use in the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

export type PrayerSettings = typeof prayerSettings.$inferSelect;
export type InsertPrayerSettings = z.infer<typeof insertPrayerSettingsSchema>;

export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type SearchHistoryItem = typeof searchHistory.$inferSelect;
export type InsertSearchHistoryItem = z.infer<typeof insertSearchHistorySchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
