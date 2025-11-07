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
  lang: z.enum(['en', 'sq']).describe('The language of the user interaction.'),
  siteContent: z.string().describe('The full content of the website for context.'),
});
export type IntelligentChatbotForVisitorInteractionInput = z.infer<typeof IntelligentChatbotForVisitorInteractionInputSchema>;

const IntelligentChatbotForVisitorInteractionOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user query.'),
  requiresPhoneNumber: z.boolean().describe('Set to true if the user has shown interest in a custom service and you need to ask for their phone number.')
});
export type IntelligentChatbotForVisitorInteractionOutput = z.infer<typeof IntelligentChatbotForVisitorInteractionOutputSchema>;

export async function intelligentChatbotForVisitorInteraction(input: IntelligentChatbotForVisitorInteractionInput): Promise<IntelligentChatbotForVisitorInteractionOutput> {
  return intelligentChatbotForVisitorInteractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentChatbotForVisitorInteractionPrompt',
  input: {schema: IntelligentChatbotForVisitorInteractionInputSchema},
  output: {schema: IntelligentChatbotForVisitorInteractionOutputSchema},
  prompt: `You are an expert sales and support assistant for Blue Square AI, a company that provides AI solutions for businesses. Your persona is helpful, professional, and slightly proactive.

You are interacting with a user in {{{lang}}}. ALL your responses MUST be in {{{lang}}}.

You have access to the full content of the website here:
<WEBSITE_CONTENT>
{{{siteContent}}}
</WEBSITE_CONTENT>

Your primary goals are:
1.  Answer any questions the user has about Blue Square AI's products and services using the provided website content. Be concise and helpful.
2.  If the user shows interest in a service or describes a problem that our services can solve, proactively suggest a custom AI solution.
3.  When you suggest a solution, your goal is to get their phone number for a follow-up call from a human expert. DO NOT REVEAL that the tools are developed with AI or give technical details. Keep it business-focused.
4.  If the user agrees to a follow-up, set 'requiresPhoneNumber' to true in your response. Otherwise, set it to false.
5.  If you ask for the phone number, use this exact phrase based on the language:
    -   (en): "That sounds like an interesting project. I can have an expert from our team call you to discuss the details. What is the best phone number to reach you at?"
    -   (sq): "Ky tingëllon si një projekt interesant. Mund të organizoj që një ekspert nga ekipi ynë t'ju telefonojë për të diskutuar detajet. Cili është numri më i mirë i telefonit për t'ju kontaktuar?"

User Query:
{{{query}}}
`,
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
