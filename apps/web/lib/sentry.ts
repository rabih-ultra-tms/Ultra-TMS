/**
 * INFRA-004: Sentry client-side integration for Next.js
 *
 * Thin wrapper that dynamically imports @sentry/nextjs only when
 * NEXT_PUBLIC_SENTRY_DSN is set. If the package is not installed,
 * all functions gracefully no-op.
 *
 * Usage:
 *   import { initSentry, captureError } from '@/lib/sentry';
 *   initSentry();                          // call once in root layout/provider
 *   captureError(new Error('oh no'), { userId: '123' });
 */

let initialized = false;

/**
 * Initialize Sentry on the client side.
 * Safe to call multiple times — only the first call has effect.
 * No-op if NEXT_PUBLIC_SENTRY_DSN is not set or @sentry/nextjs is not installed.
 */
export function initSentry(): void {
  if (initialized) return;
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  initialized = true;

  import('@sentry/nextjs')
    .then((Sentry) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        // Reduce noise in development
        enabled: process.env.NODE_ENV === 'production',
        // Don't send PII by default
        sendDefaultPii: false,
      });
    })
    .catch(() => {
      // @sentry/nextjs is not installed — silently skip
    });
}

/**
 * Capture an error and send it to Sentry with optional context.
 * Falls back to console.error if Sentry is not available.
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
): void {
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.captureException(error, { extra: context });
  } catch {
    // Sentry not available — log to console as fallback
    console.error('[Sentry unavailable]', error, context);
  }
}

/**
 * Capture a message (non-error) and send it to Sentry.
 */
export function captureMessage(
  message: string,
  context?: Record<string, unknown>
): void {
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.captureMessage(message, { extra: context });
  } catch {
    console.warn('[Sentry unavailable]', message, context);
  }
}

/**
 * Set user context for Sentry error reports.
 */
export function setUser(user: { id: string; email?: string } | null): void {
  try {
    const Sentry = require('@sentry/nextjs');
    Sentry.setUser(user);
  } catch {
    // Sentry not available — silently skip
  }
}
