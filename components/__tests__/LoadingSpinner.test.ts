import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadingSpinner from '../LoadingSpinner.vue';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render spinner', () => {
    const wrapper = mount(LoadingSpinner);

    expect(wrapper.exists()).toBe(true);
  });

  it('should render different types', () => {
    const types = ['spinner', 'dots', 'pulse', 'bars'];

    types.forEach((type) => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          type: type as any,
        },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });

  it('should render different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'];

    sizes.forEach((size) => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          size: size as any,
        },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });

  it('should render with label', () => {
    const wrapper = mount(LoadingSpinner, {
      props: {
        label: 'Loading...',
      },
    });

    expect(wrapper.text()).toContain('Loading...');
  });

  it('should apply different colors', () => {
    const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];

    colors.forEach((color) => {
      const wrapper = mount(LoadingSpinner, {
        props: {
          color: color as any,
        },
      });

      expect(wrapper.exists()).toBe(true);
    });
  });
});
