// Basic popup interactions: Ping background and fetch a dev status endpoint

(async function () {
  const pingBtn = document.getElementById('pingBtn');
  const apiBtn = document.getElementById('apiBtn');
  const result = document.getElementById('result');

  pingBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'PING' }, (resp) => {
      result.textContent = 'BG: ' + JSON.stringify(resp);
    });
  });

  apiBtn.addEventListener('click', async () => {
    result.textContent = 'Checking...';
    try {
      // Attempt to call local Nuxt dev server (if running)
      const resp = await fetch('http://localhost:3000/api/health');
      if (!resp.ok) throw new Error('Non-OK response: ' + resp.status);
      const json = await resp.json();
      result.textContent = 'Nuxt Dev: ' + JSON.stringify(json);
    } catch (err) {
      // Try python api as fallback
      try {
        const resp2 = await fetch('http://localhost:8000/health');
        if (!resp2.ok) throw new Error('Non-OK response: ' + resp2.status);
        const j2 = await resp2.json();
        result.textContent = 'Python API: ' + JSON.stringify(j2);
      } catch (err2) {
        result.textContent = 'No backend reachable';
      }
    }
  });
})();
