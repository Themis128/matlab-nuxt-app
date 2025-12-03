# Algolia Setup Guide

## Overview

Algolia is a powerful search-as-a-service platform used in this application for indexing and searching mobile phone data. This guide will walk you through setting up an Algolia account and obtaining the necessary API keys.

## Step 1: Create an Algolia Account

1. **Visit Algolia**: Go to [https://www.algolia.com/](https://www.algolia.com/)

2. **Sign Up**:
   - Click "Get Started Free" or "Sign Up"
   - Choose your preferred sign-up method:
     - Email and password
     - Google account
     - GitHub account

3. **Verify Your Account**:
   - Check your email for a verification link
   - Click the link to activate your account

## Step 2: Create Your First Application

1. **Dashboard Access**:
   - After verification, you'll be taken to your Algolia dashboard
   - Click "Create your first application" or "New Application"

2. **Application Setup**:
   - **Application Name**: Choose a descriptive name (e.g., "Mobile Finder Search")
   - **Data Center**: Select the closest region to your users:
     - US-West (Oregon) - Recommended for global apps
     - US-East (Virginia)
     - EU-West (Ireland) - Good for European users
     - AP-South (Mumbai) - Good for Asian users

3. **Choose Plan**:
   - Select "Free" plan to get started (1M records, 10k searches/month)
   - You can upgrade later as your needs grow

4. **Create Application**:
   - Click "Create Application"
   - Wait for the application to be provisioned

## Step 3: Get Your API Keys

After your application is created, you'll see the API keys section:

### Application ID

- **Location**: Dashboard → Application → API Keys
- **Format**: 10-character alphanumeric string (e.g., `ABCDEFGHIJ`)
- **Usage**: Identifies your Algolia application
- **Security**: Can be exposed in frontend code (not sensitive)

### Search-Only API Key

- **Location**: Dashboard → Application → API Keys → "Search-Only API Key"
- **Format**: 32-character alphanumeric string
- **Usage**: Used for search operations (safe to expose in frontend)
- **Security**: Can be exposed in frontend code (not sensitive)

### Admin API Key (⚠️ Keep Secret!)

- **Location**: Dashboard → Application → API Keys → "Admin API Key"
- **Format**: 32-character alphanumeric string
- **Usage**: Used for indexing, updating, and deleting records
- **Security**: ⚠️ **NEVER expose this key in frontend code**
- **Storage**: Keep in server-side environment variables only

## Step 4: Configure Environment Variables

Create or update your environment files with the Algolia credentials:

### For Development (.env)

```bash
# Algolia Configuration
ALGOLIA_APP_ID=your_application_id_here
ALGOLIA_ADMIN_API_KEY=your_admin_api_key_here
ALGOLIA_INDEX=mobiles_index
```

### For Production (.env.production)

```bash
# Algolia Configuration
ALGOLIA_APP_ID=your_application_id_here
ALGOLIA_ADMIN_API_KEY=your_admin_api_key_here
ALGOLIA_INDEX=mobiles_index
```

### For Docker (.env)

```bash
# Algolia Configuration
ALGOLIA_APP_ID=your_application_id_here
ALGOLIA_ADMIN_API_KEY=your_admin_api_key_here
ALGOLIA_INDEX=mobiles_index
```

## Step 5: Test Your Setup

1. **Verify API Keys**:

   ```bash
   # Test with curl (replace with your keys)
   curl -X POST "https://your_app_id.algolia.net/1/indexes/your_index/query" \
        -H "X-Algolia-API-Key: your_search_api_key" \
        -H "X-Algolia-Application-Id: your_app_id" \
        -d '{"query": ""}'
   ```

2. **Test the Application**:
   - Start your development server
   - Try the Algolia indexing script:
   ```bash
   cd scripts/algolia
   node index_records.js --dry-run
   ```

## Step 6: Security Best Practices

### 🔐 API Key Security

- **Admin API Key**: Never commit to version control, only use server-side
- **Search API Key**: Safe to expose in frontend, read-only access
- **Application ID**: Safe to expose, identifies your app

### 🔒 Environment Variables

- Use different keys for development, staging, and production
- Rotate keys regularly (at least annually)
- Monitor API usage in Algolia dashboard

### 🛡️ Access Controls

- Limit Admin API key usage to necessary operations
- Use Search API key for frontend searches
- Implement rate limiting on your endpoints

## Step 7: Usage in This Application

### CLI Indexing Script

```bash
# Index records from a JSON file
node scripts/algolia/index_records.js --file data/mobiles.json --index mobiles_index

# Dry run to validate data
node scripts/algolia/index_records.js --file data/mobiles.json --dry-run
```

### API Endpoint

```bash
# Index records via API
curl -X POST http://localhost:3000/api/algolia/index \
     -H "Content-Type: application/json" \
     -d '{"indexName": "mobiles_index", "objects": [...]}'
```

## Step 8: Monitoring & Billing

1. **Dashboard Monitoring**:
   - Visit your Algolia dashboard regularly
   - Monitor search performance and usage
   - Set up alerts for quota limits

2. **Billing**:
   - Free tier: 1M records, 10k searches/month
   - Paid plans start at $29/month for higher limits
   - Monitor usage to avoid unexpected charges

## Troubleshooting

### Common Issues:

1. **"Invalid Application ID"**:
   - Double-check your Application ID
   - Ensure it's copied correctly (no extra spaces)

2. **"Invalid API Key"**:
   - Verify you're using the correct key type (Search vs Admin)
   - Check for typos in the API key

3. **"Index not found"**:
   - The index is created automatically on first use
   - Check your index name in environment variables

4. **Rate Limiting**:
   - Free tier has search limits
   - Implement caching to reduce API calls

### Getting Help:

- Algolia Documentation: [https://www.algolia.com/doc/](https://www.algolia.com/doc/)
- Community Forum: [https://discourse.algolia.com/](https://discourse.algolia.com/)
- Support: Available on paid plans

## Next Steps

Once you have your Algolia credentials configured:

1. Run the indexing script to populate your search index
2. Test search functionality in your application
3. Monitor performance and adjust as needed
4. Consider implementing search analytics for insights

---

**Note**: Keep your Admin API key secure and never expose it in client-side code. The Search API key and Application ID are safe to use in frontend applications.
