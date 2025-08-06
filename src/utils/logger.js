// 🔍 Structured Logging & Error Tracking System
// Implements the observability requirements from PRE_COMMIT_CHECKLIST.md

/**
 * Logger utility for structured logging with different levels
 * Supports both development console logging and production error tracking
 */

// Log levels for different types of events
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug',
  USER_ACTION: 'user_action',
  SECURITY: 'security',
  PERFORMANCE: 'performance'
};

// Production error tracking configuration
const ERROR_TRACKING_CONFIG = {
  // In production, this would be Sentry DSN or similar service
  enabled: process.env.NODE_ENV === 'production',
  endpoint: process.env.VITE_ERROR_TRACKING_ENDPOINT || null
};

/**
 * Core logging function with structured format
 * @param {string} level - Log level from LOG_LEVELS
 * @param {string} message - Human readable message
 * @param {Object} context - Additional context data
 * @param {Error} error - Error object if applicable
 */
const log = (level, message, context = {}, error = null) => {
  const timestamp = new Date().toISOString();
  const sessionId = getSessionId();
  const userId = getCurrentUserId();
  
  const logEntry = {
    timestamp,
    level,
    message,
    sessionId,
    userId,
    context: {
      ...context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    }
  };

  // Add error details if provided
  if (error) {
    logEntry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    };
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    const consoleMethod = getConsoleMethod(level);
    consoleMethod(`[${level.toUpperCase()}] ${message}`, logEntry);
  }

  // Send to error tracking service in production
  if (ERROR_TRACKING_CONFIG.enabled && shouldSendToTracking(level)) {
    sendToErrorTracking(logEntry);
  }

  // Store critical logs locally for debugging
  if (shouldStoreLocally(level)) {
    storeLogLocally(logEntry);
  }
};

/**
 * User action tracking - for analytics and debugging user flows
 * @param {string} action - The action performed
 * @param {Object} metadata - Action-specific data
 */
export const logUserAction = (action, metadata = {}) => {
  log(LOG_LEVELS.USER_ACTION, `User action: ${action}`, {
    action,
    ...metadata,
    component: getCurrentComponent(),
    feature: getCurrentFeature()
  });
};

/**
 * Security event logging - for auth failures, input validation, etc.
 * @param {string} event - Security event description
 * @param {Object} details - Security-relevant details
 */
export const logSecurityEvent = (event, details = {}) => {
  log(LOG_LEVELS.SECURITY, `Security event: ${event}`, {
    event,
    ...details,
    ip: getClientIP(),
    timestamp: Date.now()
  });
};

/**
 * Performance logging - for tracking slow operations
 * @param {string} operation - Operation being measured
 * @param {number} duration - Time taken in milliseconds
 * @param {Object} metadata - Performance context
 */
