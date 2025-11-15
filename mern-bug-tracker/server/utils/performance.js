/**
 * Performance Monitoring Utilities
 * 
 * These utilities help monitor and measure application performance
 * on both server and client side.
 */

/**
 * Server-Side Performance Utilities
 */

// Measure function execution time
const measureExecutionTime = async (fn, label = 'Function') => {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    console.log(`⏱️  ${label} took ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${label} failed after ${duration}ms:`, error.message);
    throw error;
  }
};

// Database query performance monitor
const monitorQuery = (schema) => {
  schema.pre('find', function () {
    this._startTime = Date.now();
  });

  schema.post('find', function (docs) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      if (duration > 100) {
        console.warn(`⚠️  Slow query detected: ${this.mongooseCollection.name}.find() took ${duration}ms`);
      }
    }
  });

  schema.pre('findOne', function () {
    this._startTime = Date.now();
  });

  schema.post('findOne', function (doc) {
    if (this._startTime) {
      const duration = Date.now() - this._startTime;
      if (duration > 100) {
        console.warn(`⚠️  Slow query detected: ${this.mongooseCollection.name}.findOne() took ${duration}ms`);
      }
    }
  });
};

// Memory usage monitor
const logMemoryUsage = () => {
  const used = process.memoryUsage();
  const usage = {
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`, // Resident Set Size
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`,
  };
  console.log('📊 Memory Usage:', usage);
  return usage;
};

// API endpoint performance tracking
const trackEndpointPerformance = () => {
  const stats = new Map();

  return {
    middleware: (req, res, next) => {
      const start = Date.now();
      const endpoint = `${req.method} ${req.route?.path || req.path}`;

      res.on('finish', () => {
        const duration = Date.now() - start;

        if (!stats.has(endpoint)) {
          stats.set(endpoint, {
            count: 0,
            totalTime: 0,
            minTime: Infinity,
            maxTime: 0,
            avgTime: 0,
          });
        }

        const stat = stats.get(endpoint);
        stat.count++;
        stat.totalTime += duration;
        stat.minTime = Math.min(stat.minTime, duration);
        stat.maxTime = Math.max(stat.maxTime, duration);
        stat.avgTime = stat.totalTime / stat.count;

        if (duration > 1000) {
          console.warn(`⚠️  Slow endpoint: ${endpoint} took ${duration}ms`);
        }
      });

      next();
    },

    getStats: () => {
      const results = [];
      stats.forEach((value, key) => {
        results.push({
          endpoint: key,
          ...value,
          minTime: `${value.minTime}ms`,
          maxTime: `${value.maxTime}ms`,
          avgTime: `${Math.round(value.avgTime)}ms`,
        });
      });
      return results.sort((a, b) => b.count - a.count);
    },

    reset: () => stats.clear(),
  };
};

/**
 * Client-Side Performance Utilities
 */

// Measure React component render time
const measureComponentRender = (componentName) => {
  return {
    onRender: (id, phase, actualDuration, baseDuration, startTime, commitTime) => {
      if (actualDuration > 16) { // More than one frame at 60fps
        console.warn(`⚠️  ${componentName} ${phase} took ${actualDuration.toFixed(2)}ms`);
      }

      // Log to analytics service
      if (window.analytics) {
        window.analytics.track('Component Render', {
          component: componentName,
          phase,
          duration: actualDuration,
        });
      }
    },
  };
};

// Measure API call performance
const measureApiCall = async (apiCall, endpoint) => {
  const startTime = performance.now();

  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;

    console.log(`📡 API ${endpoint}: ${duration.toFixed(2)}ms`);

    if (duration > 1000) {
      console.warn(`⚠️  Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ API ${endpoint} failed after ${duration.toFixed(2)}ms:`, error.message);
    throw error;
  }
};

