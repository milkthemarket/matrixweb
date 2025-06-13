
import type { Stock } from '@/types';

function convertToCSV(data: Stock[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const headers = ['Symbol', 'Price', '% Change', 'Float (M)', 'Volume (M)', 'Catalyst News', 'Last Updated'];
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = [
      row.symbol,
      row.price,
      row.changePercent,
      row.float,
      row.volume,
      `"${(row.newsSnippet || 'N/A').replace(/"/g, '""')}"`, // Escape double quotes in news snippet
      new Date(row.lastUpdated).toLocaleString(),
    ];
    csvRows.push(values.join(','));
  }

  return csvRows.join('\\n');
}

export function exportToCSV(filename: string, data: Stock[]): void {
  const csvString = convertToCSV(data);
  if (!csvString) {
    console.warn('No data to export.');
    return;
  }

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
