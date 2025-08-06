// 🔒 Security Utilities - Input Sanitization & Validation
// Implements security requirements from PRE_COMMIT_CHECKLIST.md and DEVELOPMENT_STANDARDS.md

import { logSecurityEvent, logWarning } from './logger.js';

/**
 * XSS Prevention - Sanitize HTML content
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input safe for display
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return '';
  
  // Create a map of dangerous characters to safe equivalents
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  const sanitized = input.replace(/[&<>"'`=\/]/g, (char) => htmlEscapeMap[char]);
  
  if (sanitized !== input) {
    logSecurityEvent('HTML sanitization performed', {
      originalLength: input.length,
      sanitizedLength: sanitized.length,
      charactersRemoved: input.length - sanitized.length
    });
  }
  
  return sanitized;
};

/**
 * SQL Injection Prevention - Sanitize database inputs
 * @param {string} input - Input that might be used in database queries
 * @returns {string} - Sanitized input
 */
export const sanitizeSQL = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove or escape SQL injection patterns
  const dangerous = [
    /('|(\\'))/gi,  // Single quotes
    /(;|\0)/gi,     // Semicolons and null bytes
    /(-{2})/gi,     // SQL comments
    /(\/\*|\*\/)/gi // Multi-line comments
  ];
  
  let sanitized = input;
  dangerous.forEach(pattern => {
    if (pattern.test(sanitized)) {
      logSecurityEvent('SQL injection attempt detected', {
        pattern: pattern.toString(),
        input: input.substring(0, 100) // Log only first 100 chars
      });
    }
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized.trim();
};

/**
 * Path Traversal Prevention - Sanitize file paths
 * @param {string} path - File path to sanitize
 * @returns {string} - Safe file path
 */
export const sanitizeFilePath = (path) => {
  if (typeof path !== 'string') return '';
  
  // Remove dangerous path traversal patterns
  const dangerous = ['../', '.\\', '%2e%2e', '%2f', '%5c'];
  let sanitized = path;
  
  dangerous.forEach(pattern => {
    if (sanitized.toLowerCase().includes(pattern.toLowerCase())) {
      logSecurityEvent('Path traversal attempt detected', {
        pattern,
        originalPath: path
      });
    }
    sanitized = sanitized.replace(new RegExp(pattern, 'gi'), '');
  });
  
  // Only allow alphanumeric, hyphens, underscores, and dots
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_]/g, '');
  
  return sanitized;
};

/**
 * Email validation with security considerations
 * @param {string} email - Email to validate
 * @returns {Object} - Validation result with security flags
 */
