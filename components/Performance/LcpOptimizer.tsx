import { useEffect } from 'react';

const LcpOptimizer = () => {
  useEffect(() => {
    // Preconnect to external domains
    const preconnect = (url: string) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    };

    // Add your critical domains here
    preconnect('https://fonts.gstatic.com');
    preconnect('https://api.meetup.com');

    // Load critical CSS
    const criticalCSS = document.createElement('link');
    criticalCSS.rel = 'stylesheet';
    criticalCSS.href = '/styles/critical.css';
    document.head.appendChild(criticalCSS);

    // Load fonts after critical content
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap';
    document.head.appendChild(fontLink);

    // LCP measurement
    const measureLcp = () => {
      const lcpElements = document.querySelectorAll(
        'img, video, div[role="img"], svg, canvas'
      );

      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP candidate:', lastEntry);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    };

    window.addEventListener('load', measureLcp);
    return () => window.removeEventListener('load', measureLcp);
  }, []);

  return null;
};

export default LcpOptimizer;