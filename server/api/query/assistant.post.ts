// callPythonAPI not currently used but may be needed for future enhancements

interface QueryRequest {
  query: string;
  context?: string;
}

interface QueryResponse {
  answer: string;
  products?: Array<{
    id: number;
    model_name: string;
    company: string;
    price: number;
    image_url?: string;
  }>;
  sources?: string[];
  confidence?: number;
}

import { setCorsHeaders } from '../../utils/cors';

export default defineEventHandler(async (event: any) => {
  // Set secure CORS headers
  setCorsHeaders(event);

  // Handle preflight requests
  if (getMethod(event) === 'OPTIONS') {
    return { ok: true };
  }

  try {
    const body: QueryRequest = await readBody(event);

    if (!body.query || body.query.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Query is required',
      });
    }

    const query = body.query.toLowerCase().trim();

    // Analyze query to determine intent and extract parameters
    const queryAnalysis = analyzeQuery(query);

    let response: QueryResponse;

    switch (queryAnalysis.intent) {
      case 'price_search':
        response = await handlePriceSearch(queryAnalysis, event);
        break;
      case 'comparison':
        response = await handleComparison(queryAnalysis, event);
        break;
      case 'recommendation':
        response = await handleRecommendation(queryAnalysis, event);
        break;
      case 'specification':
        response = await handleSpecification(queryAnalysis, event);
        break;
      default:
        response = await handleGeneralQuery(queryAnalysis, event);
    }

    return response;
  } catch (error: unknown) {
    console.error('Error in query assistant:', error);

    if ((error as any)?.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process query',
    });
  }
});

function analyzeQuery(query: string) {
  const lowerQuery = query.toLowerCase();

  // Extract price range
  const priceMatch = lowerQuery.match(/under\s+\$?(\d+)|below\s+\$?(\d+)|less\s+than\s+\$?(\d+)/);
  const maxPrice = priceMatch
    ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || '0', 10)
    : null;

  // Extract brands
  const brands = [
    'apple',
    'samsung',
    'google',
    'oneplus',
    'xiaomi',
    'huawei',
    'oppo',
    'vivo',
    'realme',
    'nokia',
  ];
  const mentionedBrands = brands.filter((brand) => lowerQuery.includes(brand));

  // Extract features
  const features = {
    camera: lowerQuery.includes('camera') || lowerQuery.includes('photo'),
    gaming: lowerQuery.includes('gaming') || lowerQuery.includes('game'),
    battery: lowerQuery.includes('battery') || lowerQuery.includes('long lasting'),
    display: lowerQuery.includes('display') || lowerQuery.includes('screen'),
    performance: lowerQuery.includes('fast') || lowerQuery.includes('performance'),
  };

  // Determine intent
  let intent = 'general';
  if (lowerQuery.includes('vs') || lowerQuery.includes('compare')) {
    intent = 'comparison';
  } else if (lowerQuery.includes('best') || lowerQuery.includes('recommend')) {
    intent = 'recommendation';
  } else if (maxPrice || lowerQuery.includes('price') || lowerQuery.includes('cost')) {
    intent = 'price_search';
  } else if (Object.values(features).some((f) => f)) {
    intent = 'specification';
  }

  return {
    intent,
    maxPrice,
    brands: mentionedBrands,
    features,
    originalQuery: query,
  };
}

async function handlePriceSearch(analysis: any, _event: any): Promise<QueryResponse> {
  try {
    // Search for products within price range
    const searchParams = new URLSearchParams();
    if (analysis.maxPrice) {
      searchParams.append('maxPrice', analysis.maxPrice.toString());
    }
    if (analysis.brands.length > 0) {
      searchParams.append('brand', analysis.brands[0]); // Use first brand
    }
    searchParams.append('limit', '5');

    const searchResult = await $fetch(`/api/dataset/search?${searchParams.toString()}`);

    let answer = `Based on your budget`;
    if (analysis.maxPrice) {
      answer += ` of $${analysis.maxPrice}`;
    }
    answer += `, here are some excellent options:`;

    const typedSearchResult = searchResult as { models?: any[] };
    const products =
      typedSearchResult.models?.slice(0, 3).map((model: any, index: number) => ({
        id: index + 1,
        model_name: model.modelName,
        company: model.company,
        price: model.price,
        image_url: model.imageUrl,
      })) || [];

    if (products.length > 0 && products[0]) {
      const firstProduct = products[0];
      answer += ` The ${firstProduct.company} ${firstProduct.model_name} offers great value at $${firstProduct.price}.`;
      if (products[1]) {
        const secondProduct = products[1];
        answer += ` The ${secondProduct.company} ${secondProduct.model_name} is another solid choice at $${secondProduct.price}.`;
      }
    } else {
      answer =
        "I couldn't find specific products matching your criteria, but I'd recommend checking our device browser for the latest options.";
    }

    return {
      answer,
      products,
      sources: ['Product Database', 'Price Analysis'],
      confidence: 85,
    };
  } catch (error) {
    console.error('Error in price search:', error);
    return {
      answer:
        "I'm having trouble accessing the product database right now. Please try using our device browser to find phones in your price range.",
      sources: ['Error Fallback'],
      confidence: 0,
    };
  }
}

