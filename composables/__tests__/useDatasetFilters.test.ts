import { describe, it, expect, beforeEach } from 'vitest';
import { useDatasetFilters } from '../useDatasetFilters';

describe('useDatasetFilters', () => {
  let filters: ReturnType<typeof useDatasetFilters>;

  beforeEach(() => {
    filters = useDatasetFilters();
    filters.clearFilters();
  });

  it('should initialize with default filters', () => {
    expect(filters.filters.value.brand).toBe('');
    expect(filters.filters.value.priceRange).toEqual([0, 5000]);
    expect(filters.filters.value.yearRange).toEqual([2020, 2025]);
    expect(filters.filters.value.searchQuery).toBe('');
  });

  it('should build query parameters correctly', () => {
    filters.filters.value.brand = 'Samsung';
    filters.filters.value.priceRange = [100, 500];
    filters.filters.value.ram = 8;

    const query = filters.getQueryParams();

    expect(query.brand).toBe('Samsung');
    expect(query.minPrice).toBe(100);
    expect(query.maxPrice).toBe(500);
    expect(query.minRam).toBe(8);
    expect(query.maxRam).toBe(8);
  });

  it('should clear all filters', () => {
    filters.filters.value.brand = 'Samsung';
    filters.filters.value.priceRange = [100, 500];
    filters.filters.value.searchQuery = 'test';

    filters.clearFilters();

    expect(filters.filters.value.brand).toBe('');
    expect(filters.filters.value.priceRange).toEqual([0, 5000]);
    expect(filters.filters.value.searchQuery).toBe('');
  });

  it('should detect active filters', () => {
    expect(filters.hasActiveFilters.value).toBe(false);

    filters.filters.value.brand = 'Samsung';
    expect(filters.hasActiveFilters.value).toBe(true);

    filters.clearFilters();
    filters.filters.value.searchQuery = 'test';
    expect(filters.hasActiveFilters.value).toBe(true);
  });

  it('should handle year range in query params', () => {
    filters.filters.value.yearRange = [2022, 2024];

    const query = filters.getQueryParams();

    expect(query.year).toEqual([2022, 2024]);
  });

  it('should handle battery filter in query params', () => {
    filters.filters.value.battery = 4000;

    const query = filters.getQueryParams();

    expect(query.minBattery).toBe(4000);
    expect(query.maxBattery).toBe(4000);
  });

  it('should handle screen filter in query params', () => {
    filters.filters.value.screen = 6.5;

    const query = filters.getQueryParams();

    expect(query.minScreen).toBe(6.5);
    expect(query.maxScreen).toBe(6.5);
  });
});
