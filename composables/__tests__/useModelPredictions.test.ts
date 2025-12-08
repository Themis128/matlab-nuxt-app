import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useModelPredictions } from '../useModelPredictions';

// Mock useApiConfig
const mockUseApiConfig = vi.fn(() => ({
  pythonApiUrl: 'http://localhost:8000',
}));

vi.mock('~/composables/useApiConfig', () => ({
  useApiConfig: () => mockUseApiConfig(),
}));

// Mock useFetch
const mockUseFetch = vi.fn();

vi.mock('#app', () => ({
  useFetch: (...args: any[]) => mockUseFetch(...args),
}));

describe('useModelPredictions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFetch.mockReturnValue({
      data: { value: { price: 999, model_used: 'distilled' } },
      error: { value: null },
    });
  });

  it('should return all prediction methods', () => {
    const predictions = useModelPredictions();

    expect(predictions).toHaveProperty('predictPrice');
    expect(predictions).toHaveProperty('predictRam');
    expect(predictions).toHaveProperty('predictBattery');
    expect(predictions).toHaveProperty('predictBrand');
    expect(predictions).toHaveProperty('compareModels');
    expect(predictions).toHaveProperty('getModelInfo');
    expect(predictions).toHaveProperty('getAvailableModels');
    expect(predictions).toHaveProperty('getRecommendedModels');
  });

  it('should get available models', () => {
    const predictions = useModelPredictions();
    const models = predictions.getAvailableModels();

    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toHaveProperty('type');
    expect(models[0]).toHaveProperty('name');
  });

  it('should get recommended models', () => {
    const predictions = useModelPredictions();
    const models = predictions.getRecommendedModels();

    expect(models.every((m) => m.recommended)).toBe(true);
  });

  it('should predict price with distilled model', async () => {
    const predictions = useModelPredictions();
    const request = {
      ram: 8,
      battery: 4000,
      screen: 6.1,
      weight: 200,
      year: 2023,
      company: 'Apple',
    };

    const result = await predictions.predictPrice(request, 'distilled');

    expect(mockUseFetch).toHaveBeenCalled();
    expect(result.price).toBe(999);
  });

  it('should predict price with other models', async () => {
    const predictions = useModelPredictions();
    const request = {
      ram: 8,
      battery: 4000,
      screen: 6.1,
      weight: 200,
      year: 2023,
      company: 'Apple',
    };

    await predictions.predictPrice(request, 'ensemble_stacking');

    const call = mockUseFetch.mock.calls[0]![0];
    expect(call).toContain('/api/advanced/predict');
  });

  it('should handle prediction errors', async () => {
    mockUseFetch.mockReturnValue({
      data: { value: null },
      error: { value: { message: 'API Error' } },
    });

    const predictions = useModelPredictions();
    const request = {
      ram: 8,
      battery: 4000,
      screen: 6.1,
      weight: 200,
      year: 2023,
      company: 'Apple',
    };

    await expect(predictions.predictPrice(request)).rejects.toThrow();
  });

  it('should compare multiple models', async () => {
    const predictions = useModelPredictions();
    const request = {
      ram: 8,
      battery: 4000,
      screen: 6.1,
      weight: 200,
      year: 2023,
      company: 'Apple',
    };

    const result = await predictions.compareModels(request, ['distilled', 'ensemble_stacking']);

    expect(Object.keys(result)).toHaveLength(2);
  });
});
