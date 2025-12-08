/**
 * Run Next Steps: Execute MATLAB scripts for evaluation, visualization, and brand classification
 * This script runs the next steps after initial model training
 */

import { execFile } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { dirname, join, resolve, normalize } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate and sanitize path to prevent directory traversal
function validatePath(pathToCheck, baseDir) {
  const resolved = resolve(baseDir, pathToCheck);
  const normalized = normalize(resolved);
  if (!normalized.startsWith(normalize(baseDir))) {
    throw new Error(`Invalid path: ${pathToCheck} - path traversal detected`);
  }
  return normalized;
}

// Read MATLAB configuration with validation
const configPath = join(process.cwd(), 'config', 'matlab.config.json');
if (!existsSync(configPath)) {
  throw new Error(`Configuration file not found: ${configPath}`);
}
const config = JSON.parse(readFileSync(configPath, 'utf8'));

// Validate matlab path from config
if (!config.matlab || !config.matlab.installPath || typeof config.matlab.installPath !== 'string') {
  throw new Error('Invalid MATLAB configuration: installPath must be a string');
}

const matlabPath = validatePath(config.matlab.installPath, process.cwd());
const matlabExe = join(matlabPath, 'matlab.exe');
const scriptPath = join(__dirname, '..', '..', 'mobiles-dataset-docs', 'run_next_steps.m');

console.log('🚀 Running Next Steps: Evaluation, Visualization, and Brand Classification\n');
console.log(`MATLAB Path: ${matlabExe}\n`);
console.log(`Script: ${scriptPath}\n`);

// MATLAB command to run the script in batch mode
// -batch flag runs MATLAB in batch mode (non-interactive)
// Change to the mobiles-dataset-docs directory first
const mobilesDir = join(__dirname, '..', '..', 'mobiles-dataset-docs')
  .replace(/\\/g, '/')
  .replace(/'/g, "''");

// Use execFile with array of arguments to prevent command injection
const matlabArgs = ['-batch', `cd('${mobilesDir}'); run('run_next_steps.m')`];

console.log('Executing MATLAB script...\n');
console.log('This may take several minutes depending on your system.\n');
console.log('Steps being executed:');
console.log('  1. Evaluate price prediction model');
console.log('  2. Visualize results');
console.log('  3. Train brand classification model\n');

execFile(
  matlabExe,
  matlabArgs,
  {
    maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large outputs (training can produce lots of output)
    timeout: 600000, // 10 minute timeout (training can take a while)
  },
  (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error running MATLAB:');
      console.error(error.message);
      if (stderr) {
        console.error('STDERR:', stderr);
      }
      return;
    }

    // Display the output
    console.log(stdout);

    if (stderr && !stderr.includes('Warning')) {
      console.error('Warnings:', stderr);
    }

    console.log('\n✅ Next steps completed!');
    console.log('\nCheck the following for results:');
    console.log('  - mobiles-dataset-docs/trained_models/evaluation_report.mat');
    console.log('  - mobiles-dataset-docs/trained_models/figures/ (visualization images)');
    console.log('  - mobiles-dataset-docs/trained_models/brand_classifier.mat');
    console.log('  - mobiles-dataset-docs/trained_models/brand_classification_results.mat\n');
  }
);
