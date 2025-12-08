import { execFile } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
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
const scriptPath = join(__dirname, 'check_matlab_capabilities.m');

console.log('🔍 Checking MATLAB Capabilities...\n');
console.log(`MATLAB Path: ${matlabExe}\n`);

// Check if MATLAB executable exists
if (!existsSync(matlabExe)) {
  console.log('⚠️  MATLAB executable not found at the specified path.');
  console.log('Please update config/matlab.config.json with the correct MATLAB installation path.');
  console.log('Skipping MATLAB capabilities check.\n');
  process.exit(0);
}

// MATLAB command to run the script and exit
// -batch flag runs MATLAB in batch mode (non-interactive)
// -r runs the specified command/script
// Sanitize script path for MATLAB command
const sanitizedScriptPath = scriptPath.replace(/\\/g, '/').replace(/'/g, "''");

// Use execFile with array of arguments to prevent command injection
const matlabArgs = ['-batch', `run('${sanitizedScriptPath}')`];

execFile(
  matlabExe,
  matlabArgs,
  {
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    timeout: 60000, // 60 second timeout
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

    // Save report to file
    const reportPath = join(__dirname, 'matlab-capabilities-report.txt');
    writeFileSync(reportPath, stdout, 'utf8');
    console.log(`\n✅ Report saved to: ${reportPath}`);
  }
);
