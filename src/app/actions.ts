'use server';

import { intelligentChatbotForVisitorInteraction } from '@/ai/flows/intelligent-chatbot-for-visitor-interaction';

export async function handleChatbotQuery(history: { role: string; content: string }[], query: string) {
  try {
    const result = await intelligentChatbotForVisitorInteraction({ query });
    return { success: true, response: result.response };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'There was a problem communicating with the assistant. Please try again.' };
  }
}
