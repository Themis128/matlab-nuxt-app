import { algoliasearch } from 'algoliasearch';
import type { AlgoliaRecord } from '../../../types/algolia';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
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
  const appId = config?.ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
  const apiKey = config?.ALGOLIA_ADMIN_API_KEY || process.env.ALGOLIA_ADMIN_API_KEY;

  if (!appId || !apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Algolia credentials not configured on server',
    });
  }

  // At this point we've asserted `appId` and `apiKey` are present, so they are `string`.
  const client = algoliasearch(String(appId), String(apiKey));

  let objects: any[] | undefined = body?.objects;
  if (!Array.isArray(objects)) {
    // fetch sample dataset if objects not provided
    const datasetRequest = await fetch(
      'https://dashboard.algolia.com/api/1/sample_datasets?type=movie'
    );
    const resJson = await datasetRequest.json();
    if (Array.isArray(resJson)) {
      objects = resJson;
    } else if (resJson && Array.isArray(resJson.hits)) {
      objects = resJson.hits;
    } else if (Array.isArray(resJson[0]?.objects)) {
      objects = resJson[0].objects;
    } else {
      const direct = await fetch(
        'https://raw.githubusercontent.com/algolia/doc-code-samples/master/sample-datasets/movies.json'
      );
      objects = await direct.json();
    }
  }

  if (!objects || objects.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No objects to index' });
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
    if (typeof obj.title !== 'string' || obj.title.length === 0) return false;
    if (typeof obj.price !== 'number' || Number.isNaN(obj.price)) return false;
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
    const res = await client.saveObjects({ indexName, objects: records });
    const resAny = res as any;
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
    throw createError({ statusCode: 500, statusMessage: String(err) });
  }
});
