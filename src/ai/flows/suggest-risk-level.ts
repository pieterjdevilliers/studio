// src/ai/flows/suggest-risk-level.ts
'use server';
/**
 * @fileOverview An AI agent that suggests a risk level for a client based on uploaded documents and provided information.
 *
 * - suggestRiskLevel - A function that handles the risk level suggestion process.
 * - SuggestRiskLevelInput - The input type for the suggestRiskLevel function.
 * - SuggestRiskLevelOutput - The return type for the suggestRiskLevel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRiskLevelInputSchema = z.object({
  clientType: z.enum(['Individual', 'Company', 'Trust']).describe('The type of client.'),
  clientInformation: z.string().describe('The information provided by the client.'),
  uploadedDocuments: z
    .array(z.string())
    .describe(
      'A list of data URIs of uploaded documents, that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type SuggestRiskLevelInput = z.infer<typeof SuggestRiskLevelInputSchema>;

const SuggestRiskLevelOutputSchema = z.object({
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The suggested risk level for the client.'),
  confidenceScore: z
    .number()
    .min(0)
    .max(1)
    .describe('A score between 0 and 1 indicating the confidence in the suggested risk level.'),
  reasoning: z.string().describe('The reasoning behind the suggested risk level.'),
});
export type SuggestRiskLevelOutput = z.infer<typeof SuggestRiskLevelOutputSchema>;

export async function suggestRiskLevel(input: SuggestRiskLevelInput): Promise<SuggestRiskLevelOutput> {
  return suggestRiskLevelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRiskLevelPrompt',
  input: {schema: SuggestRiskLevelInputSchema},
  output: {schema: SuggestRiskLevelOutputSchema},
  prompt: `You are an expert risk assessment agent specializing in determining risk levels for new clients during onboarding.

You will use the client type, provided information, and uploaded documents to suggest a risk level (Low, Medium, or High) and provide a confidence score (0-1) for the suggestion.

Client Type: {{{clientType}}}
Client Information: {{{clientInformation}}}
Uploaded Documents: {{#each uploadedDocuments}}{{media url=this}}{{/each}}

Ensure that the riskLevel, confidenceScore, and reasoning fields are populated in the output.
`,
});

const suggestRiskLevelFlow = ai.defineFlow(
  {
    name: 'suggestRiskLevelFlow',
    inputSchema: SuggestRiskLevelInputSchema,
    outputSchema: SuggestRiskLevelOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
