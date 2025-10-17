# Phase 1: Critical Infrastructure Migration Manual

## Overview

**Duration**: 2 weeks
**Priority**: 🔴 Critical
**Team**: 2-3 Full-stack developers

Phase 1 establishes the foundational infrastructure required for all subsequent migration phases. This involves migrating the core API layer, enhancing authentication, and establishing database integration patterns.

## Architecture Analysis

### Current Next.js Architecture

#### 1. **tRPC API System**
- **17 routers** with comprehensive business logic
- **Type-safe endpoints** with Zod validation
- **Permission-based procedures** (public, protected, admin, limited)
- **Complex query patterns** with Supabase integration

#### 2. **Authentication System**
- **NextAuth.js** with Google OAuth
- **Permission-based access control** with granular scopes
- **Session management** with JWT tokens
- **Role-based authorization** (admin/user)

#### 3. **Database Integration**
- **Supabase** as primary database
- **Service role clients** for admin operations
- **RLS policies** for data security
- **Complex query optimization**

### Target SvelteKit Architecture

#### 1. **API Routes System**
- **SvelteKit API routes** (`+server.ts` files)
- **Type-safe request/response handling**
- **Middleware for authentication**
- **Error handling and validation**

#### 2. **Lucia Authentication**
- **Lucia auth** with Google OAuth
- **Session management** with secure cookies
- **Permission system integration**
- **Role-based access control**

## Implementation Guide

### Week 1: API Layer Migration

#### Day 1-2: Core API Structure Setup

**1. Create API Route Structure**
```typescript
// src/lib/server/api/routes/
├── auth/
│   ├── +server.ts
│   ├── login/+server.ts
│   └── logout/+server.ts
├── blog/
│   ├── +server.ts
│   ├── posts/+server.ts
│   └── comments/+server.ts
├── admin/
│   ├── +server.ts
│   ├── users/+server.ts
│   └── dashboard/+server.ts
└── services/
    ├── +server.ts
    └── catalog/+server.ts
```

**2. Implement Base API Utilities**
```typescript
// src/lib/server/api/utils.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

export class ApiError {
  constructor(
    public message: string,
    public code: number = 500,
    public details?: any
  ) {}
}

export function handleApiError(error: any) {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return json(
      { error: error.message, details: error.details },
      { status: error.code }
    );
  }
  
  return json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new ApiError('Invalid request data', 400, error);
  }
}

export async function requireAuth(
  event: RequestEvent
) {
  const session = await event.locals.auth();
  if (!session?.user) {
    throw new ApiError('Unauthorized', 401);
  }
  return session;
}

export async function requireAdmin(
  event: RequestEvent
) {
  const session = await requireAuth(event);
  if (session.user.role !== 'admin') {
    throw new ApiError('Admin access required', 403);
  }
  return session;
}
```

#### Day 3-5: Migrate Core tRPC Routers

**1. Authentication Router Migration**
```typescript
// src/lib/server/api/routes/auth/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest } from '../utils';
import { lucia } from '$lib/server/auth';
import { google } from '$lib/server/auth';
import { generateCodeVerifier, generateState } from 'arctic';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(event: RequestEvent) {
  try {
    const data = await event.request.json();
    const { email, password } = validateRequest(loginSchema, data);
    
    // Implement login logic using Lucia
    const user = await authenticateUser(email, password);
    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }
    
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
    
    return json({ success: true, user });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(event: RequestEvent) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  
  event.cookies.set('google_oauth_state', state, {
    secure: true,
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10
  });
  
  event.cookies.set('google_code_verifier', codeVerifier, {
    secure: true,
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10
  });
  
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ['profile', 'email']
  });
  
  return json({ url });
}
```

