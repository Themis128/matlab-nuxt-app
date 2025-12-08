import { algoliasearch } from 'algoliasearch';
import type { AlgoliaRecord } from '../../../types/algolia';

export default defineEventHandler(async (event: any) => {
  const body = await readBody(event);

  // Validate request body
  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request body',
    });
  }

  // use typed runtime config; `types/runtime.d.ts` declares the runtime shape
  const config = useRuntimeConfig();

  // Accept body with { indexName: string, objects: Array<object> }
  const indexName =
    body?.indexName || config?.ALGOLIA_INDEX || process.env.ALGOLIA_INDEX || 'movies_index';

  // Security: Only allow specific whitelisted index names to prevent unauthorized access
  const ALLOWED_INDICES = ['movies_index', 'mobiles_index', 'phones_index', 'products_index'];
  if (!ALLOWED_INDICES.includes(indexName)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid index name. Allowed indices: ${ALLOWED_INDICES.join(', ')}`,
    });
  }

  // Get credentials with preference for runtime config (more secure)
  const appId = config?.ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
  const apiKey = config?.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_ADMIN_API_KEY;

  // Validate credentials are present and properly formatted
  if (!appId || !apiKey) {
    console.error('[Algolia Index] Missing credentials');
    throw createError({
      statusCode: 500,
      statusMessage: 'Algolia credentials not configured on server',
    });
  }

  // Basic validation of credential format
  if (typeof appId !== 'string' || appId.length < 8) {
    console.error('[Algolia Index] Invalid App ID format');
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid Algolia App ID configuration',
    });
  }

  if (typeof apiKey !== 'string' || apiKey.length < 32) {
    console.error('[Algolia Index] Invalid API key format');
    throw createError({
      statusCode: 500,
      statusMessage: 'Invalid Algolia API key configuration',
    });
  }

  // At this point we've asserted `appId` and `apiKey` are present, so they are `string`.
  const client = algoliasearch(String(appId), String(apiKey));

  let objects: any[] | undefined = body?.objects;
  if (!Array.isArray(objects)) {
    // fetch sample dataset if objects not provided
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const datasetRequest = await fetch(
        'https://dashboard.algolia.com/api/1/sample_datasets?type=movie',
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const resJson = await datasetRequest.json();
      if (Array.isArray(resJson)) {
        objects = resJson;
      } else if (resJson && Array.isArray(resJson.hits)) {
        objects = resJson.hits;
      } else if (Array.isArray(resJson[0]?.objects)) {
        objects = resJson[0].objects;
      } else {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 10000);

        try {
          const direct = await fetch(
            'https://raw.githubusercontent.com/algolia/doc-code-samples/master/sample-datasets/movies.json',
            { signal: controller2.signal }
          );
          clearTimeout(timeoutId2);
          objects = await direct.json();
        } catch (fetchError) {
          clearTimeout(timeoutId2);
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('Algolia sample dataset fetch timeout');
          }
          throw fetchError;
        }
      }
    } catch (fetchError) {
      console.error('Failed to fetch Algolia sample dataset:', fetchError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch sample dataset: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
      });
    }
  }

  if (!objects || objects.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No objects to index' });
  }

  // Limit number of objects to prevent abuse
  if (objects.length > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Too many objects to index (max 1000 per request)',
    });
  }

  // Normalize objectIDs
  objects = objects.map((r: any, i: number) => {
    if (!r.objectID) {
      if (r.id) r.objectID = String(r.id);
      else r.objectID = `manual-${i}`;
    }
    return r;
  });

  // Validate objects against the AlgoliaRecord runtime contract
  function isValidAlgoliaRecord(obj: any): obj is AlgoliaRecord {
    if (!obj) return false;
    if (typeof obj.objectID !== 'string' || obj.objectID.length === 0) return false;
    // Support both title (for movies) and model_name (for phones)
    const hasTitle = typeof obj.title === 'string' && obj.title.length > 0;
    const hasModelName = typeof obj.model_name === 'string' && obj.model_name.length > 0;
    if (!hasTitle && !hasModelName) return false;
    // Price is optional for phones but required for movies
    if (obj.price !== undefined && (typeof obj.price !== 'number' || Number.isNaN(obj.price))) {
      return false;
    }
    return true;
  }

  const invalidIndices: number[] = [];
  const records: AlgoliaRecord[] = [];
  (objects as any[]).forEach((o, i) => {
    if (isValidAlgoliaRecord(o)) {
      records.push(o);
    } else {
      invalidIndices.push(i);
    }
  });

  if (invalidIndices.length > 0) {
    throw createError({
      statusCode: 422,
      statusMessage: `Invalid algolia objects at indices: ${invalidIndices.join(',')}`,
    });
  }

  try {
    // In Algolia v5, saveObjects returns a response with taskID(s)
    const res = await client.saveObjects({ indexName, objects: records });
    const resAny = res as any;

    // Wait for indexing to complete if waitForTask is available
    // In v5, waitForTask might be on the client or need to be accessed differently
    if (typeof client.waitForTask === 'function') {
      if (Array.isArray(resAny)) {
        for (const r of resAny) {
          if (r?.taskID) {
            await client.waitForTask({ indexName, taskID: r.taskID });
          }
        }
      } else if (resAny?.taskID) {
        await client.waitForTask({ indexName, taskID: resAny.taskID });
      }
    }

    return { success: true, indexed: records.length };
  } catch (err) {
    console.error('Algolia indexing error:', err);
    throw createError({
      statusCode: 500,
      statusMessage: `Algolia indexing failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
});
