/* eslint-disable no-console */
import { exec } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read MATLAB configuration
const config = JSON.parse(readFileSync('config/matlab.config.json', 'utf8'))
const matlabPath = config.matlab.installPath
const matlabExe = join(matlabPath, 'matlab.exe')
const scriptPath = join(__dirname, 'check_matlab_capabilities.m')

console.log('🔍 Checking MATLAB Capabilities...\n')
console.log(`MATLAB Path: ${matlabExe}\n`)

// Check if MATLAB executable exists
if (!existsSync(matlabExe)) {
  console.log('⚠️  MATLAB executable not found at the specified path.')
  console.log('Please update config/matlab.config.json with the correct MATLAB installation path.')
  console.log('Skipping MATLAB capabilities check.\n')
  process.exit(0)
}

// MATLAB command to run the script and exit
// -batch flag runs MATLAB in batch mode (non-interactive)
// -r runs the specified command/script
const matlabCommand = `"${matlabExe}" -batch "run('${scriptPath.replace(/\\/g, '/')}')"`

exec(
  matlabCommand,
  {
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    timeout: 60000, // 60 second timeout
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

    // Save report to file
    const reportPath = join(__dirname, 'matlab-capabilities-report.txt')
    writeFileSync(reportPath, stdout, 'utf8')
    console.log(`\n✅ Report saved to: ${reportPath}`)
  }
)
