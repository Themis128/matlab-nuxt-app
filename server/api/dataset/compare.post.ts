import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readBody, createError, defineEventHandler } from 'h3';
import type { H3Event } from 'h3';

interface PhoneModel {
  modelName: string;
  company: string;
  price: number;
  ram: number;
  battery: number;
  screenSize: number;
  weight: number;
  year: number;
  frontCamera?: number;
  backCamera?: number;
  storage?: number;
  processor?: string;
  displayType?: string;
  refreshRate?: number;
  resolution?: string;
  imageUrl?: string;
}

interface ComparisonResponse {
  models: PhoneModel[];
  comparison: {
    price: { min: number; max: number; avg: number; diff: number };
    ram: { min: number; max: number; avg: number; diff: number };
    battery: { min: number; max: number; avg: number; diff: number };
    screenSize: { min: number; max: number; avg: number; diff: number };
    weight: { min: number; max: number; avg: number; diff: number };
    year: { min: number; max: number; avg: number; diff: number };
  };
  differences: Array<{
    field: string;
    best: string;
    worst: string;
    difference: string;
  }>;
}

interface CompareRequest {
  modelNames: string[];
}

export default defineEventHandler(async (event: H3Event): Promise<ComparisonResponse> => {
  try {
    const body = await readBody<CompareRequest>(event);

    if (!body.modelNames || !Array.isArray(body.modelNames) || body.modelNames.length < 2) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least 2 model names are required for comparison',
      });
    }

    if (body.modelNames.length > 5) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum 5 models can be compared at once',
      });
    }

    // Find dataset file
    const projectRoot = process.cwd();
    const datasetPaths = [
      join(projectRoot, 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'mobiles-dataset-docs', 'Mobiles Dataset (2025).csv'),
      join(projectRoot, 'mobiles-dataset-docs', 'preprocessed', 'preprocessed_data.csv'),
    ];

    let datasetContent: string | null = null;

    for (const path of datasetPaths) {
      try {
        datasetContent = readFileSync(path, 'utf-8');
        break;
      } catch {
        continue;
      }
    }

    if (!datasetContent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Dataset file not found',
      });
    }

    // Parse CSV
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const lines = datasetContent.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Dataset file is empty or invalid',
      });
    }

    // Parse header
    const headerLineValue = lines[0] ?? '';
    const headers = headerLineValue
      ? parseCSVLine(headerLineValue).map((h) => h.replace(/^"|"$/g, '').trim())
      : [];

    // Find column indices
    const getColumnIndex = (exactName: string, fallbackNames: string[] = []): number => {
      const exactIdx = headers.findIndex((h) => h === exactName);
      if (exactIdx !== -1) return exactIdx;

      for (const fallback of fallbackNames) {
        const idx = headers.findIndex((h) => h.toLowerCase().includes(fallback.toLowerCase()));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const modelNameIdx = getColumnIndex('Model Name', ['model']);
    const companyIdx = getColumnIndex('Company Name', ['company', 'brand']);
    const priceIdx = getColumnIndex('Launched Price (USA)', ['price', 'usd']);
    const ramIdx = getColumnIndex('RAM', ['ram']);
    const batteryIdx = getColumnIndex('Battery Capacity', ['battery']);
    const screenIdx = getColumnIndex('Screen Size', ['screen', 'display']);
    const weightIdx = getColumnIndex('Mobile Weight', ['weight']);
    const yearIdx = getColumnIndex('Launched Year', ['year', 'launched']);
    const frontCameraIdx = getColumnIndex('Front Camera', ['front', 'camera']);
    const backCameraIdx = getColumnIndex('Back Camera', ['back', 'camera']);
    const storageIdx = getColumnIndex('Storage', ['storage', 'internal']);
    const processorIdx = getColumnIndex('Processor', ['processor']);
    const displayTypeIdx = getColumnIndex('Display Type', ['display type', 'screen type']);
    const refreshRateIdx = getColumnIndex('Refresh Rate', ['refresh', 'hz']);
    const resolutionIdx = getColumnIndex('Resolution', ['resolution']);

    // Helper to extract number
    const extractNumber = (str: string): number | null => {
      if (!str || str.trim() === '' || str.toLowerCase() === 'nan') return null;
      const cleaned = str
        .toString()
        .replace(/(USD|PKR|INR|CNY|AED|\$)/gi, '')
        .replace(/[$,\s]/g, '')
        .replace(/(mAh|GB|MP|g|inches|"|'|Hz|TB|MB)/gi, '');
      const match = cleaned.match(/(\d+\.?\d*)/);
      if (match && match[1]) {
        const num = parseFloat(String(match[1]));
        return isNaN(num) || num <= 0 ? null : num;
      }
      return null;
    };

    // Find models
    const foundModels: PhoneModel[] = [];
    const imageDir = join(projectRoot, 'public', 'mobile_images');

    for (const searchName of body.modelNames) {
      const searchNameLower = searchName.toLowerCase().trim();
      let found = false;

      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i];
        const values = currentLine
          ? parseCSVLine(currentLine).map((v) => v.replace(/^"|"$/g, '').trim())
          : [];

        if (values.length === 0 || values.length < headers.length) continue;

        const modelNameValue = modelNameIdx !== -1 ? values[modelNameIdx] : '';
        const currentModelName = (modelNameValue || '').toLowerCase();

        // Check if model name matches
        if (
          !currentModelName.includes(searchNameLower) &&
          !searchNameLower.includes(currentModelName)
        ) {
          continue;
        }

        // Extract values
        const phonePrice =
          priceIdx !== -1 && values[priceIdx] ? extractNumber(values[priceIdx]) : null;
        const phoneRam = ramIdx !== -1 && values[ramIdx] ? extractNumber(values[ramIdx]) : null;
        const phoneBattery =
          batteryIdx !== -1 && values[batteryIdx] ? extractNumber(values[batteryIdx]) : null;
        const phoneScreen =
          screenIdx !== -1 && values[screenIdx] ? extractNumber(values[screenIdx]) : null;
        const phoneWeight =
          weightIdx !== -1 && values[weightIdx] ? extractNumber(values[weightIdx]) : null;
        const phoneYear = yearIdx !== -1 && values[yearIdx] ? extractNumber(values[yearIdx]) : null;

        if (!phonePrice || !phoneRam || !phoneBattery || !phoneScreen || !phoneWeight || !phoneYear)
          continue;

        const modelName = modelNameValue || '' || 'Unknown Model';
        const companyValue = companyIdx !== -1 ? values[companyIdx] : '';
        const company = companyValue || '' || 'Unknown Brand';

        // Check for image
        const imageBaseName = modelName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_');
        const imageExtensions = ['.jpg', '.jpeg', '.png'];
        let imageUrl: string | undefined = undefined;
        for (const ext of imageExtensions) {
          const imagePath = join(imageDir, `${imageBaseName}${ext}`);
          if (existsSync(imagePath)) {
            imageUrl = `/mobile_images/${imageBaseName}${ext}`;
            break;
          }
        }

        // Calculate optional numeric properties, filtering out null values
        const getOptionalNumber = (idx: number): number | undefined => {
          return idx !== -1 && values[idx] ? extractNumber(values[idx]) || undefined : undefined;
        };

        foundModels.push({
          modelName,
          company,
          price: phonePrice,
          ram: phoneRam,
          battery: phoneBattery,
          screenSize: phoneScreen,
          weight: phoneWeight,
          year: phoneYear,
          frontCamera: getOptionalNumber(frontCameraIdx),
          backCamera: getOptionalNumber(backCameraIdx),
          storage: getOptionalNumber(storageIdx),
          processor: processorIdx !== -1 ? values[processorIdx] : undefined,
          displayType: displayTypeIdx !== -1 ? values[displayTypeIdx] : undefined,
          refreshRate: getOptionalNumber(refreshRateIdx),
          resolution: resolutionIdx !== -1 ? values[resolutionIdx] : undefined,
          imageUrl,
        });

        found = true;
        break;
      }

      if (!found) {
        throw createError({
          statusCode: 404,
          statusMessage: `Model "${searchName}" not found in dataset`,
        });
      }
    }

    // Calculate comparison metrics
    const prices = foundModels.map((m) => m.price);
    const rams = foundModels.map((m) => m.ram);
    const batteries = foundModels.map((m) => m.battery);
    const screens = foundModels.map((m) => m.screenSize);
    const weights = foundModels.map((m) => m.weight);
    const years = foundModels.map((m) => m.year);

    const calculateStats = (values: number[]) => ({
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      diff: Math.max(...values) - Math.min(...values),
    });

    const comparison = {
      price: calculateStats(prices),
      ram: calculateStats(rams),
      battery: calculateStats(batteries),
      screenSize: calculateStats(screens),
      weight: calculateStats(weights),
      year: calculateStats(years),
    };

    // Find differences
    type Difference = { field: string; best: string; worst: string; difference: string };
    const differences: Difference[] = [];

    const priceBest = foundModels.find((m) => m.price === comparison.price.min)?.modelName || '';
    const priceWorst = foundModels.find((m) => m.price === comparison.price.max)?.modelName || '';
    if (priceBest && priceWorst && priceBest !== priceWorst) {
      differences.push({
        field: 'Price',
        best: priceBest,
        worst: priceWorst,
        difference: `$${comparison.price.diff.toFixed(0)}`,
      });
    }

    const ramBest = foundModels.find((m) => m.ram === comparison.ram.max)?.modelName || '';
    const ramWorst = foundModels.find((m) => m.ram === comparison.ram.min)?.modelName || '';
    if (ramBest && ramWorst && ramBest !== ramWorst) {
      differences.push({
        field: 'RAM',
        best: ramBest,
        worst: ramWorst,
        difference: `${comparison.ram.diff.toFixed(1)} GB`,
      });
    }

    const batteryBest =
      foundModels.find((m) => m.battery === comparison.battery.max)?.modelName || '';
    const batteryWorst =
      foundModels.find((m) => m.battery === comparison.battery.min)?.modelName || '';
    if (batteryBest && batteryWorst && batteryBest !== batteryWorst) {
      differences.push({
        field: 'Battery',
        best: batteryBest,
        worst: batteryWorst,
        difference: `${comparison.battery.diff.toFixed(0)} mAh`,
      });
    }

    return {
      models: foundModels,
      comparison,
      differences,
    };
  } catch (error: unknown) {
    const err = error as any;
    if (err && err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to compare models: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