**2. Blog Router Migration**
```typescript
// src/lib/server/api/routes/blog/posts/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { handleApiError, validateRequest, requireAuth } from '../../utils';
import { createServiceRoleClient } from '$lib/server/supabase';

const getPostsSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),
  category: z.string().optional(),
  search: z.string().optional()
});

const createPostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(50),
  excerpt: z.string().max(500),
  category: z.string().optional(),
  draft: z.boolean().default(false)
});

export async function GET(event: RequestEvent) {
  try {
    const url = new URL(event.url);
    const query = {
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10'),
      category: url.searchParams.get('category') || undefined,
      search: url.searchParams.get('search') || undefined
    };
    
    const { page, limit, category, search } = validateRequest(getPostsSchema, query);
    
    const supabase = createServiceRoleClient();
    
    let queryBuilder = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('draft', false)
      .order('created_at', { ascending: false });
    
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }
    
    if (search) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${search}%,content.ilike.%${search}%`
      );
    }
    
    const offset = (page - 1) * limit;
    const { data: posts, error, count } = await queryBuilder
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return json({
      posts: posts || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(event: RequestEvent) {
  try {
    const session = await requireAuth(event);
    const data = await event.request.json();
    const postData = validateRequest(createPostSchema, data);
    
    const supabase = createServiceRoleClient();
    
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        ...postData,
        slug,
        author_user_id: session.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return json({ success: true, post });
  } catch (err) {
    return handleApiError(err);
  }
}
```

### Week 2: Authentication Enhancement & Database Integration

#### Day 6-8: Complete Lucia Authentication

**1. Enhanced Lucia Configuration**
```typescript
// src/lib/server/auth.ts
import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { google } from '@lucia-auth/oauth/providers';
import { dev } from '$app/environment';
import { adapter } from './db';

export const auth = lucia({
  adapter: adapter,
  middleware: sveltekit(),
  sessionCookie: {
    attributes: {
      secure: !dev
    }
  },
  getUserAttributes: (data) => {
    return {
      userId: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      emailVerified: data.email_verified,
      picture: data.picture,
      permissions: data.permissions
    };
  }
});

export const googleAuth = google(auth, {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: dev
    ? 'http://localhost:5173/login/google/callback'
    : 'https://yourdomain.com/login/google/callback'
});

export type Auth = typeof auth;
```

**2. Permission System Integration**
```typescript
// src/lib/server/permissions.ts
import { createServiceRoleClient } from './supabase';
import { PERMISSION_SCOPES } from '$lib/constants/permissions';

export async function getUserPermissions(userId: string): Promise<string[]> {
  const supabase = createServiceRoleClient();
  
  const { data, error } = await supabase
    .from('user_permissions')
    .select('permission')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
  
  return data?.map(p => p.permission) || [];
}

export async function hasPermission(
  userId: string,
  permission: keyof typeof PERMISSION_SCOPES
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(PERMISSION_SCOPES[permission]);
}

export async function requirePermission(
  userId: string,
  permission: keyof typeof PERMISSION_SCOPES
) {
  const hasRequiredPermission = await hasPermission(userId, permission);
  if (!hasRequiredPermission) {
    throw new Error(`Permission required: ${permission}`);
  }
}
```

**3. Session Management Enhancement**
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

const authHandler: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(auth.sessionCookieName);
  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const { session, user } = await auth.validateSession(sessionId);
  
  if (session && session.fresh) {
    const sessionCookie = auth.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
  }
  
  if (!session) {
    const sessionCookie = auth.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes
    });
  }
  
  event.locals.user = user;
  event.locals.session = session;
  
  return resolve(event);
};

const protectedRoutes: Handle = async ({ event, resolve }) => {
  const protectedPaths = ['/admin', '/account'];
  const isProtected = protectedPaths.some(path => 
    event.url.pathname.startsWith(path)
  );
  
  if (isProtected && !event.locals.user) {
    throw redirect(302, '/login');
  }
  
  const adminPaths = ['/admin'];
  const isAdminRoute = adminPaths.some(path => 
    event.url.pathname.startsWith(path)
  );
  
  if (isAdminRoute && event.locals.user?.role !== 'admin') {
    throw redirect(302, '/');
  }
  
  return resolve(event);
};

export const handle = sequence(authHandler, protectedRoutes);
```

#### Day 9-10: Database Layer Migration

**1. Enhanced Supabase Integration**
```typescript
// src/lib/server/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '$lib/types/database';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// Service role client for admin operations
export function createServiceRoleClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Authenticated client for user operations
export function createAuthenticatedClient(accessToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Client-side client
export function createClientClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
```

**2. Query Utilities**
```typescript
// src/lib/server/queries/blog.ts
import { createServiceRoleClient } from '../supabase';

export async function getPublicBlogPosts(  supabase: ReturnType<typeof createServiceRoleClient>,
  options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  } = {}
) {
  const { page = 1, limit = 10, category, search } = options;
  const offset = (page - 1) * limit;
  
  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('draft', false)
    .order('created_at', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,content.ilike.%${search}%`
    );
  }
  
  const { data, error, count } = await query
    .range(offset, offset + limit - 1);
  
  if (error) {
    throw error;
  }
  
  return {
    posts: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

export async function getBlogPostBySlug(
  supabase: ReturnType<typeof createServiceRoleClient>,
  slug: string
) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('draft', false)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}
```

## Migration Checklist

### ✅ API Layer
- [ ] Create API route structure (`+server.ts` files)
- [ ] Implement base API utilities (error handling, validation)
- [ ] Migrate authentication router (`/api/auth`)
- [ ] Migrate blog router (`/api/blog`)
- [ ] Migrate admin router (`/api/admin`)
- [ ] Migrate services router (`/api/services`)
- [ ] Set up API middleware for authentication
- [ ] Implement request/response type safety

### ✅ Authentication System
- [ ] Complete Lucia OAuth integration
- [ ] Implement permission system migration
- [ ] Add role-based access control
- [ ] Set up session management
- [ ] Create auth middleware
- [ ] Implement protected routes
- [ ] Add admin protection logic

### ✅ Database Integration
- [ ] Migrate advanced Supabase queries
- [ ] Implement service role client patterns
- [ ] Add permission-based data access
- [ ] Create query utilities
- [ ] Optimize database operations
- [ ] Set up connection pooling

## Testing Strategy

### Unit Tests
```typescript
// tests/api/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { POST, GET } from '$lib/server/api/routes/auth/+server';
import { createMockEvent } from '$tests/test-utils';

