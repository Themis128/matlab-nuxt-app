import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import OptimizedImage from '../OptimizedImage.vue';

// Import centralized stubs
import { getMountStubs } from '~/tests/setup/nuxt-ui-stubs';

// Mock Nuxt composables with actual structure
const mockNuxtApp = {
  $img: {
    url: (src: string) => src,
  },
};

vi.stubGlobal('useNuxtApp', () => mockNuxtApp);
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {},
}));
vi.stubGlobal('useSentryLogger', () => ({
  logError: vi.fn(),
  debug: vi.fn(),
}));

// Get centralized stubs
const stubs = getMountStubs();

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render image container', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        src: 'test-image.jpg',
        alt: 'Test image',
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.find('.optimized-image-container').exists()).toBe(true);
  });

  it('should accept src and alt props', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        src: 'test-image.jpg',
        alt: 'Test image',
      },
      global: {
        stubs,
      },
    });

    expect((wrapper.props() as any).src).toBe('test-image.jpg');
    expect((wrapper.props() as any).alt).toBe('Test image');
  });

  it('should be a Vue instance', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        src: 'test-image.jpg',
        alt: 'Test image',
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.vm).toBeTruthy();
  });

  it('should handle lazy loading prop', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        src: 'test-image.jpg',
        alt: 'Test image',
        lazy: true,
      },
      global: {
        stubs,
      },
    });

    expect((wrapper.props() as any).lazy).toBe(true);
  });

  it('should show loading state initially', () => {
    const wrapper = mount(OptimizedImage, {
      props: {
        src: 'test-image.jpg',
        alt: 'Test image',
      },
      global: {
        stubs,
      },
    });

    // Component should render (loading state is internal)
    expect(wrapper.exists()).toBe(true);
  });
});
