/**
 * Sentry Webhook Handler
 *
 * Receives webhook events from Sentry and processes them.
 * Can trigger notifications, update dashboards, or log events.
 *
 * Configure webhook in Sentry: Settings → Projects → Your Project → Webhooks
 * URL: https://your-domain.com/api/sentry/webhook
 */

import { logger } from '../../utils/logger';

export default defineEventHandler(async (event: any) => {
  const headers = getHeaders(event);
  const body = await readBody(event);

  // Always require webhook signature verification for security
  const webhookSecret = process.env.SENTRY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Sentry Webhook] SENTRY_WEBHOOK_SECRET not configured');
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook secret not configured',
    });
  }

  const signature = headers['sentry-hook-signature'];
  if (!signature) {
    console.error('[Sentry Webhook] Missing signature header');
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing webhook signature',
    });
  }

  if (!verifyWebhookSignature(body, signature, webhookSecret)) {
    console.error('[Sentry Webhook] Invalid signature');
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid webhook signature',
    });
  }

  const action = body.action;
  const resource = body.resource;

  try {
    // Log webhook event
    console.log(`[Sentry Webhook] ${action} on ${resource}`);

    // Handle different webhook event types
    switch (action) {
      case 'issue.created':
        await handleIssueCreated(body);
        break;
      case 'issue.resolved':
        await handleIssueResolved(body);
        break;
      case 'issue.assigned':
        await handleIssueAssigned(body);
        break;
      case 'issue.ignored':
        await handleIssueIgnored(body);
        break;
      case 'event.alert':
        await handleEventAlert(body);
        break;
      case 'release.created':
        await handleReleaseCreated(body);
        break;
      default:
        console.log(`[Sentry Webhook] Unhandled action: ${action}`);
    }

    return {
      success: true,
      action,
      resource,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Sentry Webhook] Error processing webhook:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});

/**
 * Verify webhook signature using HMAC-SHA256
 */
import crypto from 'crypto';

function verifyWebhookSignature(body: any, signature: string, secret: string): boolean {
  try {
    // Convert body to string if it's an object
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);

    // Create HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyString, 'utf8')
      .digest('hex');

    // Sentry sends signature in format "sha256=<hash>"
    const receivedSignature = signature.startsWith('sha256=') ? signature.slice(7) : signature;

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

/**
 * Handle issue.created event
 */
async function handleIssueCreated(data: any) {
  const issue = data.data?.issue;

  if (issue) {
    logger.warn('New Sentry issue created', {
      issueId: issue.id,
      title: issue.title,
      level: issue.level,
      culprit: issue.culprit,
      webhook: true,
    });

    // You can add custom logic here:
    // - Send notifications (email, Slack, etc.)
    // - Update internal dashboards
    // - Trigger alerts
    // - Create tickets in issue tracker
  }
}

/**
 * Handle issue.resolved event
 */
async function handleIssueResolved(data: any) {
  const issue = data.data?.issue;

  if (issue) {
    logger.info('Sentry issue resolved', {
      issueId: issue.id,
      title: issue.title,
      webhook: true,
    });
  }
}

/**
 * Handle issue.assigned event
 */
async function handleIssueAssigned(data: any) {
  const issue = data.data?.issue;

  if (issue) {
    logger.info('Sentry issue assigned', {
      issueId: issue.id,
      assignedTo: issue.assignedTo,
      webhook: true,
    });
  }
}

/**
 * Handle issue.ignored event
 */
async function handleIssueIgnored(data: any) {
  const issue = data.data?.issue;

  if (issue) {
    logger.info('Sentry issue ignored', {
      issueId: issue.id,
      title: issue.title,
      webhook: true,
    });
  }
}

/**
 * Handle event.alert event
 */
async function handleEventAlert(data: any) {
  const event = data.data?.event;

  if (event) {
    logger.warn('Sentry alert triggered', {
      eventId: event.id,
      message: event.message,
      level: event.level,
      webhook: true,
    });
  }
}

/**
 * Handle release.created event
 */
async function handleReleaseCreated(data: any) {
  const release = data.data?.release;

  if (release) {
    logger.info('Sentry release created', {
      version: release.version,
      url: release.url,
      webhook: true,
    });
  }
}
