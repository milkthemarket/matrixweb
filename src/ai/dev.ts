import 'dotenv/config';

// Flows will be imported for their side effects in this file.
import '@/ai/flows/get-trade-suggestion-flow';

// The following imports are temporarily commented out to resolve a server startup issue.
// These flows may be causing issues with Alpaca API authentication during initialization.
// import '@/ai/flows/check-alpaca-connection-flow';
// import '@/ai/flows/get-chart-data-flow';
