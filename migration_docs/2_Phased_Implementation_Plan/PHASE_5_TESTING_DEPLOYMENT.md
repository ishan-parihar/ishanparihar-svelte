# Phase 5: Testing & Deployment Manual

## Overview

**Duration**: 2 weeks
**Priority**: 🟡 Medium
**Team**: 2-3 Full-stack developers + 1 DevOps engineer
**Dependencies**: Phase 1, 2, 3, & 4 completion

Phase 5 focuses on comprehensive testing, production deployment, and monitoring setup. This phase ensures the migrated SvelteKit application is production-ready with proper quality assurance and deployment infrastructure.

## Architecture Analysis

### Testing Strategy Overview

#### 1. **Testing Pyramid**
- **Unit Tests** - 70% of tests, fast execution, isolated components
- **Integration Tests** - 20% of tests, component interactions, API integration
- **End-to-End Tests** - 10% of tests, user workflows, critical paths

#### 2. **Testing Tools**
- **Vitest** - Unit testing framework with Svelte support
- **Playwright** - E2E testing with cross-browser support
- **Testing Library** - Component testing utilities
- **MSW** - API mocking for testing

#### 3. **Quality Assurance**
- **Code Coverage** - Target >80% coverage
- **Performance Testing** - Load testing and performance benchmarks
- **Security Testing** - Vulnerability scanning and penetration testing
- **Accessibility Testing** - WCAG 2.1 compliance validation

### Deployment Architecture

#### 1. **Deployment Pipeline**
```
Git Push → CI/CD Pipeline → Build → Test → Deploy → Monitor
```

#### 2. **Infrastructure**
- **Vercel** - Primary hosting platform with edge functions
- **CDN** - Global content delivery network
- **Monitoring** - Application performance monitoring
- **Logging** - Centralized logging and error tracking

#### 3. **Environment Management**
- **Development** - Local development with hot reload
- **Staging** - Production-like environment for testing
- **Production** - Live environment with monitoring

## Implementation Guide

### Week 1: Comprehensive Testing

#### Day 1-3: Unit Testing Setup

**1. Vitest Configuration**
```typescript
// vite.config.ts
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});
```

**2. Test Setup Configuration**
```typescript
// src/test/setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import { server } from 'msw/node';
import { handlers } from './mocks/handlers';

// Setup MSW for API mocking
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn'
  });
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  server.close();
});

// Global test utilities
export * from '@testing-library/svelte';
export { expect } from 'vitest';
```

**3. API Mocking Setup**
```typescript
// src/test/mocks/handlers.ts
import { rest } from 'msw';

const API_BASE = 'http://localhost:5173/api';

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'admin@example.com' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          user: {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials' })
    );
  }),
  
  // Blog endpoints
  rest.get(`${API_BASE}/blog/posts`, (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page') || '1');
    const limit = Number(req.url.searchParams.get('limit') || '10');
    
    return res(
      ctx.status(200),
      ctx.json({
        posts: [
          {
            id: '1',
            title: 'Test Post 1',
            slug: 'test-post-1',
            excerpt: 'Test excerpt',
            content: 'Test content',
            created_at: '2023-01-01T00:00:00Z'
          }
        ],
        total: 1,
        page,
        limit,
        totalPages: 1
      })
    );
  }),
  
  // Services endpoints
  rest.get(`${API_BASE}/services`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        services: [
          {
            id: '1',
            title: 'Test Service',
            slug: 'test-service',
            base_price: 99.99,
            service_type: 'consulting',
            published: true,
            available: true
          }
        ],
        total: 1
      })
    );
  })
];
```

