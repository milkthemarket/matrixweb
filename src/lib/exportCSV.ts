
import type { ColumnConfig } from '@/types';

// A more robust CSV value sanitizer
function sanitizeValue(value: any): string {
    if (value === undefined || value === null) {
        return '';
    }
    let stringValue = String(value);

    // If the value contains a comma, a double quote, or a newline, wrap it in double quotes.
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        // Escape any double quotes within the value by doubling them up.
        stringValue = stringValue.replace(/"/g, '""');
        return `"${stringValue}"`;
    }
    return stringValue;
}

function getColumnValue(item: any, col: ColumnConfig<any>): any {
    // Handling nested data, if any, could go here. For now, direct access.
    return item[col.key as keyof typeof item];
}


// A generic export function that can handle different data types
export function exportToCSV(filename: string, data: any[], columnConfig: ColumnConfig<any>[]): void {
  if (!data || data.length === 0) {
    console.warn('No data to export.');
    return;
  }

  // Use all defined columns from config for a complete export.
  const exportableColumns = columnConfig;

  // Generate header row
  const headers = exportableColumns.map(col => sanitizeValue(col.label));
  const csvRows = [headers.join(',')];

  // Generate data rows
  for (const item of data) {
    const values = exportableColumns.map(col => {
      let value = getColumnValue(item, col);

      // Apply formatter if it exists and results in a primitive type
      if (col.format) {
        const formatted = col.format(value, item);
        if (typeof formatted === 'string' || typeof formatted === 'number' || typeof formatted === 'boolean') {
          value = formatted;
        } else {
            // If the formatter returns a ReactNode, fall back to the raw value.
            // This is a simplification; a more complex system might extract text from the ReactNode.
            value = getColumnValue(item, col);
        }
      }
      
      // Fallback for null/undefined after formatting attempt
      if (value === undefined || value === null) {
          value = '';
      }

      return sanitizeValue(value);
    });
    csvRows.push(values.join(','));
  }

  // Join rows with proper newline character
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  // Create and click a download link
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
