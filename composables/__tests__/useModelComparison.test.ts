import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, readonly } from 'vue';
import { useModelComparison } from '../useModelComparison';

// Ensure Vue reactivity is available
vi.stubGlobal('ref', ref);
vi.stubGlobal('computed', computed);
vi.stubGlobal('readonly', readonly);

// Mock Nuxt composables
const mockUseState = vi.fn();
const mockUseFetch = vi.fn();

vi.mock('#app', () => ({
  useState: (...args: any[]) => mockUseState(...args),
  useFetch: (...args: any[]) => mockUseFetch(...args),
}));

// Stub globally for auto-imports
vi.stubGlobal('useState', (...args: any[]) => mockUseState(...args));
vi.stubGlobal('useFetch', (...args: any[]) => mockUseFetch(...args));

describe('useModelComparison', () => {
  const mockModels = [
    {
      id: '1',
      name: 'iPhone 15',
      brand: 'Apple',
      price: 999,
      year: 2023,
      ram: 8,
      battery: 4000,
      screen: 6.1,
    },
    {
      id: '2',
      name: 'Samsung S24',
      brand: 'Samsung',
      price: 899,
      year: 2024,
      ram: 12,
      battery: 4500,
      screen: 6.2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    const stateRef = ref([]);
    mockUseState.mockReturnValue(stateRef);

    const mockData = ref({ models: [], differences: {} });
    const mockPending = ref(false);
    const mockError = ref(null);

    mockUseFetch.mockReturnValue({
      data: mockData,
      pending: mockPending,
      error: mockError,
      refresh: vi.fn(),
    });
  });

  it('should initialize with empty models array', () => {
    const stateRef = ref([]);
    mockUseState.mockReturnValue(stateRef);

    const comparison = useModelComparison();

    expect(comparison.models.value).toEqual([]);
    expect(comparison.canAddMore.value).toBe(true);
  });

  it('should add model to comparison', () => {
    const stateRef = ref([]);
    mockUseState.mockReturnValue(stateRef);

    const comparison = useModelComparison();
    comparison.addModel(mockModels[0]!);

    expect(stateRef.value).toHaveLength(1);
    expect(stateRef.value[0]).toEqual(mockModels[0]!);
  });

  it('should not add duplicate models', () => {
    const stateRef = ref([]);
    mockUseState.mockReturnValue(stateRef);

    const comparison = useModelComparison();
    comparison.addModel(mockModels[0]!);
    comparison.addModel(mockModels[0]!); // Try to add same model

    expect(stateRef.value).toHaveLength(1);
  });

  it('should limit to 3 models', () => {
    const stateRef = ref([]);
    mockUseState.mockReturnValue(stateRef);

    const comparison = useModelComparison();
    comparison.addModel(mockModels[0]!);
    comparison.addModel(mockModels[1]!);
    comparison.addModel({
      id: '3',
      name: 'Model 3',
      brand: 'Brand',
      price: 500,
      year: 2023,
      ram: 6,
      battery: 3000,
      screen: 5.5,
    });
    comparison.addModel({
      id: '4',
      name: 'Model 4',
      brand: 'Brand',
      price: 600,
      year: 2023,
      ram: 8,
      battery: 3500,
      screen: 6.0,
    }); // Should not be added

    expect(stateRef.value).toHaveLength(3);
    expect(comparison.canAddMore.value).toBe(false);
  });

  it('should remove model by index', () => {
    const stateRef = ref([...mockModels]);
    mockUseState.mockReturnValue(stateRef);

    const comparison = useModelComparison();
    comparison.removeModel(0);

    expect(stateRef.value).toHaveLength(1);
    expect(stateRef.value[0]).toEqual(mockModels[1]);
  });

  it('should not remove model if index is out of bounds', () => {
    const stateRef = ref([...mockModels]);
    mockUseState.mockReturnValue(stateRef);

    const comparison = useModelComparison();
    comparison.removeModel(10); // Invalid index

    expect(stateRef.value).toHaveLength(2);
  });

  it('should clear all models', () => {
    const stateRef = ref([...mockModels]);
    mockUseState.mockReturnValue(stateRef);

    const comparison = useModelComparison();
    comparison.clearComparison();

    expect(stateRef.value).toHaveLength(0);
  });

  it('should update canAddMore when models are added', () => {
    const stateRef = ref([]);
    mockUseState.mockReturnValue(stateRef);

    const comparison = useModelComparison();
    expect(comparison.canAddMore.value).toBe(true);

    comparison.addModel(mockModels[0]!);
    comparison.addModel(mockModels[1]!);
    comparison.addModel({
      id: '3',
      name: 'Model 3',
      brand: 'Brand',
      price: 500,
      year: 2023,
      ram: 6,
      battery: 3000,
      screen: 5.5,
    });

    expect(comparison.canAddMore.value).toBe(false);
  });

  it('should call useFetch with correct parameters', () => {
    useModelComparison();

    expect(mockUseFetch).toHaveBeenCalledWith(
      '/api/dataset/compare',
      expect.objectContaining({
        method: 'POST',
        lazy: true,
      })
    );
  });
});
