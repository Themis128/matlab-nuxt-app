/**
 * Utility to call Python API endpoints
 */

export async function callPythonAPI<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<T | null> {
  const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000'

  try {
    const response = await fetch(`${pythonApiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    // Return the response data regardless of status code
    // Let the calling code handle errors appropriately
    const data = await response.json()
    return data
  } catch (error) {
    // Python API not available, return null to fallback
    console.log(`Python API not available at ${pythonApiUrl}${endpoint}`)
  }

  return null
}
