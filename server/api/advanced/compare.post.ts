import { callPythonAPI } from '../../utils/python-api'
import { readBody, createError, defineEventHandler, setHeader, getMethod } from 'h3'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  // Set CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true }
  }

  try {
    const body = await readBody(event)

    // Validate required fields
    const requiredFields = ['models', 'ram', 'battery', 'screen', 'weight', 'year', 'company']
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0)

    if (missingFields.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required fields: ${missingFields.join(', ')}`,
      })
    }

    if (!Array.isArray(body.models) || body.models.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Models array is required and must not be empty',
      })
    }

    // Run predictions for each model
    const predictions: any[] = []
    const startTime = Date.now()

    for (const modelType of body.models) {
      try {
        const payload = {
          ram: parseFloat(body.ram),
          battery: parseFloat(body.battery),
          screen: parseFloat(body.screen),
          weight: parseFloat(body.weight),
          year: parseInt(body.year),
          company: body.company,
          front_camera: body.front_camera ? parseFloat(body.front_camera) : undefined,
          back_camera: body.back_camera ? parseFloat(body.back_camera) : undefined,
          processor: body.processor || undefined,
          storage: body.storage ? parseFloat(body.storage) : undefined,
          model_type: modelType,
          currency: body.currency || 'USD',
        }

        const result = await callPythonAPI(`/api/advanced/predict`, payload, event)
        if (result) {
          predictions.push({
            model: modelType,
            ...result,
          })
        }
      } catch (error) {
        console.warn(`Failed to get prediction for model ${modelType}:`, error)
        // Continue with other models even if one fails
      }
    }

    const totalTime = Date.now() - startTime

    return {
      predictions,
      total_models: body.models.length,
      successful_predictions: predictions.length,
      total_time_ms: totalTime,
      average_time_per_model_ms: totalTime / predictions.length,
    }
  } catch (error: unknown) {
    console.error('Error in model comparison:', error)
    throw error
  }
})
