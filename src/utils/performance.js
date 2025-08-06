// 📊 Performance Monitoring & Optimization Utilities
// Implements performance requirements from PRE_COMMIT_CHECKLIST.md

import { logPerformance, logWarning, measurePerformance } from './logger.js';

/**
 * Performance monitoring configuration
 */
const PERFORMANCE_CONFIG = {
  // Performance thresholds in milliseconds
  thresholds: {
    pageLoad: 2000,
    componentMount: 500,
    apiCall: 1000,
    imageUpload: 3000,
    localStorage: 100,
    formSubmit: 500,
    navigation: 200
  },
  
  // Enable/disable monitoring based on environment
  enabled: true,
  
  // Sample rate (0-1) for production to reduce overhead
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
};

/**
 * Performance observer for tracking web vitals
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.setupObservers();
  }

  setupObservers() {
    if (!window.PerformanceObserver) {
      logWarning('PerformanceObserver not supported');
      return;
    }

    // Core Web Vitals monitoring
    this.observeLCP(); // Largest Contentful Paint
    this.observeFID(); // First Input Delay
    this.observeCLS(); // Cumulative Layout Shift
  }

  observeLCP() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric('LCP', lastEntry.startTime, {
          element: lastEntry.element?.tagName || 'unknown',
          url: lastEntry.url || window.location.href
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('LCP', observer);
    } catch (error) {
      logWarning('Failed to setup LCP observer', { error: error.message });
    }
  }

  observeFID() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, {
            eventType: entry.name,
            target: entry.target?.tagName || 'unknown'
          });
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('FID', observer);
    } catch (error) {
      logWarning('Failed to setup FID observer', { error: error.message });
    }
  }

  observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.recordMetric('CLS', clsValue, {
          sources: entries.map(e => e.sources?.map(s => s.node?.tagName).join(',') || 'unknown')
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('CLS', observer);
    } catch (error) {
      logWarning('Failed to setup CLS observer', { error: error.message });
    }
  }

  recordMetric(name, value, metadata = {}) {
    if (!this.shouldSample()) return;

    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      connection: this.getConnectionInfo(),
      ...metadata
    };

    this.metrics.set(`${name}_${Date.now()}`, metric);
    
    // Log performance issues
    const threshold = this.getThreshold(name);
    if (threshold && value > threshold) {
      logPerformance(`${name} threshold exceeded`, value, {
        threshold,
        exceedBy: value - threshold,
        ...metadata
      });
    }
    
    // Keep only recent metrics to prevent memory bloat
    this.cleanupOldMetrics();
  }

  getThreshold(metricName) {
    const thresholds = {
      'LCP': 2500,  // Web Vitals threshold
      'FID': 100,   // Web Vitals threshold
      'CLS': 0.1    // Web Vitals threshold
    };
    return thresholds[metricName];
  }

  getConnectionInfo() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  shouldSample() {
    return Math.random() < PERFORMANCE_CONFIG.sampleRate;
  }

  cleanupOldMetrics() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    for (const [key, metric] of this.metrics) {
      if (now - metric.timestamp > maxAge) {
        this.metrics.delete(key);
      }
    }
  }

  getMetrics() {
    return Array.from(this.metrics.values());
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

// Global performance monitor instance
const monitor = new PerformanceMonitor();

/**
 * Mark the start of a performance measurement
 * @param {string} label - Performance measurement label
 */
export const markStart = (label) => {
  if (!PERFORMANCE_CONFIG.enabled) return;
  
  performance.mark(`${label}-start`);
};

/**
 * Mark the end of a performance measurement and log the duration
 * @param {string} label - Performance measurement label
 * @param {Object} metadata - Additional context
 */
export const markEnd = (label, metadata = {}) => {
  if (!PERFORMANCE_CONFIG.enabled) return;

  try {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label, 'measure')[0];
    if (measure) {
      const duration = measure.duration;
      const threshold = PERFORMANCE_CONFIG.thresholds[label] || 1000;
      
      logPerformance(label, duration, {
        threshold,
        exceedsThreshold: duration > threshold,
        ...metadata
      });
      
      // Clean up marks
      performance.clearMarks(`${label}-start`);
      performance.clearMarks(`${label}-end`);
      performance.clearMeasures(label);
    }
  } catch (error) {
    logWarning('Performance measurement failed', { label, error: error.message });
  }
};

/**
 * Measure the performance of an async operation
 * @param {string} operation - Operation name
 * @param {Function} fn - Async function to measure
 * @param {Object} metadata - Additional context
 * @returns {Promise} - Function result with performance data
 */
export const measureAsync = async (operation, fn, metadata = {}) => {
  if (!PERFORMANCE_CONFIG.enabled) {
    return await fn();
  }

  return await measurePerformance(operation, fn);
};

/**
 * Measure component render performance
 * @param {string} componentName - Component name
 * @param {Function} renderFn - Render function
 * @returns {any} - Render result
 */
