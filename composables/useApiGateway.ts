/**
 * API Gateway Composable
 *
 * Provides easy access to the API Gateway from components and composables
 */

import { getAPIGateway, type GatewayOptions, type GatewayResponse } from '~/server/gateway';

export const useApiGateway = (event?: any) => {
  const gateway = getAPIGateway(event);

  return {
    /**
     * Predict phone price
     */
    async predictPrice(
      data: Record<string, unknown>,
      options?: GatewayOptions
    ): Promise<GatewayResponse> {
      return gateway.predictPrice(data, options);
    },

    /**
     * Predict phone RAM
     */
    async predictRAM(
      data: Record<string, unknown>,
      options?: GatewayOptions
    ): Promise<GatewayResponse> {
      return gateway.predictRAM(data, options);
    },

    /**
     * Predict phone battery
     */
    async predictBattery(
      data: Record<string, unknown>,
      options?: GatewayOptions
    ): Promise<GatewayResponse> {
      return gateway.predictBattery(data, options);
    },

    /**
     * Predict phone brand
     */
    async predictBrand(
      data: Record<string, unknown>,
      options?: GatewayOptions
    ): Promise<GatewayResponse> {
      return gateway.predictBrand(data, options);
    },

    /**
     * Advanced prediction
     */
    async advancedPredict(
      data: Record<string, unknown>,
      options?: GatewayOptions
    ): Promise<GatewayResponse> {
      return gateway.advancedPredict(data, options);
    },

    /**
     * Search phones
     */
    async searchPhones(query: string, options?: GatewayOptions): Promise<GatewayResponse> {
      return gateway.searchPhones(query, options);
    },

    /**
     * Health check
     */
    async health(options?: GatewayOptions): Promise<GatewayResponse> {
      return gateway.health(options);
    },
  };
};
