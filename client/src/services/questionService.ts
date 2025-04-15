import axios from 'axios';
import { apiRequest } from '../lib/queryClient';
import { Question } from '@shared/schema';

// Perplexity API for answering questions
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Submit a new question using the Perplexity API to get a response
 * @param question - The question text
 * @returns Promise with the response from Perplexity
 */
export async function askPerplexity(question: string) {
  try {
    // Check if API key is available
    if (!import.meta.env.VITE_PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key is not available. Please set the PERPLEXITY_API_KEY environment variable.');
    }

    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable assistant specializing in Islamic teachings. ' +
                     'Provide accurate, respectful, and scholarly answers to questions about Islam, ' +
                     'citing authentic sources where appropriate. Be precise and concise.'
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
        top_p: 0.9,
        search_domain_filter: ['perplexity.ai', 'quran.com', 'islamqa.info', 'sunnah.com'],
        return_related_questions: true,
        frequency_penalty: 1,
        presence_penalty: 0,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error asking question:', error);
    throw error;
  }
}

/**
 * Submit a new question to the system
 * @param userId - The ID of the user submitting the question
 * @param text - The question text
 * @returns Promise with the created question
 */
export async function submitQuestion(userId: number, text: string) {
  return apiRequest('/api/questions', {
    method: 'POST',
    body: JSON.stringify({ userId, text })
  });
}

/**
 * Get all questions for a specific user
 * @param userId - The ID of the user
 * @returns Promise with the user's questions
 */
export async function getUserQuestions(userId: number) {
  return apiRequest(`/api/users/${userId}/questions`);
}

/**
 * Get all answered questions for a specific user
 * @param userId - The ID of the user
 * @returns Promise with the user's answered questions
 */
export async function getAnsweredQuestions(userId: number) {
  return apiRequest(`/api/users/${userId}/questions/answered`);
}

/**
 * Get a specific question by ID
 * @param questionId - The ID of the question
 * @returns Promise with the question data
 */
export async function getQuestion(questionId: number) {
  return apiRequest(`/api/questions/${questionId}`);
}

/**
 * Update the answer for a question (admin only)
 * @param questionId - The ID of the question
 * @param answer - The answer text
 * @returns Promise with the updated question
 */
export async function answerQuestion(questionId: number, answer: string) {
  return apiRequest(`/api/questions/${questionId}/answer`, {
    method: 'PUT',
    body: JSON.stringify({ answer, answeredAt: new Date() })
  });
}