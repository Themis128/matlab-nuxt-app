import { z } from 'zod';

const querySchema = z.object({
  sections: z.array(z.string()).optional().default(['all']),
  format: z.enum(['markdown', 'json', 'html']).default('markdown'),
});

export default defineEventHandler(async (event: any) => {
  const query = await getQuery(event);
  const { sections, format } = querySchema.parse(query);

  const documentation = await generateDocumentation(sections);

  switch (format) {
    case 'json':
      return documentation;
    case 'html':
      return generateHTML(documentation);
    case 'markdown':
    default:
      return generateMarkdown(documentation);
  }
});

async function generateDocumentation(sections: string[]) {
  const includeAll = sections.includes('all');

  return {
    projectOverview:
      includeAll || sections.includes('overview')
        ? {
            title: 'Project Overview',
            description: 'Comprehensive planning documentation for your Nuxt 4 application',
            generatedAt: new Date().toISOString(),
          }
        : null,
    techStack:
      includeAll || sections.includes('techstack')
        ? {
            frontend: [
              'Nuxt 4 - Full-stack Vue framework',
              'Vue 3 - Progressive JavaScript framework',
              'TypeScript - Type-safe development',
            ],
            styling: [
              'Tailwind CSS - Utility-first CSS framework',
              'Nuxt UI - Component library for Nuxt',
            ],
            backend: ['Nitro - Server engine', 'h3 - HTTP framework'],
            database: ['PostgreSQL - Primary database', 'Drizzle ORM - Type-safe database toolkit'],
            authentication: ['Nuxt Auth Utils - Authentication module'],
            deployment: ['Vercel - Hosting platform', 'GitHub Actions - CI/CD'],
          }
        : null,
    architecture:
      includeAll || sections.includes('architecture')
        ? {
            pattern: 'Layered Architecture',
            description:
              'Three-tier architecture with presentation, business logic, and data layers',
            layers: {
              presentation: {
                description: 'Vue components, pages, and layouts',
                technologies: ['Vue 3', 'Nuxt Pages', 'Nuxt Layouts'],
                responsibilities: [
                  'User interface rendering',
                  'User input handling',
                  'Client-side routing',
                ],
              },
              business: {
                description: 'Server API routes and business logic',
                technologies: ['Nitro', 'h3', 'Server Routes'],
                responsibilities: [
                  'Business rule enforcement',
                  'Data validation',
                  'Service orchestration',
                ],
              },
              data: {
                description: 'Database access and data persistence',
                technologies: ['Drizzle ORM', 'PostgreSQL'],
                responsibilities: [
                  'Data persistence',
                  'Query optimization',
                  'Transaction management',
                ],
              },
            },
          }
        : null,
    projectStructure:
      includeAll || sections.includes('structure')
        ? {
            directories: {
              'app/': 'Application source code (Nuxt 4 app directory)',
              'pages/': 'File-based routing pages',
              'components/': 'Vue components',
              'composables/': 'Reusable composition functions',
              'layouts/': 'Application layouts',
              'middleware/': 'Route middleware',
              'server/': 'Server-side code',
              'server/api/': 'API endpoints',
              'server/routes/': 'Server routes (including MCP)',
              'server/middleware/': 'Server middleware',
              'assets/': 'Build-processed assets',
              'public/': 'Static files',
              'utils/': 'Helper utilities',
              'types/': 'TypeScript definitions',
            },
            keyFiles: {
              'nuxt.config.ts': 'Nuxt configuration',
              'tsconfig.json': 'TypeScript configuration',
              'package.json': 'Project dependencies',
              '.env': 'Environment variables',
              'drizzle.config.ts': 'Database configuration',
            },
          }
        : null,
    developmentWorkflow:
      includeAll || sections.includes('workflow')
        ? {
            setup: [
              'Clone repository',
              'Install dependencies: `pnpm install`',
              'Copy `.env.example` to `.env`',
              'Set up database: `pnpm db:push`',
              'Start dev server: `pnpm dev`',
            ],
            gitWorkflow: [
              'Create feature branch from main',
              'Make changes and commit with conventional commits',
              'Push and create pull request',
              'Pass CI checks and get review',
              'Merge to main',
            ],
            testing: [
              'Run unit tests: `pnpm test`',
              'Run E2E tests: `pnpm test:e2e`',
              'Check types: `pnpm typecheck`',
              'Lint code: `pnpm lint`',
            ],
          }
        : null,
    deployment:
      includeAll || sections.includes('deployment')
        ? {
            strategy: 'Continuous Deployment via GitHub Actions',
            environments: {
              development: {
                url: 'http://localhost:3000',
                branch: 'develop',
                purpose: 'Local development and testing',
              },
              staging: {
                url: 'https://staging.example.com',
                branch: 'staging',
                purpose: 'Pre-production testing',
              },
              production: {
                url: 'https://example.com',
                branch: 'main',
                purpose: 'Live production environment',
              },
            },
            pipeline: [
              'Push to branch triggers CI/CD',
              'Run tests and type checking',
              'Build application',
              'Deploy to appropriate environment',
              'Run smoke tests',
            ],
          }
        : null,
    bestPractices:
      includeAll || sections.includes('best-practices')
        ? [
            {
              category: 'Code Quality',
              practices: [
                'Use TypeScript strict mode',
                'Follow Vue 3 Composition API patterns',
                'Write meaningful component and function names',
                'Keep components small and focused',
                'Use composables for shared logic',
              ],
            },
            {
              category: 'Performance',
              practices: [
                'Use lazy loading for routes and components',
                'Optimize images with Nuxt Image',
                'Implement proper caching strategies',
                'Monitor bundle size',
                'Use virtual scrolling for long lists',
              ],
            },
            {
              category: 'Security',
              practices: [
                'Never commit secrets or API keys',
                'Validate all user input',
                'Implement CSRF protection',
                'Use environment variables for sensitive data',
                'Keep dependencies updated',
              ],
            },
            {
              category: 'Testing',
              practices: [
                'Write tests for critical user paths',
                'Mock external dependencies',
                'Test edge cases and error states',
                'Maintain high test coverage for business logic',
                'Use testing-library best practices',
              ],
            },
          ]
        : null,
    troubleshooting:
      includeAll || sections.includes('troubleshooting')
        ? [
            {
              issue: 'Build failures',
              solutions: [
                'Clear .nuxt directory and node_modules',
                'Verify all dependencies are installed',
                'Check TypeScript errors',
                'Review recent changes',
              ],
            },
            {
              issue: 'Type errors',
              solutions: [
                'Run `nuxi prepare` to regenerate types',
                'Check tsconfig.json configuration',
                'Verify imported types are correct',
                'Restart TypeScript server in IDE',
              ],
            },
            {
              issue: 'Database connection issues',
              solutions: [
                'Verify DATABASE_URL is correct',
                'Check database server is running',
                'Verify network connectivity',
                'Check SSL/TLS configuration',
              ],
            },
          ]
        : null,
  };
}

