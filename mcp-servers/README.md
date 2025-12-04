# MCP Servers Collection

This directory contains various Model Context Protocol (MCP) server implementations fetched from GitHub and custom-built servers for the MatLab ML application.

## Fetched MCP Servers

### 1. Official MCP Servers (`mcp-servers-official/`)

- **Source**: https://github.com/modelcontextprotocol/servers
- **Contains**: Core MCP server implementations including:
  - `filesystem/` - File system operations
  - `git/` - Git repository operations
  - `fetch/` - HTTP fetch operations
  - `memory/` - In-memory storage
  - `time/` - Time and date utilities
  - `everything/` - Combined server with all tools
  - `sequentialthinking/` - Sequential thinking patterns

### 2. GitHub MCP Server (`mcp-github/`)

- **Source**: https://github.com/github/github-mcp-server
- **Purpose**: GitHub API integration for repository management, issues, pull requests, etc.
- **Tools**: Repository operations, issue management, pull request handling, code search

### 3. Snyk MCP Server (`mcp-snyk/`)

- **Source**: https://github.com/snyk/snyk-ls
- **Purpose**: Security scanning and vulnerability assessment
- **Tools**: Code analysis, dependency scanning, security recommendations

### 4. Algolia MCP Server (`mcp-node/`)

- **Source**: https://github.com/algolia/mcp-node
- **Purpose**: Algolia search and analytics integration
- **Tools**: Search operations, analytics, index management

## Custom ML-Specific MCP Servers

### 5. MATLAB Integration Server (`mcp-matlab-integration/`)

- **Purpose**: Direct integration with MATLAB for running scripts, checking status, and workspace management
- **Tools**:
  - `check_matlab_status` - Verify MATLAB installation and availability
  - `run_matlab_script` - Execute MATLAB .m files with arguments
  - `execute_matlab_command` - Run MATLAB commands directly
  - `get_matlab_workspace` - Inspect MATLAB workspace variables
  - `list_matlab_functions` - Discover MATLAB functions in directories
  - `validate_matlab_syntax` - Check MATLAB script syntax

### 6. Model Training Monitor (`mcp-model-training-monitor/`)

- **Purpose**: Monitor ML model training progress, metrics, and status
- **Tools**:
  - `check_training_status` - Get current training job status
  - `get_training_metrics` - Retrieve training performance metrics
  - `monitor_training_progress` - View real-time training progress
  - `read_training_logs` - Access training log files
  - `get_model_performance` - Evaluate trained model performance
  - `list_training_jobs` - View all active/completed training jobs
  - `stop_training_job` - Stop running training processes
  - `analyze_training_results` - Generate training insights and recommendations

### 7. Dataset Validation Server (`mcp-dataset-validation/`)

- **Purpose**: Validate ML datasets, check data quality, and perform preprocessing analysis
- **Tools**:
  - `validate_csv_dataset` - Check CSV structure and integrity
  - `check_data_quality` - Comprehensive data quality assessment
  - `analyze_missing_values` - Identify and analyze missing data patterns
  - `analyze_data_distribution` - Statistical distribution analysis
  - `validate_data_types` - Suggest optimal data types for columns
  - `check_dataset_statistics` - Generate dataset summary statistics
  - `detect_data_anomalies` - Identify potential data issues
  - `generate_data_report` - Create comprehensive data quality reports

### 8. Prediction Analysis Server (`mcp-prediction-analysis/`)

- **Purpose**: Analyze ML prediction results, generate performance reports, and compare models
- **Tools**:
  - `analyze_predictions` - Compare predictions against actual values
  - `calculate_metrics` - Compute accuracy, precision, recall, RMSE, etc.
  - `generate_performance_report` - Create detailed performance reports
  - `compare_models` - Compare multiple model performances
  - `analyze_prediction_errors` - Identify error patterns and biases
  - `visualize_predictions` - Generate visualization data for predictions
  - `calculate_confusion_matrix` - Classification performance analysis
  - `analyze_prediction_distribution` - Statistical analysis of predictions

## Setup and Usage

Each MCP server directory contains its own setup instructions. Generally:

1. Navigate to the server directory
2. Install dependencies: `npm install` or `pip install -r requirements.txt`
3. Configure authentication tokens/API keys as needed
4. Run the server according to its documentation

### Custom ML Servers Setup

For the custom ML-specific servers:

```bash
# MATLAB Integration Server
cd mcp-matlab-integration
npm install
npm start

# Model Training Monitor
cd mcp-model-training-monitor
npm install
npm start

# Dataset Validation Server
cd mcp-dataset-validation
npm install
npm start

# Prediction Analysis Server
cd mcp-prediction-analysis
npm install
npm start
```

## Integration with Your Application

These MCP servers can be integrated with MCP-compatible clients like Claude Desktop or custom applications using the MCP SDK.

For configuration examples, see the main project's `MCP_EVENTS_README.md` file.

## ML Workflow Integration

The custom MCP servers are designed to work together in ML workflows:

1. **Dataset Validation** → Validate and clean datasets
2. **MATLAB Integration** → Run preprocessing and feature engineering
3. **Model Training Monitor** → Train models and monitor progress
4. **Prediction Analysis** → Evaluate model performance and generate reports

This creates a comprehensive ML development environment accessible through natural language interfaces.

## Note on Missing Servers

Some MCP servers mentioned in the documentation were not found at their expected GitHub locations:

- Playwright MCP Server (likely distributed via npm: `@executeautomation/playwright-mcp-server`)
- AWS Cost Explorer MCP Server (likely distributed via pip: `awslabs.cost-explorer-mcp-server`)

These can be installed via their respective package managers when needed.
