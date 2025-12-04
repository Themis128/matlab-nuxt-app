#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

class MatlabIntegrationServer {
  constructor() {
    this.server = new Server(
      {
        name: 'matlab-integration-server',
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
    // Check MATLAB status
    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'check_matlab_status':
            return await this.checkMatlabStatus();

          case 'run_mobile_dataset_analysis':
            return await this.runMobileDatasetAnalysis();

          case 'train_price_prediction_model':
            return await this.trainPricePredictionModel();

          case 'predict_phone_price':
            return await this.predictPhonePrice(args.ram, args.battery, args.screen, args.company);

          case 'analyze_market_segments':
            return await this.analyzeMarketSegments();

          case 'extract_dataset_insights':
            return await this.extractDatasetInsights();

          case 'run_model_comparison':
            return await this.runModelComparison();

          case 'validate_matlab_syntax':
            return await this.validateMatlabSyntax(args.filePath);

          case 'list_available_models':
            return await this.listAvailableModels();

          case 'get_training_status':
            return await this.getTrainingStatus();

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
            name: 'check_matlab_status',
            description: 'Check if MATLAB is installed and accessible',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'run_mobile_dataset_analysis',
            description: 'Run comprehensive analysis on the mobile phones dataset',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'train_price_prediction_model',
            description: 'Train the price prediction model using enhanced features',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'predict_phone_price',
            description: 'Predict phone price based on specifications',
            inputSchema: {
              type: 'object',
              properties: {
                ram: { type: 'number', description: 'RAM in GB' },
                battery: { type: 'number', description: 'Battery capacity in mAh' },
                screen: { type: 'number', description: 'Screen size in inches' },
                company: { type: 'string', description: 'Phone manufacturer' },
              },
              required: ['ram', 'battery', 'screen', 'company'],
            },
          },
          {
            name: 'analyze_market_segments',
            description: 'Analyze market segments and pricing strategies',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'extract_dataset_insights',
            description: 'Extract comprehensive insights from the mobile dataset',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'run_model_comparison',
            description: 'Compare performance of different trained models',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_available_models',
            description: 'List all available trained models and their metadata',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_training_status',
            description: 'Get current training status and progress',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'validate_matlab_syntax',
            description: 'Validate MATLAB script syntax',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to MATLAB file to validate',
                },
              },
              required: ['filePath'],
            },
          },
        ],
      };
    });
  }

  async checkMatlabStatus() {
    try {
      // Try to run MATLAB version check
      const result = execSync('matlab -batch "disp(version)"', {
        encoding: 'utf8',
        timeout: 10000,
      });

      return {
        content: [
          {
            type: 'text',
            text: `MATLAB Status: Available\nVersion: ${result.trim()}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `MATLAB Status: Not available or not in PATH\nError: ${error.message}`,
          },
        ],
      };
    }
  }

  async runMobileDatasetAnalysis() {
    try {
      const scriptPath = path.resolve(
        'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\analyze_mobiles_dataset.m'
      );

      const result = execSync(
        `matlab -batch "run('${scriptPath.replace(/\\/g, '/')}'); disp('Analysis Complete') "`,
        {
          encoding: 'utf8',
          timeout: 60000, // 60 second timeout for analysis
          cwd: 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs',
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: `Mobile Dataset Analysis Results:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to run mobile dataset analysis: ${error.message}`);
    }
  }

  async trainPricePredictionModel() {
    try {
      const scriptPath = path.resolve(
        'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\train_models_with_enhanced_features.m'
      );

      const result = execSync(
        `matlab -batch "run('${scriptPath.replace(/\\/g, '/')}'); disp('Training Complete') "`,
        {
          encoding: 'utf8',
          timeout: 300000, // 5 minute timeout for training
          cwd: 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs',
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: `Price Prediction Model Training Results:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to train price prediction model: ${error.message}`);
    }
  }

  async predictPhonePrice(ram, battery, screen, company) {
    try {
      const scriptPath = path.resolve(
        'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\predict_price.m'
      );

      const command = `
        ram_val = ${ram};
        battery_val = ${battery};
        screen_val = ${screen};
        company_val = '${company}';
        run('${scriptPath.replace(/\\/g, '/')}');
        fprintf('Predicted Price: $%.2f\\n', predicted_price);
      `;

      const result = execSync(`matlab -batch "${command}"`, {
        encoding: 'utf8',
        timeout: 30000,
        cwd: 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Phone Price Prediction Results:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to predict phone price: ${error.message}`);
    }
  }

  async analyzeMarketSegments() {
    try {
      const scriptPath = path.resolve(
        'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\analyze_market_segments.m'
      );

      const result = execSync(
        `matlab -batch "run('${scriptPath.replace(/\\/g, '/')}'); disp('Market Analysis Complete') "`,
        {
          encoding: 'utf8',
          timeout: 45000,
          cwd: 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs',
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: `Market Segment Analysis Results:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze market segments: ${error.message}`);
    }
  }

  async extractDatasetInsights() {
    try {
      const scriptPath = path.resolve(
        'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\extract_all_insights.m'
      );

      const result = execSync(
        `matlab -batch "run('${scriptPath.replace(/\\/g, '/')}'); disp('Insights Extraction Complete') "`,
        {
          encoding: 'utf8',
          timeout: 60000,
          cwd: 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs',
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: `Dataset Insights Extraction Results:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to extract dataset insights: ${error.message}`);
    }
  }

  async runModelComparison() {
    try {
      const scriptPath = path.resolve(
        'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\VIEW_RESULTS.m'
      );

      const result = execSync(
        `matlab -batch "run('${scriptPath.replace(/\\/g, '/')}'); disp('Model Comparison Complete') "`,
        {
          encoding: 'utf8',
          timeout: 30000,
          cwd: 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs',
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: `Model Comparison Results:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to run model comparison: ${error.message}`);
    }
  }

  async listAvailableModels() {
    try {
      // Check for trained models in the MATLAB workspace
      const command = `
        model_files = dir('*.mat');
        if isempty(model_files)
            disp('No trained models found in current directory');
        else
            fprintf('Available trained models:\\n');
            for i = 1:length(model_files)
                fprintf('- %s (%.2f MB)\\n', model_files(i).name, model_files(i).bytes/1024/1024);
            end
        end
      `;

      const result = execSync(`matlab -batch "${command}"`, {
        encoding: 'utf8',
        timeout: 15000,
        cwd: 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs',
      });

      return {
        content: [
          {
            type: 'text',
            text: `Available MATLAB Models:\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list available models: ${error.message}`);
    }
  }

  async getTrainingStatus() {
    try {
      const statusPath = path.resolve(
        'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\TRAINING_STATUS.md'
      );

      let status = 'No training status file found';
      try {
        status = await fs.readFile(statusPath, 'utf8');
      } catch (e) {
        // File doesn't exist, check if training is currently running
        const command = `
          if exist('training_progress.mat', 'file')
              load('training_progress.mat');
              if exist('progress', 'var')
                  fprintf('Training Progress: %.1f%%\\n', progress * 100);
              else
                  disp('Training status: Unknown');
              end
          else
              disp('No active training session found');
          end
        `;

        const result = execSync(`matlab -batch "${command}"`, {
          encoding: 'utf8',
          timeout: 10000,
          cwd: 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs',
        });
        status = result;
      }

      return {
        content: [
          {
            type: 'text',
            text: `Training Status:\n${status}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get training status: ${error.message}`);
    }
  }

  async validateMatlabSyntax(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      await fs.access(absolutePath);

      // Use MATLAB's syntax checker
      const result = execSync(
        `matlab -batch "pcode('${absolutePath.replace(/\\/g, '/')}'); disp('Syntax OK') "`,
        {
          encoding: 'utf8',
          timeout: 10000,
        }
      );

      return {
        content: [
          {
            type: 'text',
            text: `MATLAB Syntax Validation for ${filePath}:\n${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `MATLAB Syntax Error in ${filePath}:\n${error.message}`,
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('MATLAB Integration MCP Server running...');
  }
}

// Run the server
const server = new MatlabIntegrationServer();
server.run().catch(console.error);