**4. Component Testing Examples**
```typescript
// src/lib/components/ui/Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Button from './Button.svelte';

describe('Button Component', () => {
  it('renders with default props', () => {
    const { getByRole } = render(Button, {
      children: 'Click me'
    });
    
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
    expect(button).toHaveClass('px-4', 'py-2', 'bg-blue-600');
  });
  
  it('renders with custom variant', () => {
    const { getByRole } = render(Button, {
      variant: 'secondary',
      children: 'Secondary Button'
    });
    
    const button = getByRole('button');
    expect(button).toHaveClass('bg-gray-600');
  });
  
  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(Button, {
      children: 'Click me',
      onclick: handleClick
    });
    
    const button = getByRole('button');
    await fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when loading prop is true', () => {
    const { getByRole } = render(Button, {
      children: 'Loading',
      loading: true
    });
    
    const button = getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('disabled');
  });
});
```

**5. Store Testing**
```typescript
// src/lib/stores/cart.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { cartStore } from './cart';

describe('Cart Store', () => {
  beforeEach(() => {
    cartStore.clearCart();
  });
  
  it('starts with empty cart', () => {
    const cart = get(cartStore);
    expect(cart.items).toEqual([]);
    expect(cart.itemCount).toBe(0);
    expect(cart.total).toBe(0);
  });
  
  it('adds items to cart', () => {
    const service = {
      id: '1',
      title: 'Test Service',
      base_price: 99.99
    };
    
    cartStore.addItem(service, 1);
    
    const cart = get(cartStore);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].service).toEqual(service);
    expect(cart.items[0].quantity).toBe(1);
    expect(cart.itemCount).toBe(1);
  });
  
  it('updates item quantity', () => {
    const service = {
      id: '1',
      title: 'Test Service',
      base_price: 99.99
    };
    
    cartStore.addItem(service, 1);
    cartStore.updateQuantity('1', 3);
    
    const cart = get(cartStore);
    expect(cart.items[0].quantity).toBe(3);
  });
  
  it('removes items from cart', () => {
    const service = {
      id: '1',
      title: 'Test Service',
      base_price: 99.99
    };
    
    cartStore.addItem(service, 1);
    cartStore.removeItem('1');
    
    const cart = get(cartStore);
    expect(cart.items).toEqual([]);
  });
  
  it('calculates totals correctly', () => {
    const service = {
      id: '1',
      title: 'Test Service',
      base_price: 100
    };
    
    cartStore.addItem(service, 2);
    
    const cart = get(cartStore);
    expect(cart.subtotal).toBe(200);
    expect(cart.tax).toBe(36); // 18% tax
    expect(cart.total).toBe(236);
  });
});
```

#### Day 4-5: Integration Testing

**1. API Integration Tests**
```typescript
// src/test/integration/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { apiClient } from '$lib/api/client';

const server = setupServer(
  rest.get('/api/blog/posts', (req, res, ctx) => {
    return res(
      ctx.json({
        posts: [
          {
            id: '1',
            title: 'Integration Test Post',
            slug: 'integration-test',
            created_at: '2023-01-01T00:00:00Z'
          }
        ],
        total: 1
      })
    );
  })
);

describe('API Integration Tests', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  
  it('fetches blog posts successfully', async () => {
    const response = await apiClient.blog.getPosts();
    
    expect(response.posts).toHaveLength(1);
    expect(response.posts[0].title).toBe('Integration Test Post');
    expect(response.total).toBe(1);
  });
  
  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/blog/posts', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    await expect(apiClient.blog.getPosts()).rejects.toThrow('Server error');
  });
});
```

**2. Component Integration Tests**
```typescript
// src/test/integration/Header.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach } from 'vitest';
import Header from '$components/layout/Header.svelte';
import { page } from '$app/stores';
import { writable } from 'svelte/store';

describe('Header Integration', () => {
  beforeEach(() => {
    // Mock page store
    page.set({
      url: new URL('http://localhost:3000/')
    });
  });
  
  it('displays navigation links', () => {
    render(Header);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });
  
  it('shows auth buttons when not logged in', () => {
    render(Header);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });
  
  it('shows user info when logged in', () => {
    const userStore = writable({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
    });
    
    render(Header, {
      user: userStore
    });
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });
});
```

#### Day 6-7: End-to-End Testing

**1. Playwright Configuration**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

