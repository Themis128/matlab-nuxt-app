import { experimental } from 'https://unpkg.com/@replit/extensions@1.10.0/dist/index.esm.js'
const { init, auth } = experimental
async function bootstrap () {
  await init()
  const token = await auth.getAuthToken().catch(() => null)
  if (token) {
    document.getElementById('authStatus').textContent = 'Auth token acquired'
  }
}
bootstrap()
