import { callPythonAPI } from '../../utils/python-api';

export default defineEventHandler(async (event) => {
  // Set CORS headers
  setHeader(event, 'Access-Control-Allow-Origin', '*');
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const query = getQuery(event);
    const search = (query.search as string) || '';
    const brand = (query.brand as string) || '';
    const ramMin = (query.ramMin as string) || '';
    const ramMax = (query.ramMax as string) || '';
    const page = parseInt((query.page as string) || '1');
    const limit = parseInt((query.limit as string) || '12');

    // Build query parameters, only include non-empty values
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (brand) params.append('brand', brand);
    if (ramMin) params.append('ramMin', ramMin);
    if (ramMax) params.append('ramMax', ramMax);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    // Call Python API to get products from database
    const result = await callPythonAPI<{
      products: Array<{
        id: number;
        company: string;
        model: string;
        weight: string;
        ram: string;
        front_camera: string;
        back_camera: string;
        processor: string;
        battery: string;
        screen_size: string;
        price_pakistan: number | null;
        price_india: number | null;
        price_china: number | null;
        price_usa: number | null;
        price_dubai: number | null;
        launched_year: number;
        image_url: string;
        created_at: string;
      }>;
      total: number;
      page: number;
      limit: number;
    }>(
      `/api/products?${params.toString()}`,
      null,
      event,
      'GET'
    );

    if (!result) {
      throw new Error('Python API is not available');
    }

    return result;
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    throw error;
  }
});
