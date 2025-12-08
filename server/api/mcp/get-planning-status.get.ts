import type { PlanningSession } from '@/types/planning';
import { getPlanningSession } from '../../utils/database';
import { handleAPIError } from '../../utils/error-handler';

export default defineEventHandler(async (event: any) => {
  const startTime = Date.now();
  const query = await getQuery(event);
  const sessionId = query.sessionId?.toString() || 'default';

  try {
    const session = await getPlanningSession(sessionId);

    if (!session) {
      return {
        success: false,
        message: 'No active planning session found',
        sessionId,
        suggestion: 'Initialize a planning session using initialize_planning tool',
      };
    }

    // Calculate progress
    const progress = calculateProgress(session);

    // Determine current phase based on progress
    const currentPhase = determinePhase(session, progress);

    const result = {
      success: true,
      session: {
        id: session.id,
        projectName: session.projectName,
        projectType: session.projectType,
        scale: session.scale,
        phase: currentPhase,
        startedAt: session.startedAt,
        updatedAt: session.updatedAt,
      },
      progress,
      features: session.features,
      architectureDecisions: session.architectureDecisions,
      nextRecommendedActions: getNextRecommendedActions(currentPhase, progress),
    };

    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Planning Status]', {
        sessionId,
        duration: `${duration}ms`,
      });
    }

    return result;
  } catch (error) {
    return handleAPIError(event, error);
  }
});

function calculateProgress(session: PlanningSession) {
  let total = 0;
  let completed = 0;

  Object.values(session.checklist).forEach((category) => {
    Object.values(category).forEach((item: any) => {
      total++;
      if (item && typeof item === 'object' && 'completed' in item && item.completed) {
        completed++;
      }
    });
  });

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    byCategory: Object.entries(session.checklist).reduce(
      (acc, [category, items]) => {
        const categoryItems = Object.values(items) as any[];
        const categoryTotal = categoryItems.length;
        const categoryCompleted = categoryItems.filter(
          (i: any) => i && typeof i === 'object' && 'completed' in i && i.completed
        ).length;

        acc[category] = {
          total: categoryTotal,
          completed: categoryCompleted,
          percentage: categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0,
        };
        return acc;
      },
      {} as Record<string, { total: number; completed: number; percentage: number }>
    ),
  };
}

function determinePhase(
  session: PlanningSession,
  progress: ReturnType<typeof calculateProgress>
): PlanningSession['phase'] {
  // Simple phase determination based on progress
  if (progress.percentage === 0) {
    return 'initialization';
  } else if (progress.percentage < 25) {
    return 'requirements';
  } else if (progress.percentage < 50) {
    return 'architecture';
  } else if (progress.percentage < 75) {
    return 'development';
  } else if (progress.percentage < 90) {
    return 'testing';
  } else {
    return 'deployment';
  }
}

function getNextRecommendedActions(
  phase: PlanningSession['phase'],
  _progress: ReturnType<typeof calculateProgress>
): string[] {
  const actions: Record<PlanningSession['phase'], string[]> = {
    initialization: [
      'Complete project initialization',
      'Define project requirements',
      'Select project type and scale',
    ],
    requirements: [
      'Document functional requirements',
      'Identify technical requirements',
      'Plan feature set',
    ],
    architecture: [
      'Choose architecture pattern',
      'Design system architecture',
      'Plan API structure',
    ],
    setup: [
      'Set up development environment',
      'Configure project structure',
      'Install dependencies',
    ],
    development: [
      'Start feature development',
      'Implement core functionality',
      'Set up testing framework',
    ],
    testing: ['Write unit tests', 'Perform integration testing', 'Conduct user acceptance testing'],
    deployment: [
      'Set up CI/CD pipeline',
      'Configure production environment',
      'Plan deployment strategy',
    ],
  };

  return actions[phase] || [];
}
