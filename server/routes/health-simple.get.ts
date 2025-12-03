import { setHeader, getMethod, defineEventHandler } from 'h3'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // Set CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type,Authorization')

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true }
  }

  return {
    status: 'healthy',
    message: 'Nuxt.js frontend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }
})
