export function buildCustomCsv(records = [], selectedColumns = []) {
  if (records.length === 0 || selectedColumns.length === 0) return '';
  const headers = selectedColumns.map(c => c.label);
  const rows = records.map(r =>
    selectedColumns.map(c => {
      const val = r[c.key] != null ? String(r[c.key]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    })
  );

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
