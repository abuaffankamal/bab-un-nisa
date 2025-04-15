import { apiRequest } from '@/lib/queryClient';

/**
 * Send a question to GPT and get an Islamic-knowledge based answer
 * @param question - The question to ask about Islam
 * @returns Promise with the answer from GPT
 */
export async function askChatGPT(question: string): Promise<{ answer: string }> {
  const response = await apiRequest('POST', '/api/ask', { question });
  const data = await response.json();
  return data;
}

/**
 * Get explanation for Islamic terms or concepts
 * @param term - The Islamic term or concept to explain
 * @returns Promise with the explanation
 */
export async function getIslamicTermExplanation(term: string): Promise<{ explanation: string }> {
  const response = await apiRequest('POST', '/api/explain', { term });
  const data = await response.json();
  return data;
}

/**
 * Get biographical information about an Islamic scholar
 * @param scholarName - The name of the Islamic scholar
 * @returns Promise with the biographical information
 */
export async function getScholarBiography(scholarName: string): Promise<{ biography: string }> {
  const response = await apiRequest('POST', '/api/scholar', { name: scholarName });
  const data = await response.json();
  return data;
}