async function handleComparison(analysis: any, _event: any): Promise<QueryResponse> {
  try {
    // Extract phone models from query
    const query = analysis.originalQuery.toLowerCase();
    const phoneModels = [];

    // Look for specific models
    if (query.includes('iphone') && query.includes('samsung')) {
      phoneModels.push('iPhone', 'Samsung Galaxy');
    } else if (query.includes('pixel') && query.includes('oneplus')) {
      phoneModels.push('Google Pixel', 'OnePlus');
    }

    let answer = 'When comparing these devices, here are the key differences: ';

    if (query.includes('iphone') && query.includes('samsung')) {
      answer +=
        'iPhones excel in ecosystem integration, long-term software support (5-6 years), and consistent performance optimization. Samsung flagships offer more customization options, better multitasking, superior zoom cameras, and often introduce cutting-edge display technology first. Choose iPhone for simplicity and longevity, Samsung for features and flexibility.';
    } else {
      answer +=
        "Both devices have their strengths. I'd recommend checking our comparison tool for detailed side-by-side specifications and performance metrics.";
    }

    // Try to find actual products for comparison
    const searchResult = await $fetch('/api/dataset/search?limit=10');
    const typedSearchResult = searchResult as { models?: any[] };
    const products =
      typedSearchResult.models?.slice(0, 2).map((model: any, index: number) => ({
        id: index + 1,
        model_name: model.modelName,
        company: model.company,
        price: model.price,
        image_url: model.imageUrl,
      })) || [];

    return {
      answer,
      products,
      sources: ['Comparison Database', 'Expert Reviews'],
      confidence: 90,
    };
  } catch (error) {
    console.error('Error in comparison:', error);
    return {
      answer:
        'For detailed comparisons, I recommend using our comparison tool where you can see side-by-side specifications and performance metrics.',
      sources: ['Error Fallback'],
      confidence: 0,
    };
  }
}

async function handleRecommendation(analysis: any, _event: any): Promise<QueryResponse> {
  try {
    // Build search parameters based on features
    const searchParams = new URLSearchParams();

    if (analysis.features.gaming) {
      searchParams.append('minRam', '8');
      searchParams.append('sortBy', 'ram');
    } else if (analysis.features.camera) {
      searchParams.append('sortBy', 'price');
      searchParams.append('sortOrder', 'desc');
    } else if (analysis.maxPrice) {
      searchParams.append('maxPrice', analysis.maxPrice.toString());
    }

    if (analysis.brands.length > 0) {
      searchParams.append('brand', analysis.brands[0]);
    }

    searchParams.append('limit', '5');

    const searchResult = await $fetch(`/api/dataset/search?${searchParams.toString()}`);

    let answer = 'Based on your requirements, I recommend: ';

    const typedSearchResult = searchResult as { models?: any[] };
    const products =
      typedSearchResult.models?.slice(0, 3).map((model: any, index: number) => ({
        id: index + 1,
        model_name: model.modelName,
        company: model.company,
        price: model.price,
        image_url: model.imageUrl,
      })) || [];

    if (products.length > 0 && products[0]) {
      const firstProduct = products[0];
      const firstModel = typedSearchResult.models?.[0];
      if (analysis.features.gaming) {
        answer += `For gaming, the ${firstProduct.company} ${firstProduct.model_name} with ${firstModel?.ram || 'N/A'}GB RAM offers excellent performance.`;
      } else if (analysis.features.camera) {
        answer += `For photography, the ${firstProduct.company} ${firstProduct.model_name} delivers outstanding camera quality.`;
      } else {
        answer += `The ${firstProduct.company} ${firstProduct.model_name} offers the best overall value at $${firstProduct.price}.`;
      }
    } else {
      answer =
        "I'd recommend exploring our device browser to find phones that match your specific needs and preferences.";
    }

    return {
      answer,
      products,
      sources: ['Recommendation Engine', 'User Reviews'],
      confidence: 80,
    };
  } catch (error) {
    console.error('Error in recommendation:', error);
    return {
      answer:
        "I'd recommend exploring our device browser and comparison tools to find phones that match your specific needs.",
      sources: ['Error Fallback'],
      confidence: 0,
    };
  }
}

async function handleSpecification(analysis: any, _event: any): Promise<QueryResponse> {
  try {
    let answer = "Here's what you should know about ";

    if (analysis.features.camera) {
      answer +=
        'camera specifications: Look for phones with larger main sensors (1/1.3" or bigger), optical image stabilization, and multiple lenses for versatility. Night mode and computational photography features are also important.';
    } else if (analysis.features.gaming) {
      answer +=
        'gaming performance: Prioritize phones with flagship processors (Snapdragon 8 Gen 3, A17 Pro), 8GB+ RAM, high refresh rate displays (120Hz+), and good cooling systems.';
    } else if (analysis.features.battery) {
      answer +=
        'battery life: Look for 4000mAh+ capacity, efficient processors, and fast charging (30W+). Software optimization also plays a crucial role in battery performance.';
    } else if (analysis.features.display) {
      answer +=
        'display quality: Consider OLED panels for better contrast, high refresh rates (90Hz+), good brightness (800+ nits), and color accuracy. Screen size preference varies by user.';
    } else {
      answer +=
        'smartphone specifications: Key factors include processor performance, RAM capacity, storage options, camera quality, battery life, and display characteristics.';
    }

    return {
      answer,
      sources: ['Technical Specifications', 'Performance Benchmarks'],
      confidence: 95,
    };
  } catch (error) {
    console.error('Error in specification query:', error);
    return {
      answer:
        'For detailed specifications, please check our device browser where you can compare technical details across different models.',
      sources: ['Error Fallback'],
      confidence: 0,
    };
  }
}

async function handleGeneralQuery(_analysis: any, _event: any): Promise<QueryResponse> {
  return {
    answer:
      "I can help you find information about mobile devices. Try asking about specific phones, price ranges, comparisons, or features you're interested in. You can also use our device browser and comparison tools for detailed information.",
    sources: ['General Knowledge'],
    confidence: 70,
  };
}
