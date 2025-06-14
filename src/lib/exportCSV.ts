
import type { Stock, ColumnConfig } from '@/types';

// Function to get a value from a stock using a key, handling potential undefined
function getStockValue(stock: Stock, key: keyof Stock): any {
  return stock[key];
}

export function exportToCSV(filename: string, data: Stock[], columnConfig: ColumnConfig<Stock>[]): void {
  if (!data || data.length === 0) {
    console.warn('No data to export.');
    return;
  }

  // Use all defined columns from config, not just visible ones, for a complete export
  // Or, could filter by visibleColumns if only visible data is desired for export
  const exportableColumns = columnConfig;

  const headers = exportableColumns.map(col => col.label);
  const csvRows = [headers.join(',')];

  for (const stock of data) {
    const values = exportableColumns.map(col => {
      let value = getStockValue(stock, col.key);
      // If there's a custom formatter, try to get a string representation.
      // This is tricky because formatters can return ReactNodes.
      // For CSV, we need plain text.
      if (col.format) {
        const formatted = col.format(value, stock);
        if (typeof formatted === 'string') {
          value = formatted;
        } else if (typeof formatted === 'number' || typeof formatted === 'boolean') {
          value = String(formatted);
        } else {
          // If it's a ReactNode or complex object, fall back to raw value or key
          // or a placeholder. For simplicity, use raw value or 'N/A'.
          value = value !== undefined && value !== null ? String(value) : 'N/A';
        }
      } else {
        value = value !== undefined && value !== null ? String(value) : 'N/A';
      }
      
      // Clean value for CSV: remove $ signs from prices/VWAP, % from percentages, etc.
      // This step might need to be more sophisticated based on specific formatters.
      if (typeof value === 'string') {
         if (col.key === 'price' || col.key === 'vwap' || col.key === 'high52' || col.key === 'low52' || col.key === 'atr') {
            value = value.replace('$', '');
         } else if (col.key === 'changePercent' || col.key === 'gapPercent' || col.key === 'shortFloat' || col.key === 'instOwn' || col.key === 'premarketChange') {
            value = value.replace('%', '').replace('+', '');
         } else if (col.key === 'marketCap') {
            // Let market cap formatter handle it (e.g. 2.55T becomes 2.55T)
         } else if (col.key === 'volume' || col.key === 'avgVolume') {
            value = value.replace('M', '');
         }
      }


      // Escape double quotes and handle commas for CSV
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`; // Enclose all values in quotes
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\\n');

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