describe('Auth API', () => {
  beforeEach(() => {
    // Reset database state
  });
  
  it('should authenticate valid user', async () => {
    const event = createMockEvent({
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123' }
    });
    
    const response = await POST(event);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
  });
  
  it('should reject invalid credentials', async () => {
    const event = createMockEvent({
      method: 'POST',
      body: { email: 'test@example.com', password: 'wrong' }
    });
    
    const response = await POST(event);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid credentials');
  });
});
```

### Integration Tests
```typescript
// tests/integration/auth-flow.test.ts
import { describe, it, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('Authentication Flow', () => {
  it('should complete full auth flow', async () => {
    // Test login
    const loginResponse = await $fetch('/api/auth', {
      method: 'POST',
      body: { email: 'admin@example.com', password: 'admin123' }
    });
    
    expect(loginResponse.success).toBe(true);
    
    // Test protected route access
    const dashboardResponse = await $fetch('/api/admin/dashboard', {
      headers: {
        Cookie: loginResponse.sessionCookie
      }
    });
    
    expect(dashboardResponse.user).toBeDefined();
  });
});
```

## Common Issues & Solutions

### 1. **Session Management Issues**
**Problem**: Sessions not persisting across requests
**Solution**: Ensure cookie attributes are properly configured
```typescript
// In hooks.server.ts
const sessionCookie = auth.createSessionCookie(session.id);
event.cookies.set(sessionCookie.name, sessionCookie.value, {
  path: '.',
  secure: !dev,
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30 // 30 days
});
```

### 2. **Permission System Migration**
**Problem**: Permission checks failing after migration
**Solution**: Ensure permissions are loaded in session validation
```typescript
// In auth getUserAttributes
getUserAttributes: (data) => {
  return {
    // ... other attributes
    permissions: data.permissions || []
  };
}
```

### 3. **Database Connection Issues**
**Problem**: Service role client not working
**Solution**: Verify environment variables and client configuration
```typescript
// Debug database connection
const supabase = createServiceRoleClient();
const { data, error } = await supabase.from('users').select('count');
console.log('Database connection test:', { data, error });
```

## Deliverables

### Code Deliverables
- [ ] Complete API route structure
- [ ] Lucia authentication system
- [ ] Permission system integration
- [ ] Enhanced Supabase utilities
- [ ] Query optimization layer
- [ ] Error handling middleware

### Documentation Deliverables
- [ ] API endpoint documentation
- [ ] Authentication flow diagrams
- [ ] Database schema documentation
- [ ] Migration test reports

### Testing Deliverables
- [ ] Unit test suite (80% coverage)
- [ ] Integration test suite
- [ ] API endpoint tests
- [ ] Authentication flow tests

## Success Criteria

### Technical Metrics
- [ ] All API endpoints migrated and functional
- [ ] Authentication system working with 100% compatibility
- [ ] Permission system fully integrated
- [ ] Database queries optimized (target: <100ms response time)
- [ ] Test coverage >80%

### Functional Metrics
- [ ] User login/logout working
- [ ] Admin access control functional
- [ ] API requests responding correctly
- [ ] Database operations working
- [ ] Error handling robust

## Next Phase Preparation

Upon completion of Phase 1, the team will have:
1. **Stable API foundation** for all subsequent features
2. **Robust authentication system** with permission control
3. **Optimized database layer** for efficient data operations
4. **Comprehensive testing framework** for quality assurance

This foundation enables the team to proceed with **Phase 2: Admin Dashboard Migration** with confidence in the underlying infrastructure.

---

**Phase 1 Status**: 🔄 In Progress
**Dependencies**: None
**Blocked By**: Environment setup completion
**Next Phase**: Phase 2 - Admin Dashboard Migration
