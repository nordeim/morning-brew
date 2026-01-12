class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null
    };
    this.initPerformanceMonitoring();
  }

  initPerformanceMonitoring() {
    if ('performance' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.fcp = entries[0].startTime;
        this.logMetric('FCP', this.metrics.fcp);
      });
      fcpObserver.observe({ type: 'paint', buffered: true });

      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.lcp = entries[0].startTime;
        this.logMetric('LCP', this.metrics.lcp);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      let firstInputDelay = null;
      document.addEventListener('keydown', this.trackFirstInput.bind(this), { once: true });
      document.addEventListener('click', this.trackFirstInput.bind(this), { once: true });
      document.addEventListener('touchstart', this.trackFirstInput.bind(this), { once: true });
    }

    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          this.metrics.cls = (this.metrics.cls || 0) + entry.value;
        }
      }
      this.logMetric('CLS', this.metrics.cls);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    window.addEventListener('load', () => {
      this.logResourceMetrics();
    });
  }

  trackFirstInput(event) {
    const timing = event.timeStamp;
    const firstInputDelay = timing - performance.timing.navigationStart;
    this.metrics.fid = firstInputDelay;
    this.logMetric('FID', firstInputDelay);
  }

  logMetric(name, value) {
    console.log(`${name}: ${value.toFixed(2)}ms`);

    if (value > this.getThreshold(name)) {
      this.logPerformanceIssue(name, value);
    }
  }

  getThreshold(metric) {
    const thresholds = {
      'FCP': 1800,
      'LCP': 2500,
      'FID': 100,
      'CLS': 0.1
    };
    return thresholds[metric] || 0;
  }

  logPerformanceIssue(metric, value) {
    console.warn(`⚠️ Performance issue: ${metric} = ${value.toFixed(2)}ms exceeds threshold of ${this.getThreshold(metric)}ms`);
  }

  logResourceMetrics() {
    const resources = performance.getEntriesByType('resource');
    const totalSize = resources.reduce((sum, res) => sum + (res.decodedBodySize || 0), 0);
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;

    console.log(`===== RESOURCE METRICS =====`);
    console.log(`Total page size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Page load time: ${loadTime}ms`);
    console.log(`Total resources: ${resources.length}`);
  }

  generatePerformanceReport() {
    console.log('===== PERFORMANCE REPORT =====');
    console.log(`FCP: ${this.metrics.fcp ? this.metrics.fcp.toFixed(2) : 'N/A'}ms`);
    console.log(`LCP: ${this.metrics.lcp ? this.metrics.lcp.toFixed(2) : 'N/A'}ms`);
    console.log(`FID: ${this.metrics.fid ? this.metrics.fid.toFixed(2) : 'N/A'}ms`);
    console.log(`CLS: ${this.metrics.cls ? this.metrics.cls.toFixed(4) : 'N/A'}`);

    const score = this.calculatePerformanceScore();
    console.log(`Performance Score: ${score}/100`);

    return score;
  }

  calculatePerformanceScore() {
    let score = 100;
    if (this.metrics.fcp && this.metrics.fcp > 1800) score -= 10;
    if (this.metrics.lcp && this.metrics.lcp > 2500) score -= 15;
    if (this.metrics.fid && this.metrics.fid > 100) score -= 10;
    if (this.metrics.cls && this.metrics.cls > 0.1) score -= 10;
    return Math.max(0, score);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const perfMonitor = new PerformanceMonitor();

  window.addEventListener('load', () => {
    const score = perfMonitor.generatePerformanceReport();

    if (score < 90) {
      console.warn(`⚠️ Performance score ${score}/100 needs improvement`);
    }
  });
});
