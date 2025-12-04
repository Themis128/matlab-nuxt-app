import { readFileSync } from 'fs';
import { join } from 'path';

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
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

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

    // Parse dataset
    const models: PhoneModel[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i] ?? '').map((v) => v.replace(/^"|"$/g, '').trim());

      if (values.length < headers.length) continue;

      const phonePrice = priceIdx !== -1 ? extractNumber(values[priceIdx] ?? '') : null;
      const phoneRam = ramIdx !== -1 ? extractNumber(values[ramIdx] ?? '') : null;
      const phoneBattery = batteryIdx !== -1 ? extractNumber(values[batteryIdx] ?? '') : null;
      const phoneScreen = screenIdx !== -1 ? extractNumber(values[screenIdx] ?? '') : null;
      const phoneWeight = weightIdx !== -1 ? extractNumber(values[weightIdx] ?? '') : null;
      const phoneYear = yearIdx !== -1 ? extractNumber(values[yearIdx] ?? '') : null;

      if (!phonePrice || !phoneRam || !phoneBattery || !phoneScreen || !phoneWeight || !phoneYear)
        continue;

      const modelName = (modelNameIdx !== -1 ? values[modelNameIdx] : '') || 'Unknown Model';
      const companyName = (companyIdx !== -1 ? values[companyIdx] : '') || 'Unknown Brand';

      models.push({
        modelName,
        company: companyName,
        price: phonePrice,
        ram: phoneRam,
        battery: phoneBattery,
        screenSize: phoneScreen,
        weight: phoneWeight,
        year: phoneYear,
      });
    }

    // Calculate similarity scores
    const targetPrice = body.price || body.predictedPrice;
    const targetRam = body.ram || body.predictedRam;
    const targetBattery = body.battery || body.predictedBattery;
    const targetScreen = body.screen || body.screenSize;
    const targetWeight = body.weight;
    const targetYear = body.year;
    const targetCompany = body.company || body.predictedBrand;

    const scoredModels = models.map((model) => {
      let score = 0;
      let factors = 0;

      if (targetPrice !== undefined && targetPrice !== null) {
        const priceDiff = Math.abs(model.price - targetPrice) / targetPrice;
        score += (1 - Math.min(priceDiff, 1)) * 0.3;
        factors += 0.3;
      }

      if (targetRam !== undefined && targetRam !== null) {
        const ramDiff = Math.abs(model.ram - targetRam) / targetRam;
        score += (1 - Math.min(ramDiff, 1)) * 0.2;
        factors += 0.2;
      }

      if (targetBattery !== undefined && targetBattery !== null) {
        const batteryDiff = Math.abs(model.battery - targetBattery) / targetBattery;
        score += (1 - Math.min(batteryDiff, 1)) * 0.2;
        factors += 0.2;
      }

      if (targetScreen !== undefined && targetScreen !== null) {
        const screenDiff = Math.abs(model.screenSize - targetScreen) / targetScreen;
        score += (1 - Math.min(screenDiff, 1)) * 0.1;
        factors += 0.1;
      }

      if (targetWeight !== undefined && targetWeight !== null) {
        const weightDiff = Math.abs(model.weight - targetWeight) / targetWeight;
        score += (1 - Math.min(weightDiff, 1)) * 0.1;
        factors += 0.1;
      }

      if (targetYear !== undefined && targetYear !== null) {
        const yearDiff = Math.abs(model.year - targetYear);
        score += (1 - Math.min(yearDiff / 5, 1)) * 0.05;
        factors += 0.05;
      }

      if (targetCompany && model.company.toLowerCase() === targetCompany.toLowerCase()) {
        score += 0.05;
        factors += 0.05;
      }

      const similarityScore = factors > 0 ? score / factors : 0;

      return {
        ...model,
        similarityScore,
      };
    });

    // Find closest match
    scoredModels.sort((a, b) => b.similarityScore - a.similarityScore);
    const closest = scoredModels[0];

    if (!closest) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No matching model found',
      });
    }

    return {
      modelName: closest.modelName,
      company: closest.company,
      similarityScore: closest.similarityScore,
      price: closest.price,
      ram: closest.ram,
      battery: closest.battery,
      screenSize: closest.screenSize,
      weight: closest.weight,
      year: closest.year,
    };
  } catch (error: unknown) {
    if ((error as any)?.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to find closest model: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
