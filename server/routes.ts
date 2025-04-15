import express, { type Express, Router, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs/promises";
import path from "path";
import * as nodeSchedule from 'node-schedule';
import { z } from "zod";
import axios from 'axios';
import { setupAuth } from "./auth";
import {
  insertUserSchema,
  insertBookmarkSchema,
  insertPrayerSettingsSchema,
  insertReadingProgressSchema,
  insertQuestionSchema,
  insertSearchHistorySchema,
  UserPreferences
} from "@shared/schema";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  const apiRouter = Router();

  // Helper function for Google Gemini API calls
  async function callGeminiAPI(messages: any[], options: any = {}) {
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || '';

    if (!geminiApiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessage = messages.find(m => m.role === 'user')?.content || '';

    const result = await model.generateContent(`${systemMessage}\n${userMessage}`);
    const response = await result.response;
    return response.text();
  }

  // Authentication middleware to protect routes
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Authentication required" });
  };

  // Health check route
  apiRouter.get("/health", (req: Request, res: Response) => {
    res.json({ status: "OK" });
  });

  // User routes
  apiRouter.post("/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: `Invalid user data: ${error}` });
    }
  });

  apiRouter.get("/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  // User profile update endpoint
  apiRouter.put('/user/update', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
      const { name, email, language, theme, location } = req.body;
      const userId = (req.user as any).id;

      // Get current user to verify it exists  
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      const updatedUser = await storage.updateUser(userId, {
        name,
        email,
        language,
        theme,
        location
      });

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't send password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error); 
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Bookmark routes
  apiRouter.get("/bookmarks", requireAuth, async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const bookmarks = await storage.getBookmarks(userId);
    res.json(bookmarks);
  });

  apiRouter.get("/bookmarks/type/:type", async (req: Request, res: Response) => {
    const userId = 1;
    const { type } = req.params;
    const bookmarks = await storage.getBookmarksByType(userId, type);
    res.json(bookmarks);
  });

  apiRouter.post("/bookmarks", async (req: Request, res: Response) => {
    try {
      const userId = 1;
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        userId
      });

      const bookmark = await storage.createBookmark(bookmarkData);
      res.status(201).json(bookmark);
    } catch (error) {
      res.status(400).json({ error: `Invalid bookmark data: ${error}` });
    }
  });

  apiRouter.get("/bookmarks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid bookmark ID" });
    }

    const bookmark = await storage.getBookmark(id);
    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    res.json(bookmark);
  });

  apiRouter.patch("/bookmarks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid bookmark ID" });
    }

    try {
      const bookmark = await storage.getBookmark(id);
      if (!bookmark) {
        return res.status(404).json({ error: "Bookmark not found" });
      }

      const updateSchema = insertBookmarkSchema.partial();
      const updateData = updateSchema.parse(req.body);

      const updatedBookmark = await storage.updateBookmark(id, updateData);
      res.json(updatedBookmark);
    } catch (error) {
      res.status(400).json({ error: `Invalid bookmark data: ${error}` });
    }
  });

  apiRouter.delete("/bookmarks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid bookmark ID" });
    }

    const success = await storage.deleteBookmark(id);
    if (!success) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    res.status(204).end();
  });

  // Reading Progress routes
  apiRouter.get("/reading-progress/:userId/:type", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { type } = req.params;
    const progress = await storage.getReadingProgress(userId, type);
    if (!progress) {
      return res.status(404).json({ error: "Reading progress not found" });
    }

    res.json(progress);
  });

  apiRouter.post("/reading-progress", async (req: Request, res: Response) => {
    try {
      const progressData = insertReadingProgressSchema.parse(req.body);
      const progress = await storage.createReadingProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      res.status(400).json({ error: `Invalid reading progress data: ${error}` });
    }
  });

  apiRouter.patch("/reading-progress/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid reading progress ID" });
    }

    try {
      const updateSchema = insertReadingProgressSchema.partial();
      const updateData = updateSchema.parse(req.body);

      const updatedProgress = await storage.updateReadingProgress(id, updateData);
      if (!updatedProgress) {
        return res.status(404).json({ error: "Reading progress not found" });
      }

      res.json(updatedProgress);
    } catch (error) {
      res.status(400).json({ error: `Invalid reading progress data: ${error}` });
    }
  });

  // Question routes
  apiRouter.get("/questions/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }

    const question = await storage.getQuestion(id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(question);
  });

  apiRouter.get("/users/:userId/questions", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const questions = await storage.getQuestions(userId);
    res.json(questions);
  });

  apiRouter.get("/users/:userId/questions/answered", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const questions = await storage.getAnsweredQuestions(userId);
    res.json(questions);
  });

  apiRouter.get("/questions/pending", async (req: Request, res: Response) => {
    const questions = await storage.getPendingQuestions();
    res.json(questions);
  });

  apiRouter.post("/questions", async (req: Request, res: Response) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      res.status(400).json({ error: `Invalid question data: ${error}` });
    }
  });

  apiRouter.patch("/questions/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }

    try {
      const question = await storage.getQuestion(id);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      const updateSchema = insertQuestionSchema.partial();
      const updateData = updateSchema.parse(req.body);

      const updatedQuestion = await storage.updateQuestion(id, updateData);
      res.json(updatedQuestion);
    } catch (error) {
      res.status(400).json({ error: `Invalid question data: ${error}` });
    }
  });

  // Search History routes
  apiRouter.get("/users/:userId/search-history", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const history = await storage.getSearchHistory(userId);
    res.json(history);
  });

  apiRouter.post("/search-history", async (req: Request, res: Response) => {
    try {
      const searchHistoryData = insertSearchHistorySchema.parse(req.body);
      const historyItem = await storage.createSearchHistoryItem(searchHistoryData);
      res.status(201).json(historyItem);
    } catch (error) {
      res.status(400).json({ error: `Invalid search history data: ${error}` });
    }
  });

  apiRouter.delete("/users/:userId/search-history", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const success = await storage.clearSearchHistory(userId);
    if (!success) {
      return res.status(500).json({ error: "Failed to clear search history" });
    }

    res.status(204).end();
  });

  // OpenAI ChatGPT API proxy for answering Islamic questions
  apiRouter.post("/ask", requireAuth, async (req: Request, res: Response) => {
    try {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      // Create the message array for the Gemini API
      const messages = [
        {
          role: "system",
          content: "You are a knowledgeable assistant specializing in Islamic teachings. " +
            "Provide accurate, respectful, and scholarly answers to questions about Islam, " +
            "citing authentic sources where appropriate such as the Quran and Hadith. " +
            "Be precise, concise, and mindful of different schools of thought in Islam."
        },
        {
          role: "user",
          content: question
        }
      ];

      // Call Gemini API with the helper function
      const answer = await callGeminiAPI(messages, {
        temperature: 0.2,
        max_tokens: 2000,
        frequency_penalty: 1
      });

      res.json({
        question,
        answer
      });
    } catch (error: any) {
      console.error('Error processing question:', error);
      res.status(500).json({ error: `Failed to get answer: ${error.message}` });
    }
  });

  // Route to explain Quranic verses
  apiRouter.post("/quran/explain", requireAuth, async (req: Request, res: Response) => {
    try {
      const { surah, ayah, language } = req.body;

      if (!surah || !ayah) {
        return res.status(400).json({ error: "Surah and ayah are required" });
      }

      // Get the verse from an external API
      const verseResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`);
      if (!verseResponse.ok) {
        throw new Error(`Error fetching verse: ${verseResponse.statusText}`);
      }

      const verseData = await verseResponse.json();
      const arabicText = verseData.data?.text || "";

      // Get a translation if requested
      let translationText = "";
      if (language && language !== 'ar') {
        const translationResponse = await fetch(`https://quranenc.com/api/v1/translation/aya/${language}/${surah}/${ayah}`);
        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          translationText = translationData.result?.translation || "";
        }
      }

      // Create the message array for the Gemini API
      const messages = [
        {
          role: "system",
          content: "You are a knowledgeable assistant specializing in Quranic exegesis (tafsir). " +
            "Provide scholarly explanations of Quranic verses, citing respected tafsir sources. " +
            "Include the historical context, linguistic analysis, and relevance to contemporary life. " +
            "Be respectful and accurate in your explanations."
        },
        {
          role: "user",
          content: `Please provide a detailed explanation of the following Quranic verse:\n\nArabic: ${arabicText}\n\nTranslation: ${translationText}\n\nSurah ${surah}, Ayah ${ayah}`
        }
      ];

      // Call Gemini API with the helper function
      const explanation = await callGeminiAPI(messages, {
        temperature: 0.3,
        max_tokens: 2000
      });

      res.json({
        verse: {
          surah,
          ayah,
          arabic: arabicText,
          translation: translationText
        },
        explanation
      });
    } catch (error: any) {
      console.error('Error explaining verse:', error);
      res.status(500).json({ error: `Failed to get explanation: ${error.message}` });
    }
  });

  // Route to explain Islamic concepts
  apiRouter.post("/explain", requireAuth, async (req: Request, res: Response) => {
    try {
      const { term } = req.body;

      if (!term) {
        return res.status(400).json({ error: "Term is required" });
      }

      // Create the message array for the Gemini API
      const messages = [
        {
          role: "system",
          content: "You are a knowledgeable assistant specializing in Islamic theology, jurisprudence, and history. " +
            "Provide scholarly explanations of Islamic concepts, practices, and terminology. " +
            "Include definitions, historical context, and different perspectives from various schools of thought if applicable. " +
            "Be respectful and accurate in your explanations."
        },
        {
          role: "user",
          content: `Please explain the Islamic concept or term: ${term}`
        }
      ];

      // Call Gemini API with the helper function
      const explanation = await callGeminiAPI(messages, {
        temperature: 0.3,
        max_tokens: 1500
      });

      res.json({
        term,
        explanation
      });
    } catch (error: any) {
      console.error('Error explaining Islamic concept:', error);
      res.status(500).json({ error: `Failed to get explanation: ${error.message}` });
    }
  });

  // Route to get information about Islamic scholars
  apiRouter.post("/scholar", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Scholar name is required" });
      }

      // Create the message array for the Gemini API
      const messages = [
        {
          role: "system",
          content: "You are a knowledgeable assistant specializing in Islamic scholarship and history. " +
            "Provide accurate biographical information about Islamic scholars, including their life, works, " +
            "contributions to Islamic knowledge, and their place in Islamic intellectual history. " +
            "Be respectful and accurate in your descriptions."
        },
        {
          role: "user",
          content: `Please provide biographical information about the Islamic scholar: ${name}`
        }
      ];

      // Call Gemini API with the helper function
      const biography = await callGeminiAPI(messages, {
        temperature: 0.3,
        max_tokens: 1500
      });

      res.json({
        scholarName: name,
        biography
      });
    } catch (error: any) {
      console.error('Error fetching scholar information:', error);
      res.status(500).json({ error: `Failed to get scholar information: ${error.message}` });
    }
  });

  // Use api prefix for all routes
  app.use("/api", apiRouter);
  
  // Create and set up the HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