function generateMarkdown(doc: any): string {
  let md = '# Nuxt 4 Project Planning Documentation\n\n';
  md += `*Generated: ${new Date().toLocaleString()}*\n\n`;
  md += '---\n\n';

  if (doc.projectOverview) {
    md += '## Project Overview\n\n';
    md += `${doc.projectOverview.description}\n\n`;
  }

  if (doc.techStack) {
    md += '## Tech Stack\n\n';
    md += '### Frontend\n';
    doc.techStack.frontend.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += '\n### Styling\n';
    doc.techStack.styling.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += '\n### Backend\n';
    doc.techStack.backend.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += '\n### Database\n';
    doc.techStack.database.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += '\n### Authentication\n';
    doc.techStack.authentication.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += '\n### Deployment\n';
    doc.techStack.deployment.forEach((item: string) => {
      md += `- ${item}\n`;
    });
    md += '\n';
  }

  if (doc.architecture) {
    md += '## Architecture\n\n';
    md += `**Pattern:** ${doc.architecture.pattern}\n\n`;
    md += `${doc.architecture.description}\n\n`;

    Object.entries(doc.architecture.layers).forEach(([name, layer]: [string, any]) => {
      md += `### ${name.charAt(0).toUpperCase() + name.slice(1)} Layer\n\n`;
      md += `${layer.description}\n\n`;
      md += '**Technologies:**\n';
      layer.technologies.forEach((tech: string) => {
        md += `- ${tech}\n`;
      });
      md += '\n**Responsibilities:**\n';
      layer.responsibilities.forEach((resp: string) => {
        md += `- ${resp}\n`;
      });
      md += '\n';
    });
  }

  if (doc.projectStructure) {
    md += '## Project Structure\n\n';
    md += '### Directories\n\n';
    Object.entries(doc.projectStructure.directories).forEach(([dir, desc]) => {
      md += `- **${dir}** - ${desc}\n`;
    });
    md += '\n### Key Files\n\n';
    Object.entries(doc.projectStructure.keyFiles).forEach(([file, desc]) => {
      md += `- **${file}** - ${desc}\n`;
    });
    md += '\n';
  }

  if (doc.developmentWorkflow) {
    md += '## Development Workflow\n\n';
    md += '### Setup\n\n';
    doc.developmentWorkflow.setup.forEach((step: string) => {
      md += `1. ${step}\n`;
    });
    md += '\n### Git Workflow\n\n';
    doc.developmentWorkflow.gitWorkflow.forEach((step: string) => {
      md += `1. ${step}\n`;
    });
    md += '\n### Testing\n\n';
    doc.developmentWorkflow.testing.forEach((cmd: string) => {
      md += `- ${cmd}\n`;
    });
    md += '\n';
  }

  if (doc.deployment) {
    md += '## Deployment\n\n';
    md += `**Strategy:** ${doc.deployment.strategy}\n\n`;
    md += '### Environments\n\n';
    Object.entries(doc.deployment.environments).forEach(([name, env]: [string, any]) => {
      md += `#### ${name.charAt(0).toUpperCase() + name.slice(1)}\n`;
      md += `- **URL:** ${env.url}\n`;
      md += `- **Branch:** ${env.branch}\n`;
      md += `- **Purpose:** ${env.purpose}\n\n`;
    });
    md += '### Deployment Pipeline\n\n';
    doc.deployment.pipeline.forEach((step: string, i: number) => {
      md += `${i + 1}. ${step}\n`;
    });
    md += '\n';
  }

  if (doc.bestPractices) {
    md += '## Best Practices\n\n';
    doc.bestPractices.forEach((category: any) => {
      md += `### ${category.category}\n\n`;
      category.practices.forEach((practice: string) => {
        md += `- ${practice}\n`;
      });
      md += '\n';
    });
  }

  if (doc.troubleshooting) {
    md += '## Troubleshooting\n\n';
    doc.troubleshooting.forEach((item: any) => {
      md += `### ${item.issue}\n\n`;
      item.solutions.forEach((solution: string) => {
        md += `- ${solution}\n`;
      });
      md += '\n';
    });
  }

  return md;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
}

function generateHTML(doc: any): string {
  const md = generateMarkdown(doc);
  // Escape the markdown content to prevent XSS
  const escapedMd = escapeHtml(md);

  // In a real implementation, you'd use a markdown-to-HTML converter
  // For now, just wrap in pre tags with escaped content
  return `<!DOCTYPE html>
<html>
<head>
  <title>Nuxt 4 Planning Documentation</title>
  <style>
    body { font-family: system-ui; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #00DC82; border-bottom: 2px solid #00DC82; }
    h2 { color: #00DC82; margin-top: 2em; }
    h3 { color: #003543; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <pre>${escapedMd}</pre>
</body>
</html>`;
}
