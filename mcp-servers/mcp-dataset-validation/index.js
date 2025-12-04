#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { promises as fs } from 'fs';
import path from 'path';
import Papa from 'papaparse';

class DatasetValidationServer {
  constructor() {
    this.server = new Server(
      {
        name: 'dataset-validation-server',
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
          case 'validate_csv_dataset':
            return await this.validateCsvDataset(args.filePath);

          case 'check_data_quality':
            return await this.checkDataQuality(args.filePath);

          case 'analyze_missing_values':
            return await this.analyzeMissingValues(args.filePath);

          case 'analyze_data_distribution':
            return await this.analyzeDataDistribution(args.filePath, args.column);

          case 'validate_data_types':
            return await this.validateDataTypes(args.filePath);

          case 'check_dataset_statistics':
            return await this.checkDatasetStatistics(args.filePath);

          case 'detect_data_anomalies':
            return await this.detectDataAnomalies(args.filePath);

          case 'generate_data_report':
            return await this.generateDataReport(args.filePath);

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
            name: 'validate_csv_dataset',
            description: 'Validate CSV dataset structure and basic integrity',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the CSV dataset file',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'check_data_quality',
            description: 'Perform comprehensive data quality checks',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the dataset file',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'analyze_missing_values',
            description: 'Analyze missing values in the dataset',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the dataset file',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'analyze_data_distribution',
            description: 'Analyze distribution of a specific column',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the dataset file',
                },
                column: {
                  type: 'string',
                  description: 'Column name to analyze',
                },
              },
              required: ['filePath', 'column'],
            },
          },
          {
            name: 'validate_data_types',
            description: 'Validate and suggest data types for columns',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the dataset file',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'check_dataset_statistics',
            description: 'Generate basic statistics for the dataset',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the dataset file',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'detect_data_anomalies',
            description: 'Detect potential anomalies in the data',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the dataset file',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'generate_data_report',
            description: 'Generate a comprehensive data quality report',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the dataset file',
                },
              },
              required: ['filePath'],
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

  async validateCsvDataset(
    filePath = 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\Mobiles Dataset (2025).csv'
  ) {
    try {
      const data = await this.loadCsvData(filePath);

      const validation = {
        totalRows: data.length,
        columns: Object.keys(data[0] || {}),
        columnCount: Object.keys(data[0] || {}).length,
        issues: [],
      };

      // Check for empty dataset
      if (data.length === 0) {
        validation.issues.push('Dataset is empty');
      }

      // Check for inconsistent column counts
      const expectedColumns = validation.columnCount;
      for (let i = 0; i < data.length; i++) {
        const rowColumns = Object.keys(data[i]).length;
        if (rowColumns !== expectedColumns) {
          validation.issues.push(
            `Row ${i + 1} has ${rowColumns} columns, expected ${expectedColumns}`
          );
        }
      }

      // Check for completely empty rows
      const emptyRows = data.filter((row) =>
        Object.values(row).every((value) => !value || value.toString().trim() === '')
      ).length;

      if (emptyRows > 0) {
        validation.issues.push(`${emptyRows} completely empty rows found`);
      }

      // Mobile dataset specific validations
      if (filePath.includes('Mobiles Dataset')) {
        const requiredColumns = [
          'Company Name',
          'Model Name',
          'RAM',
          'Battery Capacity',
          'Screen Size',
          'Launched Price (USA)',
        ];
        const missingColumns = requiredColumns.filter((col) => !validation.columns.includes(col));
        if (missingColumns.length > 0) {
          validation.issues.push(
            `Missing required columns for mobile dataset: ${missingColumns.join(', ')}`
          );
        }

        // Check for valid price formats
        const priceColumn = 'Launched Price (USA)';
        if (validation.columns.includes(priceColumn)) {
          const invalidPrices = data.filter((row) => {
            const price = row[priceColumn];
            return price && !/^USD \d+(\.\d+)?$/.test(price.toString().trim());
          }).length;
          if (invalidPrices > 0) {
            validation.issues.push(
              `${invalidPrices} rows have invalid price format in '${priceColumn}'`
            );
          }
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `CSV Dataset Validation for ${filePath}:\n${JSON.stringify(validation, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to validate CSV dataset: ${error.message}`);
    }
  }

  async checkDataQuality(
    filePath = 'd:\\Nuxt Projects\\MatLab\\mobiles-dataset-docs\\Mobiles Dataset (2025).csv'
  ) {
    try {
      const data = await this.loadCsvData(filePath);

      const qualityReport = {
        totalRows: data.length,
        totalColumns: Object.keys(data[0] || {}).length,
        completeness: {},
        uniqueness: {},
        consistency: {},
        mobileSpecificChecks: {},
        issues: [],
      };

      const columns = Object.keys(data[0] || {});

      // Check completeness (missing values)
      columns.forEach((column) => {
        const values = data.map((row) => row[column]);
        const missingCount = values.filter(
          (value) => !value || value.toString().trim() === ''
        ).length;
        const completeness = ((data.length - missingCount) / data.length) * 100;

        qualityReport.completeness[column] = {
          missingCount,
          completenessPercentage: completeness.toFixed(2),
        };

        if (completeness < 80) {
          qualityReport.issues.push(
            `Column '${column}' has low completeness: ${completeness.toFixed(2)}%`
          );
        }
      });

      // Check uniqueness
      columns.forEach((column) => {
        const values = data
          .map((row) => row[column])
          .filter((value) => value && value.toString().trim() !== '');
        const uniqueValues = new Set(values);
        const uniqueness = (uniqueValues.size / values.length) * 100;

        qualityReport.uniqueness[column] = {
          uniqueCount: uniqueValues.size,
          totalValues: values.length,
          uniquenessPercentage: uniqueness.toFixed(2),
        };
      });

      // Mobile dataset specific checks
      if (filePath.includes('Mobiles Dataset')) {
        // Check RAM values are valid
        const ramValues = data.map((row) => row.RAM).filter((v) => v);
        const invalidRam = ramValues.filter((ram) => !/^\d+GB$/.test(ram.toString().trim())).length;
        qualityReport.mobileSpecificChecks.ramFormat = {
          valid: ramValues.length - invalidRam,
          invalid: invalidRam,
          total: ramValues.length,
        };
        if (invalidRam > 0) {
          qualityReport.issues.push(
            `${invalidRam} RAM values have invalid format (should be like "6GB")`
          );
        }

        // Check battery capacity format
        const batteryValues = data.map((row) => row['Battery Capacity']).filter((v) => v);
        const invalidBattery = batteryValues.filter(
          (batt) => !/^\d+mAh$/.test(batt.toString().trim())
        ).length;
        qualityReport.mobileSpecificChecks.batteryFormat = {
          valid: batteryValues.length - invalidBattery,
          invalid: invalidBattery,
          total: batteryValues.length,
        };
        if (invalidBattery > 0) {
          qualityReport.issues.push(
            `${invalidBattery} battery values have invalid format (should be like "3600mAh")`
          );
        }

        // Check for duplicate model names within same company
        const modelCompanyPairs = data
          .map((row) => `${row['Company Name']}-${row['Model Name']}`)
          .filter((v) => v);
        const uniquePairs = new Set(modelCompanyPairs);
        const duplicates = modelCompanyPairs.length - uniquePairs.size;
        qualityReport.mobileSpecificChecks.duplicateModels = {
          totalModels: modelCompanyPairs.length,
          uniqueModels: uniquePairs.size,
          duplicates,
        };
        if (duplicates > 0) {
          qualityReport.issues.push(`${duplicates} duplicate company-model combinations found`);
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Data Quality Report for ${filePath}:\n${JSON.stringify(qualityReport, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to check data quality: ${error.message}`);
    }
  }

  async analyzeMissingValues(filePath) {
    try {
      const data = await this.loadCsvData(filePath);
      const columns = Object.keys(data[0] || {});

      const missingAnalysis = {
        totalRows: data.length,
        missingByColumn: {},
        missingByRow: {},
        patterns: [],
      };

      // Analyze missing values by column
      columns.forEach((column) => {
        const missingIndices = [];
        let missingCount = 0;

        data.forEach((row, index) => {
          if (!row[column] || row[column].toString().trim() === '') {
            missingIndices.push(index);
            missingCount++;
          }
        });

        missingAnalysis.missingByColumn[column] = {
          count: missingCount,
          percentage: ((missingCount / data.length) * 100).toFixed(2),
          indices: missingIndices.slice(0, 10), // First 10 indices
        };
      });

      // Analyze missing values by row
      data.forEach((row, index) => {
        const missingColumns = columns.filter(
          (col) => !row[col] || row[col].toString().trim() === ''
        );
        if (missingColumns.length > 0) {
          missingAnalysis.missingByRow[index] = {
            missingColumns,
            count: missingColumns.length,
          };
        }
      });

      // Detect patterns
      const columnsWithMissing = Object.entries(missingAnalysis.missingByColumn)
        .filter(([, stats]) => stats.count > 0)
        .map(([col]) => col);

      if (columnsWithMissing.length > 1) {
        missingAnalysis.patterns.push(`${columnsWithMissing.length} columns have missing values`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Missing Values Analysis for ${filePath}:\n${JSON.stringify(missingAnalysis, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze missing values: ${error.message}`);
    }
  }

  async analyzeDataDistribution(filePath, column) {
    try {
      const data = await this.loadCsvData(filePath);

      if (!data[0] || !data[0][column]) {
        throw new Error(`Column '${column}' not found in dataset`);
      }

      const values = data
        .map((row) => row[column])
        .filter((value) => {
          const num = parseFloat(value);
          return !isNaN(num) && value.toString().trim() !== '';
        })
        .map((value) => parseFloat(value));

      if (values.length === 0) {
        throw new Error(`No numeric values found in column '${column}'`);
      }

      const distribution = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: this.calculateMedian(values),
        stdDev: this.calculateStdDev(values),
        quartiles: this.calculateQuartiles(values),
        outliers: this.detectOutliers(values),
      };

      return {
        content: [
          {
            type: 'text',
            text: `Data Distribution Analysis for column '${column}' in ${filePath}:\n${JSON.stringify(distribution, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to analyze data distribution: ${error.message}`);
    }
  }

  calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calculateStdDev(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  calculateQuartiles(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    return { q1, q3 };
  }

  detectOutliers(values) {
    const { q1, q3 } = this.calculateQuartiles(values);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return values.filter((value) => value < lowerBound || value > upperBound);
  }

  async validateDataTypes(filePath) {
    try {
      const data = await this.loadCsvData(filePath);
      const columns = Object.keys(data[0] || {});

      const typeValidation = {
        columnTypes: {},
        suggestions: {},
      };

      columns.forEach((column) => {
        const values = data
          .map((row) => row[column])
          .filter((value) => value !== null && value !== undefined);
        const nonEmptyValues = values.filter((value) => value.toString().trim() !== '');

        if (nonEmptyValues.length === 0) {
          typeValidation.columnTypes[column] = 'empty';
          typeValidation.suggestions[column] = 'Column is empty - consider removing or filling';
          return;
        }

        // Analyze value patterns
        const numericCount = nonEmptyValues.filter(
          (value) => !isNaN(parseFloat(value)) && isFinite(value)
        ).length;
        const booleanCount = nonEmptyValues.filter((value) => {
          const lower = value.toString().toLowerCase();
          return lower === 'true' || lower === 'false' || lower === '1' || lower === '0';
        }).length;
        const dateCount = nonEmptyValues.filter((value) => !isNaN(Date.parse(value))).length;

        const numericRatio = numericCount / nonEmptyValues.length;
        const booleanRatio = booleanCount / nonEmptyValues.length;
        const dateRatio = dateCount / nonEmptyValues.length;

        // Determine suggested type
        if (numericRatio > 0.8) {
          typeValidation.columnTypes[column] = 'numeric';
          typeValidation.suggestions[column] = 'Use numeric type (int/float)';
        } else if (booleanRatio > 0.8) {
          typeValidation.columnTypes[column] = 'boolean';
          typeValidation.suggestions[column] = 'Use boolean type';
        } else if (dateRatio > 0.8) {
          typeValidation.columnTypes[column] = 'date';
          typeValidation.suggestions[column] = 'Use date/datetime type';
        } else {
          typeValidation.columnTypes[column] = 'string';
          typeValidation.suggestions[column] = 'Use string/text type';
        }

        typeValidation.columnTypes[column] +=
          ` (${(numericRatio * 100).toFixed(1)}% numeric, ${(booleanRatio * 100).toFixed(1)}% boolean, ${(dateRatio * 100).toFixed(1)}% date)`;
      });

      return {
        content: [
          {
            type: 'text',
            text: `Data Type Validation for ${filePath}:\n${JSON.stringify(typeValidation, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to validate data types: ${error.message}`);
    }
  }

  async checkDatasetStatistics(filePath) {
    try {
      const data = await this.loadCsvData(filePath);
      const columns = Object.keys(data[0] || {});

      const statistics = {
        dataset: {
          rows: data.length,
          columns: columns.length,
        },
        columnStats: {},
      };

      columns.forEach((column) => {
        const values = data
          .map((row) => row[column])
          .filter((value) => value !== null && value !== undefined);
        const nonEmptyValues = values.filter((value) => value.toString().trim() !== '');

        statistics.columnStats[column] = {
          totalValues: values.length,
          nonEmptyValues: nonEmptyValues.length,
          emptyValues: values.length - nonEmptyValues.length,
          completeness: `${((nonEmptyValues.length / values.length) * 100).toFixed(2)}%`,
        };

        // Add numeric statistics if applicable
        const numericValues = nonEmptyValues
          .map((value) => parseFloat(value))
          .filter((value) => !isNaN(value));

        if (numericValues.length > 0) {
          statistics.columnStats[column].numericStats = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            mean: (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2),
            uniqueValues: new Set(numericValues).size,
          };
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Dataset Statistics for ${filePath}:\n${JSON.stringify(statistics, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to check dataset statistics: ${error.message}`);
    }
  }

  async detectDataAnomalies(filePath) {
    try {
      const data = await this.loadCsvData(filePath);
      const columns = Object.keys(data[0] || {});

      const anomalies = {
        duplicateRows: [],
        inconsistentFormats: {},
        potentialOutliers: {},
        unusualPatterns: [],
      };

      // Check for duplicate rows
      const seenRows = new Set();
      data.forEach((row, index) => {
        const rowString = JSON.stringify(row);
        if (seenRows.has(rowString)) {
          anomalies.duplicateRows.push(index);
        }
        seenRows.add(rowString);
      });

      // Check for inconsistent formats in each column
      columns.forEach((column) => {
        const values = data
          .map((row) => row[column])
          .filter((value) => value && value.toString().trim() !== '');
        const formats = values.map((value) => this.detectValueFormat(value.toString()));

        const formatCounts = {};
        formats.forEach((format) => {
          formatCounts[format] = (formatCounts[format] || 0) + 1;
        });

        const dominantFormat = Object.entries(formatCounts).sort(([, a], [, b]) => b - a)[0];
        const inconsistentCount = values.length - dominantFormat[1];

        if (inconsistentCount > values.length * 0.1) {
          // More than 10% inconsistent
          anomalies.inconsistentFormats[column] = {
            dominantFormat: dominantFormat[0],
            inconsistentCount,
            totalValues: values.length,
          };
        }
      });

      // Detect potential outliers in numeric columns
      columns.forEach((column) => {
        const numericValues = data
          .map((row) => row[column])
          .filter((value) => value && !isNaN(parseFloat(value)))
          .map((value) => parseFloat(value));

        if (numericValues.length > 10) {
          // Only check if enough data
          const outliers = this.detectOutliers(numericValues);
          if (outliers.length > 0) {
            anomalies.potentialOutliers[column] = outliers.slice(0, 5); // First 5 outliers
          }
        }
      });

      return {
        content: [
          {
            type: 'text',
            text: `Data Anomalies Detection for ${filePath}:\n${JSON.stringify(anomalies, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to detect data anomalies: ${error.message}`);
    }
  }

  detectValueFormat(value) {
    if (!isNaN(parseFloat(value)) && isFinite(value)) {
      return 'numeric';
    }
    if (!isNaN(Date.parse(value))) {
      return 'date';
    }
    if (/^(true|false|1|0)$/i.test(value)) {
      return 'boolean';
    }
    if (/^[a-zA-Z]+$/.test(value)) {
      return 'alpha';
    }
    if (/^[a-zA-Z0-9]+$/.test(value)) {
      return 'alphanumeric';
    }
    return 'mixed';
  }

  async generateDataReport(filePath) {
    try {
      const [validation, quality, missing, statistics] = await Promise.all([
        this.validateCsvDataset(filePath),
        this.checkDataQuality(filePath),
        this.analyzeMissingValues(filePath),
        this.checkDatasetStatistics(filePath),
      ]);

      const report = {
        filePath,
        generatedAt: new Date().toISOString(),
        summary: {
          validation: JSON.parse(validation.content[0].text.split('\n').slice(1).join('\n')),
          quality: JSON.parse(quality.content[0].text.split('\n').slice(1).join('\n')),
          missing: JSON.parse(missing.content[0].text.split('\n').slice(1).join('\n')),
          statistics: JSON.parse(statistics.content[0].text.split('\n').slice(1).join('\n')),
        },
        recommendations: this.generateRecommendations(
          JSON.parse(validation.content[0].text.split('\n').slice(1).join('\n')),
          JSON.parse(quality.content[0].text.split('\n').slice(1).join('\n'))
        ),
      };

      return {
        content: [
          {
            type: 'text',
            text: `Comprehensive Data Report for ${filePath}:\n${JSON.stringify(report, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to generate data report: ${error.message}`);
    }
  }

  generateRecommendations(validation, quality) {
    const recommendations = [];

    // Validation recommendations
    if (validation.issues && validation.issues.length > 0) {
      recommendations.push(`Fix validation issues: ${validation.issues.join(', ')}`);
    }

    // Quality recommendations
    if (quality.completeness) {
      Object.entries(quality.completeness).forEach(([column, stats]) => {
        if (parseFloat(stats.completenessPercentage) < 80) {
          recommendations.push(
            `Improve completeness of column '${column}' (${stats.completenessPercentage}%)`
          );
        }
      });
    }

    if (quality.issues && quality.issues.length > 0) {
      recommendations.push(`Address quality issues: ${quality.issues.join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Dataset appears to be in good condition');
    }

    return recommendations;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Dataset Validation MCP Server running...');
  }
}

// Run the server
const server = new DatasetValidationServer();
server.run().catch(console.error);
