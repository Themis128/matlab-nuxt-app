import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getQuery, createError, defineEventHandler } from 'h3';
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

interface SearchResponse {
  models: PhoneModel[];
  totalCount: number;
  filteredCount: number;
  filters: {
    brands?: string[];
    priceRange?: { min: number; max: number };
    ramRange?: { min: number; max: number };
    batteryRange?: { min: number; max: number };
    screenRange?: { min: number; max: number };
    years?: number[];
    storageRange?: { min: number; max: number };
    processor?: string;
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default defineEventHandler(async (event: H3Event): Promise<SearchResponse> => {
  try {
    const query = getQuery(event);

    // Parse query parameters
    const brands = query.brand
      ? (Array.isArray(query.brand) ? query.brand : [query.brand]).map((b) => String(b))
      : undefined;
    const minPrice = query.minPrice ? parseFloat(String(query.minPrice)) : undefined;
    const maxPrice = query.maxPrice ? parseFloat(String(query.maxPrice)) : undefined;
    const minRam = query.minRam ? parseFloat(String(query.minRam)) : undefined;
    const maxRam = query.maxRam ? parseFloat(String(query.maxRam)) : undefined;
    const minBattery = query.minBattery ? parseFloat(String(query.minBattery)) : undefined;
    const maxBattery = query.maxBattery ? parseFloat(String(query.maxBattery)) : undefined;
    const minScreen = query.minScreen ? parseFloat(String(query.minScreen)) : undefined;
    const maxScreen = query.maxScreen ? parseFloat(String(query.maxScreen)) : undefined;
    const years = query.year
      ? (Array.isArray(query.year) ? query.year : [query.year]).map((y) => parseInt(String(y)))
      : undefined;
    const minStorage = query.minStorage ? parseFloat(String(query.minStorage)) : undefined;
    const maxStorage = query.maxStorage ? parseFloat(String(query.maxStorage)) : undefined;
    const processor = query.processor ? String(query.processor) : undefined;
    const sortBy = (query.sortBy as string) || 'price';
    const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'asc';
    const limit = parseInt(String(query.limit || '50'));
    const offset = parseInt(String(query.offset || '0'));

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
    const headerLine = lines[0] ?? '';
    const headers = parseCSVLine(headerLine).map((h) => h.replace(/^"|"$/g, '').trim());

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

    // Parse dataset and apply filters
    const models: PhoneModel[] = [];
    const imageDir = join(projectRoot, 'public', 'mobile_images');

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i] ?? '').map((v) => v.replace(/^"|"$/g, '').trim());

      if (values.length < headers.length) continue;

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
      const phoneStorage =
        storageIdx !== -1 && values[storageIdx] ? extractNumber(values[storageIdx]) : null;
      const phoneProcessor =
        processorIdx !== -1 && values[processorIdx] ? values[processorIdx].toLowerCase() : '';
      const companyRaw = companyIdx !== -1 && values[companyIdx] ? values[companyIdx] : '';
      const company = companyRaw.toLowerCase();

      // Skip if required fields are missing
      if (!phonePrice || !phoneRam || !phoneBattery || !phoneScreen || !phoneWeight || !phoneYear)
        continue;

      // Apply filters
      if (brands && brands.length > 0 && !brands.some((b) => company.includes(b.toLowerCase())))
        continue;
      if (minPrice !== undefined && phonePrice < minPrice) continue;
      if (maxPrice !== undefined && phonePrice > maxPrice) continue;
      if (minRam !== undefined && phoneRam < minRam) continue;
      if (maxRam !== undefined && phoneRam > maxRam) continue;
      if (minBattery !== undefined && phoneBattery < minBattery) continue;
      if (maxBattery !== undefined && phoneBattery > maxBattery) continue;
      if (minScreen !== undefined && phoneScreen < minScreen) continue;
      if (maxScreen !== undefined && phoneScreen > maxScreen) continue;
      if (years && years.length > 0 && !years.includes(phoneYear)) continue;
      if (minStorage !== undefined && (!phoneStorage || phoneStorage < minStorage)) continue;
      if (maxStorage !== undefined && (!phoneStorage || phoneStorage > maxStorage)) continue;
      if (processor && !phoneProcessor.includes(processor.toLowerCase())) continue;

      // Filter out unrealistic values
      if (phoneRam < 1 || phoneRam > 24) continue;
      if (phoneBattery < 1000 || phoneBattery > 10000) continue;
      if (phoneScreen < 3 || phoneScreen > 10) continue;
      if (phoneWeight < 50 || phoneWeight > 500) continue;
      if (phoneYear < 2015 || phoneYear > 2025) continue;

      const modelName = (modelNameIdx !== -1 ? values[modelNameIdx] : '') || 'Unknown Model';
      const companyName = (companyIdx !== -1 ? values[companyIdx] : '') || 'Unknown Brand';

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

      models.push({
        modelName,
        company: companyName,
        price: phonePrice,
        ram: phoneRam,
        battery: phoneBattery,
        screenSize: phoneScreen,
        weight: phoneWeight,
        year: phoneYear,
        frontCamera:
          frontCameraIdx !== -1 ? extractNumber(values[frontCameraIdx]) ?? undefined : undefined,
        backCamera:
          backCameraIdx !== -1 ? extractNumber(values[backCameraIdx]) ?? undefined : undefined,
        storage: phoneStorage ?? undefined,
        processor: processorIdx !== -1 ? values[processorIdx] || undefined : undefined,
        displayType: displayTypeIdx !== -1 ? values[displayTypeIdx] || undefined : undefined,
        refreshRate:
          refreshRateIdx !== -1 ? extractNumber(values[refreshRateIdx]) ?? undefined : undefined,
        resolution: resolutionIdx !== -1 ? values[resolutionIdx] || undefined : undefined,
        imageUrl,
      });
    }

    // Sort results
    models.sort((a, b) => {
      let aValue: number;
      let bValue: number;

      switch (sortBy) {
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'ram':
          aValue = a.ram;
          bValue = b.ram;
          break;
        case 'battery':
          aValue = a.battery;
          bValue = b.battery;
          break;
        case 'screen':
          aValue = a.screenSize;
          bValue = b.screenSize;
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        default:
          aValue = a.price;
          bValue = b.price;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    // Apply pagination
    const totalCount = models.length;
    const paginatedModels = models.slice(offset, offset + limit);

    return {
      models: paginatedModels,
      totalCount,
      filteredCount: totalCount,
      filters: {
        brands: brands,
        priceRange:
          minPrice !== undefined || maxPrice !== undefined
            ? { min: minPrice || 0, max: maxPrice || Infinity }
            : undefined,
        ramRange:
          minRam !== undefined || maxRam !== undefined
            ? { min: minRam || 0, max: maxRam || Infinity }
            : undefined,
        batteryRange:
          minBattery !== undefined || maxBattery !== undefined
            ? { min: minBattery || 0, max: maxBattery || Infinity }
            : undefined,
        screenRange:
          minScreen !== undefined || maxScreen !== undefined
            ? { min: minScreen || 0, max: maxScreen || Infinity }
            : undefined,
        years: years,
        storageRange:
          minStorage !== undefined || maxStorage !== undefined
            ? { min: minStorage || 0, max: maxStorage || Infinity }
            : undefined,
        processor: processor,
      },
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };
  } catch (error: unknown) {
    if ((error as any)?.statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to search models: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});
