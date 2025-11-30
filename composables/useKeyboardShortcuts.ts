/**
 * Keyboard shortcuts composable
 * Provides global keyboard shortcuts for improved user experience
 */

import { ref, readonly, onMounted, onUnmounted } from 'vue'

interface ShortcutAction {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  description: string
  action: () => void
  disabled?: boolean
}

export function useKeyboardShortcuts() {
  const shortcuts = ref<ShortcutAction[]>([
    {
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      action: () => showShortcutsHelp(),
    },
    {
      key: '/',
      ctrlKey: true,
      description: 'Focus search',
      action: () => focusSearch(),
    },
    {
      key: ',',
      ctrlKey: true,
      description: 'Open preferences',
      action: () => openPreferences(),
    },
    {
      key: 'h',
      ctrlKey: true,
      description: 'Go to home',
      action: () => navigateToHome(),
    },
    {
      key: 'd',
      ctrlKey: true,
      description: 'Toggle dark mode',
      action: () => toggleTheme(),
    },
    {
      key: 'r',
      ctrlKey: true,
      description: 'Refresh data',
      action: () => refreshData(),
    },
  ])

  // Handle keyboard events
  const handleKeydown = (event: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const activeElement = document.activeElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.hasAttribute('contenteditable'))
    ) {
      return
    }

    // Check for matching shortcuts
    for (const shortcut of shortcuts.value) {
      if (shortcut.disabled) continue

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const altMatches = !!shortcut.altKey === event.altKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey
      const metaMatches = !!shortcut.metaKey === (event.metaKey || event.ctrlKey)

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        event.preventDefault()
        event.stopPropagation()
        shortcut.action()
        break
      }
    }
  }

  // Shortcut actions
  const showShortcutsHelp = () => {
    // This will be implemented when we add a shortcuts help dialog
    alert(
      'Keyboard Shortcuts:\n' +
        'Ctrl+/ - Focus search\n' +
        'Ctrl+, - Open preferences\n' +
        'Ctrl+H - Go to home\n' +
        'Ctrl+D - Toggle theme\n' +
        'Ctrl+R - Refresh data\n' +
        'Shift+? - Show this help'
    )
  }

  const focusSearch = () => {
    const searchInput = document.querySelector(
      'input[placeholder*="search" i], input[type="search"]'
    ) as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
      searchInput.select()
    } else {
      // Try to navigate to search page
      window.location.href = '/search'
    }
  }

  const openPreferences = () => {
    // Emit event to open preferences dialog
    // This will be handled by the parent component
    const event = new CustomEvent('open-preferences')
    window.dispatchEvent(event)
  }

  const navigateToHome = () => {
    window.location.href = '/'
  }

  const toggleTheme = () => {
    // Toggle theme via existing ThemeToggle component
    const themeToggle = document.querySelector('[data-theme-toggle]') as HTMLElement
    if (themeToggle) {
      themeToggle.click()
    } else {
      // Fallback: toggle a class on document
      document.documentElement.classList.toggle('dark')
    }
  }

  const refreshData = () => {
    // Refresh current page data
    window.location.reload()
  }

  // Add keyboard event listener
  onMounted(() => {
    if (process.client) {
      document.addEventListener('keydown', handleKeydown)
    }
  })

  // Remove keyboard event listener
  onUnmounted(() => {
    if (process.client) {
      document.removeEventListener('keydown', handleKeydown)
    }
  })

  return {
    shortcuts: readonly(shortcuts),
    showShortcutsHelp,
    focusSearch,
    openPreferences,
    navigateToHome,
    toggleTheme,
    refreshData,
  }
}
