import { z } from 'zod';
import type { ProjectScale } from '@/types/planning';

const querySchema = z.object({
  projectType: z.string(),
  scale: z.enum(['small', 'medium', 'large', 'enterprise']),
  features: z.array(z.string()).optional(),
});

export default defineEventHandler(async (event: any) => {
  const query = await getQuery(event);
  const { projectType, scale, features } = querySchema.parse(query);

  const recommendations = getArchitectureRecommendations(
    projectType,
    scale as ProjectScale,
    features || []
  );

  return {
    success: true,
    projectType,
    scale,
    recommendations,
  };
});

function getArchitectureRecommendations(
  projectType: string,
  scale: ProjectScale,
  features: string[]
) {
  const baseRecommendations = {
    patterns: [] as string[],
    technologies: {
      frontend: [] as string[],
      backend: [] as string[],
      database: [] as string[],
      deployment: [] as string[],
    },
    considerations: [] as string[],
  };

  // Pattern recommendations based on project type
  switch (projectType.toLowerCase()) {
    case 'e-commerce':
      baseRecommendations.patterns = [
        'Layered Architecture',
        'API Gateway Pattern',
        'Event-Driven Architecture (for order processing)',
      ];
      baseRecommendations.technologies.frontend = ['Nuxt 4', 'Nuxt UI', 'Tailwind CSS'];
      baseRecommendations.technologies.backend = ['Nitro', 'h3'];
      baseRecommendations.technologies.database = ['PostgreSQL', 'Redis (for caching)'];
      baseRecommendations.considerations = [
        'Payment processing security',
        'Inventory management',
        'Order fulfillment workflow',
        'Customer data protection',
      ];
      break;

    case 'saas':
      baseRecommendations.patterns = [
        'Multi-tenant Architecture',
        'Microservices (for large scale)',
        'API-first Design',
      ];
      baseRecommendations.technologies.frontend = ['Nuxt 4', 'Nuxt UI', 'Radix Vue'];
      baseRecommendations.technologies.backend = ['Nitro', 'Server Routes'];
      baseRecommendations.technologies.database = [
        'PostgreSQL with row-level security',
        'Drizzle ORM',
      ];
      baseRecommendations.considerations = [
        'Data isolation between tenants',
        'Scalable billing system',
        'Feature flags for gradual rollout',
        'Analytics and usage tracking',
      ];
      break;

    case 'blog':
    case 'documentation':
      baseRecommendations.patterns = [
        'JAMstack',
        'Static Site Generation',
        'Content-First Architecture',
      ];
      baseRecommendations.technologies.frontend = ['Nuxt 4', 'Nuxt Content', 'Nuxt UI'];
      baseRecommendations.technologies.backend = ['Nitro (for API routes)'];
      baseRecommendations.technologies.database = ['Nuxt Content (Markdown)', 'Git-based content'];
      baseRecommendations.considerations = [
        'SEO optimization',
        'Content versioning',
        'Search functionality',
        'Fast page loads',
      ];
      break;

    case 'portfolio':
      baseRecommendations.patterns = ['Static Site Generation', 'JAMstack'];
      baseRecommendations.technologies.frontend = ['Nuxt 4', 'Nuxt UI', 'Tailwind CSS'];
      baseRecommendations.technologies.backend = ['Nitro (minimal)'];
      baseRecommendations.technologies.database = ['None (static content)'];
      baseRecommendations.considerations = [
        'Visual appeal',
        'Performance',
        'SEO',
        'Easy content updates',
      ];
      break;

    case 'dashboard':
      baseRecommendations.patterns = [
        'Layered Architecture',
        'REST API',
        'Real-time Updates (if needed)',
      ];
      baseRecommendations.technologies.frontend = [
        'Nuxt 4',
        'Nuxt UI',
        'Chart libraries (ApexCharts, etc.)',
      ];
      baseRecommendations.technologies.backend = ['Nitro', 'Server Routes'];
      baseRecommendations.technologies.database = ['PostgreSQL', 'Time-series DB (if needed)'];
      baseRecommendations.considerations = [
        'Data visualization',
        'Real-time data updates',
        'User permissions',
        'Performance with large datasets',
      ];
      break;

    default:
      baseRecommendations.patterns = ['Layered Architecture', 'RESTful API'];
      baseRecommendations.technologies.frontend = ['Nuxt 4', 'Nuxt UI'];
      baseRecommendations.technologies.backend = ['Nitro'];
      baseRecommendations.technologies.database = ['PostgreSQL'];
  }

  // Scale-based adjustments
  if (scale === 'enterprise' || scale === 'large') {
    baseRecommendations.patterns.push('Microservices Architecture');
    baseRecommendations.technologies.deployment = ['Kubernetes', 'Docker', 'CloudFlare Workers'];
    baseRecommendations.considerations.push(
      'Horizontal scaling',
      'Load balancing',
      'High availability',
      'Disaster recovery'
    );
  } else if (scale === 'medium') {
    baseRecommendations.technologies.deployment = ['Vercel', 'Netlify', 'CloudFlare Pages'];
  } else {
    baseRecommendations.technologies.deployment = ['Vercel', 'Netlify', 'Simple hosting'];
  }

  // Feature-based recommendations
  if (features.includes('authentication')) {
    baseRecommendations.technologies.backend.push('Nuxt Auth Utils', 'Supabase Auth (or similar)');
  }

  if (features.includes('real-time')) {
    baseRecommendations.patterns.push('WebSocket/SSE for real-time');
    baseRecommendations.technologies.backend.push('WebSocket support');
  }

  if (features.includes('payments')) {
    baseRecommendations.considerations.push(
      'PCI compliance',
      'Secure payment processing',
      'Transaction logging'
    );
  }

  return baseRecommendations;
}
