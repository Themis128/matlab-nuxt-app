<template>
  <div id="app">
    <header class="header">
      <h1 class="header-title">
        <a href="/">Vue InstantSearch App</a>
      </h1>
      <p class="header-subtitle">
        using
        <a href="https://github.com/algolia/vue-instantsearch">
          Vue InstantSearch
        </a>
      </p>
    </header>

    <div class="container">
      <div class="search-panel">
        <div class="search-panel__filters">
          <ais-refinement-list attribute="company" />
          <ais-menu attribute="brand_segment" />
          <ais-sort-by :items="sortByOptions" />
          <ais-hits-per-page :items="hitsPerPageOptions" />
          <ais-current-refinements />
        </div>

        <div class="search-panel__results">
          <ais-instant-search-ssr
            :search-client="searchClient"
            index-name="phones_index_npm_test"
          >
            <ais-search-box />
            <ais-hits>
              <template #item="{ item }">
                <PhoneHit :hit="item" />
              </template>
            </ais-hits>
            <ais-pagination />
            <ais-configure :hits-per-page.camel="8" />
            <ais-stats />
          </ais-instant-search-ssr>
        </div>
        <head>
          <title>Mobile Search | Vue InstantSearch SSR</title>
          <meta
            name="description"
            content="Search and filter mobile phones with advanced Algolia InstantSearch features. SSR enabled for SEO."
          />
          <meta
            property="og:title"
            content="Mobile Search | Vue InstantSearch SSR"
          />
          <meta
            property="og:description"
            content="Search and filter mobile phones with advanced Algolia InstantSearch features. SSR enabled for SEO."
          />
          <meta property="og:type" content="website" />
        </head>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// Algolia Analytics: Track search events
onMounted(() => {
  if (window && window.algoliasearch) {
    const originalSearch = searchClient.search;
    searchClient.search = function (queries, options) {
      if (window && window.__algoliaEvents) {
        window.__algoliaEvents.push({
          type: 'search',
          queries,
          options,
          timestamp: Date.now(),
        });
      }
      return originalSearch.call(this, queries, options);
    };
  }
});
import { ref } from 'vue';
import algoliasearch from 'algoliasearch/lite';
import PhoneHit from './components/PhoneHit.vue';

const searchClient = algoliasearch(
  'RU9T2K7NNV',
  '27436de04794c3a5adcc603039723f51'
);

const sortByOptions = [
  { value: 'phones_index_npm_test', label: 'Default' },
  { value: 'phones_index_npm_test_price_asc', label: 'Price Ascending' },
  { value: 'phones_index_npm_test_price_desc', label: 'Price Descending' },
  { value: 'phones_index_npm_test_ram_desc', label: 'RAM Descending' },
];

const hitsPerPageOptions = [
  { value: 8, label: '8 per page' },
  { value: 16, label: '16 per page' },
  { value: 32, label: '32 per page' },
];
</script>

<style scoped>
/* Component specific styles */
</style>
