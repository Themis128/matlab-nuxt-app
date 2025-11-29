import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'

const execAsync = promisify(exec)

interface PriceRequest {
  ram: number
  battery: number
  screen: number
  weight: number
  year: number
  company: string
}

interface PriceResponse {
  price: number
}

export default defineEventHandler(async (event): Promise<PriceResponse> => {
  try {
    const body = await readBody<PriceRequest>(event)

    // Validate required fields
    if (!body.ram || !body.battery || !body.screen || !body.weight || !body.year || !body.company) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: ram, battery, screen, weight, year, company'
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

    // Create MATLAB command to call predict_price
    const matlabScript = `
cd('${mobilesDir.replace(/\\/g, '/')}');
try
    price = predict_price(${body.ram}, ${body.battery}, ${body.screen}, ${body.weight}, ${body.year}, '${body.company}');
    fprintf('PRICE_RESULT:%.2f\\n', price);
catch ME
    fprintf('ERROR:%s\\n', ME.message);
    exit(1);
end
exit(0);
`

    // Write temporary script
    const tempScriptPath = join(projectRoot, 'temp_predict_price.m')
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
    const priceMatch = stdout.match(/PRICE_RESULT:([\d.]+)/)
    if (priceMatch) {
      const price = parseFloat(priceMatch[1])
      return { price: Math.round(price) }
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
      statusMessage: `Failed to predict price: ${error.message}`
    })
  }
})
