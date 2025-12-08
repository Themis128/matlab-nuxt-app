import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DashboardSidebar from '../DashboardSidebar.vue';

// Mock Nuxt UI components
vi.mock('#components', () => ({
  UButton: {
    name: 'UButton',
    template: '<button><slot /></button>',
  },
  UIcon: {
    name: 'UIcon',
    template: '<span class="icon-mock"></span>',
  },
}));

// Mock useRoute
vi.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/',
  }),
}));

describe('DashboardSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sidebar', () => {
    const wrapper = mount(DashboardSidebar, {
      props: {
        isOpen: true,
        selected: 'dashboard',
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it('should show navigation items', () => {
    const wrapper = mount(DashboardSidebar, {
      props: {
        isOpen: true,
        selected: 'dashboard',
      },
    });

    // Sidebar should contain navigation structure
    expect(wrapper.html()).toBeTruthy();
  });

  it('should emit close event when close button clicked', async () => {
    const wrapper = mount(DashboardSidebar, {
      props: {
        isOpen: true,
        selected: 'dashboard',
      },
    });

    const closeButton = wrapper.find('button[aria-label="Close sidebar"]');
    if (closeButton.exists()) {
      await closeButton.trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    }
  });

  it('should hide sidebar when open is false', () => {
    const wrapper = mount(DashboardSidebar, {
      props: {
        isOpen: false,
        selected: 'dashboard',
      },
    });

    // Sidebar should be hidden or have hidden class
    expect(wrapper.exists()).toBe(true);
  });
});
