# Chrome Extension for Matlab Nuxt App

This folder contains a minimal Chrome extension that demonstrates how to wire up a popup, background service worker, and content script to the main Nuxt app.

Key features:
- Manifest v3 extension scaffold
- Popup UI that can call your Nuxt/Python API dev endpoints
- Background service worker for extension messaging
- Content script that adds an overlay button to pages

## Development

1. Build or run the app: either the Nuxt dev server (default) or the Python API

```pwsh
# Start the Nuxt app
npm run dev
# Optionally start the python API, if needed
npm run dev:python
```

2. Load the extension in Chrome (developer mode):
- Open `chrome://extensions/`
- Enable `Developer Mode`
- Click `Load unpacked` and select the `chrome-extension` folder
- The extension will be installed and the popup will connect to `http://localhost:3000` or `http://localhost:8000` if available

## Build & Packaging

The repo includes a script `scripts/build-chrome-extension.js` to copy the extension into `.output/extension` and optionally create a zip file for uploading to the Chrome Web Store. Run:

```pwsh
npm run extension:build
```

After build you can use `Load unpacked` and select `.output/extension`.

## Notes
- Replace icons under `icons/` with production-ready PNG assets if you intend to publish the extension to the Chrome Web Store.
- For production you should implement a proper build step for popup UI (bundle Vue/Nuxt components into a static popup) and avoid network calls to localhost from the extension popup.
- Consider scoping `host_permissions` to a specific domain instead of `https://*/*` for security.
