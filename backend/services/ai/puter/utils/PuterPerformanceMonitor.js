/**
 * Puter Performance Monitor
 * Advanced performance monitoring and metrics collection for Puter services
 * Mirrors the monitoring patterns from the tailoring system
 */

class PuterPerformanceMonitor {
  constructor() {
    this.name = 'Puter Performance Monitor';
    this.version = '1.0.0';
    this.startTime = Date.now();
    
    // Performance metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      
      // Operation-specific metrics
      operationMetrics: {},
      
      // Engine performance
      engineMetrics: {
        auth: { calls: 0, totalTime: 0, errors: 0 },
        request: { calls: 0, totalTime: 0, errors: 0 },
        response: { calls: 0, totalTime: 0, errors: 0 },
        jobAnalysis: { calls: 0, totalTime: 0, errors: 0 },
        cvTailoring: { calls: 0, totalTime: 0, errors: 0 }
      },
      
      // Memory usage
      memoryUsage: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      },
      
      // System metrics
      systemMetrics: {
        cpuUsage: 0,
        uptime: 0,
        loadAverage: []
      }
    };
    
    // Performance thresholds
    this.thresholds = {
      maxResponseTime: 30000, // 30 seconds
      maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
      maxCpuUsage: 80, // 80%
      minSuccessRate: 0.95 // 95%
    };
    
    // Monitoring intervals
    this.monitoringInterval = null;
    this.reportingInterval = null;
    
    // Start monitoring
    this.startMonitoring();
    
    console.log('📊 Puter Performance Monitor initialized');
  }

  /**
   * Start monitoring system performance
   */
  startMonitoring() {
    // Monitor memory usage every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.updateMemoryMetrics();
      this.updateSystemMetrics();
    }, 5000);
    
    // Generate performance reports every minute
    this.reportingInterval = setInterval(() => {
      this.generatePerformanceReport();
    }, 60000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
  }

  /**
   * Record operation start
   * @param {string} operation - Operation name
   * @param {string} engine - Engine name
   * @returns {string} - Operation ID
   */
  startOperation(operation, engine = 'unknown') {
    const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const operationData = {
      id: operationId,
      operation,
      engine,
      startTime: Date.now(),
      startMemory: process.memoryUsage().heapUsed
    };
    
    // Initialize operation metrics if not exists
    if (!this.metrics.operationMetrics[operation]) {
      this.metrics.operationMetrics[operation] = {
        calls: 0,
        totalTime: 0,
        averageTime: 0,
        errors: 0,
        successRate: 0
      };
    }
    
    this.metrics.operationMetrics[operation].calls++;
    this.metrics.totalRequests++;
    
    return operationId;
  }

  /**
   * Record operation completion
   * @param {string} operationId - Operation ID
   * @param {boolean} success - Operation success status
   * @param {Object} metadata - Additional metadata
   */
  endOperation(operationId, success = true, metadata = {}) {
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;
    
    // Extract operation info from ID
    const [operation] = operationId.split('_');
    
    if (this.metrics.operationMetrics[operation]) {
      const operationMetrics = this.metrics.operationMetrics[operation];
      const executionTime = endTime - (metadata.startTime || endTime);
      
      operationMetrics.totalTime += executionTime;
      operationMetrics.averageTime = operationMetrics.totalTime / operationMetrics.calls;
      
      if (success) {
        this.metrics.successfulRequests++;
      } else {
        this.metrics.failedRequests++;
        operationMetrics.errors++;
      }
      
      operationMetrics.successRate = (operationMetrics.calls - operationMetrics.errors) / operationMetrics.calls;
      
      // Update global metrics
      this.updateGlobalMetrics(executionTime);
      
      // Update engine metrics
      if (metadata.engine && this.metrics.engineMetrics[metadata.engine]) {
        const engineMetrics = this.metrics.engineMetrics[metadata.engine];
        engineMetrics.calls++;
        engineMetrics.totalTime += executionTime;
        
        if (!success) {
          engineMetrics.errors++;
        }
      }
      
      // Log performance warning if needed
      this.checkPerformanceThresholds(operation, executionTime, metadata);
    }
  }

  /**
   * Update global performance metrics
   * @param {number} executionTime - Operation execution time
   */
  updateGlobalMetrics(executionTime) {
    this.metrics.totalResponseTime += executionTime;
    this.metrics.averageResponseTime = this.metrics.totalResponseTime / this.metrics.totalRequests;
    
    if (executionTime < this.metrics.minResponseTime) {
      this.metrics.minResponseTime = executionTime;
    }
    
    if (executionTime > this.metrics.maxResponseTime) {
      this.metrics.maxResponseTime = executionTime;
    }
  }

  /**
   * Update memory metrics
   */
  updateMemoryMetrics() {
    const memoryUsage = process.memoryUsage();
    
    this.metrics.memoryUsage = {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss
    };
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    this.metrics.systemMetrics = {
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      loadAverage: require('os').loadavg()
    };
  }

  /**
   * Check performance thresholds and log warnings
   * @param {string} operation - Operation name
   * @param {number} executionTime - Execution time
   * @param {Object} metadata - Operation metadata
   */
  checkPerformanceThresholds(operation, executionTime, metadata = {}) {
    const warnings = [];
    
    // Check response time threshold
    if (executionTime > this.thresholds.maxResponseTime) {
      warnings.push(`⚠️ Slow operation: ${operation} took ${executionTime}ms (threshold: ${this.thresholds.maxResponseTime}ms)`);
    }
    
    // Check memory usage threshold
    if (this.metrics.memoryUsage.heapUsed > this.thresholds.maxMemoryUsage) {
      warnings.push(`⚠️ High memory usage: ${Math.round(this.metrics.memoryUsage.heapUsed / 1024 / 1024)}MB (threshold: ${Math.round(this.thresholds.maxMemoryUsage / 1024 / 1024)}MB)`);
    }
    
    // Check success rate threshold
    const operationMetrics = this.metrics.operationMetrics[operation];
    if (operationMetrics && operationMetrics.successRate < this.thresholds.minSuccessRate) {
      warnings.push(`⚠️ Low success rate: ${operation} has ${(operationMetrics.successRate * 100).toFixed(2)}% success rate (threshold: ${(this.thresholds.minSuccessRate * 100).toFixed(2)}%)`);
    }
    
    // Log warnings
    warnings.forEach(warning => console.warn(warning));
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      overview: {
        totalRequests: this.metrics.totalRequests,
        successfulRequests: this.metrics.successfulRequests,
        failedRequests: this.metrics.failedRequests,
        successRate: this.metrics.totalRequests > 0 ? (this.metrics.successfulRequests / this.metrics.totalRequests) : 0,
        averageResponseTime: this.metrics.averageResponseTime,
        minResponseTime: this.metrics.minResponseTime === Infinity ? 0 : this.metrics.minResponseTime,
        maxResponseTime: this.metrics.maxResponseTime
      },
      operations: this.metrics.operationMetrics,
      engines: this.getEnginePerformanceReport(),
      memory: this.metrics.memoryUsage,
      system: this.metrics.systemMetrics,
      health: this.getHealthStatus()
    };
    
    console.log('📊 Performance Report:', JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * Get engine performance report
   */
  getEnginePerformanceReport() {
    const engineReport = {};
    
    Object.entries(this.metrics.engineMetrics).forEach(([engine, metrics]) => {
      engineReport[engine] = {
        calls: metrics.calls,
        averageTime: metrics.calls > 0 ? metrics.totalTime / metrics.calls : 0,
        errors: metrics.errors,
        successRate: metrics.calls > 0 ? (metrics.calls - metrics.errors) / metrics.calls : 0
      };
    });
    
    return engineReport;
  }

  /**
   * Get overall health status
   */
  getHealthStatus() {
    const health = {
      overall: 'healthy',
      issues: []
    };
    
    // Check various health indicators
    const successRate = this.metrics.totalRequests > 0 ? 
      (this.metrics.successfulRequests / this.metrics.totalRequests) : 1;
    
    if (successRate < this.thresholds.minSuccessRate) {
      health.overall = 'degraded';
      health.issues.push('Low success rate');
    }
    
    if (this.metrics.averageResponseTime > this.thresholds.maxResponseTime * 0.8) {
      health.overall = 'degraded';
      health.issues.push('High response times');
    }
    
    if (this.metrics.memoryUsage.heapUsed > this.thresholds.maxMemoryUsage * 0.8) {
      health.overall = 'degraded';
      health.issues.push('High memory usage');
    }
    
    if (health.issues.length > 2) {
      health.overall = 'unhealthy';
    }
    
    return health;
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics.totalRequests = 0;
    this.metrics.successfulRequests = 0;
    this.metrics.failedRequests = 0;
    this.metrics.totalResponseTime = 0;
    this.metrics.averageResponseTime = 0;
    this.metrics.minResponseTime = Infinity;
    this.metrics.maxResponseTime = 0;
    this.metrics.operationMetrics = {};
    
    // Reset engine metrics
    Object.keys(this.metrics.engineMetrics).forEach(engine => {
      this.metrics.engineMetrics[engine] = {
        calls: 0,
        totalTime: 0,
        errors: 0
      };
    });
    
    console.log('📊 Performance metrics reset');
  }

  /**
   * Configure performance thresholds
   * @param {Object} newThresholds - New threshold values
   */
  configureThresholds(newThresholds) {
    this.thresholds = {
      ...this.thresholds,
      ...newThresholds
    };
    
    console.log('📊 Performance thresholds updated:', this.thresholds);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopMonitoring();
    console.log('📊 Puter Performance Monitor cleaned up');
  }
}

module.exports = PuterPerformanceMonitor;
