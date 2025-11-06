'use server';

import { generateContent, GenerateContentInput } from '@/ai/flows/automated-content-generation';
import { intelligentChatbotForVisitorInteraction } from '@/ai/flows/intelligent-chatbot-for-visitor-interaction';

export async function handleChatbotQuery(history: { role: string; content: string }[], query: string) {
  try {
    const result = await intelligentChatbotForVisitorInteraction({ query });
    return { success: true, response: result.response };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Pati një problem gjatë komunikimit me asistentin. Ju lutem provoni përsëri.' };
  }
}

export async function handleContentGeneration(input: GenerateContentInput) {
  try {
    const result = await generateContent(input);
    return { success: true, content: result.content };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Pati një problem gjatë gjenerimit të përmbajtjes. Ju lutem provoni përsëri.' };
  }
}
