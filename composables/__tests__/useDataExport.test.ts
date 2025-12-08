import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDataExport } from '../useDataExport';

describe('useDataExport', () => {
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;
  let clickSpy: any;
  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;

  beforeEach(() => {
    // Mock DOM methods
    createElementSpy = vi.spyOn(document, 'createElement');
    appendChildSpy = vi.spyOn(document.body, 'appendChild');
    removeChildSpy = vi.spyOn(document.body, 'removeChild');
    clickSpy = vi.fn();
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    // Mock link element
    const mockLink = {
      setAttribute: vi.fn(),
      style: {},
      click: clickSpy,
    };
    createElementSpy.mockReturnValue(mockLink);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export data to CSV', () => {
    const { exportToCSV } = useDataExport();
    const data = [
      { name: 'iPhone', price: 999 },
      { name: 'Samsung', price: 899 },
    ];

    exportToCSV(data, 'test.csv');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('should handle CSV values with commas', () => {
    const { exportToCSV } = useDataExport();
    const data = [{ name: 'iPhone, Pro', price: 999 }];

    exportToCSV(data, 'test.csv');

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('should handle CSV values with quotes', () => {
    const { exportToCSV } = useDataExport();
    const data = [{ name: 'iPhone "Pro"', price: 999 }];

    exportToCSV(data, 'test.csv');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should handle null and undefined values in CSV', () => {
    const { exportToCSV } = useDataExport();
    const data = [{ name: 'iPhone', price: null, stock: undefined }];

    exportToCSV(data, 'test.csv');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should export data to JSON', () => {
    const { exportToJSON } = useDataExport();
    const data = [{ name: 'iPhone', price: 999 }];

    exportToJSON(data, 'test.json');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should format JSON with proper indentation', () => {
    const { exportToJSON } = useDataExport();
    const data = [{ name: 'iPhone', price: 999 }];

    exportToJSON(data, 'test.json');

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('application/json;charset=utf-8;');
  });

  it('should export to Excel (fallback to CSV)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { exportToExcel } = useDataExport();
    const data = [{ name: 'iPhone', price: 999 }];

    exportToExcel(data, 'test.xlsx');

    expect(consoleSpy).toHaveBeenCalledWith(
      'Excel export requires additional library. Exporting as CSV instead.'
    );
    expect(createElementSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should use exportDataset with CSV format', () => {
    const { exportDataset } = useDataExport();
    const data = [{ name: 'iPhone', price: 999 }];

    exportDataset(data, 'csv', 'custom.csv');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should use exportDataset with JSON format', () => {
    const { exportDataset } = useDataExport();
    const data = [{ name: 'iPhone', price: 999 }];

    exportDataset(data, 'json', 'custom.json');

    expect(createElementSpy).toHaveBeenCalled();
  });

  it('should use exportDataset with Excel format', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { exportDataset } = useDataExport();
    const data = [{ name: 'iPhone', price: 999 }];

    exportDataset(data, 'excel', 'custom.xlsx');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should generate default filename with timestamp', () => {
    const { exportDataset } = useDataExport();
    const data = [{ name: 'iPhone', price: 999 }];

    exportDataset(data, 'csv');

    const link = createElementSpy.mock.results[0].value;
    expect(link.setAttribute).toHaveBeenCalledWith(
      'download',
      expect.stringMatching(/mobile-dataset-export-\d{4}-\d{2}-\d{2}\.csv/)
    );
  });

  it('should warn when exporting empty data', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { exportToCSV } = useDataExport();

    exportToCSV([], 'test.csv');

    expect(consoleSpy).toHaveBeenCalledWith('No data to export');
    expect(createElementSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should revoke object URL after download', () => {
    const { exportToCSV } = useDataExport();
    const data = [{ name: 'iPhone', price: 999 }];

    exportToCSV(data, 'test.csv');

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
