#!/usr/bin/env node
import { algoliasearch } from 'algoliasearch';
import fs from 'fs/promises';
import path from 'path';

console.log('Script started');

function usage() {
  console.log(
    'Usage: node index_records.js [--file <path/to/file.json>] [--index <index_name>] [--appId <ALGOLIA_APP_ID>] [--apiKey <ALGOLIA_ADMIN_API_KEY>] [--dry-run]\n'
  );
  console.log('Options:');
  console.log(
    '  --dry-run    Validate records and show what would be indexed without actually indexing'
  );
  console.log('  --help, -h   Show this help message');
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--file' || a === '-f') {
      opts.file = args[++i];
    } else if (a === '--index' || a === '-i') {
      opts.index = args[++i];
    } else if (a === '--appId') {
      opts.appId = args[++i];
    } else if (a === '--apiKey') {
      opts.apiKey = args[++i];
    } else if (a === '--dry-run') {
      opts.dryRun = true;
    } else if (a === '--help' || a === '-h') {
      usage();
    }
  }

  const appId = opts.appId || process.env.ALGOLIA_APP_ID;
  const apiKey = opts.apiKey || process.env.ALGOLIA_ADMIN_API_KEY;
  const indexName = opts.index || process.env.ALGOLIA_INDEX || 'movies_index';

  if (!opts.dryRun && (!appId || !apiKey)) {
    console.error(
      'Missing Algolia credentials. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY environment variables or pass --appId and --apiKey.'
    );
    process.exit(2);
  }

  const client = opts.dryRun ? null : algoliasearch(appId, apiKey);

  let records = null;

  if (opts.file) {
    const filePath = path.isAbsolute(opts.file) ? opts.file : path.join(process.cwd(), opts.file);
    console.log(`Reading local file ${filePath}`);
    const data = await fs.readFile(filePath, 'utf8');
    records = JSON.parse(data);
  } else {
    // fetch sample dataset from Algolia dashboard
    console.log('Fetching sample dataset of movies from Algolia dashboard');
    const datasetRequest = await fetch(
      'https://dashboard.algolia.com/api/1/sample_datasets?type=movie'
    );
    let resJson = null;
    if (datasetRequest.ok) {
      try {
        resJson = await datasetRequest.json();
      } catch (err) {
        console.warn(
          'Failed to parse JSON from Algolia sample_datasets endpoint, falling back to raw dataset URL',
          err
        );
        resJson = null;
      }
    } else {
      console.warn('Algolia sample_datasets endpoint returned', datasetRequest.status);
    }
    // resJson may include a list or the objects directly depending on the endpoint
    // The sample API returns an array in the 0th element or as a root array
    // The `movies` may be at `resJson.data` or as `resJson[0]` - adjust accordingly
    if (Array.isArray(resJson)) {
      // In many cases the dataset list returns an array of lists; pick first that looks like movie records
      records = resJson;
    } else if (resJson && Array.isArray(resJson.hits)) {
      records = resJson.hits;
    } else {
      // try to fetch the sample data via example endpoint used by the dashboard
      // The 'sample_datasets' endpoint returns arrays with objects that contain `objects` property in some versions
      if (Array.isArray(resJson?.[0]?.objects)) {
        records = resJson[0].objects;
      } else {
        // fallback: try a dataset of movies via the raw sample dataset url
        const direct = await fetch(
          'https://raw.githubusercontent.com/algolia/doc-code-samples/master/sample-datasets/movies.json'
        );
        if (!direct.ok) throw new Error('Failed to fetch sample dataset from fallback URL');
        records = await direct.json();
      }
    }
  }

  if (!records) {
    console.error('No records found to index');
    process.exit(3);
  }
  // If records is an object keyed by id/model name, turn into an array
  if (!Array.isArray(records) && typeof records === 'object') {
    records = Object.keys(records).map((k) => {
      const v = records[k];
      if (!v.objectID) v.objectID = k;
      return v;
    });
  }

  if (!records || records.length === 0) {
    console.error('No records found to index');
    process.exit(3);
  }
  // Normalize objects to ensure objectID is present
  // If `objectID` doesn't exist, try `id` or `object_id` or `movie_id` or generate a UUID
  function ensureObjectID(obj, i) {
    if (obj.objectID) return obj;
    if (obj.id) {
      obj.objectID = String(obj.id);
      return obj;
    }
    if (obj.object_id) {
      obj.objectID = String(obj.object_id);
      return obj;
    }
    if (obj.movie_id) {
      obj.objectID = String(obj.movie_id);
      return obj;
    }
    obj.objectID = `manual-${i}`;
    return obj;
  }

  records = records.map((r, i) => ensureObjectID(r, i));

  // Validation function to ensure minimal fields exist for Algolia records
  function isValidAlgoliaRecord(obj) {
    if (!obj) return false;
    if (!obj.objectID || typeof obj.objectID !== 'string') return false;
    // Support both movie data (title) and phone data (model_name)
    const hasTitle = obj.title && typeof obj.title === 'string';
    const hasModelName = obj.model_name && typeof obj.model_name === 'string';
    if (!hasTitle && !hasModelName) return false;
    // Price is optional - only validate if present
    if (obj.price !== undefined && (typeof obj.price !== 'number' || Number.isNaN(obj.price))) {
      return false;
    }
    return true;
  }

  // Identify invalid records
  const invalidIndices = [];
  const validatedRecords = [];
  for (let i = 0; i < records.length; i++) {
    if (isValidAlgoliaRecord(records[i])) validatedRecords.push(records[i]);
    else invalidIndices.push(i);
  }

  if (invalidIndices.length > 0) {
    if (opts.dryRun) {
      console.warn(
        `DRY RUN: ${invalidIndices.length} invalid records found at indices: ${invalidIndices.join(', ')}`
      );
    } else {
      console.error(`Invalid records found at indices: ${invalidIndices.join(', ')}`);
      process.exit(4);
    }
  }

  // Save objects in batches of 1000 to avoid too-large uploads
  const batchSize = 1000;

  if (opts.dryRun) {
    console.log(
      `DRY RUN: Would index ${records.length} records into index '${indexName}' in batches of ${batchSize}`
    );
    console.log('Sample records that would be indexed:');
    const sampleSize = Math.min(5, records.length);
    for (let i = 0; i < sampleSize; i++) {
      console.log(`  Record ${i}: ${JSON.stringify(validatedRecords[i], null, 2)}`);
    }
    if (validatedRecords.length > sampleSize) {
      console.log(`  ... and ${validatedRecords.length - sampleSize} more records`);
    }
    console.log('DRY RUN: No actual indexing performed');
    return;
  }

  console.log(
    `Indexing ${validatedRecords.length} records into index '${indexName}' in batches of ${batchSize}...`
  );

  let pos = 0;
  while (pos < validatedRecords.length) {
    const chunk = validatedRecords.slice(pos, pos + batchSize);
    console.log(`Uploading records ${pos} - ${pos + chunk.length - 1}`);
    const res = await client.saveObjects({ indexName, objects: chunk });
    const resAny = res;
    // res may contain taskID(s): either as res.taskID or res[0].taskID
    if (typeof client.waitForTask === 'function') {
      if (Array.isArray(resAny)) {
        for (const r of resAny) {
          if (r?.taskID) await client.waitForTask({ indexName, taskID: r.taskID });
        }
      } else if (resAny?.taskID) {
        await client.waitForTask({ indexName, taskID: resAny.taskID });
      }
    }
    pos += batchSize;
  }

  console.log('Successfully indexed objects!');
}

main().catch((err) => {
  console.error('Error indexing records:', err);
  process.exit(99);
});
