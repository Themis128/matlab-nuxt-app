/**
 * Price Prediction Endpoint (v2 - Using API Gateway)
 *
 * This is an example migration showing how to use the new API Gateway
 * and domain layer. This endpoint demonstrates:
 * - Using API Gateway for unified backend communication
 * - Domain validation with Zod schemas
 * - Domain services for business logic
 * - Better error handling
 */

import { getAPIGateway } from '../../gateway';
import { PredictionInputSchema } from '../../../domain/validators/prediction.schema';
import { PredictionService } from '../../../domain/services/prediction.service';
import { Prediction } from '../../../domain/models/prediction.model';
import { handleAPIError } from '../../utils/error-handler';

import { setCorsHeaders } from '../../utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const body = await readBody(event);

    // Use domain validation
    const validationResult = PredictionInputSchema.safeParse(body);
    if (!validationResult.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: {
          errors: validationResult.error.errors,
        },
      });
    }

    const validatedInput = validationResult.data;

    // Use domain service for business logic
    const predictionService = new PredictionService();
    const inputQuality = predictionService.calculateInputQuality(validatedInput);

    if (inputQuality < 0.5) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Insufficient input data quality. Please provide more fields.',
        data: { inputQuality },
      });
    }

    // Use API Gateway for backend communication
    const gateway = getAPIGateway(event);
    const gatewayResponse = await gateway.predictPrice(validatedInput, {
      useCache: predictionService.shouldCache(
        new Prediction(validatedInput, { prediction: 0 }, 'price')
      ),
      cacheTTL: 300, // 5 minutes
    });

    // Transform response to domain model
    const prediction = new Prediction(
      validatedInput,
      {
        prediction: gatewayResponse.data.price || gatewayResponse.data.prediction || 0,
        confidence: gatewayResponse.data.confidence,
        model: gatewayResponse.data.model,
        metadata: {
          processingTime: gatewayResponse.metadata?.responseTime,
          timestamp: new Date().toISOString(),
        },
      },
      'price'
    );

    // Format using domain service
    const formattedValue = predictionService.formatPrediction(prediction, 'price');

    return {
      price: prediction.getValue(),
      formattedPrice: formattedValue,
      confidence: prediction.output.confidence,
      model: prediction.output.model,
      inputQuality,
      metadata: {
        cached: gatewayResponse.metadata?.cached || false,
        responseTime: gatewayResponse.metadata?.responseTime,
      },
    };
  } catch (error: unknown) {
    return handleAPIError(event, error);
  }
});
