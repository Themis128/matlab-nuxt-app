import { z } from 'zod';
import type { PlanningPhase } from '@/types/planning';

const querySchema = z.object({
  currentPhase: z.enum([
    'initialization',
    'requirements',
    'architecture',
    'setup',
    'development',
    'testing',
    'deployment',
  ]),
});

export default defineEventHandler(async (event: any) => {
  const query = await getQuery(event);
  const { currentPhase } = querySchema.parse(query);

  const suggestions = getNextStepSuggestions(currentPhase as PlanningPhase);

  return {
    success: true,
    currentPhase,
    suggestions,
    estimatedTime: getEstimatedTime(currentPhase as PlanningPhase),
  };
});

function getNextStepSuggestions(phase: PlanningPhase) {
  const phaseSuggestions: Record<
    PlanningPhase,
    Array<{ step: string; priority: 'high' | 'medium' | 'low'; description: string }>
  > = {
    initialization: [
      {
        step: 'Define project goals and objectives',
        priority: 'high',
        description: 'Clearly articulate what you want to achieve with this Nuxt 4 application',
      },
      {
        step: 'Identify target audience and use cases',
        priority: 'high',
        description: 'Understand who will use the application and how they will interact with it',
      },
      {
        step: 'Choose project type and scale',
        priority: 'high',
        description: 'Select the appropriate project type (e-commerce, SaaS, blog, etc.) and scale',
      },
      {
        step: 'List required features',
        priority: 'medium',
        description: 'Create an initial list of features and functionality needed',
      },
    ],
    requirements: [
      {
        step: 'Document functional requirements',
        priority: 'high',
        description: 'Detail all features and functionality the application must provide',
      },
      {
        step: 'Define non-functional requirements',
        priority: 'high',
        description: 'Specify performance, security, scalability, and usability requirements',
      },
      {
        step: 'Create user stories or use cases',
        priority: 'medium',
        description: 'Document how users will interact with the application',
      },
      {
        step: 'Identify integration requirements',
        priority: 'medium',
        description: 'List external services, APIs, and third-party tools needed',
      },
    ],
    architecture: [
      {
        step: 'Choose architecture pattern',
        priority: 'high',
        description:
          'Select an appropriate architecture pattern (Layered, JAMstack, Microservices, etc.)',
      },
      {
        step: 'Design directory structure',
        priority: 'high',
        description: 'Plan the organization of components, pages, composables, and server code',
      },
      {
        step: 'Plan API structure',
        priority: 'high',
        description: 'Design REST endpoints, data models, and API contracts',
      },
      {
        step: 'Select state management solution',
        priority: 'medium',
        description: 'Choose between Pinia, composables, or server state management',
      },
      {
        step: 'Plan data flow',
        priority: 'medium',
        description: 'Design how data moves through the application layers',
      },
    ],
    setup: [
      {
        step: 'Initialize Nuxt 4 project',
        priority: 'high',
        description: 'Create new Nuxt 4 project with TypeScript support',
      },
      {
        step: 'Configure development tools',
        priority: 'high',
        description: 'Set up ESLint, Prettier, and other development tools',
      },
      {
        step: 'Set up environment variables',
        priority: 'high',
        description: 'Configure .env files and environment management',
      },
      {
        step: 'Install core dependencies',
        priority: 'high',
        description: 'Add UI framework, database ORM, authentication libraries, etc.',
      },
      {
        step: 'Create project structure',
        priority: 'medium',
        description: 'Set up directories and initial file structure according to architecture plan',
      },
    ],
    development: [
      {
        step: 'Set up database schema',
        priority: 'high',
        description: 'Create database models and migrations using your chosen ORM',
      },
      {
        step: 'Implement authentication',
        priority: 'high',
        description: 'Set up user authentication and authorization if required',
      },
      {
        step: 'Build core features',
        priority: 'high',
        description: 'Start implementing the main application features',
      },
      {
        step: 'Create reusable components',
        priority: 'medium',
        description: 'Build shared UI components and composables',
      },
      {
        step: 'Implement API endpoints',
        priority: 'medium',
        description: 'Create server routes and API handlers',
      },
    ],
    testing: [
      {
        step: 'Set up testing framework',
        priority: 'high',
        description: 'Configure Vitest, Playwright, or your chosen testing tools',
      },
      {
        step: 'Write unit tests',
        priority: 'high',
        description: 'Create tests for components, composables, and utilities',
      },
      {
        step: 'Write integration tests',
        priority: 'medium',
        description: 'Test API endpoints and data flow',
      },
      {
        step: 'Perform E2E testing',
        priority: 'medium',
        description: 'Test complete user workflows',
      },
      {
        step: 'Conduct code review',
        priority: 'low',
        description: 'Review code quality and adherence to best practices',
      },
    ],
    deployment: [
      {
        step: 'Choose hosting provider',
        priority: 'high',
        description: 'Select deployment platform (Vercel, Netlify, CloudFlare, etc.)',
      },
      {
        step: 'Set up CI/CD pipeline',
        priority: 'high',
        description: 'Configure automated testing and deployment workflows',
      },
      {
        step: 'Configure production environment',
        priority: 'high',
        description: 'Set up production database, environment variables, and services',
      },
      {
        step: 'Set up monitoring and logging',
        priority: 'medium',
        description: 'Configure error tracking, analytics, and performance monitoring',
      },
      {
        step: 'Plan backup and recovery',
        priority: 'medium',
        description: 'Establish data backup and disaster recovery procedures',
      },
    ],
  };

  return phaseSuggestions[phase] || [];
}

function getEstimatedTime(phase: PlanningPhase): string {
  const timeEstimates: Record<PlanningPhase, string> = {
    initialization: '1-2 days',
    requirements: '3-5 days',
    architecture: '5-7 days',
    setup: '2-3 days',
    development: '4-12 weeks (varies by project)',
    testing: '1-2 weeks',
    deployment: '3-5 days',
  };

  return timeEstimates[phase] || 'Varies';
}