// Page load metrics
const getPageLoadMetrics = () => {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const perfData = performance.getEntriesByType('navigation')[0];

  if (!perfData) {
    return null;
  }

  return {
    // Time to Interactive (TTI)
    tti: perfData.domInteractive - perfData.fetchStart,

    // DOM Content Loaded
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,

    // Full page load
    loadComplete: perfData.loadEventEnd - perfData.fetchStart,

    // DNS lookup
    dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,

    // TCP connection
    tcpTime: perfData.connectEnd - perfData.connectStart,

    // Request time
    requestTime: perfData.responseStart - perfData.requestStart,

    // Response time
    responseTime: perfData.responseEnd - perfData.responseStart,

    // Processing time
    processingTime: perfData.domComplete - perfData.domLoading,

    // First paint (if available)
    firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,

    // First contentful paint (if available)
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
  };
};

// Log page load metrics
const logPageLoadMetrics = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPageLoadMetrics();

      if (metrics) {
        console.group('📊 Page Load Metrics');
        console.log('Time to Interactive:', `${metrics.tti}ms`);
        console.log('DOM Content Loaded:', `${metrics.domContentLoaded}ms`);
        console.log('Load Complete:', `${metrics.loadComplete}ms`);
        console.log('DNS Time:', `${metrics.dnsTime}ms`);
        console.log('TCP Time:', `${metrics.tcpTime}ms`);
        console.log('Request Time:', `${metrics.requestTime}ms`);
        console.log('Response Time:', `${metrics.responseTime}ms`);
        console.log('Processing Time:', `${metrics.processingTime}ms`);

        if (metrics.firstPaint) {
          console.log('First Paint:', `${metrics.firstPaint.toFixed(2)}ms`);
        }

        if (metrics.firstContentfulPaint) {
          console.log('First Contentful Paint:', `${metrics.firstContentfulPaint.toFixed(2)}ms`);
        }

        console.groupEnd();

        // Send to analytics
        if (window.analytics) {
          window.analytics.track('Page Load', metrics);
        }
      }
    }, 0);
  });
};

// FPS (Frames Per Second) monitor
const createFPSMonitor = () => {
  let lastTime = performance.now();
  let frames = 0;
  let fps = 60;

  const updateFPS = () => {
    const currentTime = performance.now();
    frames++;

    if (currentTime >= lastTime + 1000) {
      fps = Math.round((frames * 1000) / (currentTime - lastTime));
      frames = 0;
      lastTime = currentTime;

      if (fps < 30) {
        console.warn(`⚠️  Low FPS detected: ${fps} fps`);
      }
    }

    requestAnimationFrame(updateFPS);
  };

  return {
    start: () => {
      requestAnimationFrame(updateFPS);
    },
    getFPS: () => fps,
  };
};

// Bundle size analyzer
const logBundleSize = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  const resources = performance.getEntriesByType('resource');
  const scripts = resources.filter(r => r.name.endsWith('.js'));
  const styles = resources.filter(r => r.name.endsWith('.css'));

  const scriptSize = scripts.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const styleSize = styles.reduce((sum, r) => sum + (r.transferSize || 0), 0);

  console.group('📦 Bundle Sizes');
  console.log('JavaScript:', `${(scriptSize / 1024).toFixed(2)} KB`);
  console.log('CSS:', `${(styleSize / 1024).toFixed(2)} KB`);
  console.log('Total:', `${((scriptSize + styleSize) / 1024).toFixed(2)} KB`);
  console.groupEnd();

  if (scriptSize > 500 * 1024) {
    console.warn('⚠️  Large JavaScript bundle detected. Consider code splitting.');
  }
};

// Export utilities
module.exports = {
  // Server-side
  measureExecutionTime,
  monitorQuery,
  logMemoryUsage,
  trackEndpointPerformance,

  // Client-side (use in browser)
  measureComponentRender,
  measureApiCall,
  getPageLoadMetrics,
  logPageLoadMetrics,
  createFPSMonitor,
  logBundleSize,
};
