import { exec } from 'child_process'
import { promisify } from 'util'
import { join } from 'path'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'

const execAsync = promisify(exec)

interface BrandRequest {
  ram: number
  battery: number
  screen: number
  weight: number
  year: number
  price: number
}

interface BrandResponse {
  brand: string
}

export default defineEventHandler(async (event): Promise<BrandResponse> => {
  try {
    const body = await readBody<BrandRequest>(event)

    // Validate required fields
    if (!body.ram || !body.battery || !body.screen || !body.weight || !body.year || !body.price) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: ram, battery, screen, weight, year, price'
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

    // Create MATLAB command to call predict_brand
    const matlabScript = `
  try
    % Ensure project paths are available
    cd('${projectRoot.replace(/\\/g, '/')}');
    if exist('setup_matlab_env.m', 'file')
      run('setup_matlab_env.m');
    else
      addpath(genpath(pwd));
    end

    % Move to mobiles dataset docs folder
    cd('${mobilesDir.replace(/\\/g, '/')}');

    % Call prediction function
    brand = predict_brand(${body.ram}, ${body.battery}, ${body.screen}, ${body.weight}, ${body.year}, ${body.price});
    fprintf('BRAND_RESULT:%s\\n', char(brand));
  catch ME
    fprintf('ERROR:%s\\n', ME.message);
    exit(1);
  end
  exit(0);
  `

    // Write temporary script
    const tempScriptPath = join(projectRoot, 'temp_predict_brand.m')
    writeFileSync(tempScriptPath, matlabScript)

    // Run MATLAB
    const matlabCommand = `"${matlabExe}" -batch "run('${tempScriptPath.replace(/\\/g, '/')}')"`

    const { stdout, stderr } = await execAsync(matlabCommand, {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 60000,
      cwd: projectRoot
    })

    // Clean up temp file
    try {
      unlinkSync(tempScriptPath)
    } catch (e) {
      // Ignore cleanup errors
    }

    // Parse result
    const brandMatch = stdout.match(/BRAND_RESULT:(.+)/)
    if (brandMatch) {
      return { brand: brandMatch[1].trim() }
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
      statusMessage: `Failed to predict brand: ${error.message}`
    })
  }
})