**2. E2E Test Examples**
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can login and logout', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    
    // Check user is logged in
    await expect(page.getByText('Admin User')).toBeVisible();
    
    // Logout
    await page.click('button[aria-label="Logout"]');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
    
    // Check login button is visible
    await expect(page.getByText('Login')).toBeVisible();
  });
  
  test('shows validation errors for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });
});
```

```typescript
// tests/e2e/shopping-cart.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test('user can add items to cart and checkout', async ({ page }) => {
    // Navigate to services page
    await page.goto('/services');
    
    // Find first service and add to cart
    await page.click('button:has-text("Add to Cart")');
    
    // Should show success message
    await expect(page.getByText('Added to cart')).toBeVisible();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Verify item is in cart
    await expect(page.getByText('Test Service')).toBeVisible();
    
    // Proceed to checkout
    await page.click('button:has-text("Checkout")');
    
    // Fill checkout form
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    
    // Complete checkout
    await page.click('button:has-text("Complete Order")');
    
    // Should redirect to success page
    await expect(page).toHaveURL('/checkout/success');
    
    // Verify order confirmation
    await expect(page.getByText('Order Confirmed')).toBeVisible();
  });
  
  test('cart persists across page refreshes', async ({ page }) => {
    await page.goto('/services');
    await page.click('button:has-text("Add to Cart")');
    await page.goto('/cart');
    
    // Refresh page
    await page.reload();
    
    // Item should still be in cart
    await expect(page.getByText('Test Service')).toBeVisible();
  });
});
```

### Week 2: Deployment & Monitoring

#### Day 8-10: Production Deployment

**1. Vercel Configuration**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "sveltekit",
  "functions": {
    "src/routes/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/blog",
      "destination": "/blog/1"
    }
  ]
}
```

**2. Environment Configuration**
```typescript
// src/lib/env.ts
import { env } from '$env/dynamic/public';

export const env = {
  PUBLIC_SUPABASE_URL: env('PUBLIC_SUPABASE_URL', ''),
  PUBLIC_SUPABASE_ANON_KEY: env('PUBLIC_SUPABASE_ANON_KEY', ''),
  SUPABASE_SERVICE_ROLE_KEY: env('SUPABASE_SERVICE_ROLE_KEY', ''),
  
  GOOGLE_CLIENT_ID: env('GOOGLE_CLIENT_ID', ''),
  GOOGLE_CLIENT_SECRET: env('GOOGLE_CLIENT_SECRET', ''),
  
  RAZORPAY_KEY_ID: env('RAZORPAY_KEY_ID', ''),
  RAZORPAY_KEY_SECRET: env('RAZORPAY_KEY_SECRET', ''),
  
  NEXTAUTH_SECRET: env('NEXTAUTH_SECRET', ''),
  
  SENTRY_DSN: env('SENTRY_DSN', ''),
  ANALYTICS_ID: env('ANALYTICS_ID', '')
};
``n
**3. Monitoring Setup**
```typescript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/public';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        sessionSampleRate: 0.1
      })
    ]
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (env.SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error:', error);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (env.SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}
```

**4. Performance Monitoring**
```typescript
// src/lib/monitoring/analytics.ts
import { env } from '$env/dynamic/public';

export class Analytics {
  private static instance: Analytics;
  
  public static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }
  
  public trackEvent(eventName: string, properties?: Record<string, any>) {
    if (typeof window !== 'undefined' && env.ANALYTICS_ID) {
      // Google Analytics 4
      gtag('event', eventName, {
        event_category: 'User Interaction',
        ...properties
      });
    }
  }
  
  public trackPageView(page: string, title?: string) {
    if (typeof window !== 'undefined' && env.ANALYTICS_ID) {
      gtag('config', env.ANALYTICS_ID);
      gtag('page_view', {
        page_location: page,
        page_title: title
      });
    }
  }
  
  public trackConversion(type: string, value?: number) {
    this.trackEvent('conversion', {
      conversion_type: type,
      value
    });
  }
}

// Initialize gtag
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
}

