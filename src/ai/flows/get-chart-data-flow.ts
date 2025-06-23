
'use server';
/**
 * @fileOverview A flow to fetch historical chart data from Alpaca.
 * This flow is temporarily disabled to resolve a server startup issue.
 */

export async function getChartData(input: any): Promise<any[]> {
  console.log("getChartData is temporarily disabled.", input);
  throw new Error("Chart data fetching is temporarily disabled.");
}

export type GetChartDataInput = {};
export type GetChartDataOutput = any[];
