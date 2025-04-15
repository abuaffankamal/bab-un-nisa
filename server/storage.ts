import {
  users, bookmarks, prayerSettings, readingProgress, questions, searchHistory,
  type User, type InsertUser,
  type Bookmark, type InsertBookmark,
  type PrayerSettings, type InsertPrayerSettings,
  type ReadingProgress, type InsertReadingProgress,
  type Question, type InsertQuestion,
  type SearchHistoryItem, type InsertSearchHistoryItem
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { createClient } from '@supabase/supabase-js';
import type { UserPreferences } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

// Interface for all storage operations
export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Bookmark operations
  getBookmark(id: number): Promise<Bookmark | undefined>;
  getBookmarks(userId: number): Promise<Bookmark[]>;
  getBookmarksByType(userId: number, type: string): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  updateBookmark(id: number, bookmark: Partial<InsertBookmark>): Promise<Bookmark | undefined>;
  deleteBookmark(id: number): Promise<boolean>;

  // Prayer settings operations
  getPrayerSettings(userId: number): Promise<PrayerSettings | undefined>;
  createPrayerSettings(settings: InsertPrayerSettings): Promise<PrayerSettings>;
  updatePrayerSettings(userId: number, settings: Partial<InsertPrayerSettings>): Promise<PrayerSettings | undefined>;

  // Reading progress operations
  getReadingProgress(userId: number, type: string): Promise<ReadingProgress | undefined>;
  createReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress>;
  updateReadingProgress(id: number, progress: Partial<InsertReadingProgress>): Promise<ReadingProgress | undefined>;

  // Question operations
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestions(userId: number): Promise<Question[]>;
  getPendingQuestions(): Promise<Question[]>;
  getAnsweredQuestions(userId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined>;

  // Search history operations
  getSearchHistory(userId: number): Promise<SearchHistoryItem[]>;
  createSearchHistoryItem(item: InsertSearchHistoryItem): Promise<SearchHistoryItem>;
  clearSearchHistory(userId: number): Promise<boolean>;
}

// Supabase storage implementation
export class SupabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Using maybeSingle() instead of single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting user:', error);
      return undefined;
    }

    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }

    return data || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }

    return data || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...user,
          name: user.name || '',
          location: user.location || null,
          language: user.language || 'en',
          theme: user.theme || 'light',
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }

      return data as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    // Extract preferences if they exist and map them to individual columns
    const updateData = { ...data };
    if (updateData.preferences) {
      updateData.language = updateData.preferences.translation;
      updateData.theme = updateData.preferences.theme;
      delete updateData.preferences;
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return undefined;
    }

    return updatedUser || undefined;
  }

  // Bookmark operations
  async getBookmark(id: number): Promise<Bookmark | undefined> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting bookmark:', error);
      return undefined;
    }

    return data || undefined;
  }

  async getBookmarks(userId: number): Promise<Bookmark[]> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('userId', userId);

    if (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }

    return data || [];
  }

  async getBookmarksByType(userId: number, type: string): Promise<Bookmark[]> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('userId', userId)
      .eq('type', type);

    if (error) {
      console.error('Error getting bookmarks by type:', error);
      return [];
    }

    return data || [];
  }

  async createBookmark(bookmark: InsertBookmark): Promise<Bookmark> {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert(bookmark)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating bookmark:', error);
      throw error;
    }

    return data as Bookmark;
  }

  async updateBookmark(id: number, bookmark: Partial<InsertBookmark>): Promise<Bookmark | undefined> {
    const { data, error } = await supabase
      .from('bookmarks')
      .update(bookmark)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating bookmark:', error);
      return undefined;
    }

    return data || undefined;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bookmark:', error);
      return false;
    }

    return data !== null;
  }

  // Prayer settings operations
  async getPrayerSettings(userId: number): Promise<PrayerSettings | undefined> {
    const { data, error } = await supabase
      .from('prayer_settings')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) {
      console.error('Error getting prayer settings:', error);
      return undefined;
    }

    return data || undefined;
  }

  async createPrayerSettings(insertSettings: InsertPrayerSettings): Promise<PrayerSettings> {
    const { data, error } = await supabase
      .from('prayer_settings')
      .insert(insertSettings)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating prayer settings:', error);
      throw error;
    }

    return data as PrayerSettings;
  }

  async updatePrayerSettings(userId: number, settingsUpdate: Partial<InsertPrayerSettings>): Promise<PrayerSettings | undefined> {
    const { data, error } = await supabase
      .from('prayer_settings')
      .update(settingsUpdate)
      .eq('userId', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating prayer settings:', error);
      return undefined;
    }

    return data || undefined;
  }

  // Reading progress operations
  async getReadingProgress(userId: number, type: string): Promise<ReadingProgress | undefined> {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('userId', userId)
      .eq('type', type)
      .single();

    if (error) {
      console.error('Error getting reading progress:', error);
      return undefined;
    }

    return data || undefined;
  }

  async createReadingProgress(insertProgress: InsertReadingProgress): Promise<ReadingProgress> {
    const { data, error } = await supabase
      .from('reading_progress')
      .insert(insertProgress)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating reading progress:', error);
      throw error;
    }

    return data as ReadingProgress;
  }

  async updateReadingProgress(id: number, progressUpdate: Partial<InsertReadingProgress>): Promise<ReadingProgress | undefined> {
    const { data, error } = await supabase
      .from('reading_progress')
      .update(progressUpdate)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating reading progress:', error);
      return undefined;
    }

    return data || undefined;
  }

  // Question operations
  async getQuestion(id: number): Promise<Question | undefined> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error getting question:', error);
      return undefined;
    }

    return data || undefined;
  }

  async getQuestions(userId: number): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('userId', userId);

    if (error) {
      console.error('Error getting questions:', error);
      return [];
    }

    return data || undefined;
  }

  async getPendingQuestions(): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('status', 'pending');

    if (error) {
      console.error('Error getting pending questions:', error);
      return [];
    }

    return data || [];
  }

  async getAnsweredQuestions(userId: number): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'answered');

    if (error) {
      console.error('Error getting answered questions:', error);
      return [];
    }

    return data || [];
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating question:', error);
      throw error;
    }

    return data as Question;
  }

  async updateQuestion(id: number, questionUpdate: Partial<InsertQuestion>): Promise<Question | undefined> {
    const { data, error } = await supabase
      .from('questions')
      .update(questionUpdate)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return undefined;
    }

    return data || undefined;
  }

  // Search history operations
  async getSearchHistory(userId: number): Promise<SearchHistoryItem[]> {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('userId', userId);

    if (error) {
      console.error('Error getting search history:', error);
      return [];
    }

    return data || [];
  }

  async createSearchHistoryItem(item: InsertSearchHistoryItem): Promise<SearchHistoryItem> {
    const { data, error } = await supabase
      .from('search_history')
      .insert(item)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating search history item:', error);
      throw error;
    }

    return data as SearchHistoryItem;
  }

  async clearSearchHistory(userId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('search_history')
      .delete()
      .eq('userId', userId);

    if (error) {
      console.error('Error clearing search history:', error);
      return false;
    }

    return data !== null;
  }
}

// Use Supabase storage
export const storage = new SupabaseStorage();