export const logPerformance = (operation, duration, metadata = {}) => {
  log(LOG_LEVELS.PERFORMANCE, `Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...metadata,
    thresholdExceeded: duration > getPerformanceThreshold(operation)
  });
};

/**
 * Error logging with automatic context capture
 * @param {Error} error - Error object
 * @param {Object} context - Additional error context
 */
export const logError = (error, context = {}) => {
  // Sanitize error context to prevent data leakage
  const sanitizedContext = sanitizeErrorContext(context);
  
  log(LOG_LEVELS.ERROR, `Error: ${error.message}`, sanitizedContext, error);
  
  // For critical errors, attempt recovery logging
  if (isCriticalError(error)) {
    logRecoveryAttempt(error, context);
  }
};

/**
 * Warning logging for non-critical issues
 * @param {string} message - Warning message
 * @param {Object} context - Warning context
 */
export const logWarning = (message, context = {}) => {
  log(LOG_LEVELS.WARN, message, context);
};

/**
 * Info logging for general application events
 * @param {string} message - Info message
 * @param {Object} context - Info context
 */
export const logInfo = (message, context = {}) => {
  log(LOG_LEVELS.INFO, message, context);
};

/**
 * Debug logging (only in development)
 * @param {string} message - Debug message
 * @param {Object} context - Debug context
 */
export const logDebug = (message, context = {}) => {
  if (process.env.NODE_ENV === 'development') {
    log(LOG_LEVELS.DEBUG, message, context);
  }
};

// Helper functions
const getSessionId = () => {
  return sessionStorage.getItem('phenoHunter_sessionId') || generateSessionId();
};

const generateSessionId = () => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('phenoHunter_sessionId', sessionId);
  return sessionId;
};

const getCurrentUserId = () => {
  try {
    const auth = JSON.parse(localStorage.getItem('phenoHunter_auth') || '{}');
    return auth.user?.id || 'anonymous';
  } catch {
    return 'anonymous';
  }
};

const getCurrentComponent = () => {
  // In a real app, this would be extracted from React context or router
  return window.location.pathname.split('/')[1] || 'home';
};

const getCurrentFeature = () => {
  const path = window.location.pathname;
  if (path.includes('plant')) return 'plant_management';
  if (path.includes('auth')) return 'authentication';
  if (path.includes('dashboard')) return 'dashboard';
  return 'general';
};

const getClientIP = () => {
  // In production, this would be provided by the backend
  return 'client_side_unknown';
};

const getPerformanceThreshold = (operation) => {
  const thresholds = {
    'page_load': 2000,
    'api_call': 1000,
    'form_submit': 500,
    'image_upload': 3000,
    'data_save': 200
  };
  return thresholds[operation] || 1000;
};

const getConsoleMethod = (level) => {
  const methods = {
    [LOG_LEVELS.ERROR]: console.error,
    [LOG_LEVELS.WARN]: console.warn,
    [LOG_LEVELS.INFO]: console.info,
    [LOG_LEVELS.DEBUG]: console.log,
    [LOG_LEVELS.USER_ACTION]: console.log,
    [LOG_LEVELS.SECURITY]: console.warn,
    [LOG_LEVELS.PERFORMANCE]: console.log
  };
  return methods[level] || console.log;
};

const shouldSendToTracking = (level) => {
  return [LOG_LEVELS.ERROR, LOG_LEVELS.SECURITY, LOG_LEVELS.PERFORMANCE].includes(level);
};

const shouldStoreLocally = (level) => {
  return [LOG_LEVELS.ERROR, LOG_LEVELS.SECURITY].includes(level);
};

const storeLogLocally = (logEntry) => {
  try {
    const logs = JSON.parse(localStorage.getItem('phenoHunter_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 50 logs to prevent storage bloat
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }
    
    localStorage.setItem('phenoHunter_logs', JSON.stringify(logs));
  } catch (error) {
    console.warn('Failed to store log locally:', error);
  }
};

const sendToErrorTracking = async (logEntry) => {
  if (!ERROR_TRACKING_CONFIG.endpoint) return;
  
  try {
    await fetch(ERROR_TRACKING_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logEntry)
    });
  } catch (error) {
    console.warn('Failed to send log to tracking service:', error);
  }
};

const sanitizeErrorContext = (context) => {
  // Remove sensitive data from error context
  const sensitive = ['password', 'token', 'auth', 'credential', 'secret'];
  const sanitized = { ...context };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitive.some(term => key.toLowerCase().includes(term))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

const isCriticalError = (error) => {
  const critical = [
    'localStorage quota exceeded',
    'network error',
    'auth failure',
    'data corruption'
  ];
  return critical.some(term => error.message.toLowerCase().includes(term));
};

const logRecoveryAttempt = (error, context) => {
  log(LOG_LEVELS.INFO, `Attempting recovery from critical error: ${error.message}`, {
    ...context,
    recovery: 'attempted',
    originalError: error.name
  });
};

/**
 * Performance measurement wrapper
 * @param {string} operation - Operation name
 * @param {Function} fn - Function to measure
 * @returns {Promise|any} - Function result
 */
export const measurePerformance = async (operation, fn) => {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    
    logPerformance(operation, duration, {
      success: true,
      resultType: typeof result
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logPerformance(operation, duration, {
      success: false,
      error: error.message
    });
    
    logError(error, { operation, duration });
    throw error;
  }
};

/**
 * Get stored logs for debugging (development only)
 * @returns {Array} - Array of log entries
 */
export const getStoredLogs = () => {
  if (process.env.NODE_ENV !== 'development') {
    logWarning('Attempted to access stored logs in production');
    return [];
  }
  
  try {
    return JSON.parse(localStorage.getItem('phenoHunter_logs') || '[]');
  } catch (error) {
    logError(error, { operation: 'getStoredLogs' });
    return [];
  }
};

/**
 * Clear stored logs (development only)
 */
export const clearStoredLogs = () => {
  if (process.env.NODE_ENV !== 'development') {
    logWarning('Attempted to clear stored logs in production');
    return;
  }
  
  localStorage.removeItem('phenoHunter_logs');
  logInfo('Stored logs cleared');
};

export default {
  logUserAction,
  logSecurityEvent,
  logPerformance,
  logError,
  logWarning,
  logInfo,
  logDebug,
  measurePerformance,
  getStoredLogs,
  clearStoredLogs
};
