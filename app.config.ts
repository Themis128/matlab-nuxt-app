export default defineAppConfig({
  ui: {
    primary: 'blue',
    gray: 'slate',

    // Enhanced button styles
    button: {
      default: {
        size: 'md',
        color: 'primary',
        variant: 'solid',
        loadingIcon: 'i-heroicons-arrow-path',
      },
      rounded: 'rounded-lg',
      padding: {
        sm: 'px-3 py-1.5',
        md: 'px-4 py-2.5',
        lg: 'px-5 py-3',
        xl: 'px-6 py-3.5',
      },
    },

    // Enhanced card styles
    card: {
      rounded: 'rounded-xl',
      shadow: 'shadow-lg',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
      divide: 'divide-y divide-gray-200 dark:divide-gray-700',
      body: {
        padding: 'p-4 sm:p-6',
      },
      header: {
        padding: 'p-4 sm:p-6',
      },
      footer: {
        padding: 'p-4 sm:p-6',
      },
    },

    // Enhanced input styles
    input: {
      rounded: 'rounded-lg',
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
      padding: {
        sm: 'px-3 py-2',
        md: 'px-4 py-2.5',
        lg: 'px-5 py-3',
      },
    },

    // Enhanced form group
    formGroup: {
      label: {
        base: 'block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1',
      },
      help: 'text-sm text-gray-500 dark:text-gray-400 mt-1',
      error: 'text-sm text-red-500 dark:text-red-400 mt-1',
    },

    // Enhanced select
    select: {
      rounded: 'rounded-lg',
      padding: {
        sm: 'px-3 py-2',
        md: 'px-4 py-2.5',
        lg: 'px-5 py-3',
      },
    },

    // Enhanced textarea
    textarea: {
      rounded: 'rounded-lg',
      padding: {
        sm: 'px-3 py-2',
        md: 'px-4 py-2.5',
        lg: 'px-5 py-3',
      },
    },

    // Enhanced badge
    badge: {
      rounded: 'rounded-full',
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
      },
    },

    // Enhanced alert
    alert: {
      rounded: 'rounded-lg',
      padding: 'p-4',
      title: 'text-sm font-semibold',
      description: 'mt-1 text-sm',
    },

    // Enhanced modal
    modal: {
      rounded: 'rounded-2xl',
      shadow: 'shadow-2xl',
      padding: 'p-0',
      overlay: {
        background: 'bg-gray-900/75 dark:bg-gray-900/90',
      },
    },

    // Enhanced tooltip
    tooltip: {
      rounded: 'rounded-lg',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
    },

    // Enhanced notification
    notification: {
      rounded: 'rounded-xl',
      shadow: 'shadow-2xl',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-700',
    },
  },
})
