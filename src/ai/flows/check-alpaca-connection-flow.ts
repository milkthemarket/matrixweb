
'use server';
/**
 * @fileOverview A flow to check the connection to the Alpaca API.
 * This flow is temporarily disabled to resolve a server startup issue.
 */

export async function checkAlpacaConnection(): Promise<any> {
  console.log("checkAlpacaConnection is temporarily disabled.");
  throw new Error("Alpaca connection check is temporarily disabled.");
}

export type AlpacaAccount = {};
