/**
 * MATLAB .mat File Viewer (Node.js)
 * Converts .mat files to readable JSON format
 *
 * Requires: npm install mat-file-reader
 * Usage: node view_mat_file.js <file.mat> [output.json]
 */

const fs = require('fs');
const path = require('path');

// Check if mat-file-reader is available
let matFileReader;
try {
    matFileReader = require('mat-file-reader');
} catch (e) {
    console.error('Error: mat-file-reader not installed.');
    console.error('Install with: npm install mat-file-reader');
    process.exit(1);
}

function viewMatFile(matPath, outputPath) {
    const filePath = path.resolve(matPath);

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
    }

    // Validate output path to prevent arbitrary file writes
    let validatedOutputPath = null;
    if (outputPath) {
        const resolvedOutputPath = path.resolve(outputPath);
        const cwd = process.cwd();

        // Ensure output path is within current working directory
        if (!resolvedOutputPath.startsWith(cwd)) {
            console.error(`Error: Output path must be within current directory: ${cwd}`);
            process.exit(1);
        }

        // Additional safety: ensure it's a .json file
        if (!resolvedOutputPath.endsWith('.json')) {
            console.error('Error: Output file must have .json extension');
            process.exit(1);
        }

        validatedOutputPath = resolvedOutputPath;
    }

    console.log(`Loading ${filePath}...`);

    try {
        // Read .mat file
        const fileBuffer = fs.readFileSync(filePath);
        const matFile = matFileReader(fileBuffer);

        const result = {};
        const variables = matFile.variables();

        console.log('\n=== Variables in file ===\n');
        variables.forEach(varName => {
            const varData = matFile.read(varName);
            result[varName] = formatData(varData);

            console.log(`Variable: ${varName}`);
            console.log(`  Type: ${typeof varData}`);
            if (Array.isArray(varData)) {
                console.log(`  Size: ${varData.length} elements`);
                if (varData.length <= 10) {
                    console.log(`  Value: ${JSON.stringify(varData)}`);
                } else {
                    console.log(`  Value: [Array with ${varData.length} elements]`);
                    console.log(`  Sample: ${JSON.stringify(varData.slice(0, 5))}...`);
                }
            } else if (typeof varData === 'object' && varData !== null) {
                console.log(`  Keys: ${Object.keys(varData).join(', ')}`);
            } else {
                console.log(`  Value: ${varData}`);
            }
            console.log('');
        });

        // Output JSON
        const jsonOutput = JSON.stringify(result, null, 2);

        if (validatedOutputPath) {
            fs.writeFileSync(validatedOutputPath, jsonOutput, 'utf-8');
            console.log(`✓ Output saved to: ${validatedOutputPath}`);
        } else {
            console.log('\n=== JSON Output ===\n');
            console.log(jsonOutput);
        }

    } catch (error) {
        console.error(`Error reading .mat file: ${error.message}`);
        process.exit(1);
    }
}

function formatData(data) {
    if (Array.isArray(data)) {
        if (data.length > 100) {
            return {
                _type: 'array',
                _length: data.length,
                _sample: data.slice(0, 10),
                _summary: {
                    min: Math.min(...data),
                    max: Math.max(...data),
                    mean: data.reduce((a, b) => a + b, 0) / data.length
                }
            };
        }
        return data;
    } else if (typeof data === 'object' && data !== null) {
        const formatted = {};
        for (const key in data) {
            formatted[key] = formatData(data[key]);
        }
        return formatted;
    }
    return data;
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node view_mat_file.js <file.mat> [output.json]');
    process.exit(1);
}

viewMatFile(args[0], args[1]);
