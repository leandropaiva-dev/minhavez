/**
 * ✅ SECURITY: Structured logging system
 * Replaces console.error with secure, structured logging
 * Prevents sensitive data leaks in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

interface LogContext {
  userId?: string
  businessId?: string
  requestId?: string
  action?: string
  [key: string]: unknown
}

class SecurityLogger {
  private isProd = process.env.NODE_ENV === 'production'

  /**
   * Sanitize error objects to prevent sensitive data leaks
   */
  private sanitizeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        // Only include stack in development
        ...(this.isProd ? {} : { stack: error.stack }),
      }
    }

    // For unknown error types, only log basic info
    return {
      type: typeof error,
      message: String(error),
    }
  }

  /**
   * Remove sensitive data from context
   */
  private sanitizeContext(context: LogContext): LogContext {
    const sanitized = { ...context }

    // List of keys to redact
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'api_key',
      'authorization',
      'cookie',
      'session',
    ]

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Log with structured format
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
    const timestamp = new Date().toISOString()
    const sanitizedContext = context ? this.sanitizeContext(context) : {}
    const sanitizedError = error ? this.sanitizeError(error) : undefined

    const logEntry = {
      timestamp,
      level,
      message,
      ...sanitizedContext,
      ...(sanitizedError && { error: sanitizedError }),
    }

    // In production, use JSON format (for log aggregation)
    if (this.isProd) {
      console.log(JSON.stringify(logEntry))
    } else {
      // In development, use readable format
      const consoleMethod = level === 'debug' || level === 'info' ? 'log' : level === 'critical' ? 'error' : level
      console[consoleMethod](
        `[${level.toUpperCase()}] ${message}`,
        sanitizedContext,
        sanitizedError || ''
      )
    }

    // TODO: Send to external logging service (Sentry, LogRocket, etc)
    // if (level === 'error' || level === 'critical') {
    //   Sentry.captureException(error, { contexts: { custom: sanitizedContext } })
    // }
  }

  debug(message: string, context?: LogContext) {
    if (!this.isProd) {
      this.log('debug', message, context)
    }
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: unknown, context?: LogContext) {
    this.log('error', message, context, error)
  }

  critical(message: string, error?: unknown, context?: LogContext) {
    this.log('critical', message, context, error)
  }

  /**
   * Log security events
   */
  security(event: string, context?: LogContext) {
    this.log('warn', `[SECURITY] ${event}`, {
      ...context,
      securityEvent: true,
    })
  }
}

// Singleton instance
export const logger = new SecurityLogger()

// Helper to get request context
export function getRequestContext(headers: Headers): LogContext {
  return {
    userAgent: headers.get('user-agent') || 'unknown',
    ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
    referer: headers.get('referer') || undefined,
  }
}
