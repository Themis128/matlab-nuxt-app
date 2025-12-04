#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ModelTrainingMonitorServer {
  constructor() {
    this.server = new Server(
      {
        name: 'model-training-monitor-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.trainingJobs = new Map(); // Track active training jobs
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Handle tool calls
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'check_training_status':
            return await this.checkTrainingStatus();

          case 'get_model_performance':
            return await this.getModelPerformance(args.modelType);

          case 'monitor_prediction_accuracy':
            return await this.monitorPredictionAccuracy();

          case 'get_training_metrics':
            return await this.getTrainingMetrics();

          case 'analyze_prediction_errors':
            return await this.analyzePredictionErrors();

          case 'list_available_models':
            return await this.listAvailableModels();

          case 'validate_model_health':
            return await this.validateModelHealth(args.modelType);

          case 'get_prediction_stats':
            return await this.getPredictionStats();

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
            name: 'check_training_status',
            description: 'Check if all required models have been trained',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_model_performance',
            description: 'Get performance metrics for a specific model type',
            inputSchema: {
              type: 'object',
              properties: {
                modelType: {
                  type: 'string',
                  enum: ['price', 'ram', 'battery', 'brand'],
                  description: 'Type of model to check',
                },
              },
              required: ['modelType'],
            },
          },
          {
            name: 'monitor_prediction_accuracy',
            description: 'Monitor real-world prediction accuracy from logs',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_training_metrics',
            description: 'Get comprehensive training metrics and results',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'analyze_prediction_errors',
            description: 'Analyze prediction errors and identify patterns',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_available_models',
            description: 'List all trained models and their status',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'validate_model_health',
            description: 'Validate that a model is healthy and ready for predictions',
            inputSchema: {
              type: 'object',
              properties: {
                modelType: {
                  type: 'string',
                  enum: ['price', 'ram', 'battery', 'brand'],
                  description: 'Type of model to validate',
                },
              },
              required: ['modelType'],
            },
          },
          {
            name: 'get_prediction_stats',
            description: 'Get prediction statistics and monitoring data',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });
  }

  async checkTrainingStatus() {
    try {
      // Use the actual training status check script from the project
      const { execSync } = await import('child_process');
      const result = execSync(
        'python "d:\\Nuxt Projects\\MatLab\\python_api\\check_training_status.py"',
        {
          encoding: 'utf8',
          timeout: 30000,
          cwd: 'd:\\Nuxt Projects\\MatLab\\python_api',
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: `Training Status Check Results:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to check training status: ${error.message}`);
    }
  }

  async monitorTrainingProgress(jobId) {
    try {
      const progressFile = path.join(process.cwd(), 'training_jobs', jobId, 'progress.log');

      const progressData = await fs.readFile(progressFile, 'utf8');
      const lines = progressData.split('\n').filter((line) => line.trim());

      // Get last 10 progress updates
      const recentProgress = lines.slice(-10);

      return {
        content: [
          {
            type: 'text',
            text: `Recent Training Progress for Job ${jobId}:\n${recentProgress.join('\n')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to monitor training progress: ${error.message}`);
    }
  }

  async readTrainingLogs(jobId, lines = 50) {
    try {
      const logFile = path.join(process.cwd(), 'training_jobs', jobId, 'training.log');

      const logData = await fs.readFile(logFile, 'utf8');
      const allLines = logData.split('\n').filter((line) => line.trim());

      // Get last N lines
      const recentLines = allLines.slice(-lines);

      return {
        content: [
          {
            type: 'text',
            text: `Last ${lines} Training Log Lines for Job ${jobId}:\n${recentLines.join('\n')}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read training logs: ${error.message}`);
    }
  }

  async getModelPerformance(modelType) {
    try {
      const modelDir = 'd:\\Nuxt Projects\\MatLab\\python_api\\trained_models';
      const metadataFile = path.join(modelDir, `${modelType}_predictor_metadata.json`);

      try {
        const metadataContent = await fs.readFile(metadataFile, 'utf8');
        const metadata = JSON.parse(metadataContent);

        return {
          content: [
            {
              type: 'text',
              text: `${modelType.toUpperCase()} Model Performance Metrics:\n${JSON.stringify(metadata, null, 2)}`,
            },
          ],
        };
      } catch (metadataError) {
        // Try to get basic model info
        const modelFile = path.join(modelDir, `${modelType}_predictor_sklearn.pkl`);
        try {
          await fs.access(modelFile);
          const stats = await fs.stat(modelFile);

          return {
            content: [
              {
                type: 'text',
                text: `${modelType.toUpperCase()} Model Info:\n- File: ${modelFile}\n- Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n- Modified: ${stats.mtime.toISOString()}\n- No detailed metadata available`,
              },
            ],
          };
        } catch (fileError) {
          return {
            content: [
              {
                type: 'text',
                text: `${modelType.toUpperCase()} model not found in trained_models directory`,
              },
            ],
          };
        }
      }
    } catch (error) {
      throw new Error(`Failed to get model performance: ${error.message}`);
    }
  }

  async evaluatePythonModel(modelPath) {
    // This would integrate with Python to load and evaluate the model
    // For now, return placeholder
    return `Python model evaluation not yet implemented for ${modelPath}`;
  }

  async evaluateMatlabModel(modelPath) {
    // This would integrate with MATLAB to load and evaluate the model
    // For now, return placeholder
    return `MATLAB model evaluation not yet implemented for ${modelPath}`;
  }

  async listTrainingJobs() {
    try {
      const jobsDir = path.join(process.cwd(), 'training_jobs');

      try {
        const jobDirs = await fs.readdir(jobsDir);
        const jobs = [];

        for (const jobId of jobDirs) {
          const jobPath = path.join(jobsDir, jobId);
          const stat = await fs.stat(jobPath);

          if (stat.isDirectory()) {
            const status = await this.checkTrainingStatus(jobId);
            jobs.push({
              jobId,
              status: status.content[0].text,
              path: jobPath,
            });
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: `Training Jobs:\n${jobs.map((job) => `- ${job.jobId}: ${job.status}`).join('\n')}`,
            },
          ],
        };
      } catch (dirError) {
        return {
          content: [
            {
              type: 'text',
              text: 'No training jobs directory found',
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(`Failed to list training jobs: ${error.message}`);
    }
  }

  async stopTrainingJob(jobId) {
    try {
      const stopFile = path.join(process.cwd(), 'training_jobs', jobId, 'stop.signal');

      await fs.writeFile(stopFile, 'STOP', 'utf8');

      return {
        content: [
          {
            type: 'text',
            text: `Stop signal sent to training job ${jobId}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to stop training job: ${error.message}`);
    }
  }

  async analyzeTrainingResults(jobId) {
    try {
      const resultsFile = path.join(process.cwd(), 'training_jobs', jobId, 'results.json');

      const resultsData = await fs.readFile(resultsFile, 'utf8');
      const results = JSON.parse(resultsData);

      // Generate analysis insights
      const analysis = this.generateTrainingAnalysis(results);

      return {
        content: [
          {
            type: 'text',
            text: `Training Results Analysis for Job ${jobId}:\n\n${analysis}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze training results: ${error.message}`);
    }
  }

  generateTrainingAnalysis(results) {
    // Generate insights based on training results
    let analysis = 'Training Analysis:\n';

    if (results.final_accuracy) {
      analysis += `Final Accuracy: ${results.final_accuracy.toFixed(4)}\n`;
      if (results.final_accuracy > 0.9) {
        analysis += '✓ Excellent performance!\n';
      } else if (results.final_accuracy > 0.8) {
        analysis += '✓ Good performance\n';
      } else {
        analysis += '⚠ Consider improving the model\n';
      }
    }

    if (results.training_time) {
      analysis += `Training Time: ${results.training_time} seconds\n`;
    }

    if (results.epochs) {
      analysis += `Epochs Completed: ${results.epochs}\n`;
    }

    if (results.best_epoch) {
      analysis += `Best Performance at Epoch: ${results.best_epoch}\n`;
    }

    return analysis;
  }

  async monitorPredictionAccuracy() {
    try {
      const { execSync } = await import('child_process');
      const result = execSync(
        'python "d:\\Nuxt Projects\\MatLab\\python_api\\monitor_predictions.py"',
        {
          encoding: 'utf8',
          timeout: 30000,
          cwd: 'd:\\Nuxt Projects\\MatLab\\python_api',
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: `Prediction Accuracy Monitoring Results:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to monitor prediction accuracy: ${error.message}`);
    }
  }

  async getTrainingMetrics() {
    try {
      const metricsDir = 'd:\\Nuxt Projects\\MatLab\\data';
      const metricsFiles = [
        'price_prediction_results.json',
        'segmentation_metrics.json',
        'ensemble_oof_predictions.csv',
      ];

      let results = 'Training Metrics Summary:\n\n';

      for (const file of metricsFiles) {
        const filePath = path.join(metricsDir, file);
        try {
          const content = await fs.readFile(filePath, 'utf8');
          if (file.endsWith('.json')) {
            const data = JSON.parse(content);
            results += `${file}:\n${JSON.stringify(data, null, 2)}\n\n`;
          } else {
            results += `${file}:\n${content.substring(0, 500)}...\n\n`;
          }
        } catch (e) {
          results += `${file}: Not found or error reading\n\n`;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: results,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get training metrics: ${error.message}`);
    }
  }

  async analyzePredictionErrors() {
    try {
      const errorLogPath = 'd:\\Nuxt Projects\\MatLab\\python_api\\monitoring\\error_log.csv';
      try {
        const content = await fs.readFile(errorLogPath, 'utf8');
        const lines = content.split('\n').slice(0, 20); // First 20 lines

        return {
          content: [
            {
              type: 'text',
              text: `Prediction Error Analysis (first 20 entries):\n${lines.join('\n')}`,
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: 'text',
              text: 'No prediction error logs found. Start making predictions to generate error tracking data.',
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(`Failed to analyze prediction errors: ${error.message}`);
    }
  }

  async listAvailableModels() {
    try {
      const modelDir = 'd:\\Nuxt Projects\\MatLab\\python_api\\trained_models';
      const files = await fs.readdir(modelDir);

      const modelGroups = {};
      const modelTypes = ['price', 'ram', 'battery', 'brand'];

      for (const modelType of modelTypes) {
        const typeFiles = files.filter(
          (f) => f.includes(modelType) && (f.endsWith('.pkl') || f.endsWith('.json'))
        );
        if (typeFiles.length > 0) {
          modelGroups[modelType] = typeFiles;
        }
      }

      let results = 'Available Trained Models:\n\n';
      for (const [type, files] of Object.entries(modelGroups)) {
        results += `${type.toUpperCase()} Models:\n`;
        for (const file of files) {
          const filePath = path.join(modelDir, file);
          const stats = await fs.stat(filePath);
          results += `  - ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB, ${stats.mtime.toISOString().split('T')[0]})\n`;
        }
        results += '\n';
      }

      return {
        content: [
          {
            type: 'text',
            text: results,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list available models: ${error.message}`);
    }
  }

  async validateModelHealth(modelType) {
    try {
      const modelDir = 'd:\\Nuxt Projects\\MatLab\\python_api\\trained_models';
      const modelFile = path.join(modelDir, `${modelType}_predictor_sklearn.pkl`);
      const scalerFile = path.join(modelDir, `${modelType}_predictor_scalers.pkl`);
      const metadataFile = path.join(modelDir, `${modelType}_predictor_metadata.json`);

      let healthStatus = `${modelType.toUpperCase()} Model Health Check:\n\n`;

      // Check model file
      try {
        await fs.access(modelFile);
        const stats = await fs.stat(modelFile);
        healthStatus += `✓ Model file exists: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`;
      } catch (e) {
        healthStatus += `✗ Model file missing: ${modelFile}\n`;
      }

      // Check scaler file
      try {
        await fs.access(scalerFile);
        healthStatus += '✓ Scaler file exists\n';
      } catch (e) {
        healthStatus += `✗ Scaler file missing: ${scalerFile}\n`;
      }

      // Check metadata file
      try {
        const metadata = JSON.parse(await fs.readFile(metadataFile, 'utf8'));
        healthStatus += '✓ Metadata file exists\n';
        if (metadata.accuracy) {
          healthStatus += `  - Accuracy: ${metadata.accuracy}\n`;
        }
      } catch (e) {
        healthStatus += `✗ Metadata file missing or invalid: ${metadataFile}\n`;
      }

      return {
        content: [
          {
            type: 'text',
            text: healthStatus,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to validate model health: ${error.message}`);
    }
  }

  async getPredictionStats() {
    try {
      const statsDir = 'd:\\Nuxt Projects\\MatLab\\python_api\\monitoring';
      const statsFile = path.join(statsDir, 'prediction_stats.json');
      const logFile = path.join(statsDir, 'prediction_log.jsonl');

      let results = 'Prediction Statistics:\n\n';

      // Try to read stats file
      try {
        const stats = JSON.parse(await fs.readFile(statsFile, 'utf8'));
        results += `Overall Statistics:\n${JSON.stringify(stats, null, 2)}\n\n`;
      } catch (e) {
        results += 'No overall statistics file found.\n\n';
      }

      // Count log entries
      try {
        const logContent = await fs.readFile(logFile, 'utf8');
        const entryCount = logContent.split('\n').filter((line) => line.trim()).length;
        results += `Total Predictions Logged: ${entryCount}\n\n`;

        // Show recent predictions
        const lines = logContent
          .split('\n')
          .filter((line) => line.trim())
          .slice(-5);
        results += 'Recent Predictions:\n';
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            results += `  ${entry.timestamp.split('T')[0]} ${entry.type}: ${entry.predicted}`;
            if (entry.actual) {
              results += ` (actual: ${entry.actual}, error: ${entry.error || 'N/A'})`;
            }
            results += '\n';
          } catch (e) {
            // Skip malformed lines
          }
        }
      } catch (e) {
        results += 'No prediction logs found.\n';
      }

      return {
        content: [
          {
            type: 'text',
            text: results,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get prediction stats: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Model Training Monitor MCP Server running...');
  }
}

// Run the server
const server = new ModelTrainingMonitorServer();
server.run().catch(console.error);
