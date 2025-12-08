import { z } from 'zod';
import type { PlanningChecklist } from '@/types/planning';
import {
  getPlanningSession,
  updatePlanningSession,
  savePlanningSession,
} from '../../utils/database';
import { handleAPIError } from '../../utils/error-handler';

const bodySchema = z.object({
  sessionId: z.string().optional(),
  category: z.string(),
  itemId: z.string(),
  completed: z.boolean(),
  notes: z.string().optional(),
});

export default defineEventHandler(async (event: any) => {
  const startTime = Date.now();

  try {
    const body = await readBody(event);
    const { sessionId, category, itemId, completed, notes } = bodySchema.parse(body);

    // Get session ID
    const activeSessionId = sessionId || (await getQuery(event)).sessionId?.toString() || 'default';

    // Get or create session
    let session = await getPlanningSession(activeSessionId);
    if (!session) {
      // Create new session with empty checklist
      session = {
        id: activeSessionId,
        projectName: 'New Project',
        projectType: 'custom',
        scale: 'medium',
        features: [],
        phase: 'initialization',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checklist: {
          'Project Setup': {},
          Architecture: {},
          Features: {},
          Testing: {},
          Deployment: {},
        },
        architectureDecisions: [],
      };
      await savePlanningSession(session);
    }

    // Validate category
    const validCategories: (keyof PlanningChecklist)[] = [
      'Project Setup',
      'Architecture',
      'Features',
      'Testing',
      'Deployment',
    ];

    if (!validCategories.includes(category as keyof PlanningChecklist)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      });
    }

    // Update checklist item
    const categoryChecklist = session.checklist[category as keyof PlanningChecklist];

    if (!categoryChecklist[itemId]) {
      // Create new item if it doesn't exist
      categoryChecklist[itemId] = {
        id: itemId,
        title: itemId,
        priority: 'medium',
        completed,
        notes,
        completedAt: completed ? new Date().toISOString() : undefined,
      };
    } else {
      // Update existing item
      categoryChecklist[itemId].completed = completed;
      if (notes) {
        categoryChecklist[itemId].notes = notes;
      }
      if (completed) {
        categoryChecklist[itemId].completedAt = new Date().toISOString();
      } else {
        categoryChecklist[itemId].completedAt = undefined;
      }
    }

    // Update session in database
    const updatedSession = await updatePlanningSession(activeSessionId, {
      checklist: session.checklist,
    });

    if (!updatedSession) {
      throw new Error('Failed to update session');
    }

    // Calculate progress
    const progress = calculateProgress(updatedSession.checklist);

    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV !== 'test') {
      console.log('[Checklist Updated]', {
        sessionId: activeSessionId,
        category,
        itemId,
        completed,
        duration: `${duration}ms`,
      });
    }

    return {
      success: true,
      sessionId: activeSessionId,
      category,
      itemId,
      completed,
      progress,
      checklist: updatedSession.checklist,
    };
  } catch (error) {
    return handleAPIError(event, error);
  }
});

function calculateProgress(checklist: PlanningChecklist) {
  let total = 0;
  let completed = 0;

  Object.values(checklist).forEach((category) => {
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
    byCategory: Object.entries(checklist).reduce(
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