export const measureRender = (componentName, renderFn) => {
  if (!PERFORMANCE_CONFIG.enabled) {
    return renderFn();
  }

  markStart(`render-${componentName}`);
  
  try {
    const result = renderFn();
    markEnd(`render-${componentName}`, { component: componentName });
    return result;
  } catch (error) {
    logWarning('Component render failed', { 
      component: componentName, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Monitor localStorage performance
 * @param {string} operation - 'get', 'set', 'remove', or 'clear'
 * @param {Function} fn - localStorage operation
 * @returns {any} - Operation result
 */
export const measureLocalStorage = (operation, fn) => {
  if (!PERFORMANCE_CONFIG.enabled) {
    return fn();
  }

  const startTime = performance.now();
  
  try {
    const result = fn();
    const duration = performance.now() - startTime;
    
    logPerformance(`localStorage-${operation}`, duration, {
      operation,
      storageUsed: getStorageUsage(),
      threshold: PERFORMANCE_CONFIG.thresholds.localStorage
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logPerformance(`localStorage-${operation}-error`, duration, {
      operation,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get localStorage usage statistics
 * @returns {Object} - Storage usage info
 */
export const getStorageUsage = () => {
  try {
    let totalSize = 0;
    const itemCount = localStorage.length;
    
    for (let i = 0; i < itemCount; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += key.length + (value ? value.length : 0);
    }
    
    // Estimate quota (usually 5-10MB)
    const estimatedQuota = 5 * 1024 * 1024; // 5MB
    const usagePercent = (totalSize / estimatedQuota) * 100;
    
    return {
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024),
      itemCount,
      usagePercent: Math.round(usagePercent),
      estimatedQuotaKB: Math.round(estimatedQuota / 1024)
    };
  } catch (error) {
    logWarning('Failed to calculate storage usage', { error: error.message });
    return { totalSizeBytes: 0, itemCount: 0, usagePercent: 0 };
  }
};

/**
 * Monitor network performance for fetch requests
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch response with performance data
 */
export const monitoredFetch = async (url, options = {}) => {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const duration = performance.now() - startTime;
    
    logPerformance('network-request', duration, {
      url,
      method: options.method || 'GET',
      status: response.status,
      responseType: response.headers.get('content-type'),
      threshold: PERFORMANCE_CONFIG.thresholds.apiCall
    });
    
    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    logPerformance('network-request-error', duration, {
      url,
      method: options.method || 'GET',
      error: error.message
    });
    
    throw error;
  }
};

/**
 * Check if device has performance constraints
 * @returns {Object} - Device performance info
 */
export const getDevicePerformanceInfo = () => {
  const info = {
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    memory: navigator.deviceMemory || 'unknown',
    connection: monitor.getConnectionInfo(),
    isLowEndDevice: false
  };
  
  // Detect low-end devices
  info.isLowEndDevice = (
    info.hardwareConcurrency <= 2 ||
    (info.memory && info.memory <= 2) ||
    (info.connection && info.connection.effectiveType === 'slow-2g')
  );
  
  return info;
};

/**
 * Optimize performance based on device capabilities
 * @returns {Object} - Performance optimization settings
 */
export const getPerformanceOptimizations = () => {
  const deviceInfo = getDevicePerformanceInfo();
  
  return {
    shouldLazyLoad: deviceInfo.isLowEndDevice,
    shouldReduceAnimations: deviceInfo.isLowEndDevice,
    shouldCompressImages: deviceInfo.connection?.saveData || deviceInfo.isLowEndDevice,
    maxConcurrentRequests: deviceInfo.isLowEndDevice ? 2 : 6,
    cacheStrategy: deviceInfo.isLowEndDevice ? 'aggressive' : 'normal'
  };
};

/**
 * Get performance summary for debugging
 * @returns {Object} - Performance summary
 */
export const getPerformanceSummary = () => {
  return {
    metrics: monitor.getMetrics(),
    deviceInfo: getDevicePerformanceInfo(),
    storageUsage: getStorageUsage(),
    optimizations: getPerformanceOptimizations(),
    config: PERFORMANCE_CONFIG
  };
};

/**
 * Clean up performance monitoring
 */
export const cleanup = () => {
  monitor.disconnect();
};

// React Hook for performance monitoring
export const usePerformanceMonitoring = (componentName) => {
  const markComponentStart = () => markStart(`component-${componentName}`);
  const markComponentEnd = () => markEnd(`component-${componentName}`, { component: componentName });
  
  return {
    markStart: markComponentStart,
    markEnd: markComponentEnd,
    measureOperation: (operation, fn) => measureAsync(`${componentName}-${operation}`, fn, { component: componentName })
  };
};

export default {
  markStart,
  markEnd,
  measureAsync,
  measureRender,
  measureLocalStorage,
  monitoredFetch,
  getStorageUsage,
  getDevicePerformanceInfo,
  getPerformanceOptimizations,
  getPerformanceSummary,
  usePerformanceMonitoring,
  cleanup
};
