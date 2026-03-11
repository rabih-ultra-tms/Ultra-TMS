/**
 * INFRA-005: Lighthouse CI Configuration
 *
 * Performance budgets for Ultra TMS frontend.
 * Run: pnpm dlx @lhci/cli autorun
 */
export default {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/login',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/orders',
        'http://localhost:3000/loads',
      ],
      startServerCommand: 'pnpm --filter web start',
      startServerReadyPattern: 'Ready',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        // Performance budgets
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        interactive: ['warn', { maxNumericValue: 5000 }],

        // Category scores (0-1)
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],

        // Bundle size guards
        'resource-summary:script:size': ['warn', { maxNumericValue: 1048576 }], // 1MB JS
        'resource-summary:total:size': ['warn', { maxNumericValue: 3145728 }], // 3MB total
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
