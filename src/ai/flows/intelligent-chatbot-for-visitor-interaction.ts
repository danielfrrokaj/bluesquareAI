'use server';
/**
 * @fileOverview An intelligent chatbot for real-time visitor interaction.
 *
 * - intelligentChatbotForVisitorInteraction - A function that handles the chatbot interaction process.
 * - IntelligentChatbotForVisitorInteractionInput - The input type for the intelligentChatbotForVisitorInteraction function.
 * - IntelligentChatbotForVisitorInteractionOutput - The return type for the intelligentChatbotForVisitorInteraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentChatbotForVisitorInteractionInputSchema = z.object({
  query: z.string().describe('The user query or message.'),
});
export type IntelligentChatbotForVisitorInteractionInput = z.infer<typeof IntelligentChatbotForVisitorInteractionInputSchema>;

const IntelligentChatbotForVisitorInteractionOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
});
export type IntelligentChatbotForVisitorInteractionOutput = z.infer<typeof IntelligentChatbotForVisitorInteractionOutputSchema>;

export async function intelligentChatbotForVisitorInteraction(input: IntelligentChatbotForVisitorInteractionInput): Promise<IntelligentChatbotForVisitorInteractionOutput> {
  return intelligentChatbotForVisitorInteractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentChatbotForVisitorInteractionPrompt',
  input: {schema: IntelligentChatbotForVisitorInteractionInputSchema},
  output: {schema: IntelligentChatbotForVisitorInteractionOutputSchema},
  prompt: `You are an intelligent chatbot designed to provide real-time interaction with website visitors.
  Your goal is to handle inquiries and offer personalized deals to help users quickly get the information they need and make informed decisions.
  Respond to the following user query:
  {{{query}}}`,
});

const intelligentChatbotForVisitorInteractionFlow = ai.defineFlow(
  {
    name: 'intelligentChatbotForVisitorInteractionFlow',
    inputSchema: IntelligentChatbotForVisitorInteractionInputSchema,
    outputSchema: IntelligentChatbotForVisitorInteractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
