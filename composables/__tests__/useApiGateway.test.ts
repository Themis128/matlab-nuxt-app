import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useApiGateway } from '../useApiGateway';

// Mock the gateway module
const mockGateway = {
  predictPrice: vi.fn(),
  predictRAM: vi.fn(),
  predictBattery: vi.fn(),
  predictBrand: vi.fn(),
  advancedPredict: vi.fn(),
  searchPhones: vi.fn(),
  health: vi.fn(),
};

vi.mock('~/server/gateway', () => ({
  getAPIGateway: vi.fn(() => mockGateway),
}));

describe('useApiGateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return gateway methods', () => {
    const gateway = useApiGateway();

    expect(gateway).toHaveProperty('predictPrice');
    expect(gateway).toHaveProperty('predictRAM');
    expect(gateway).toHaveProperty('predictBattery');
    expect(gateway).toHaveProperty('predictBrand');
    expect(gateway).toHaveProperty('advancedPredict');
    expect(gateway).toHaveProperty('searchPhones');
    expect(gateway).toHaveProperty('health');
  });

  it('should call gateway.predictPrice', async () => {
    const mockResponse = { success: true, data: { price: 500 } };
    mockGateway.predictPrice.mockResolvedValue(mockResponse);

    const gateway = useApiGateway();
    const result = await gateway.predictPrice({ brand: 'Apple' });

    expect(mockGateway.predictPrice).toHaveBeenCalledWith({ brand: 'Apple' }, undefined);
    expect(result).toEqual(mockResponse);
  });

  it('should call gateway.predictPrice with options', async () => {
    const mockResponse = { success: true, data: { price: 500 } };
    mockGateway.predictPrice.mockResolvedValue(mockResponse);
    const options = { useCache: true, cacheTTL: 3600 };

    const gateway = useApiGateway();
    const result = await gateway.predictPrice({ brand: 'Apple' }, options);

    expect(mockGateway.predictPrice).toHaveBeenCalledWith({ brand: 'Apple' }, options);
    expect(result).toEqual(mockResponse);
  });

  it('should call gateway.predictRAM', async () => {
    const mockResponse = { success: true, data: { ram: 8 } };
    mockGateway.predictRAM.mockResolvedValue(mockResponse);

    const gateway = useApiGateway();
    const result = await gateway.predictRAM({ brand: 'Samsung' });

    expect(mockGateway.predictRAM).toHaveBeenCalledWith({ brand: 'Samsung' }, undefined);
    expect(result).toEqual(mockResponse);
  });

  it('should call gateway.predictBattery', async () => {
    const mockResponse = { success: true, data: { battery: 4000 } };
    mockGateway.predictBattery.mockResolvedValue(mockResponse);

    const gateway = useApiGateway();
    const result = await gateway.predictBattery({ brand: 'Xiaomi' });

    expect(mockGateway.predictBattery).toHaveBeenCalledWith({ brand: 'Xiaomi' }, undefined);
    expect(result).toEqual(mockResponse);
  });

  it('should call gateway.predictBrand', async () => {
    const mockResponse = { success: true, data: { brand: 'Apple' } };
    mockGateway.predictBrand.mockResolvedValue(mockResponse);

    const gateway = useApiGateway();
    const result = await gateway.predictBrand({ price: 1000 });

    expect(mockGateway.predictBrand).toHaveBeenCalledWith({ price: 1000 }, undefined);
    expect(result).toEqual(mockResponse);
  });

  it('should call gateway.advancedPredict', async () => {
    const mockResponse = { success: true, data: { predictions: {} } };
    mockGateway.advancedPredict.mockResolvedValue(mockResponse);

    const gateway = useApiGateway();
    const result = await gateway.advancedPredict({ brand: 'Apple', price: 1000 });

    expect(mockGateway.advancedPredict).toHaveBeenCalledWith(
      { brand: 'Apple', price: 1000 },
      undefined
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call gateway.searchPhones', async () => {
    const mockResponse = { success: true, data: { results: [] } };
    mockGateway.searchPhones.mockResolvedValue(mockResponse);

    const gateway = useApiGateway();
    const result = await gateway.searchPhones('iPhone');

    expect(mockGateway.searchPhones).toHaveBeenCalledWith('iPhone', undefined);
    expect(result).toEqual(mockResponse);
  });

  it('should call gateway.health', async () => {
    const mockResponse = { success: true, status: 'healthy' };
    mockGateway.health.mockResolvedValue(mockResponse);

    const gateway = useApiGateway();
    const result = await gateway.health();

    expect(mockGateway.health).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockResponse);
  });

  it('should handle errors from gateway methods', async () => {
    const mockError = new Error('Gateway error');
    mockGateway.predictPrice.mockRejectedValue(mockError);

    const gateway = useApiGateway();

    await expect(gateway.predictPrice({})).rejects.toThrow('Gateway error');
  });
});
