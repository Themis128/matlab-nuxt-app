import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'

const execAsync = promisify(exec)

interface BatteryRequest {
  ram: number
  screen: number
  weight: number
  year: number
  price: number
  company: string
}

interface BatteryResponse {
  battery: number
}

export default defineEventHandler(async (event): Promise<BatteryResponse> => {
  try {
    const body = await readBody<BatteryRequest>(event)

    // Validate required fields
    if (!body.ram || !body.screen || !body.weight || !body.year || !body.price || !body.company) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: ram, screen, weight, year, price, company'
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

    // Create MATLAB command to call predict_battery
    const matlabScript = `
cd('${mobilesDir.replace(/\\/g, '/')}');
try
    battery = predict_battery(${body.ram}, ${body.screen}, ${body.weight}, ${body.year}, ${body.price}, '${body.company}');
    fprintf('BATTERY_RESULT:%.2f\\n', battery);
catch ME
    fprintf('ERROR:%s\\n', ME.message);
    exit(1);
end
exit(0);
`

    // Write temporary script
    const tempScriptPath = join(projectRoot, 'temp_predict_battery.m')
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
    const batteryMatch = stdout.match(/BATTERY_RESULT:([\d.]+)/)
    if (batteryMatch) {
      const battery = parseFloat(batteryMatch[1])
      return { battery: Math.round(battery) }
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
      statusMessage: `Failed to predict battery: ${error.message}`
    })
  }
})
