/**
 * Toast notification composable for displaying messages
 * Uses Nuxt UI's notification system
 */

export interface ToastNotification {
  id?: string;
  title: string;
  description?: string;
  color?: 'primary' | 'green' | 'red' | 'orange' | 'gray';
  timeout?: number;
  icon?: string;
}

export function useToast() {
  const showToast = (notification: ToastNotification) => {
    // Try to use Nuxt UI's toast system
    try {
      const nuxtApp = useNuxtApp();
      const toast = (nuxtApp as any).toast;
      if (toast && typeof toast.add === 'function') {
        toast.add({
          id: notification.id || `toast-${Date.now()}`,
          title: notification.title,
          description: notification.description,
          color: notification.color || 'primary',
          timeout: notification.timeout || 5000,
          icon: notification.icon,
        });
        return;
      }
    } catch {
      // Fall through to console fallback
    }

    // Fallback to console if toast not available
    const level =
      notification.color === 'red' ? 'error' : notification.color === 'orange' ? 'warn' : 'log';
    console[level](
      `[${notification.color?.toUpperCase() || 'INFO'}] ${notification.title}`,
      notification.description || ''
    );
  };

  const showSuccess = (title: string, description?: string) => {
    showToast({
      title,
      description,
      color: 'green',
      icon: 'i-heroicons-check-circle',
    });
  };

  const showError = (title: string, description?: string) => {
    showToast({
      title,
      description,
      color: 'red',
      icon: 'i-heroicons-x-circle',
      timeout: 8000, // Longer timeout for errors
    });
  };

  const showWarning = (title: string, description?: string) => {
    showToast({
      title,
      description,
      color: 'orange',
      icon: 'i-heroicons-exclamation-triangle',
      timeout: 6000,
    });
  };

  const showInfo = (title: string, description?: string) => {
    showToast({
      title,
      description,
      color: 'primary',
      icon: 'i-heroicons-information-circle',
    });
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
