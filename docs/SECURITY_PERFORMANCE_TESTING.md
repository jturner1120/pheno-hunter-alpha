# 🛠️ Security & Performance Testing Utilities

This document describes the security and performance testing utilities implemented to support the enhanced development standards.

## 🧪 Testing the New Infrastructure

### Security Utilities Testing

Run these commands to test the security utilities:

```bash
# Test security validation
npm run test -- --grep "security"

# Test input sanitization
npm run test -- --grep "sanitization"

# Test rate limiting
npm run test -- --grep "rateLimit"
```

### Performance Monitoring Testing

```bash
# Test performance monitoring
npm run test -- --grep "performance"

# Test localStorage monitoring
npm run test -- --grep "localStorage"

# Run performance benchmarks
npm run test:performance
```

### Logger Testing

```bash
# Test structured logging
npm run test -- --grep "logger"

# Test error tracking
npm run test -- --grep "errorTracking"
```

## 🔧 Integration with Existing Code

### Authentication Components

Update authentication components to use security utilities:

```javascript
import { validateEmail, validatePassword, checkRateLimit, logSecurityEvent } from '../utils/security.js';
import { logUserAction } from '../utils/logger.js';

// In Login.jsx
const handleLogin = async (email, password) => {
  // Rate limiting check
  const rateLimit = checkRateLimit('login', 5, 300000); // 5 attempts per 5 minutes
  if (!rateLimit.isAllowed) {
    logSecurityEvent('Login rate limit exceeded', { email, waitTime: rateLimit.waitTime });
    return { success: false, error: 'Too many login attempts. Please try again later.' };
  }

  // Input validation
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);

  if (!emailValidation.isValid || !passwordValidation.isValid) {
    logSecurityEvent('Invalid login credentials format', { email: email.substring(0, 10) });
    return { success: false, error: 'Invalid credentials format' };
  }

  // Log user action
  logUserAction('login_attempt', { email: email.substring(0, 10) });

  // Continue with authentication...
};
```

### Plant Form Components

Update plant forms to use input sanitization:

```javascript
import { validatePlantName, sanitizeHTML, logUserAction } from '../utils/security.js';
import { measureAsync } from '../utils/performance.js';

// In PlantForm.jsx
const handleSubmit = async (formData) => {
  // Validate and sanitize plant name
  const nameValidation = validatePlantName(formData.name);
  if (!nameValidation.isValid) {
    return { success: false, error: nameValidation.error };
  }

  // Sanitize diary entries
  const sanitizedDiary = sanitizeHTML(formData.diary);

  // Log user action
  logUserAction('plant_created', { strain: formData.strain });

  // Measure save performance
  const result = await measureAsync('plant_save', async () => {
    return savePlantData({ ...formData, name: nameValidation.sanitized, diary: sanitizedDiary });
  });

  return result;
};
```

### Dashboard Performance Monitoring

```javascript
import { markStart, markEnd, getStorageUsage } from '../utils/performance.js';
import { logPerformance } from '../utils/logger.js';

// In Dashboard.jsx
useEffect(() => {
  markStart('dashboard_load');
  
  const loadDashboard = async () => {
    // Load plants data
    const plants = await getPlantsData();
    setPlants(plants);
    
    // Check storage usage
    const storage = getStorageUsage();
    if (storage.usagePercent > 80) {
      logPerformance('Storage usage high', storage.usagePercent, { storage });
    }
    
    markEnd('dashboard_load', { plantCount: plants.length });
  };

  loadDashboard();
}, []);
```

## 📊 Monitoring & Debugging

### Development Console Commands

Add these to your browser console during development:

```javascript
// View security logs
const logs = window.PhenoHunter?.getStoredLogs?.() || [];
console.table(logs.filter(log => log.level === 'security'));

// View performance summary
const perf = window.PhenoHunter?.getPerformanceSummary?.();
console.log('Performance Summary:', perf);

// Check storage usage
const storage = window.PhenoHunter?.getStorageUsage?.();
console.log('Storage Usage:', storage);

// Test input sanitization
const test = window.PhenoHunter?.sanitizeHTML?.('<script>alert("xss")</script>Hello');
console.log('Sanitized:', test);
```

### Production Monitoring

In production, these utilities will:

1. **Send security events** to your monitoring service (Sentry, DataDog, etc.)
2. **Track performance metrics** for optimization
3. **Log user actions** for analytics and debugging
4. **Monitor storage usage** to prevent quota issues
5. **Rate limit** suspicious activities

## 🔒 Security Implementation Checklist

- [x] **Input Sanitization**: HTML, SQL, and path traversal prevention
- [x] **Authentication Security**: Email/password validation, rate limiting
- [x] **File Upload Security**: Type validation, size limits, safe naming
- [x] **Error Handling**: Sanitized error messages, no data leakage
- [x] **Logging**: Security events, suspicious activities
- [x] **Rate Limiting**: Prevent brute force attacks

## 📈 Performance Implementation Checklist

- [x] **Core Web Vitals**: LCP, FID, CLS monitoring
- [x] **Component Performance**: Render time tracking
- [x] **Storage Monitoring**: localStorage usage and performance
- [x] **Network Monitoring**: API call performance tracking
- [x] **Device Detection**: Performance optimization based on device capabilities
- [x] **Memory Management**: Automatic cleanup of old metrics

## 🎯 npm Scripts to Add

Add these to your `package.json`:

```json
{
  "scripts": {
    "test:security": "vitest run --grep security",
    "test:performance": "vitest run --grep performance",
    "test:integration": "vitest run tests/integration",
    "audit:security": "npm audit --audit-level moderate",
    "analyze:bundle": "vite build --analyze",
    "check:performance": "lighthouse http://localhost:5173 --only-categories=performance --chrome-flags='--headless'",
    "validate:code": "npm run test && npm run audit:security && npm run check:performance"
  }
}
```

## 🚀 Next Steps

1. **Integrate utilities** into existing components
2. **Write tests** for the new security and performance utilities
3. **Set up CI/CD** to run security scans and performance checks
4. **Configure monitoring** service endpoints in production
5. **Train team** on using the new utilities and monitoring tools

These utilities now provide the infrastructure needed to meet all the security and performance requirements outlined in your development standards and pre-commit checklist.
