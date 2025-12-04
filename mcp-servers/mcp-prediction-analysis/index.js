#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PredictionAnalysisServer {
  constructor() {
    this.server = new Server(
      {
        name: 'prediction-analysis-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_predictions':
            return await this.analyzePredictions(args.predictionsFile, args.actualFile);

          case 'calculate_metrics':
            return await this.calculateMetrics(args.predictionsFile, args.actualFile);

          case 'generate_performance_report':
            return await this.generatePerformanceReport(args.predictionsFile, args.actualFile);

          case 'compare_models':
            return await this.compareModels(args.modelResults);

          case 'analyze_prediction_errors':
            return await this.analyzePredictionErrors(args.predictionsFile, args.actualFile);

          case 'visualize_predictions':
            return await this.visualizePredictions(args.predictionsFile, args.actualFile);

          case 'calculate_confusion_matrix':
            return await this.calculateConfusionMatrix(args.predictionsFile, args.actualFile);

          case 'analyze_prediction_distribution':
            return await this.analyzePredictionDistribution(args.predictionsFile);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });

    // List available tools
    this.server.setRequestHandler('tools/list', async () => {
      return {
        tools: [
          {
            name: 'analyze_predictions',
            description: 'Analyze prediction results against actual values',
            inputSchema: {
              type: 'object',
              properties: {
                predictionsFile: {
                  type: 'string',
                  description: 'Path to predictions CSV file',
                },
                actualFile: {
                  type: 'string',
                  description: 'Path to actual values CSV file',
                },
              },
              required: ['predictionsFile', 'actualFile'],
            },
          },
          {
            name: 'calculate_metrics',
            description: 'Calculate performance metrics (accuracy, precision, recall, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                predictionsFile: {
                  type: 'string',
                  description: 'Path to predictions CSV file',
                },
                actualFile: {
                  type: 'string',
                  description: 'Path to actual values CSV file',
                },
              },
              required: ['predictionsFile', 'actualFile'],
            },
          },
          {
            name: 'generate_performance_report',
            description: 'Generate comprehensive performance report',
            inputSchema: {
              type: 'object',
              properties: {
                predictionsFile: {
                  type: 'string',
                  description: 'Path to predictions CSV file',
                },
                actualFile: {
                  type: 'string',
                  description: 'Path to actual values CSV file',
                },
              },
              required: ['predictionsFile', 'actualFile'],
            },
          },
          {
            name: 'compare_models',
            description: 'Compare performance of multiple models',
            inputSchema: {
              type: 'object',
              properties: {
                modelResults: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      predictionsFile: { type: 'string' },
                      actualFile: { type: 'string' },
                    },
                    required: ['name', 'predictionsFile', 'actualFile'],
                  },
                  description: 'Array of model result objects',
                },
              },
              required: ['modelResults'],
            },
          },
          {
            name: 'analyze_prediction_errors',
            description: 'Analyze types and patterns of prediction errors',
            inputSchema: {
              type: 'object',
              properties: {
                predictionsFile: {
                  type: 'string',
                  description: 'Path to predictions CSV file',
                },
                actualFile: {
                  type: 'string',
                  description: 'Path to actual values CSV file',
                },
              },
              required: ['predictionsFile', 'actualFile'],
            },
          },
          {
            name: 'visualize_predictions',
            description: 'Generate visualization data for predictions',
            inputSchema: {
              type: 'object',
              properties: {
                predictionsFile: {
                  type: 'string',
                  description: 'Path to predictions CSV file',
                },
                actualFile: {
                  type: 'string',
                  description: 'Path to actual values CSV file (optional)',
                },
              },
              required: ['predictionsFile'],
            },
          },
          {
            name: 'calculate_confusion_matrix',
            description: 'Calculate confusion matrix for classification predictions',
            inputSchema: {
              type: 'object',
              properties: {
                predictionsFile: {
                  type: 'string',
                  description: 'Path to predictions CSV file',
                },
                actualFile: {
                  type: 'string',
                  description: 'Path to actual values CSV file',
                },
              },
              required: ['predictionsFile', 'actualFile'],
            },
          },
          {
            name: 'analyze_prediction_distribution',
            description: 'Analyze distribution of prediction values',
            inputSchema: {
              type: 'object',
              properties: {
                predictionsFile: {
                  type: 'string',
                  description: 'Path to predictions CSV file',
                },
              },
              required: ['predictionsFile'],
            },
          },
        ],
      };
    });
  }

  async loadCsvData(filePath) {
    const absolutePath = path.resolve(filePath);
    const csvContent = await fs.readFile(absolutePath, 'utf8');

    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(
              new Error(`CSV parsing errors: ${results.errors.map((e) => e.message).join(', ')}`)
            );
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  async analyzePredictions(predictionsFile, actualFile) {
    try {
      // Default to actual project prediction results if no file specified
      const defaultPredictionsFile =
        predictionsFile || 'd:\\\\Nuxt Projects\\\\MatLab\\\\data\\\\price_prediction_results.json';
      const defaultActualFile =
        actualFile || 'd:\\\\Nuxt Projects\\\\MatLab\\\\data\\\\Mobiles Dataset (2025).csv';

      // Load prediction results (JSON format from Python API)
      let predictionsData;
      if (defaultPredictionsFile.endsWith('.json')) {
        predictionsData = await this.loadJsonData(defaultPredictionsFile);
      } else {
        predictionsData = await this.loadCsvData(defaultPredictionsFile);
      }

      // Load actual dataset for comparison
      const actualData = await this.loadCsvData(defaultActualFile);

      // Extract predictions and actual values for mobile price analysis
      const predictions = [];
      const actuals = [];

      if (Array.isArray(predictionsData)) {
        // Handle array of prediction results
        predictionsData.forEach((result) => {
          if (result.predicted_price && result.actual_price) {
            predictions.push({ price: result.predicted_price });
            actuals.push({ price: result.actual_price });
          }
        });
      } else if (predictionsData.predictions) {
        // Handle structured prediction results
        predictionsData.predictions.forEach((pred) => {
          predictions.push({ price: pred });
        });
        if (predictionsData.actuals) {
          predictionsData.actuals.forEach((act) => {
            actuals.push({ price: act });
          });
        }
      }

      // If no predictions from JSON, fall back to CSV comparison
      if (predictions.length === 0) {
        // Use CSV data for comparison
        const predColumns = Object.keys(predictionsData[0] || {});
        const priceColumn =
          predColumns.find((col) => col.toLowerCase().includes('price')) || 'price';

        predictionsData.forEach((row, index) => {
          const actualRow = actualData[index];
          if (actualRow && row[priceColumn] && actualRow[priceColumn]) {
            predictions.push({ price: parseFloat(row[priceColumn]) });
            actuals.push({ price: parseFloat(actualRow[priceColumn]) });
          }
        });
      }

      if (predictions.length === 0 || actuals.length === 0) {
        throw new Error('No valid prediction and actual price data found');
      }

      if (predictions.length !== actuals.length) {
        throw new Error('Predictions and actual values have different lengths');
      }

      const analysis = {
        totalSamples: predictions.length,
        dataSource: {
          predictionsFile: defaultPredictionsFile,
          actualFile: defaultActualFile,
          format: defaultPredictionsFile.endsWith('.json') ? 'JSON' : 'CSV',
        },
        mobilePriceAnalysis: {},
        performanceMetrics: {},
      };

      // Mobile price prediction analysis
      const predPrices = predictions.map((p) => p.price).filter((p) => !isNaN(p));
      const actualPrices = actuals.map((a) => a.price).filter((a) => !isNaN(a));

      if (predPrices.length > 0 && actualPrices.length > 0) {
        const errors = predPrices.map((pred, i) => Math.abs(pred - actualPrices[i]));
        const squaredErrors = predPrices.map((pred, i) => Math.pow(pred - actualPrices[i], 2));
        const percentageErrors = predPrices.map((pred, i) =>
          actualPrices[i] !== 0 ? Math.abs((pred - actualPrices[i]) / actualPrices[i]) * 100 : 0
        );

        analysis.mobilePriceAnalysis = {
          meanAbsoluteError: errors.reduce((a, b) => a + b, 0) / errors.length,
          meanSquaredError: squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length,
          rootMeanSquaredError: Math.sqrt(
            squaredErrors.reduce((a, b) => a + b, 0) / squaredErrors.length
          ),
          meanAbsolutePercentageError:
            percentageErrors.reduce((a, b) => a + b, 0) / percentageErrors.length,
          maxError: Math.max(...errors),
          minError: Math.min(...errors),
          priceRange: {
            predicted: {
              min: Math.min(...predPrices),
              max: Math.max(...predPrices),
              mean: predPrices.reduce((a, b) => a + b, 0) / predPrices.length,
            },
            actual: {
              min: Math.min(...actualPrices),
              max: Math.max(...actualPrices),
              mean: actualPrices.reduce((a, b) => a + b, 0) / actualPrices.length,
            },
          },
        };

        // Performance categories for mobile price ranges
        const budgetThreshold = 300; // Under $300
        const midRangeThreshold = 800; // $300-$800
        // Above $800 is premium

        const performanceByCategory = {
          budget: { predictions: [], actuals: [], errors: [] },
          midRange: { predictions: [], actuals: [], errors: [] },
          premium: { predictions: [], actuals: [], errors: [] },
        };

        predPrices.forEach((pred, i) => {
          const actual = actualPrices[i];
          const error = Math.abs(pred - actual);
          const category =
            actual < budgetThreshold
              ? 'budget'
              : actual < midRangeThreshold
                ? 'midRange'
                : 'premium';

          performanceByCategory[category].predictions.push(pred);
          performanceByCategory[category].actuals.push(actual);
          performanceByCategory[category].errors.push(error);
        });

        analysis.performanceMetrics = {};
        Object.keys(performanceByCategory).forEach((category) => {
          const cat = performanceByCategory[category];
          if (cat.errors.length > 0) {
            analysis.performanceMetrics[category] = {
              count: cat.errors.length,
              meanAbsoluteError: cat.errors.reduce((a, b) => a + b, 0) / cat.errors.length,
              accuracy: (cat.errors.filter((e) => e < 50).length / cat.errors.length) * 100, // Within $50
            };
          }
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: `Mobile Price Prediction Analysis:\n${JSON.stringify(analysis, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze predictions: ${error.message}`);
    }
  }

  async calculateMetrics(predictionsFile, actualFile) {
    try {
      // Default to actual project files
      const defaultPredictionsFile =
        predictionsFile || 'd:\\\\Nuxt Projects\\\\MatLab\\\\data\\\\price_prediction_results.json';
      const defaultActualFile =
        actualFile || 'd:\\\\Nuxt Projects\\\\MatLab\\\\data\\\\Mobiles Dataset (2025).csv';

      // Load prediction results
      let predictionsData;
      if (defaultPredictionsFile.endsWith('.json')) {
        predictionsData = await this.loadJsonData(defaultPredictionsFile);
      } else {
        predictionsData = await this.loadCsvData(defaultPredictionsFile);
      }

      const actualData = await this.loadCsvData(defaultActualFile);

      // Extract price predictions and actuals
      const predPrices = [];
      const actualPrices = [];

      if (Array.isArray(predictionsData)) {
        predictionsData.forEach((result) => {
          if (result.predicted_price !== undefined && result.actual_price !== undefined) {
            predPrices.push(result.predicted_price);
            actualPrices.push(result.actual_price);
          }
        });
      } else if (predictionsData.predictions && predictionsData.actuals) {
        predPrices.push(...predictionsData.predictions);
        actualPrices.push(...predictionsData.actuals);
      }

      // Fallback to CSV comparison if no structured data
      if (predPrices.length === 0) {
        const priceColumn = 'price';
        predictionsData.forEach((row, index) => {
          const actualRow = actualData[index];
          if (actualRow && row[priceColumn] && actualRow[priceColumn]) {
            predPrices.push(parseFloat(row[priceColumn]));
            actualPrices.push(parseFloat(actualRow[priceColumn]));
          }
        });
      }

      if (predPrices.length === 0 || actualPrices.length === 0) {
        throw new Error('No valid price prediction data found');
      }

      if (predPrices.length !== actualPrices.length) {
        throw new Error('Predictions and actual values have different lengths');
      }

      // Calculate comprehensive regression metrics for mobile price prediction
      const n = predPrices.length;
      const meanActual = actualPrices.reduce((a, b) => a + b, 0) / n;
      const meanPredicted = predPrices.reduce((a, b) => a + b, 0) / n;

      // R-squared calculation
      const ssRes = predPrices.reduce(
        (sum, pred, i) => sum + Math.pow(actualPrices[i] - pred, 2),
        0
      );
      const ssTot = actualPrices.reduce((sum, actual) => sum + Math.pow(actual - meanActual, 2), 0);
      const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

      // Error metrics
      const errors = predPrices.map((pred, i) => actualPrices[i] - pred);
      const absErrors = errors.map(Math.abs);
      const squaredErrors = errors.map((e) => e * e);

      const meanAbsoluteError = absErrors.reduce((a, b) => a + b, 0) / n;
      const meanSquaredError = squaredErrors.reduce((a, b) => a + b, 0) / n;
      const rootMeanSquaredError = Math.sqrt(meanSquaredError);

      // MAPE (Mean Absolute Percentage Error)
      const mape =
        (actualPrices.reduce((sum, actual, i) => {
          return sum + (actual !== 0 ? Math.abs((actual - predPrices[i]) / actual) : 0);
        }, 0) /
          n) *
        100;

      // Additional mobile-specific metrics
      const priceRanges = {
        budget: { min: 0, max: 300, predictions: [], actuals: [] },
        midRange: { min: 300, max: 800, predictions: [], actuals: [] },
        premium: { min: 800, max: Infinity, predictions: [], actuals: [] },
      };

      predPrices.forEach((pred, i) => {
        const actual = actualPrices[i];
        const category = actual < 300 ? 'budget' : actual < 800 ? 'midRange' : 'premium';
        priceRanges[category].predictions.push(pred);
        priceRanges[category].actuals.push(actual);
      });

      const rangeMetrics = {};
      Object.keys(priceRanges).forEach((range) => {
        const rangeData = priceRanges[range];
        if (rangeData.predictions.length > 0) {
          const rangeErrors = rangeData.predictions.map((pred, i) =>
            Math.abs(pred - rangeData.actuals[i])
          );
          rangeMetrics[range] = {
            count: rangeData.predictions.length,
            meanAbsoluteError: rangeErrors.reduce((a, b) => a + b, 0) / rangeErrors.length,
            accuracy: (rangeErrors.filter((e) => e < 50).length / rangeErrors.length) * 100,
          };
        }
      });

      const metrics = {
        overall: {
          rSquared: rSquared.toFixed(4),
          meanAbsoluteError: meanAbsoluteError.toFixed(2),
          meanSquaredError: meanSquaredError.toFixed(2),
          rootMeanSquaredError: rootMeanSquaredError.toFixed(2),
          meanAbsolutePercentageError: `${mape.toFixed(2)}%`,
          sampleSize: n,
          dataSource: {
            predictions: defaultPredictionsFile,
            actuals: defaultActualFile,
          },
        },
        priceRangePerformance: rangeMetrics,
        summary: {
          bestPerformingRange: Object.keys(rangeMetrics).reduce((best, current) =>
            rangeMetrics[current].accuracy > rangeMetrics[best].accuracy ? current : best
          ),
          averageAccuracy:
            Object.values(rangeMetrics).reduce((sum, range) => sum + range.accuracy, 0) /
            Object.keys(rangeMetrics).length,
        },
      };

      return {
        content: [
          {
            type: 'text',
            text: `Mobile Price Prediction Metrics:\n${JSON.stringify(metrics, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to calculate metrics: ${error.message}`);
    }
  }

  async generatePerformanceReport(predictionsFile, actualFile) {
    try {
      const [analysis, metrics] = await Promise.all([
        this.analyzePredictions(predictionsFile, actualFile),
        this.calculateMetrics(predictionsFile, actualFile),
      ]);

      // Parse the results
      const analysisData = JSON.parse(analysis.content[0].text.split('\n').slice(1).join('\n'));
      const metricsData = JSON.parse(metrics.content[0].text.split('\n').slice(1).join('\n'));

      const report = {
        reportTitle: 'Mobile Price Prediction Model Performance Report',
        generatedAt: new Date().toISOString(),
        project: 'MATLAB + Nuxt.js Mobile Dataset Analysis',
        dataSources: {
          predictionsFile:
            predictionsFile ||
            'd:\\\\Nuxt Projects\\\\MatLab\\\\data\\\\price_prediction_results.json',
          actualFile:
            actualFile || 'd:\\\\Nuxt Projects\\\\MatLab\\\\data\\\\Mobiles Dataset (2025).csv',
        },
        executiveSummary: {
          modelType: 'Mobile Price Prediction (Regression)',
          overallAccuracy: metricsData.summary?.averageAccuracy || 'N/A',
          bestPerformingCategory: metricsData.summary?.bestPerformingRange || 'N/A',
          keyMetrics: {
            rSquared: metricsData.overall?.rSquared || 'N/A',
            meanAbsoluteError: metricsData.overall?.meanAbsoluteError || 'N/A',
            meanAbsolutePercentageError: metricsData.overall?.meanAbsolutePercentageError || 'N/A',
          },
        },
        detailedAnalysis: {
          analysis: analysisData,
          metrics: metricsData,
        },
        recommendations: this.generateMobilePriceRecommendations(metricsData),
        modelInsights: {
          priceRangePerformance: metricsData.priceRangePerformance,
          dataQuality: analysisData.dataSource,
          sampleSize: metricsData.overall?.sampleSize || 'N/A',
        },
      };

      return {
        content: [
          {
            type: 'text',
            text: `Mobile Price Prediction Performance Report:\n${JSON.stringify(report, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to generate performance report: ${error.message}`);
    }
  }

  generateMobilePriceRecommendations(metrics) {
    const recommendations = [];

    // Overall model performance assessment
    const rSquared = parseFloat(metrics.overall?.rSquared || 0);
    const mae = parseFloat(metrics.overall?.meanAbsoluteError || 0);
    const mape = parseFloat(metrics.overall?.meanAbsolutePercentageError || 0);

    if (rSquared < 0.5) {
      recommendations.push(
        'CRITICAL: Model performance is poor (R² < 0.5). Consider retraining with enhanced features or different algorithms.'
      );
    } else if (rSquared < 0.8) {
      recommendations.push(
        'WARNING: Model performance is moderate (R² < 0.8). Consider feature engineering or hyperparameter tuning.'
      );
    } else {
      recommendations.push(
        'GOOD: Model performance is strong (R² ≥ 0.8). Continue monitoring for drift.'
      );
    }

    // Price range specific recommendations
    if (metrics.priceRangePerformance) {
      const budgetPerf = metrics.priceRangePerformance.budget;
      const premiumPerf = metrics.priceRangePerformance.premium;

      if (budgetPerf && premiumPerf) {
        if (budgetPerf.accuracy < premiumPerf.accuracy) {
          recommendations.push(
            'Budget phone predictions are less accurate than premium phones. Consider adding budget-specific features or separate models.'
          );
        }
        if (premiumPerf.accuracy < 70) {
          recommendations.push(
            'Premium phone predictions need improvement. Consider adding brand value or premium feature indicators.'
          );
        }
      }
    }

    // Error analysis recommendations
    if (mae > 100) {
      recommendations.push(
        'High mean absolute error (>$100). Consider outlier removal or robust regression techniques.'
      );
    }

    if (mape > 30) {
      recommendations.push(
        'High percentage error (>30% MAPE). Predictions may be unreliable for pricing decisions.'
      );
    }

    // Data quality recommendations
    if (metrics.overall?.sampleSize < 100) {
      recommendations.push(
        'Small sample size detected. Consider collecting more training data for better model generalization.'
      );
    }

    // Model improvement suggestions
    recommendations.push(
      'Consider using enhanced features: ram_to_price ratios, brand segments, and temporal features.'
    );
    recommendations.push(
      'Evaluate ensemble methods (stacking) combining scikit-learn and TensorFlow models.'
    );
    recommendations.push(
      'Implement cross-validation and monitor for concept drift in mobile phone pricing.'
    );

    return recommendations;
  }

  async compareModels(modelResults) {
    try {
      const comparisons = [];

      for (const model of modelResults) {
        const metrics = await this.calculateMetrics(model.predictionsFile, model.actualFile);
        const metricsData = JSON.parse(metrics.content[0].text.split('\n').slice(1).join('\n'));

        comparisons.push({
          modelName: model.name,
          metrics: metricsData,
        });
      }

      // Generate comparison summary
      const summary = this.generateModelComparison(comparisons);

      return {
        content: [
          {
            type: 'text',
            text: `Model Comparison Results:\n${JSON.stringify({ comparisons, summary }, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to compare models: ${error.message}`);
    }
  }

  generateModelComparison(comparisons) {
    const summary = {
      bestModels: {},
      ranking: [],
    };

    // Compare each metric across models
    const metrics = ['rSquared', 'rootMeanSquaredError', 'meanAbsolutePercentageError'];

    metrics.forEach((metric) => {
      const scores = comparisons.map((comp) => ({
        model: comp.modelName,
        score: parseFloat(Object.values(comp.metrics)[0][metric]),
      }));

      if (metric === 'rSquared') {
        // Higher is better
        scores.sort((a, b) => b.score - a.score);
        summary.bestModels[metric] = scores[0];
      } else {
        // Lower is better
        scores.sort((a, b) => a.score - b.score);
        summary.bestModels[metric] = scores[0];
      }

      summary.ranking.push({
        metric,
        ranking: scores,
      });
    });

    return summary;
  }

  async analyzePredictionErrors(predictionsFile, actualFile) {
    try {
      const [predictions, actual] = await Promise.all([
        this.loadCsvData(predictionsFile),
        this.loadCsvData(actualFile),
      ]);

      const errorAnalysis = {
        errorDistribution: {},
        largeErrors: [],
        systematicBias: {},
      };

      const predColumns = Object.keys(predictions[0] || {});

      predColumns.forEach((column) => {
        const predValues = predictions
          .map((row) => parseFloat(row[column]))
          .filter((val) => !isNaN(val));
        const actualValues = actual
          .map((row) => parseFloat(row[column]))
          .filter((val) => !isNaN(val));

        if (predValues.length > 0 && actualValues.length > 0) {
          const errors = predValues.map((pred, i) => ({
            error: pred - actualValues[i],
            predicted: pred,
            actual: actualValues[i],
            index: i,
          }));

          // Error distribution
          const errorRanges = {
            large_negative: errors.filter((e) => e.error < -1).length,
            negative: errors.filter((e) => e.error >= -1 && e.error < 0).length,
            small: errors.filter((e) => e.error >= -0.1 && e.error <= 0.1).length,
            positive: errors.filter((e) => e.error > 0 && e.error <= 1).length,
            large_positive: errors.filter((e) => e.error > 1).length,
          };

          errorAnalysis.errorDistribution[column] = errorRanges;

          // Large errors (top 5%)
          const sortedErrors = errors.sort((a, b) => Math.abs(b.error) - Math.abs(a.error));
          const topErrors = sortedErrors.slice(0, Math.ceil(errors.length * 0.05));

          errorAnalysis.largeErrors.push({
            column,
            errors: topErrors.map((e) => ({
              index: e.index,
              predicted: e.predicted,
              actual: e.actual,
              error: e.error,
            })),
          });

          // Systematic bias
          const meanError = errors.reduce((sum, e) => sum + e.error, 0) / errors.length;
          const errorStd = Math.sqrt(
            errors.reduce((sum, e) => sum + Math.pow(e.error - meanError, 2), 0) / errors.length
          );

          errorAnalysis.systematicBias[column] = {
            meanError: meanError.toFixed(4),
            errorStd: errorStd.toFixed(4),
            biasDirection: meanError > 0 ? 'overestimating' : 'underestimating',
          };
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Prediction Error Analysis:\n${JSON.stringify(errorAnalysis, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze prediction errors: ${error.message}`);
    }
  }

  async visualizePredictions(predictionsFile, actualFile) {
    try {
      const predictions = await this.loadCsvData(predictionsFile);
      let actual = null;

      if (actualFile) {
        actual = await this.loadCsvData(actualFile);
      }

      const visualization = {
        scatterPlots: [],
        histograms: [],
        timeSeries: [],
      };

      const predColumns = Object.keys(predictions[0] || {});

      predColumns.forEach((column) => {
        const predValues = predictions
          .map((row) => ({
            value: parseFloat(row[column]),
            index: predictions.indexOf(row),
          }))
          .filter((item) => !isNaN(item.value));

        if (predValues.length > 0) {
          // Histogram data
          const histogram = this.generateHistogram(
            predValues.map((item) => item.value),
            20
          );
          visualization.histograms.push({
            column,
            data: histogram,
          });

          // Scatter plot data (if actual values available)
          if (actual) {
            const actualValues = actual
              .map((row) => parseFloat(row[column]))
              .filter((val) => !isNaN(val));
            if (actualValues.length === predValues.length) {
              const scatterData = predValues.map((pred, i) => ({
                predicted: pred.value,
                actual: actualValues[i],
                index: pred.index,
              }));

              visualization.scatterPlots.push({
                column,
                data: scatterData,
              });
            }
          }

          // Time series (if index can be used as time)
          visualization.timeSeries.push({
            column,
            data: predValues.map((item) => ({
              time: item.index,
              value: item.value,
            })),
          });
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Prediction Visualization Data:\n${JSON.stringify(visualization, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to visualize predictions: ${error.message}`);
    }
  }

  generateHistogram(values, bins) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;

    const histogram = [];
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth;
      const binEnd = min + (i + 1) * binWidth;
      const count = values.filter((value) => value >= binStart && value < binEnd).length;

      histogram.push({
        binStart: binStart.toFixed(2),
        binEnd: binEnd.toFixed(2),
        count,
      });
    }

    return histogram;
  }

  async calculateConfusionMatrix(predictionsFile, actualFile) {
    try {
      const [predictions, actual] = await Promise.all([
        this.loadCsvData(predictionsFile),
        this.loadCsvData(actualFile),
      ]);

      if (predictions.length !== actual.length) {
        throw new Error('Predictions and actual values have different lengths');
      }

      const confusionMatrices = {};
      const predColumns = Object.keys(predictions[0] || {});

      predColumns.forEach((column) => {
        // For classification, we need discrete classes
        // This assumes the predictions are class labels or can be discretized
        const predValues = predictions.map((row) => row[column]);
        const actualValues = actual.map((row) => row[column]);

        // Get unique classes
        const classes = [...new Set([...predValues, ...actualValues])].sort();

        // Initialize confusion matrix
        const matrix = {};
        classes.forEach((actualClass) => {
          matrix[actualClass] = {};
          classes.forEach((predClass) => {
            matrix[actualClass][predClass] = 0;
          });
        });

        // Fill confusion matrix
        predValues.forEach((pred, i) => {
          const actual = actualValues[i];
          if (matrix[actual] && matrix[actual][pred] !== undefined) {
            matrix[actual][pred]++;
          }
        });

        confusionMatrices[column] = {
          classes,
          matrix,
          summary: this.calculateConfusionSummary(matrix, classes),
        };
      });

      return {
        content: [
          {
            type: 'text',
            text: `Confusion Matrix Analysis:\n${JSON.stringify(confusionMatrices, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to calculate confusion matrix: ${error.message}`);
    }
  }

  calculateConfusionSummary(matrix, classes) {
    const summary = {
      accuracy: 0,
      precision: {},
      recall: {},
      f1Score: {},
    };

    let totalCorrect = 0;
    let totalSamples = 0;

    classes.forEach((cls) => {
      const truePositive = matrix[cls][cls];
      let falsePositive = 0;
      let falseNegative = 0;

      // Calculate false positives and false negatives
      classes.forEach((otherCls) => {
        if (otherCls !== cls) {
          falsePositive += matrix[otherCls][cls];
          falseNegative += matrix[cls][otherCls];
        }
      });

      totalCorrect += truePositive;
      totalSamples += truePositive + falsePositive + falseNegative;

      const precision = truePositive / (truePositive + falsePositive);
      const recall = truePositive / (truePositive + falseNegative);
      const f1 = (2 * (precision * recall)) / (precision + recall);

      summary.precision[cls] = isNaN(precision) ? 0 : precision.toFixed(4);
      summary.recall[cls] = isNaN(recall) ? 0 : recall.toFixed(4);
      summary.f1Score[cls] = isNaN(f1) ? 0 : f1.toFixed(4);
    });

    summary.accuracy = (totalCorrect / totalSamples).toFixed(4);

    return summary;
  }

  async analyzePredictionDistribution(predictionsFile) {
    try {
      const predictions = await this.loadCsvData(predictionsFile);

      const distribution = {
        summaryStats: {},
        distributions: {},
        outliers: {},
      };

      const predColumns = Object.keys(predictions[0] || {});

      predColumns.forEach((column) => {
        const values = predictions
          .map((row) => parseFloat(row[column]))
          .filter((val) => !isNaN(val));

        if (values.length > 0) {
          // Summary statistics
          const sorted = [...values].sort((a, b) => a - b);
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const median =
            sorted.length % 2 === 0
              ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
              : sorted[Math.floor(sorted.length / 2)];

          const variance =
            values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const stdDev = Math.sqrt(variance);

          distribution.summaryStats[column] = {
            count: values.length,
            mean: mean.toFixed(4),
            median: median.toFixed(4),
            stdDev: stdDev.toFixed(4),
            min: Math.min(...values).toFixed(4),
            max: Math.max(...values).toFixed(4),
            quartiles: this.calculateQuartiles(values),
          };

          // Distribution histogram
          distribution.distributions[column] = this.generateHistogram(values, 20);

          // Outlier detection (IQR method)
          const { q1, q3 } = this.calculateQuartiles(values);
          const iqr = q3 - q1;
          const lowerBound = q1 - 1.5 * iqr;
          const upperBound = q3 + 1.5 * iqr;

          const outliers = values.filter((val) => val < lowerBound || val > upperBound);
          distribution.outliers[column] = {
            count: outliers.length,
            percentage: `${((outliers.length / values.length) * 100).toFixed(2)}%`,
            bounds: { lower: lowerBound.toFixed(4), upper: upperBound.toFixed(4) },
            values: outliers.slice(0, 10), // First 10 outliers
          };
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Prediction Distribution Analysis:\n${JSON.stringify(distribution, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze prediction distribution: ${error.message}`);
    }
  }

  calculateQuartiles(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];

    return {
      q1: q1.toFixed(4),
      q3: q3.toFixed(4),
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Prediction Analysis MCP Server running...');
  }
}

// Run the server
const server = new PredictionAnalysisServer();
server.run().catch(console.error);
