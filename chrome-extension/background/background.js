/* global self, chrome */

// Background service worker for the extension (MV3)
// Listens for installation and simple messaging

self.addEventListener('install', (_event) => {
  console.log('Matlab Nuxt App extension installed');
  self.skipWaiting();
});

self.addEventListener('activate', (_event) => {
  console.log('Matlab Nuxt App extension activated');
});

// Simple message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'PING') {
    sendResponse({ type: 'PONG', msg: 'Hello from background' });
  }
  // Return true if will use sendResponse asynchronously
  return false;
});
