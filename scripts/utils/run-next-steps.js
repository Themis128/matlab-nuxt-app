/**
 * Run Next Steps: Execute MATLAB scripts for evaluation, visualization, and brand classification
 * This script runs the next steps after initial model training
 */

import { exec } from 'child_process'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read MATLAB configuration
const config = JSON.parse(readFileSync('matlab.config.json', 'utf8'))
const matlabPath = config.matlab.installPath
const matlabExe = join(matlabPath, 'matlab.exe')
const scriptPath = join(__dirname, 'mobiles-dataset-docs', 'run_next_steps.m')

console.log('🚀 Running Next Steps: Evaluation, Visualization, and Brand Classification\n')
console.log(`MATLAB Path: ${matlabExe}\n`)
console.log(`Script: ${scriptPath}\n`)

// MATLAB command to run the script in batch mode
// -batch flag runs MATLAB in batch mode (non-interactive)
// Change to the mobiles-dataset-docs directory first
const mobilesDir = join(__dirname, 'mobiles-dataset-docs').replace(/\\/g, '/')
const matlabCommand = `"${matlabExe}" -batch "cd('${mobilesDir}'); run('run_next_steps.m')"`

console.log('Executing MATLAB script...\n')
console.log('This may take several minutes depending on your system.\n')
console.log('Steps being executed:')
console.log('  1. Evaluate price prediction model')
console.log('  2. Visualize results')
console.log('  3. Train brand classification model\n')

exec(
  matlabCommand,
  {
    maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large outputs (training can produce lots of output)
    timeout: 600000, // 10 minute timeout (training can take a while)
  },
  (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error running MATLAB:')
      console.error(error.message)
      if (stderr) {
        console.error('STDERR:', stderr)
      }
      return
    }

    // Display the output
    console.log(stdout)

    if (stderr && !stderr.includes('Warning')) {
      console.error('Warnings:', stderr)
    }

    console.log('\n✅ Next steps completed!')
    console.log('\nCheck the following for results:')
    console.log('  - mobiles-dataset-docs/trained_models/evaluation_report.mat')
    console.log('  - mobiles-dataset-docs/trained_models/figures/ (visualization images)')
    console.log('  - mobiles-dataset-docs/trained_models/brand_classifier.mat')
    console.log('  - mobiles-dataset-docs/trained_models/brand_classification_results.mat\n')
  }
)
