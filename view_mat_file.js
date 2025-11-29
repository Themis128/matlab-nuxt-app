/**
 * MATLAB .mat File Viewer (Node.js, ESM)
 * Converts .mat files to readable JSON format
 *
 * Requires: npm install mat-file-reader
 * Usage: node view_mat_file.js <file.mat> [output.json]
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

async function tryNodeReader(matPath, outputPath) {
    // Attempt dynamic import of a MAT reader if available
    try {
        const mod = await import('mat-file-reader');
        const matFileReader = mod.default || mod;
        return viewMatFileWithNode(matFileReader, matPath, outputPath);
    } catch (e) {
        // Package not available; signal fallback
        return false;
    }
}

function viewMatFileWithNode(matFileReader, matPath, outputPath) {
    const filePath = path.resolve(matPath);

    if (!fs.existsSync(filePath)) {
        console.error(`Error: File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`Loading ${filePath}...`);

    try {
        // Read .mat file
        const fileBuffer = fs.readFileSync(filePath);
        const matFile = matFileReader(fileBuffer);

        const result = {};
        const variables = matFile.variables();

        console.log('\n=== Variables in file ===\n');
        variables.forEach((varName) => {
            const varData = matFile.read(varName);
            result[varName] = formatData(varData);

            console.log(`Variable: ${varName}`);
            console.log(`  Type: ${Array.isArray(varData) ? 'array' : typeof varData}`);
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

        if (outputPath) {
            fs.writeFileSync(outputPath, jsonOutput, 'utf-8');
            console.log(`✓ Output saved to: ${outputPath}`);
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
                    mean: data.reduce((a, b) => a + b, 0) / data.length,
                },
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

function fallbackToPython(matPath, outputPath) {
    const args = ['view_mat_file.py', matPath];
    // Let Python handle output format; default json
    if (outputPath) {
        args.push('-o', outputPath);
    }
    const result = spawnSync('python', args, { stdio: 'inherit' });
    if (result.error) {
        console.error('Error invoking Python fallback:', result.error.message);
        process.exit(1);
    }
    process.exit(result.status ?? 0);
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('Usage: node view_mat_file.js <file.mat> [output.json]');
    process.exit(1);
}

// Try Node reader first, fallback to Python if not available
tryNodeReader(args[0], args[1]).then((ok) => {
    if (ok === false) fallbackToPython(args[0], args[1]);
});
