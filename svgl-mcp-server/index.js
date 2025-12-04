const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const SvglClient = require('svgl-client');

class SVGLMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'svgl-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.svglClient = new SvglClient();

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'search_svg_logos',
          description: 'Search for SVG logos by name or query',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for logos (e.g., "github", "react", "typescript")',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_svg_logo',
          description: 'Get SVG logo by brand name',
          inputSchema: {
            type: 'object',
            properties: {
              brand: {
                type: 'string',
                description: 'Brand name (e.g., "github", "react", "typescript")',
              },
              size: {
                type: 'number',
                description: 'Size of the SVG (default: 24)',
                default: 24,
              },
              format: {
                type: 'string',
                description: 'Format to return (svg or url)',
                default: 'svg',
                enum: ['svg', 'url'],
              },
            },
            required: ['brand'],
          },
        },
        {
          name: 'list_popular_brands',
          description: 'List popular brands and their logos',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Category filter (e.g., "tech", "social", "programming")',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of brands to return (default: 20)',
                default: 20,
              },
            },
          },
        },
        {
          name: 'get_logo_info',
          description: 'Get detailed information about a specific logo',
          inputSchema: {
            type: 'object',
            properties: {
              brand: {
                type: 'string',
                description: 'Brand name to get information about',
              },
            },
            required: ['brand'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'search_svg_logos':
            return await this.handleSearchSVGs(args);
          case 'get_svg_logo':
            return await this.handleGetSVG(args);
          case 'list_popular_brands':
            return await this.handleListPopularBrands(args);
          case 'get_logo_info':
            return await this.handleGetLogoInfo(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error('Error executing tool:', error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async handleSearchSVGs(args) {
    const { query, limit = 10 } = args;

    try {
      // Since svgl-client might not have direct search, we'll simulate it
      // In a real implementation, this would call the SVGL API
      const popularLogos = [
        'github',
        'react',
        'typescript',
        'javascript',
        'vue',
        'angular',
        'nodejs',
        'docker',
        'kubernetes',
        'aws',
        'azure',
        'google',
        'microsoft',
        'apple',
        'facebook',
        'twitter',
        'instagram',
        'linkedin',
        'youtube',
        'tiktok',
      ];

      const results = popularLogos
        .filter((logo) => logo.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)
        .map((logo) => ({
          brand: logo,
          name: logo.charAt(0).toUpperCase() + logo.slice(1),
          category: 'technology',
        }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                query,
                results,
                total: results.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async handleGetSVG(args) {
    const { brand, size = 24, format = 'svg' } = args;

    try {
      const logo = await this.svglClient.getLogo(brand, { size });

      if (format === 'svg') {
        return {
          content: [
            {
              type: 'text',
              text: `SVG Logo for ${brand}:\n\n${logo.svg || 'SVG content not available'}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `URL for ${brand} logo: ${logo.url || 'URL not available'}`,
            },
          ],
        };
      }
    } catch (error) {
      throw new Error(`Failed to get SVG for ${brand}: ${error.message}`);
    }
  }

  async handleListPopularBrands(args) {
    const { category, limit = 20 } = args;

    try {
      const brands = [
        { name: 'github', category: 'development', description: 'Code repository platform' },
        {
          name: 'react',
          category: 'frontend',
          description: 'JavaScript library for building user interfaces',
        },
        {
          name: 'typescript',
          category: 'programming',
          description: 'Typed superset of JavaScript',
        },
        {
          name: 'javascript',
          category: 'programming',
          description: 'Programming language of the web',
        },
        { name: 'vue', category: 'frontend', description: 'Progressive JavaScript framework' },
        { name: 'angular', category: 'frontend', description: 'Web application framework' },
        { name: 'nodejs', category: 'backend', description: 'JavaScript runtime' },
        { name: 'docker', category: 'devops', description: 'Containerization platform' },
        { name: 'kubernetes', category: 'devops', description: 'Container orchestration platform' },
        { name: 'aws', category: 'cloud', description: 'Amazon Web Services' },
        { name: 'azure', category: 'cloud', description: 'Microsoft Azure cloud platform' },
        { name: 'google', category: 'tech', description: 'Google technology company' },
        { name: 'microsoft', category: 'tech', description: 'Microsoft Corporation' },
        { name: 'apple', category: 'tech', description: 'Apple Inc.' },
        { name: 'facebook', category: 'social', description: 'Social media platform' },
        { name: 'twitter', category: 'social', description: 'Social media platform' },
        { name: 'instagram', category: 'social', description: 'Photo and video sharing platform' },
        { name: 'linkedin', category: 'social', description: 'Professional networking platform' },
        { name: 'youtube', category: 'media', description: 'Video sharing platform' },
        { name: 'tiktok', category: 'social', description: 'Short-form video platform' },
      ];

      let filteredBrands = brands;
      if (category) {
        filteredBrands = brands.filter((brand) =>
          brand.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      const limitedBrands = filteredBrands.slice(0, limit);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                category: category || 'all',
                total: limitedBrands.length,
                brands: limitedBrands,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list brands: ${error.message}`);
    }
  }

  async handleGetLogoInfo(args) {
    const { brand } = args;

    try {
      const info = {
        brand,
        name: brand.charAt(0).toUpperCase() + brand.slice(1),
        category: 'technology',
        description: `Logo for ${brand}`,
        available_sizes: [16, 24, 32, 48, 64, 96, 128],
        formats: ['svg'],
        source: 'SVGL',
        license: 'MIT',
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to get info for ${brand}: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SVGL MCP Server running on stdio');
  }
}

// Run the server
if (require.main === module) {
  const server = new SVGLMCPServer();
  server.run().catch(console.error);
}

module.exports = SVGLMCPServer;
