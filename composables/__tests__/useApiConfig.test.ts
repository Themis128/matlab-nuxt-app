import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Nuxt composables before import
const mockRuntimeConfig = {
  public: {
    apiBase: 'http://localhost:8000',
    pyApiDisabled: false,
  },
};

// Mock useRuntimeConfig globally
vi.mock('#app', () => ({
  useRuntimeConfig: () => mockRuntimeConfig,
}));

// Make useRuntimeConfig available globally
vi.stubGlobal('useRuntimeConfig', () => mockRuntimeConfig);

// Mock process.client
vi.stubGlobal('process', {
  ...process,
  client: false,
});

// Import after mocking
import { useApiConfig } from '../useApiConfig';

describe('useApiConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset config
    mockRuntimeConfig.public.apiBase = 'http://localhost:8000';
    mockRuntimeConfig.public.pyApiDisabled = false;
  });

  it('should return Python API URL from config', () => {
    const { pythonApiUrl } = useApiConfig();
    expect(pythonApiUrl).toBe('http://localhost:8000');
  });

  it('should return isPythonApiDisabled flag', () => {
    const { isPythonApiDisabled } = useApiConfig();
    expect(typeof isPythonApiDisabled).toBe('boolean');
    expect(isPythonApiDisabled).toBe(false);
  });

  it('should use config apiBase when set', () => {
    mockRuntimeConfig.public.apiBase = 'https://api.example.com';
    const { pythonApiUrl } = useApiConfig();
    expect(pythonApiUrl).toBe('https://api.example.com');
    // Reset
    mockRuntimeConfig.public.apiBase = 'http://localhost:8000';
  });
});
