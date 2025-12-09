import * as Sentry from '@sentry/react';

/**
 * Logger wrapper that sends logs to Sentry in production
 * and uses console in development
 */
class Logger {
  /**
   * Log info message
   */
  info(message: string, data?: Record<string, any>) {
    if (import.meta.env.PROD) {
      Sentry.captureMessage(message, {
        level: 'info',
        ...(data && { extra: data }),
      });
    } else {
      console.log(message, data || '');
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: Record<string, any>) {
    if (import.meta.env.PROD) {
      Sentry.captureMessage(message, {
        level: 'warning',
        ...(data && { extra: data }),
      });
    } else {
      console.warn(message, data || '');
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, data?: Record<string, any>) {
    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: { message, ...data },
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: { error, ...data },
      });
    }

    // Always log to console for visibility
    console.error(message, error || '', data || '');
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: Record<string, any>) {
    if (!import.meta.env.PROD) {
      console.debug(message, data || '');
    }
  }
}

export const logger = new Logger();
