const { algoliasearch, instantsearch } = window;

// Get configuration from environment or global config
// Note: In production, these should be set via environment variables
const ALGOLIA_APP_ID = window.ALGOLIA_APP_ID || 'RU9T2K7NNV'; // Public demo app ID
const ALGOLIA_API_KEY =
  window.ALGOLIA_SEARCH_KEY || '27436de04794c3a5adcc603039723f51'; // Public search-only key

const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

const search = instantsearch({
  indexName: 'phones_index_npm_test',
  searchClient,
  future: { preserveSharedStateOnUnmount: true },
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => {
        const modelName =
          hit.gsmarena?.model_name || hit.model_name || 'Unknown Model';
        const url = hit.gsmarena?.url || '#';
        const ipRating = hit.gsmarena?.build?.ip_rating || 'Not specified';
        const displayType = hit.gsmarena?.display?.type || 'Not specified';
        const chipset = hit.gsmarena?.performance?.chipset || 'Not specified';

        // Create reliable inline SVG image (no external dependencies)
        const imageUrl = `data:image/svg+xml;base64,${btoa(
          `<svg width="120" height="90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#4f46e5"/><text x="60" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle">📱</text></svg>`
        )}`;

        return html`
          <article>
            <img
              src="${imageUrl}"
              alt="${modelName}"
              style="width: 120px; height: 90px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
              onerror="this.src='https://via.placeholder.com/120x90/667eea/ffffff?text=${encodeURIComponent(
                modelName.substring(0, 10)
              )}'; this.onerror=null;"
            />
            <div>
              <h1>
                ${components.Highlight({
                  hit,
                  attribute: 'gsmarena.model_name',
                })}
              </h1>
              <p>
                <strong>Display:</strong> ${displayType.substring(
                  0,
                  50
                )}${displayType.length > 50 ? '...' : ''}
              </p>
              <p><strong>Chipset:</strong> ${chipset}</p>
              <p><strong>IP Rating:</strong> ${ipRating}</p>
              <p>
                <strong>GSMArena:</strong>
                <a href="${url}" target="_blank" style="color: #3b82f6;"
                  >View Details</a
                >
              </p>
              <p style="font-size: 0.8rem; color: #6b7280;">
                <strong>ID:</strong> ${hit.objectID}
              </p>
            </div>
          </article>
        `;
      },
    },
  }),
  instantsearch.widgets.configure({
    hitsPerPage: 8,
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();
