import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Temporarily initializing without plugins to prevent startup crash due to missing API key.
// To re-enable Google AI, add `googleAI()` back to the plugins array and ensure
// your GOOGLE_API_KEY is set in the .env file.
// The model property is also removed as it depends on the googleAI() plugin.
export const ai = genkit({
  plugins: [], // Temporarily removed googleAI()
});