export const validateEmail = (email) => {
  if (typeof email !== 'string') {
    return { isValid: false, error: 'Email must be a string' };
  }
  
  // Basic email regex (RFC 5322 compliant)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  const isValid = emailRegex.test(email);
  
  // Security checks
  const securityFlags = {
    containsHTML: /<[^>]*>/.test(email),
    containsSQL: /('|;|--|\/\*)/.test(email),
    excessiveLength: email.length > 254,
    suspiciousChars: /[<>{}\\]/.test(email)
  };
  
  const hasSecurityIssues = Object.values(securityFlags).some(flag => flag);
  
  if (hasSecurityIssues) {
    logSecurityEvent('Suspicious email format detected', {
      email: email.substring(0, 50), // Log only first 50 chars
      flags: securityFlags
    });
  }
  
  return {
    isValid: isValid && !hasSecurityIssues,
    securityFlags,
    error: !isValid ? 'Invalid email format' : 
           hasSecurityIssues ? 'Email contains suspicious characters' : null
  };
};

/**
 * Password strength validation
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with strength score
 */
export const validatePassword = (password) => {
  if (typeof password !== 'string') {
    return { isValid: false, strength: 0, error: 'Password must be a string' };
  }
  
  const checks = {
    minLength: password.length >= 6,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    notCommon: !isCommonPassword(password)
  };
  
  const strength = Object.values(checks).filter(Boolean).length;
  const isValid = checks.minLength && strength >= 3;
  
  let error = null;
  if (!checks.minLength) error = 'Password must be at least 6 characters long';
  else if (!checks.notCommon) error = 'Password is too common';
  else if (strength < 3) error = 'Password is too weak';
  
  return {
    isValid,
    strength,
    checks,
    error,
    strengthText: getPasswordStrengthText(strength)
  };
};

/**
 * Username validation with security checks
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result
 */
export const validateUsername = (username) => {
  if (typeof username !== 'string') {
    return { isValid: false, error: 'Username must be a string' };
  }
  
  const sanitized = sanitizeHTML(username);
  
  const checks = {
    minLength: username.length >= 3,
    maxLength: username.length <= 30,
    validChars: /^[a-zA-Z0-9_-]+$/.test(username),
    notSanitized: username === sanitized,
    notReserved: !isReservedUsername(username.toLowerCase())
  };
  
  const isValid = Object.values(checks).every(Boolean);
  
  let error = null;
  if (!checks.minLength) error = 'Username must be at least 3 characters long';
  else if (!checks.maxLength) error = 'Username must be 30 characters or less';
  else if (!checks.validChars) error = 'Username can only contain letters, numbers, hyphens, and underscores';
  else if (!checks.notSanitized) error = 'Username contains invalid characters';
  else if (!checks.notReserved) error = 'Username is reserved';
  
  if (!checks.notSanitized) {
    logSecurityEvent('Username sanitization required', {
      original: username,
      sanitized,
      difference: username !== sanitized
    });
  }
  
  return { isValid, checks, error, sanitized };
};

/**
 * Plant name/strain validation
 * @param {string} name - Plant name to validate
 * @returns {Object} - Validation result
 */
export const validatePlantName = (name) => {
  if (typeof name !== 'string') {
    return { isValid: false, error: 'Plant name must be a string' };
  }
  
  const sanitized = sanitizeHTML(name.trim());
  
  const checks = {
    notEmpty: sanitized.length > 0,
    maxLength: sanitized.length <= 100,
    validChars: /^[a-zA-Z0-9\s#\-_().]+$/.test(sanitized),
    notSanitized: name.trim() === sanitized
  };
  
  const isValid = Object.values(checks).every(Boolean);
  
  let error = null;
  if (!checks.notEmpty) error = 'Plant name is required';
  else if (!checks.maxLength) error = 'Plant name must be 100 characters or less';
  else if (!checks.validChars) error = 'Plant name contains invalid characters';
  else if (!checks.notSanitized) error = 'Plant name contains unsafe characters';
  
  return { isValid, checks, error, sanitized };
};

/**
 * File upload validation
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const defaults = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  };
  
  const config = { ...defaults, ...options };
  
  if (!file || typeof file !== 'object') {
    return { isValid: false, error: 'No file provided' };
  }
  
  const checks = {
    validSize: file.size <= config.maxSize,
    validType: config.allowedTypes.includes(file.type),
    validExtension: config.allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    ),
    safeName: sanitizeFilePath(file.name) === file.name
  };
  
  const isValid = Object.values(checks).every(Boolean);
  
  let error = null;
  if (!checks.validSize) error = `File size must be less than ${Math.round(config.maxSize / 1024 / 1024)}MB`;
  else if (!checks.validType) error = 'File type not allowed';
  else if (!checks.validExtension) error = 'File extension not allowed';
  else if (!checks.safeName) error = 'File name contains unsafe characters';
  
  if (!checks.safeName) {
    logSecurityEvent('Unsafe file name detected', {
      originalName: file.name,
      sanitizedName: sanitizeFilePath(file.name),
      fileType: file.type,
      fileSize: file.size
    });
  }
  
  return {
    isValid,
    checks,
    error,
    sanitizedName: sanitizeFilePath(file.name),
    fileSizeMB: Math.round(file.size / 1024 / 1024 * 100) / 100
  };
};

/**
 * Rate limiting check (simple client-side implementation)
 * @param {string} action - Action being performed
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Object} - Rate limit result
 */
export const checkRateLimit = (action, maxAttempts = 5, windowMs = 60000) => {
  const key = `rateLimit_${action}`;
  const now = Date.now();
  
  let attempts = [];
  try {
    attempts = JSON.parse(localStorage.getItem(key) || '[]');
  } catch (error) {
    logWarning('Failed to parse rate limit data', { action, error: error.message });
  }
  
  // Remove attempts outside the window
  attempts = attempts.filter(timestamp => now - timestamp < windowMs);
  
  const isAllowed = attempts.length < maxAttempts;
  
  if (isAllowed) {
    attempts.push(now);
    localStorage.setItem(key, JSON.stringify(attempts));
  } else {
    logSecurityEvent('Rate limit exceeded', {
      action,
      attempts: attempts.length,
      maxAttempts,
      windowMs
    });
  }
  
  return {
    isAllowed,
    remainingAttempts: Math.max(0, maxAttempts - attempts.length),
    resetTime: attempts.length > 0 ? attempts[0] + windowMs : now,
    waitTime: isAllowed ? 0 : (attempts[0] + windowMs) - now
  };
};

// Helper functions
const isCommonPassword = (password) => {
  const common = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', 'dragon', 'master'
  ];
  return common.includes(password.toLowerCase());
};

const getPasswordStrengthText = (strength) => {
  const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return texts[Math.min(strength, texts.length - 1)];
};

const isReservedUsername = (username) => {
  const reserved = [
    'admin', 'administrator', 'root', 'system', 'user',
    'demo', 'test', 'guest', 'anonymous', 'null', 'undefined'
  ];
  return reserved.includes(username);
};

/**
 * Comprehensive input sanitization for all user inputs
 * @param {any} input - Input to sanitize
 * @param {string} type - Type of input (html, sql, filename, etc.)
 * @returns {any} - Sanitized input
 */
export const sanitizeInput = (input, type = 'html') => {
  if (input === null || input === undefined) return input;
  
  switch (type) {
    case 'html':
      return sanitizeHTML(input);
    case 'sql':
      return sanitizeSQL(input);
    case 'filename':
      return sanitizeFilePath(input);
    case 'email':
      return validateEmail(input);
    case 'username':
      return validateUsername(input);
    case 'plantname':
      return validatePlantName(input);
    default:
      return sanitizeHTML(input);
  }
};

export default {
  sanitizeHTML,
  sanitizeSQL,
  sanitizeFilePath,
  validateEmail,
  validatePassword,
  validateUsername,
  validatePlantName,
  validateFileUpload,
  checkRateLimit,
  sanitizeInput
};
