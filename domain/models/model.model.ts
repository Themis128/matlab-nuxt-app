/**
 * ML Model Domain Model
 *
 * Represents a machine learning model in the domain layer.
 */

export type ModelType =
  | 'sklearn'
  | 'ensemble'
  | 'xgboost'
  | 'multitask'
  | 'segmentation'
  | 'distilled'
  | 'neural';

export type PredictionTask = 'price' | 'ram' | 'battery' | 'brand' | 'advanced';

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  mse?: number;
  mae?: number;
  r2Score?: number;
  trainingTime?: number;
  inferenceTime?: number;
}

export interface ModelMetadata {
  name: string;
  version: string;
  type: ModelType;
  task: PredictionTask;
  trainedAt: string;
  trainedBy?: string;
  description?: string;
  features?: string[];
  hyperparameters?: Record<string, unknown>;
}

export class MLModel {
  constructor(
    public readonly id: string,
    public readonly metadata: ModelMetadata,
    public readonly metrics: ModelMetrics,
    public readonly filePath?: string,
    public readonly isActive: boolean = false
  ) {}

  /**
   * Check if model is production-ready
   */
  isProductionReady(threshold = 0.8): boolean {
    if (this.metrics.accuracy !== undefined) {
      return this.metrics.accuracy >= threshold;
    }
    if (this.metrics.r2Score !== undefined) {
      return this.metrics.r2Score >= threshold;
    }
    return false;
  }

  /**
   * Get overall performance score
   */
  getPerformanceScore(): number {
    if (this.metrics.accuracy !== undefined) {
      return this.metrics.accuracy;
    }
    if (this.metrics.r2Score !== undefined) {
      return this.metrics.r2Score;
    }
    if (this.metrics.f1Score !== undefined) {
      return this.metrics.f1Score;
    }
    return 0;
  }

  /**
   * Check if model is better than another
   */
  isBetterThan(other: MLModel): boolean {
    return this.getPerformanceScore() > other.getPerformanceScore();
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      metadata: this.metadata,
      metrics: this.metrics,
      filePath: this.filePath,
      isActive: this.isActive,
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: any): MLModel {
    return new MLModel(
      data.id,
      data.metadata,
      data.metrics || {},
      data.filePath,
      data.isActive || false
    );
  }
}
