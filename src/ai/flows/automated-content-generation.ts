'use server';

/**
 * @fileOverview A content generation AI agent.
 *
 * - generateContent - A function that handles the content generation process.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  topic: z.string().describe('The topic of the content to be generated.'),
  type: z.enum(['website description', 'blog post', 'SEO content']).describe('The type of content to be generated.'),
  keywords: z.string().optional().describe('Optional keywords to optimize the content for SEO.'),
  tone: z.string().optional().describe('The desired tone of the content (e.g., professional, friendly, humorous).'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  content: z.string().describe('The generated content.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
  return generateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {schema: GenerateContentInputSchema},
  output: {schema: GenerateContentOutputSchema},
  prompt: `You are an AI content generator that specializes in creating engaging and SEO-optimized content.

  You will generate content based on the following topic, type, and keywords:

  Topic: {{{topic}}}
  Type: {{{type}}}
  Keywords: {{keywords}}
  Tone: {{tone}}

  Content:`,
});

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
