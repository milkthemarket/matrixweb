import 'dotenv/config';

// Flows will be imported for their side effects in this file.
// The following imports are now re-enabled as they no longer make live API calls.

import '@/ai/flows/get-trade-suggestion-flow';
import '@/ai/flows/check-alpaca-connection-flow';
import '@/ai/flows/get-chart-data-flow';
