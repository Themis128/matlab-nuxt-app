/**
 * Prediction Domain Model
 *
 * Represents a machine learning prediction in the domain layer.
 */

export interface PredictionInput {
  brand?: string;
  price?: number;
  ram?: number;
  battery?: number;
  storage?: number;
  screenSize?: number;
  camera?: number;
  [key: string]: unknown;
}

export interface PredictionOutput {
  prediction: number | string;
  confidence?: number;
  model?: string;
  metadata?: {
    processingTime?: number;
    modelVersion?: string;
    timestamp?: string;
  };
}

export interface PredictionResult {
  input: PredictionInput;
  output: PredictionOutput;
  type: 'price' | 'ram' | 'battery' | 'brand' | 'advanced';
  id?: string;
  createdAt?: string;
}

export class Prediction {
  constructor(
    public readonly input: PredictionInput,
    public readonly output: PredictionOutput,
    public readonly type: 'price' | 'ram' | 'battery' | 'brand' | 'advanced',
    public readonly id?: string,
    public readonly createdAt?: string
  ) {}

  /**
   * Get prediction value as number
   */
  getValue(): number {
    if (typeof this.output.prediction === 'number') {
      return this.output.prediction;
    }
    // Try to parse string predictions
    const parsed = parseFloat(String(this.output.prediction));
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Check if prediction has high confidence
   */
  isHighConfidence(threshold = 0.8): boolean {
    return (this.output.confidence ?? 0) >= threshold;
  }

  /**
   * Convert to JSON
   */
  toJSON(): PredictionResult {
    return {
      input: this.input,
      output: this.output,
      type: this.type,
      id: this.id,
      createdAt: this.createdAt || new Date().toISOString(),
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: PredictionResult): Prediction {
    return new Prediction(data.input, data.output, data.type, data.id, data.createdAt);
  }
}
