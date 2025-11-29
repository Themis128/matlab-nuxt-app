import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'

const execAsync = promisify(exec)

interface RamRequest {
  battery: number
  screen: number
  weight: number
  year: number
  price: number
  company: string
}

interface RamResponse {
  ram: number
}

export default defineEventHandler(async (event): Promise<RamResponse> => {
  try {
    const body = await readBody<RamRequest>(event)

    // Validate required fields
    if (!body.battery || !body.screen || !body.weight || !body.year || !body.price || !body.company) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: battery, screen, weight, year, price, company'
      })
    }

    // Get project root
    const projectRoot = process.cwd()
    const mobilesDir = join(projectRoot, 'mobiles-dataset-docs')

    // Read MATLAB configuration
    const configPath = join(projectRoot, 'matlab.config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    const matlabPath = config.matlab.installPath
    const matlabExe = join(matlabPath, 'matlab.exe')

    // Create MATLAB command to call predict_ram
    const matlabScript = `
cd('${mobilesDir.replace(/\\/g, '/')}');
try
    ram = predict_ram(${body.battery}, ${body.screen}, ${body.weight}, ${body.year}, ${body.price}, '${body.company}');
    fprintf('RAM_RESULT:%.2f\\n', ram);
catch ME
    fprintf('ERROR:%s\\n', ME.message);
    exit(1);
end
exit(0);
`

    // Write temporary script
    const tempScriptPath = join(projectRoot, 'temp_predict_ram.m')
    writeFileSync(tempScriptPath, matlabScript)

    // Run MATLAB
    const matlabCommand = `"${matlabExe}" -batch "run('${tempScriptPath.replace(/\\/g, '/')}')"`

    const { stdout, stderr } = await execAsync(matlabCommand, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
      cwd: projectRoot
    })

    // Clean up temp file
    try {
      unlinkSync(tempScriptPath)
    } catch (e) {
      // Ignore cleanup errors
    }

    // Parse result
    const ramMatch = stdout.match(/RAM_RESULT:([\d.]+)/)
    if (ramMatch) {
      const ram = parseFloat(ramMatch[1])
      return { ram: Math.round(ram) }
    }

    // Check for error
    const errorMatch = stdout.match(/ERROR:(.+)/)
    if (errorMatch) {
      throw createError({
        statusCode: 500,
        statusMessage: `MATLAB error: ${errorMatch[1]}`
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to parse MATLAB output'
    })
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to predict RAM: ${error.message}`
    })
  }
})