export const analytics = Analytics.getInstance();
```

**5. Health Check Endpoint**
```typescript
// src/routes/api/health/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { createServiceRoleClient } from '$lib/server/supabase';

export async function GET(event: RequestEvent) {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const supabase = createServiceRoleClient();
    const { data: dbCheck, error: dbError } = await supabase
      .from('users')
      .select('count')
      .single();
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    
    // Check uptime
    const uptime = process.uptime();
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: dbError ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      responseTime: `${responseTime}ms`,
      database: {
        status: dbError ? 'error' : 'connected',
        users: dbCheck?.count || 0
      },
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      version: process.env.npm_package_version || 'unknown'
    };
    
    return json(health);
  } catch (error) {
    return json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      },
      { status: 500 }
    );
  }
}
```

## Migration Strategy

### 1. **Testing Strategy**
- **Test-Driven Development**: Write tests before implementing features
- **Continuous Testing**: Run tests on every commit
- **Coverage Requirements**: Enforce minimum coverage thresholds
- **Quality Gates**: Block deployments if tests fail

### 2. **Deployment Strategy**
- **Blue-Green Deployment**: Minimize downtime during releases
- **Rollback Capability**: Quick rollback if issues arise
- **Canary Releases**: Test new features with subset of users
- **Monitoring**: Real-time monitoring and alerting

### 3. **Monitoring Strategy**
- **Application Performance**: Response times, error rates
- **Business Metrics**: Conversions, user engagement
- **Infrastructure**: Server health, resource usage
- **Security**: Vulnerability scanning, threat detection

## Common Issues & Solutions

### 1. **Test Flakiness**
**Problem**: Tests failing intermittently
**Solution**: Implement retry logic and proper test isolation
```typescript
// Use test retries for flaky tests
test('flaky test', { retry: 3 }, async () => {
  // Test implementation
});
```

### 2. **Deployment Issues**
**Problem**: Build failures in production
**Solution**: Implement pre-deployment checks and rollback procedures
```typescript
// Pre-deployment health check
const healthCheck = async () => {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error('Health check failed');
  }
};
```

### 3. **Performance Regression**
**Problem**: Performance degradation after deployment
**Solution**: Implement performance monitoring and alerts
```typescript
// Performance budget monitoring
const performanceBudget = {
  FCP: 2000, // First Contentful Paint
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1   // Cumulative Layout Shift
};
```

## Deliverables

### Code Deliverables
- [ ] Comprehensive test suite (>80% coverage)
- [ ] Production deployment configuration
- [ ] Monitoring and alerting system
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation for deployment

### Documentation Deliverables
- [ ] Testing strategy documentation
- [ ] Deployment guide
- [ ] Monitoring setup guide
- [ ] Troubleshooting documentation
- [ ] Runbook for operations

### Testing Deliverables
- [ ] Unit test suite
- [ ] Integration test suite
- [ ] End-to-end test suite
- [ ] Performance test suite
- [ ] Security test suite

## Success Criteria

### Technical Metrics
- [ ] Test coverage >80%
- [ ] All tests passing in CI/CD
- [ ] Deployment success rate >95%
- [ ] Page load times <2 seconds
- [ ] Error rate <1%

### Functional Metrics
- [ ] All critical user workflows tested
- [ ] Production deployment successful
- [ ] Monitoring and alerting active
- [ ] Rollback procedures tested
- [ ] Documentation complete

## Next Phase Preparation

Upon completion of Phase 5, the team will have:
1. **Production-ready SvelteKit application** with comprehensive testing
2. **Robust deployment pipeline** with CI/CD automation
3. **Comprehensive monitoring** for performance and errors
4. **Quality assurance processes** ensuring reliability
5. **Complete documentation** for maintenance and operations

The migration will be **complete** with a fully functional, tested, and deployed SvelteKit application ready for production use.

---

**Phase 5 Status**: 🔄 Ready to Start
**Dependencies**: Phase 1, 2, 3, & 4 completion
**Blocked By**: None
**Migration Status**: ✅ Complete
