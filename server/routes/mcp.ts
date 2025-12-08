import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import type { PlanningSession } from '@/types/planning';

// In-memory storage for planning sessions (replace with database in production)
const _planningSessions = new Map<string, PlanningSession>();

function createServer() {
  const server = new Server(
    {
      name: 'nuxt-planning',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // ============================================================================
  // RESOURCES - Context for language models
  // ============================================================================

  server.setRequestHandler('resources/list' as any, async () => {
    return {
      resources: [
        {
          uri: 'resource://nuxt-planning/templates',
          name: 'Planning Templates',
          description:
            'Available project planning templates for different types of Nuxt applications',
          mimeType: 'application/json',
        },
        {
          uri: 'resource://nuxt-planning/architecture-patterns',
          name: 'Architecture Patterns',
          description: 'Recommended architecture patterns for Nuxt 4 applications',
          mimeType: 'application/json',
        },
        {
          uri: 'resource://nuxt-planning/checklists',
          name: 'Planning Checklists',
          description: 'Comprehensive checklists for planning Nuxt 4 applications',
          mimeType: 'application/json',
        },
      ],
    };
  });

  server.setRequestHandler('resources/read' as any, async (request) => {
    const { uri } = request.params;

    if (uri === 'resource://nuxt-planning/templates') {
      const templates = [
        {
          name: 'E-commerce Application',
          projectType: 'e-commerce',
          description: 'Full-featured online store with product catalog, cart, and checkout',
          recommendedFeatures: ['authentication', 'database', 'payments', 'email', 'seo'],
          architecturePatterns: ['Layered Architecture', 'API Gateway Pattern'],
          estimatedTimeline: '8-12 weeks',
        },
        {
          name: 'SaaS Application',
          projectType: 'saas',
          description: 'Multi-tenant software as a service platform',
          recommendedFeatures: ['authentication', 'database', 'api', 'payments', 'analytics'],
          architecturePatterns: ['Multi-tenant Architecture', 'Microservices'],
          estimatedTimeline: '12-16 weeks',
        },
        {
          name: 'Content Blog',
          projectType: 'blog',
          description: 'Content-focused blog with SEO optimization',
          recommendedFeatures: ['database', 'seo', 'analytics'],
          architecturePatterns: ['Static Site Generation', 'Content-First'],
          estimatedTimeline: '2-4 weeks',
        },
        {
          name: 'Portfolio Site',
          projectType: 'portfolio',
          description: 'Personal or professional portfolio showcase',
          recommendedFeatures: ['ui', 'seo', 'analytics'],
          architecturePatterns: ['Static Site Generation', 'JAMstack'],
          estimatedTimeline: '1-2 weeks',
        },
        {
          name: 'Admin Dashboard',
          projectType: 'dashboard',
          description: 'Data visualization and management dashboard',
          recommendedFeatures: ['authentication', 'database', 'api', 'analytics'],
          architecturePatterns: ['Layered Architecture', 'REST API'],
          estimatedTimeline: '6-8 weeks',
        },
      ];

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(templates, null, 2),
          },
        ],
      };
    }

    if (uri === 'resource://nuxt-planning/architecture-patterns') {
      const patterns = [
        {
          name: 'Layered Architecture',
          description:
            'Traditional three-tier architecture with presentation, business logic, and data layers',
          useCases: ['Enterprise applications', 'Complex business logic', 'Traditional web apps'],
          technologies: ['Nuxt Pages', 'API Routes', 'Prisma/Drizzle'],
          complexity: 'medium',
          scalability: 'high',
          maintainability: 'high',
        },
        {
          name: 'JAMstack',
          description:
            'JavaScript, APIs, and Markup - pre-rendered static sites with dynamic capabilities',
          useCases: ['Blogs', 'Documentation', 'Marketing sites'],
          technologies: ['Nuxt Content', 'Static Generation', 'Edge Functions'],
          complexity: 'low',
          scalability: 'high',
          maintainability: 'high',
        },
        {
          name: 'API Gateway Pattern',
          description: 'Single entry point for all API requests with routing and composition',
          useCases: ['Microservices', 'Multiple backends', 'Complex integrations'],
          technologies: ['Nuxt Server Routes', 'h3', 'API Composition'],
          complexity: 'high',
          scalability: 'high',
          maintainability: 'medium',
        },
        {
          name: 'Serverless Architecture',
          description: 'Function-based architecture with on-demand execution',
          useCases: ['Variable traffic', 'Cost optimization', 'Event-driven apps'],
          technologies: ['Nitro', 'Edge Runtime', 'Serverless Functions'],
          complexity: 'medium',
          scalability: 'high',
          maintainability: 'medium',
        },
      ];

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(patterns, null, 2),
          },
        ],
      };
    }

    if (uri === 'resource://nuxt-planning/checklists') {
      const checklists = {
        'Project Setup': [
          { id: 'init', title: 'Initialize Nuxt 4 project', priority: 'high' },
          {
            id: 'typescript',
            title: 'Configure TypeScript',
            priority: 'high',
          },
          {
            id: 'env',
            title: 'Set up environment variables',
            priority: 'high',
          },
          {
            id: 'eslint',
            title: 'Configure ESLint and Prettier',
            priority: 'medium',
          },
        ],
        Architecture: [
          {
            id: 'patterns',
            title: 'Choose architecture pattern',
            priority: 'high',
          },
          {
            id: 'structure',
            title: 'Design directory structure',
            priority: 'high',
          },
          { id: 'api', title: 'Plan API structure', priority: 'high' },
          {
            id: 'state',
            title: 'Choose state management solution',
            priority: 'medium',
          },
        ],
        Features: [
          {
            id: 'auth',
            title: 'Implement authentication',
            priority: 'high',
          },
          { id: 'db', title: 'Set up database', priority: 'high' },
          { id: 'ui', title: 'Choose UI framework', priority: 'medium' },
          {
            id: 'testing',
            title: 'Set up testing framework',
            priority: 'medium',
          },
        ],
        Deployment: [
          {
            id: 'hosting',
            title: 'Choose hosting provider',
            priority: 'high',
          },
          { id: 'ci-cd', title: 'Set up CI/CD pipeline', priority: 'high' },
          {
            id: 'monitoring',
            title: 'Configure monitoring',
            priority: 'medium',
          },
          {
            id: 'backup',
            title: 'Plan backup strategy',
            priority: 'medium',
          },
        ],
      };

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(checklists, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  });

  // ============================================================================
  // TOOLS - Operations for AI models
  // ============================================================================

  server.setRequestHandler('tools/list' as any, async () => {
    return {
      tools: [
        {
          name: 'initialize_planning',
          description: 'Start a new planning session for a Nuxt 4 application',
          inputSchema: {
            type: 'object',
            properties: {
              projectName: {
                type: 'string',
                description: 'Name of the project',
              },
              projectType: {
                type: 'string',
                enum: [
                  'e-commerce',
                  'saas',
                  'blog',
                  'portfolio',
                  'dashboard',
                  'api',
                  'documentation',
                  'marketing',
                  'custom',
                ],
                description: 'Type of project',
              },
              features: {
                type: 'array',
                items: { type: 'string' },
                description: 'Desired features',
              },
              scale: {
                type: 'string',
                enum: ['small', 'medium', 'large', 'enterprise'],
                description: 'Project scale',
              },
            },
            required: ['projectName', 'projectType'],
          },
        },
        {
          name: 'get_architecture_recommendations',
          description: 'Get architecture pattern recommendations based on project requirements',
          inputSchema: {
            type: 'object',
            properties: {
              projectType: {
                type: 'string',
                description: 'Type of project',
              },
              scale: {
                type: 'string',
                enum: ['small', 'medium', 'large', 'enterprise'],
                description: 'Project scale',
              },
              features: {
                type: 'array',
                items: { type: 'string' },
                description: 'Required features',
              },
            },
            required: ['projectType', 'scale'],
          },
        },
        {
          name: 'update_checklist',
          description: 'Update the completion status of a planning checklist item',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Checklist category',
              },
              itemId: {
                type: 'string',
                description: 'Item ID to update',
              },
              completed: {
                type: 'boolean',
                description: 'Completion status',
              },
              notes: {
                type: 'string',
                description: 'Optional notes',
              },
            },
            required: ['category', 'itemId', 'completed'],
          },
        },
        {
          name: 'get_planning_status',
          description: 'Get the current planning status and progress',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'suggest_next_steps',
          description: 'Get AI-powered suggestions for next planning steps',
          inputSchema: {
            type: 'object',
            properties: {
              currentPhase: {
                type: 'string',
                enum: [
                  'initialization',
                  'requirements',
                  'architecture',
                  'setup',
                  'development',
                  'testing',
                  'deployment',
                ],
                description: 'Current planning phase',
              },
            },
            required: ['currentPhase'],
          },
        },
        {
          name: 'generate_documentation',
          description: 'Generate planning documentation in various formats',
          inputSchema: {
            type: 'object',
            properties: {
              sections: {
                type: 'array',
                items: { type: 'string' },
                description: 'Sections to include',
              },
              format: {
                type: 'string',
                enum: ['markdown', 'json', 'html'],
                default: 'markdown',
                description: 'Output format',
              },
            },
          },
        },
      ],
    };
  });

  server.setRequestHandler('tools/call' as any, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'initialize_planning': {
          const initParams = z
            .object({
              projectName: z.string(),
              projectType: z.enum([
                'e-commerce',
                'saas',
                'blog',
                'portfolio',
                'dashboard',
                'api',
                'documentation',
                'marketing',
                'custom',
              ]),
              features: z.array(z.string()).optional(),
              scale: z.enum(['small', 'medium', 'large', 'enterprise']).optional(),
            })
            .parse(args);

          const result = await $fetch('/api/mcp/initialize-planning', {
            query: initParams,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_architecture_recommendations': {
          const archParams = z
            .object({
              projectType: z.string(),
              scale: z.enum(['small', 'medium', 'large', 'enterprise']),
              features: z.array(z.string()).optional(),
            })
            .parse(args);

          const result = await $fetch('/api/mcp/get-architecture-recommendations', {
            query: archParams,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'update_checklist': {
          const checklistParams = z
            .object({
              category: z.string(),
              itemId: z.string(),
              completed: z.boolean(),
              notes: z.string().optional(),
            })
            .parse(args);

          const result = await $fetch('/api/mcp/update-checklist', {
            method: 'POST',
            body: checklistParams,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'get_planning_status': {
          const result = await $fetch('/api/mcp/get-planning-status');

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'suggest_next_steps': {
          const stepsParams = z
            .object({
              currentPhase: z.enum([
                'initialization',
                'requirements',
                'architecture',
                'setup',
                'development',
                'testing',
                'deployment',
              ]),
            })
            .parse(args);

          const result = await $fetch('/api/mcp/suggest-next-steps', {
            query: stepsParams,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'generate_documentation': {
          const docParams = z
            .object({
              sections: z.array(z.string()).optional(),
              format: z.enum(['markdown', 'json', 'html']).default('markdown'),
            })
            .parse(args);

          const result = await $fetch('/api/mcp/generate-documentation', {
            query: docParams,
          });

          return {
            content: [
              {
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  // ============================================================================
  // PROMPTS - Reusable templates
  // ============================================================================

  server.setRequestHandler('prompts/list' as any, async () => {
    return {
      prompts: [
        {
          name: 'create_new_project_plan',
          description: 'Guided workflow for creating a comprehensive Nuxt 4 project plan',
          arguments: [
            {
              name: 'projectName',
              description: 'Name of your project',
              required: true,
            },
            {
              name: 'projectType',
              description: 'Type of project',
              required: true,
            },
          ],
        },
        {
          name: 'review_architecture_decisions',
          description: 'Review and validate architecture decisions for your Nuxt 4 project',
          arguments: [
            {
              name: 'decisions',
              description: "Describe the architecture decisions you've made",
              required: true,
            },
          ],
        },
      ],
    };
  });

  server.setRequestHandler('prompts/get' as any, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'create_new_project_plan') {
      const { projectName, projectType } = z
        .object({
          projectName: z.string(),
          projectType: z.enum([
            'e-commerce',
            'saas',
            'blog',
            'portfolio',
            'dashboard',
            'api',
            'documentation',
            'marketing',
            'custom',
          ]),
        })
        .parse(args);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `I want to create a comprehensive plan for a new Nuxt 4 project called "${projectName}" of type "${projectType}". Please help me:

1. Initialize the planning session

2. Recommend appropriate architecture patterns

3. Suggest necessary features and integrations

4. Create a development timeline

5. Generate planning documentation

Start by initializing the planning session with appropriate defaults for a ${projectType} project.`,
            },
          },
        ],
      };
    }

    if (name === 'review_architecture_decisions') {
      const { decisions } = z
        .object({
          decisions: z.string(),
        })
        .parse(args);

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please review these architecture decisions for my Nuxt 4 project and provide feedback:

${decisions}

Please analyze:

1. Alignment with Nuxt 4 best practices

2. Scalability considerations

3. Potential issues or bottlenecks

4. Alternative approaches

5. Recommendations for improvement`,
            },
          },
        ],
      };
    }

    throw new Error(`Unknown prompt: ${name}`);
  });

  return server;
}

// Create server instance once (singleton pattern)
let mcpServerInstance: ReturnType<typeof createServer> | null = null;

function _getServerInstance() {
  if (!mcpServerInstance) {
    mcpServerInstance = createServer();
  }
  return mcpServerInstance;
}

export default defineEventHandler(async (event: any) => {
  // Handle browser requests with HTML documentation
  const acceptHeader = getHeader(event, 'accept') || '';
  if (acceptHeader.includes('text/html') && getMethod(event) === 'GET') {
    setHeader(event, 'Content-Type', 'text/html; charset=utf-8');
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Nuxt 4 Planning MCP Server</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #00DC82; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    .section { margin: 30px 0; }
  </style>
</head>
<body>
  <h1>🚀 Nuxt 4 Planning MCP Server</h1>
  <p>This is the Model Context Protocol server for Nuxt 4 app planning.</p>

  <div class="section">
    <h2>Available Tools</h2>
    <ul>
      <li><code>initialize_planning</code> - Start a new planning session</li>
      <li><code>get_architecture_recommendations</code> - Get architecture recommendations</li>
      <li><code>update_checklist</code> - Update planning checklist</li>
      <li><code>get_planning_status</code> - Get current planning status</li>
      <li><code>suggest_next_steps</code> - Get next step suggestions</li>
      <li><code>generate_documentation</code> - Generate planning docs</li>
    </ul>
  </div>

  <div class="section">
    <h2>Configuration</h2>
    <p>Add this to your AI assistant's MCP configuration:</p>
    <pre>{
  "mcpServers": {
    "nuxt-planning": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}</pre>
  </div>
</body>
</html>
    `;
  }

  // Handle MCP protocol requests (JSON-RPC)
  // Manually implement MCP protocol handling
  try {
    // Get request body
    const body = await readBody(event).catch(() => null);

    if (!body || typeof body !== 'object') {
      setHeader(event, 'Content-Type', 'application/json');
      return {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32600, message: 'Invalid Request' },
      };
    }

    const { jsonrpc, method, params, id } = body as {
      jsonrpc?: string;
      method?: string;
      params?: unknown;
      id?: string | number;
    };

    if (jsonrpc !== '2.0' || !method) {
      setHeader(event, 'Content-Type', 'application/json');
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        error: { code: -32600, message: 'Invalid Request' },
      };
    }

    // Manually handle MCP methods by directly implementing the logic
    // This bypasses the Server's schema validation which is causing issues
    let result: unknown;

    try {
      if (method === 'tools/list') {
        result = {
          tools: [
            {
              name: 'initialize_planning',
              description: 'Start a new planning session for a Nuxt 4 application',
              inputSchema: {
                type: 'object',
                properties: {
                  projectName: { type: 'string', description: 'Name of the project' },
                  projectType: {
                    type: 'string',
                    enum: [
                      'e-commerce',
                      'saas',
                      'blog',
                      'portfolio',
                      'dashboard',
                      'api',
                      'documentation',
                      'marketing',
                      'custom',
                    ],
                    description: 'Type of project',
                  },
                  features: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Desired features',
                  },
                  scale: {
                    type: 'string',
                    enum: ['small', 'medium', 'large', 'enterprise'],
                    description: 'Project scale',
                  },
                },
                required: ['projectName', 'projectType'],
              },
            },
            {
              name: 'get_architecture_recommendations',
              description: 'Get architecture pattern recommendations based on project requirements',
              inputSchema: {
                type: 'object',
                properties: {
                  projectType: { type: 'string', description: 'Type of project' },
                  scale: {
                    type: 'string',
                    enum: ['small', 'medium', 'large', 'enterprise'],
                    description: 'Project scale',
                  },
                  features: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Required features',
                  },
                },
                required: ['projectType', 'scale'],
              },
            },
            {
              name: 'update_checklist',
              description: 'Update the completion status of a planning checklist item',
              inputSchema: {
                type: 'object',
                properties: {
                  category: { type: 'string', description: 'Checklist category' },
                  itemId: { type: 'string', description: 'Item ID to update' },
                  completed: { type: 'boolean', description: 'Completion status' },
                  notes: { type: 'string', description: 'Optional notes' },
                },
                required: ['category', 'itemId', 'completed'],
              },
            },
            {
              name: 'get_planning_status',
              description: 'Get the current planning status and progress',
              inputSchema: { type: 'object', properties: {} },
            },
            {
              name: 'suggest_next_steps',
              description: 'Get AI-powered suggestions for next planning steps',
              inputSchema: {
                type: 'object',
                properties: {
                  currentPhase: {
                    type: 'string',
                    enum: [
                      'initialization',
                      'requirements',
                      'architecture',
                      'setup',
                      'development',
                      'testing',
                      'deployment',
                    ],
                    description: 'Current planning phase',
                  },
                },
                required: ['currentPhase'],
              },
            },
            {
              name: 'generate_documentation',
              description: 'Generate planning documentation in various formats',
              inputSchema: {
                type: 'object',
                properties: {
                  sections: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Sections to include',
                  },
                  format: {
                    type: 'string',
                    enum: ['markdown', 'json', 'html'],
                    default: 'markdown',
                    description: 'Output format',
                  },
                },
              },
            },
          ],
        };
      } else if (method === 'resources/list') {
        result = {
          resources: [
            {
              uri: 'resource://nuxt-planning/templates',
              name: 'Planning Templates',
              description:
                'Available project planning templates for different types of Nuxt applications',
              mimeType: 'application/json',
            },
            {
              uri: 'resource://nuxt-planning/architecture-patterns',
              name: 'Architecture Patterns',
              description: 'Recommended architecture patterns for Nuxt 4 applications',
              mimeType: 'application/json',
            },
            {
              uri: 'resource://nuxt-planning/checklists',
              name: 'Planning Checklists',
              description: 'Comprehensive checklists for planning Nuxt 4 applications',
              mimeType: 'application/json',
            },
          ],
        };
      } else if (method === 'prompts/list') {
        result = {
          prompts: [
            {
              name: 'create_new_project_plan',
              description: 'Guided workflow for creating a comprehensive Nuxt 4 project plan',
              arguments: [
                { name: 'projectName', description: 'Name of your project', required: true },
                { name: 'projectType', description: 'Type of project', required: true },
              ],
            },
            {
              name: 'review_architecture_decisions',
              description: 'Review and validate architecture decisions for your Nuxt 4 project',
              arguments: [
                {
                  name: 'decisions',
                  description: "Describe the architecture decisions you've made",
                  required: true,
                },
              ],
            },
          ],
        };
      } else if (method === 'tools/call') {
        // For tool calls, delegate to the API endpoints
        const toolParams = params as { name: string; arguments: Record<string, unknown> };
        if (!toolParams?.name || !toolParams.arguments) {
          throw new Error('Invalid tool call parameters');
        }

        // Call the appropriate API endpoint based on tool name
        const baseUrl = getRequestURL(event).origin;
        let apiResult: unknown;

        switch (toolParams.name) {
          case 'initialize_planning':
            apiResult = await $fetch(`${baseUrl}/api/mcp/initialize-planning`, {
              query: toolParams.arguments,
            });
            break;
          case 'get_architecture_recommendations':
            apiResult = await $fetch(`${baseUrl}/api/mcp/get-architecture-recommendations`, {
              query: toolParams.arguments,
            });
            break;
          case 'update_checklist':
            apiResult = await $fetch(`${baseUrl}/api/mcp/update-checklist`, {
              method: 'POST',
              body: toolParams.arguments,
            });
            break;
          case 'get_planning_status':
            apiResult = await $fetch(`${baseUrl}/api/mcp/get-planning-status`);
            break;
          case 'suggest_next_steps':
            apiResult = await $fetch(`${baseUrl}/api/mcp/suggest-next-steps`, {
              query: toolParams.arguments,
            });
            break;
          case 'generate_documentation':
            apiResult = await $fetch(`${baseUrl}/api/mcp/generate-documentation`, {
              query: toolParams.arguments,
            });
            break;
          default:
            throw new Error(`Unknown tool: ${toolParams.name}`);
        }

        result = {
          content: [
            {
              type: 'text',
              text: typeof apiResult === 'string' ? apiResult : JSON.stringify(apiResult, null, 2),
            },
          ],
        };
      } else if (method === 'resources/read') {
        const resourceParams = params as { uri: string };
        if (!resourceParams?.uri) {
          throw new Error('Missing uri parameter');
        }

        // Return resource content based on URI
        // This matches the logic in the server.setRequestHandler('resources/read')
        if (resourceParams.uri === 'resource://nuxt-planning/templates') {
          const templates = [
            {
              name: 'E-commerce Application',
              projectType: 'e-commerce',
              description: 'Full-featured online store with product catalog, cart, and checkout',
              recommendedFeatures: ['authentication', 'database', 'payments', 'email', 'seo'],
              architecturePatterns: ['Layered Architecture', 'API Gateway Pattern'],
              estimatedTimeline: '8-12 weeks',
            },
            {
              name: 'SaaS Application',
              projectType: 'saas',
              description: 'Multi-tenant software as a service platform',
              recommendedFeatures: ['authentication', 'database', 'api', 'payments', 'analytics'],
              architecturePatterns: ['Multi-tenant Architecture', 'Microservices'],
              estimatedTimeline: '12-16 weeks',
            },
            {
              name: 'Content Blog',
              projectType: 'blog',
              description: 'Content-focused blog with SEO optimization',
              recommendedFeatures: ['database', 'seo', 'analytics'],
              architecturePatterns: ['Static Site Generation', 'Content-First'],
              estimatedTimeline: '2-4 weeks',
            },
            {
              name: 'Portfolio Site',
              projectType: 'portfolio',
              description: 'Personal or professional portfolio showcase',
              recommendedFeatures: ['ui', 'seo', 'analytics'],
              architecturePatterns: ['Static Site Generation', 'JAMstack'],
              estimatedTimeline: '1-2 weeks',
            },
            {
              name: 'Admin Dashboard',
              projectType: 'dashboard',
              description: 'Data visualization and management dashboard',
              recommendedFeatures: ['authentication', 'database', 'api', 'analytics'],
              architecturePatterns: ['Layered Architecture', 'REST API'],
              estimatedTimeline: '6-8 weeks',
            },
          ];
          result = {
            contents: [
              {
                uri: resourceParams.uri,
                mimeType: 'application/json',
                text: JSON.stringify(templates, null, 2),
              },
            ],
          };
        } else {
          throw new Error(`Unknown resource: ${resourceParams.uri}`);
        }
      } else {
        setHeader(event, 'Content-Type', 'application/json');
        return {
          jsonrpc: '2.0',
          id: id ?? null,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
      }

      setHeader(event, 'Content-Type', 'application/json');
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        result,
      };
    } catch (handlerError) {
      console.error('MCP handler error:', handlerError);
      setHeader(event, 'Content-Type', 'application/json');
      return {
        jsonrpc: '2.0',
        id: id ?? null,
        error: {
          code: -32603,
          message: handlerError instanceof Error ? handlerError.message : 'Internal error',
        },
      };
    }
  } catch (error) {
    console.error('MCP server error:', error);
    setHeader(event, 'Content-Type', 'application/json');
    return {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
      },
    };
  }
});
