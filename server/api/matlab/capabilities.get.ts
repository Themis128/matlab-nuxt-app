import { exec } from 'child_process'
import { promisify } from 'util'
import { readFileSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

interface Toolbox {
  name: string
  version: string
  description?: string
}

interface CapabilitiesResult {
  version?: string
  release?: string
  architecture?: string
  availableMemory?: string
  totalMemory?: string
  gpu?: {
    name: string
    memory: string
  }
  keyCapabilities?: Record<string, boolean>
  toolboxes?: Toolbox[]
}

export default defineEventHandler(async (event): Promise<CapabilitiesResult> => {
  try {
    // Get project root (workspace directory)
    const projectRoot = process.cwd()

    // Read MATLAB configuration
    const configPath = join(projectRoot, 'matlab.config.json')
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    const matlabPath = config.matlab.installPath
    const matlabExe = join(matlabPath, 'matlab.exe')
    const scriptPath = join(projectRoot, 'check_matlab_capabilities.m')

    // Run MATLAB script
    const matlabCommand = `"${matlabExe}" -batch "run('${scriptPath.replace(/\\/g, '/')}')"`

    const { stdout, stderr } = await execAsync(matlabCommand, {
      maxBuffer: 10 * 1024 * 1024, // 10MB
      timeout: 60000, // 60 seconds
      cwd: projectRoot
    })

    // Parse the output
    const result = parseMatlabOutput(stdout, projectRoot)

    return result
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to check MATLAB capabilities: ${error.message}`
    })
  }
})

function parseMatlabOutput(output: string, projectRoot: string): CapabilitiesResult {
  const result: CapabilitiesResult = {
    keyCapabilities: {},
    toolboxes: []
  }

  // Parse version
  const versionMatch = output.match(/MATLAB Version: ([^\n]+)/)
  if (versionMatch) {
    result.version = versionMatch[1].trim()
  }

  // Parse release
  const releaseMatch = output.match(/Release: ([^\n]+)/)
  if (releaseMatch) {
    result.release = releaseMatch[1].trim()
  }

  // Parse architecture
  const archMatch = output.match(/Architecture: ([^\n]+)/)
  if (archMatch) {
    result.architecture = archMatch[1].trim()
  }

  // Parse memory
  const availableMemMatch = output.match(/Available Memory: ([\d.]+) GB/)
  if (availableMemMatch) {
    result.availableMemory = `${availableMemMatch[1]} GB`
  }

  const totalMemMatch = output.match(/Total Memory: ([\d.]+) GB/)
  if (totalMemMatch) {
    result.totalMemory = `${totalMemMatch[1]} GB`
  }

  // Parse GPU
  const gpuAvailableMatch = output.match(/GPU Available: (Yes|No)/)
  if (gpuAvailableMatch && gpuAvailableMatch[1] === 'Yes') {
    const gpuNameMatch = output.match(/GPU Name: ([^\n]+)/)
    const gpuMemMatch = output.match(/GPU Memory: ([\d.]+) GB/)

    if (gpuNameMatch || gpuMemMatch) {
      result.gpu = {
        name: gpuNameMatch ? gpuNameMatch[1].trim() : 'Unknown',
        memory: gpuMemMatch ? `${gpuMemMatch[1]} GB` : 'Unknown'
      }
    }
  }

  // Parse key capabilities
  const capabilityPattern = /(\w+): (true|false)/g
  let match
  while ((match = capabilityPattern.exec(output)) !== null) {
    const name = match[1]
    const value = match[2] === 'true'
    if (result.keyCapabilities) {
      result.keyCapabilities[name] = value
    }
  }

  // Load toolbox descriptions
  const descriptionsPath = join(projectRoot, 'toolbox-descriptions.json')
  let descriptions: Record<string, string> = {}
  try {
    const descriptionsContent = readFileSync(descriptionsPath, 'utf-8')
    descriptions = JSON.parse(descriptionsContent)
  } catch (error) {
    // Descriptions file not found or invalid, continue without them
  }

  // Parse toolboxes
  const toolboxSection = output.match(/INSTALLED TOOLBOXES:([\s\S]*?)(?=\n\n|\n3\.|$)/)
  if (toolboxSection) {
    // Split into lines and parse line by line
    const lines = toolboxSection[1].split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const toolboxMatch = line.match(/^- (.+?) \(Version: (.+?)\)$/)
      if (toolboxMatch) {
        const toolboxName = toolboxMatch[1].trim()
        const version = toolboxMatch[2].trim()

        // Check if next line is a description
        let description: string | undefined = undefined
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim()
          const descMatch = nextLine.match(/^Description: (.+)$/)
          if (descMatch) {
            description = descMatch[1].trim()
            i++ // Skip the description line
          }
        }

        // Fallback to JSON descriptions if not in MATLAB output
        if (!description && descriptions[toolboxName]) {
          description = descriptions[toolboxName]
        }

        result.toolboxes?.push({
          name: toolboxName,
          version: version,
          description: description
        })
      }
    }
  }

  return result
}
