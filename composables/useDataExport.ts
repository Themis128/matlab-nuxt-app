/**
 * Nuxt 4 composable for data export functionality
 * Supports CSV, JSON, and Excel exports
 */
export const useDataExport = () => {
  const exportToCSV = (data: any[], filename: string = 'export.csv') => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    // Convert data to CSV rows
    const csvRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          // Handle values with commas, quotes, or newlines
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',');
    });

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any[], filename: string = 'export.json') => {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async (data: any[], filename: string = 'export.xlsx') => {
    // Note: This requires a library like xlsx or exceljs
    // For now, we'll export as CSV with .xlsx extension (basic implementation)
    console.warn('Excel export requires additional library. Exporting as CSV instead.');
    exportToCSV(data, filename.replace('.xlsx', '.csv'));
  };

  const exportDataset = (
    data: any[],
    format: 'csv' | 'json' | 'excel' = 'csv',
    filename?: string
  ) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `mobile-dataset-export-${timestamp}.${format === 'excel' ? 'xlsx' : format}`;

    switch (format) {
      case 'csv':
        exportToCSV(data, filename || defaultFilename);
        break;
      case 'json':
        exportToJSON(data, filename || defaultFilename);
        break;
      case 'excel':
        exportToExcel(data, filename || defaultFilename);
        break;
    }
  };

  return {
    exportToCSV,
    exportToJSON,
    exportToExcel,
    exportDataset,
  };
};
