/* global chrome, alert */

// Content script injected in pages. It demonstrates messaging with the background script

(function () {
  console.log('[Matlab Nuxt Extension] Content script loaded');

  // Add a small toolbar button to the page for demo purposes
  try {
    const toolbar = document.createElement('div');
    toolbar.id = 'matlab-nuxt-extension-toolbar';
    toolbar.style.position = 'fixed';
    toolbar.style.bottom = '16px';
    toolbar.style.right = '16px';
    toolbar.style.background = 'rgba(0, 0, 0, 0.6)';
    toolbar.style.color = 'white';
    toolbar.style.padding = '8px 12px';
    toolbar.style.borderRadius = '8px';
    toolbar.style.zIndex = 999999;
    toolbar.style.fontFamily =
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial';
    toolbar.style.fontSize = '12px';
    toolbar.innerText = 'Matlab Nuxt';

    toolbar.addEventListener('click', () => {
      // Send a message to background
      chrome.runtime.sendMessage({ type: 'PING' }, (resp) => {
        if (resp) {
          alert(`Background message: ${JSON.stringify(resp)}`);
        } else {
          alert('No response from background');
        }
      });
    });

    document.body.appendChild(toolbar);
  } catch (err) {
    console.warn('Failed to add toolbar', err);
  }
})();
