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

interface SimilarModel {
  model: PhoneModel;
  similarityScore: number;
}

interface SimilarResponse {
  models: SimilarModel[];
  query: {
    ram: number;
    battery: number;
    screenSize: number;
    weight: number;
    year: number;
    price?: number;
  };
}

interface SimilarRequest {
  ram: number;
  battery: number;
  screenSize: number;
  weight: number;
  year: number;
  price?: number;
  limit?: number;
}

export default defineEventHandler(async (event: H3Event): Promise<SimilarResponse> => {
  try {
    const body = await readBody<SimilarRequest>(event);

    // Validate required fields
    if (!body.ram || !body.battery || !body.screenSize || !body.weight || !body.year) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: ram, battery, screenSize, weight, year',
      });
    }

    const limit = body.limit || 10;

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
      ? parseCSVLine(headerLineValue).map((h) => h.replace(/^\"|\"$/g, '').trim())
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
    const extractNumber = (str: string | undefined): number | null => {
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

    // Calculate similarity scores
    const similarModels: SimilarModel[] = [];
    const imageDir = join(projectRoot, 'public', 'mobile_images');

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i] ?? '').map((v) =>
        (v ?? '').replace(/^"|"$/g, '').trim()
      );

      if (values.length < headers.length) continue;

      // Extract values
      const phonePrice = priceIdx !== -1 ? extractNumber(values[priceIdx] ?? '') : null;
      const phoneRam = ramIdx !== -1 ? extractNumber(values[ramIdx] ?? '') : null;
      const phoneBattery = batteryIdx !== -1 ? extractNumber(values[batteryIdx] ?? '') : null;
      const phoneScreen = screenIdx !== -1 ? extractNumber(values[screenIdx] ?? '') : null;
      const phoneWeight = weightIdx !== -1 ? extractNumber(values[weightIdx] ?? '') : null;
      const phoneYear = yearIdx !== -1 ? extractNumber(values[yearIdx] ?? '') : null;

      if (!phonePrice || !phoneRam || !phoneBattery || !phoneScreen || !phoneWeight || !phoneYear)
        continue;

      // Filter out unrealistic values
      if (phoneRam < 1 || phoneRam > 24) continue;
      if (phoneBattery < 1000 || phoneBattery > 10000) continue;
      if (phoneScreen < 3 || phoneScreen > 10) continue;
      if (phoneWeight < 50 || phoneWeight > 500) continue;
      if (phoneYear < 2015 || phoneYear > 2025) continue;

      // Calculate similarity score (0-100, higher = more similar)
      const ramDiff = Math.abs(phoneRam - body.ram) / Math.max(body.ram, phoneRam, 1);
      const batteryDiff =
        Math.abs(phoneBattery - body.battery) / Math.max(body.battery, phoneBattery, 1);
      const screenDiff =
        Math.abs(phoneScreen - body.screenSize) / Math.max(body.screenSize, phoneScreen, 0.1);
      const weightDiff =
        Math.abs(phoneWeight - body.weight) / Math.max(body.weight, phoneWeight, 1);
      const yearDiff = Math.abs(phoneYear - body.year) / 5; // Normalize by 5 years

      let priceDiff = 0;
      if (body.price) {
        priceDiff = Math.abs(phonePrice - body.price) / Math.max(body.price, phonePrice, 1);
      }

      // Weighted similarity (price is more important if provided)
      const weights = body.price
        ? { ram: 0.15, battery: 0.15, screen: 0.15, weight: 0.1, year: 0.1, price: 0.35 }
        : { ram: 0.2, battery: 0.2, screen: 0.2, weight: 0.15, year: 0.15, price: 0 };

      const similarityScore =
        100 *
        (1 -
          (ramDiff * weights.ram +
            batteryDiff * weights.battery +
            screenDiff * weights.screen +
            weightDiff * weights.weight +
            yearDiff * weights.year +
            priceDiff * weights.price));

      // Only include models with reasonable similarity (>= 50%)
      if (similarityScore >= 50) {
        const modelName = (modelNameIdx !== -1 ? values[modelNameIdx] : '') || 'Unknown Model';
        const company = (companyIdx !== -1 ? values[companyIdx] : '') || 'Unknown Brand';

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

        similarModels.push({
          model: {
            modelName,
            company,
            price: phonePrice,
            ram: phoneRam,
            battery: phoneBattery,
            screenSize: phoneScreen,
            weight: phoneWeight,
            year: phoneYear,
            frontCamera:
              frontCameraIdx !== -1
                ? extractNumber(values[frontCameraIdx] ?? '') ?? undefined
                : undefined,
            backCamera:
              backCameraIdx !== -1
                ? extractNumber(values[backCameraIdx] ?? '') ?? undefined
                : undefined,
            storage:
              storageIdx !== -1 ? extractNumber(values[storageIdx] ?? '') ?? undefined : undefined,
            processor: processorIdx !== -1 ? values[processorIdx] || undefined : undefined,
            displayType: displayTypeIdx !== -1 ? values[displayTypeIdx] || undefined : undefined,
            refreshRate:
              refreshRateIdx !== -1
                ? extractNumber(values[refreshRateIdx] ?? '') ?? undefined
                : undefined,
            resolution: resolutionIdx !== -1 ? values[resolutionIdx] || undefined : undefined,
            imageUrl,
          },
          similarityScore: Math.max(0, Math.min(100, similarityScore)),
        });
      }
    }

    // Sort by similarity score (highest first) and limit
    similarModels.sort((a, b) => b.similarityScore - a.similarityScore);
    const limited = similarModels.slice(0, limit);

    return {
      models: limited,
      query: {
        ram: body.ram,
        battery: body.battery,
        screenSize: body.screenSize,
        weight: body.weight,
        year: body.year,
        price: body.price,
      },
    };
  } catch (error: unknown) {
    if ((error as any)?.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to find similar models: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
