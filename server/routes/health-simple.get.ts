import { setCorsHeaders } from '../utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  return {
    status: 'healthy',
    message: 'Nuxt.js frontend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
});
