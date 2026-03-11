/* global Blob */
/**
 * Client-side CSV export utility.
 * Converts an array of objects to CSV and triggers a browser download.
 */

interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>(
  filename: string,
  data: T[],
  columns: CsvColumn<T>[]
): void {
  if (data.length === 0) return;

  const headers = columns.map((c) => escapeCsvField(c.header));
  const rows = data.map((row) =>
    columns.map((col) => escapeCsvField(String(col.accessor(row) ?? '')))
  );

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
