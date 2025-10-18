# Svelte Development Best Practices for NextJS-to-Svelte Migration

**Target:** AI Agent  
**Purpose:** Guide for porting NextJS applications to SvelteKit with Svelte 5  
**Last Updated:** October 2025

## Core Framework Differences

### Reactivity Model Comparison

**NextJS (React):** State managed through hooks (useState, useEffect, useContext). Requires explicit re-render triggers and dependency arrays.[1][2]

**SvelteKit (Svelte 5):** Compiler-based reactivity using runes (`$state`, `$derived`, `$effect`). Reactivity is automatic and compile-time optimized. No virtual DOM or reconciliation needed.[2][1]

### File Structure Mapping

**NextJS Structure:**
- `pages/` or `app/` → Routes
- `components/` → Components
- `api/` → API routes
- `public/` → Static assets
- `_app.js` → Root layout
- `_document.js` → HTML template[3]

**SvelteKit Structure:**
- `src/routes/` → Routes (file-based routing)
- `src/lib/` → Shared components and utilities
- `src/lib/server/` → Server-only code
- `src/routes/api/` → API routes
- `static/` → Static assets
- `src/routes/+layout.svelte` → Layout components
- `src/app.html` → HTML template[3]

### Routing System Translation

**NextJS Dynamic Routes:**
- `pages/posts/[id].js` → Dynamic route
- `pages/posts/[...slug].js` → Catch-all route
- `pages/api/users/[id].js` → API endpoint[1]

**SvelteKit Dynamic Routes:**
- `src/routes/posts/[id]/+page.svelte` → Dynamic route
- `src/routes/posts/[...slug]/+page.svelte` → Rest parameter
- `src/routes/api/users/[id]/+server.ts` → API endpoint[1][3]

## Svelte 5 Rune System (Core Reactivity)

### State Management Migration

**NextJS Pattern:**
```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Svelte 5 Pattern:**
```svelte
<script>
let count = $state(0);
</script>

<button onclick={() => count++}>
  {count}
</button>
```

**RULE:** Replace `useState` with `$state()`. Svelte 5 automatically tracks mutations.[1]

### Derived State Migration

**NextJS Pattern:**
```javascript
const [count, setCount] = useState(0);
const doubled = useMemo(() => count * 2, [count]);
```

**Svelte 5 Pattern:**
```svelte
<script>
let count = $state(0);
const doubled = $derived(count * 2);
</script>
```

**RULE:** Replace `useMemo` with `$derived()`. No dependency arrays needed.[2][1]

### Side Effects Migration

**NextJS Pattern:**
```javascript
useEffect(() => {
  console.log('Count changed:', count);
}, [count]);
```

**Svelte 5 Pattern:**
```svelte
<script>
$effect(() => {
  console.log('Count changed:', count);
});
</script>
```

**RULE:** Replace `useEffect` with `$effect()`. Dependencies are automatically tracked.[1]

### Component Props Migration

**NextJS Pattern:**
```javascript
function Button({ variant, size = 'md', onClick, children }) {
  return <button className={`btn-${variant} btn-${size}`} onClick={onClick}>
    {children}
  </button>;
}
```

**Svelte 5 Pattern:**
```svelte
<script>
let { 
  variant, 
  size = 'md', 
  onclick,
  children 
} = $props();
</script>

<button class="btn-{variant} btn-{size}" {onclick}>
  {@render children()}
</button>
```

**RULE:** Replace destructured props with `$props()`. Children become snippet renders.[1]

## Component Architecture

### Component Composition Principles

**P1: Component Size** - Keep components under 200 lines. Split larger components into smaller, focused units.[4]

**P2: Single Responsibility** - Each component should handle one concern. Separate presentation from logic.[4][2]

**P3: No Business Logic in Components** - Components render data and emit events only. Business logic belongs in server files or utilities.[5]

**P4: CSS Scoping** - Use component-scoped CSS by default. Avoid `:global` unless absolutely necessary.[4]

**P5: Immutability** - Create new objects instead of mutating existing ones. Use `<svelte:options immutable>` for performance.[4]

### Component File Structure

**Standard Component Pattern:**
```svelte
<script lang="ts">
  // 1. Imports
  import { goto } from '$app/navigation';
  
  // 2. Props with $props()
  let { 
    data, 
    optional = 'default' 
  }: {
    data: MyType;
    optional?: string;
  } = $props();
  
  // 3. State with $state()
  let localState = $state(initialValue);
  
  // 4. Derived values with $derived()
  const computed = $derived(localState * 2);
  
  // 5. Effects with $effect()
  $effect(() => {
    // Side effects here
  });
  
  // 6. Event handlers
  function handleClick() {
    // Handler logic
  }
</script>

<!-- 7. Template -->
<div class="container">
  <!-- Markup -->
</div>

<!-- 8. Scoped styles -->
<style>
  .container {
    /* Component-specific styles */
  }
</style>
```

**RULE:** Always follow this order: imports, props, state, derived, effects, handlers, template, styles.[2][4]

## Data Fetching Patterns

### Server Load Functions (replaces getServerSideProps)

**NextJS Pattern:**
```javascript
export async function getServerSideProps(context) {
  const data = await fetch(`/api/data/${context.params.id}`);
  return { props: { data: await data.json() } };
}
```

**SvelteKit Pattern:**
```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const response = await fetch(`/api/data/${params.id}`);
  return {
    data: await response.json()
  };
};
```

**RULE:** Move all server-side data fetching to `+page.server.ts` or `+layout.server.ts` files.[5][1]

### Static Generation (replaces getStaticProps)

**NextJS Pattern:**
```javascript
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data }, revalidate: 60 };
}

export async function getStaticPaths() {
  return { paths: [...], fallback: true };
}
```

**SvelteKit Pattern:**
```typescript
// +page.server.ts
export const prerender = true;

export const load: PageServerLoad = async ({ fetch }) => {
  const data = await fetchData();
  return { data };
};
```

**RULE:** Use `export const prerender = true` for static generation. SvelteKit handles path generation automatically.[1]

### API Routes Migration

**NextJS Pattern:**
```javascript
// pages/api/users/[id].js
export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === 'GET') {
    const user = await getUser(id);
    res.status(200).json(user);
  }
}
```

**SvelteKit Pattern:**
```typescript
// src/routes/api/users/[id]/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const user = await getUser(params.id);
  return json(user);
};
```

**RULE:** Create `+server.ts` files for API routes. Export named functions (GET, POST, PUT, DELETE, PATCH).[3][1]

## State Management Architecture

### Global State Patterns

**Domain-Specific Stores (Svelte 5):**
```typescript
// src/lib/stores/products.svelte.ts
export const createProductStore = () => {
  let products = $state<Product[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  
  async function fetchProducts() {
    loading = true;
    try {
      const response = await fetch('/api/products');
      products = await response.json();
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
  
  return {
    get products() { return products; },
    get loading() { return loading; },
    get error() { return error; },
    fetchProducts
  };
};

export const productStore = createProductStore();
```

**RULE:** Use Svelte 5 runes for stores. Export factory functions and singleton instances.[2][1]

### Server-Only State

**Pattern:**
```typescript
// src/lib/server/database.ts
import { createConnection } from 'database';

// This code runs server-side only
export const db = createConnection(process.env.DATABASE_URL);

export async function queryUsers() {
  return await db.query('SELECT * FROM users');
}
```

**RULE:** Place server-only code in `src/lib/server/`. SvelteKit prevents client-side imports.[3]

## Authentication and Middleware

### Hooks System (replaces NextJS middleware)

**Authentication Hook:**
```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('auth-token');
  
  if (token) {
    try {
      const user = jwt.verify(token, SECRET_KEY) as User;
      event.locals.user = user;
    } catch (err) {
      event.cookies.delete('auth-token', { path: '/' });
    }
  }
  
  return resolve(event);
};
```

**RULE:** Use `hooks.server.ts` for request interception. Attach data to `event.locals` for access in load functions.[1]

### Protected Routes

**Pattern:**
```typescript
// src/routes/dashboard/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  
  return {
    user: locals.user
  };
};
```

**RULE:** Implement auth checks in `+layout.server.ts` for route groups. Use `throw redirect()` for unauthorized access.[1]

## Form Handling and Progressive Enhancement

### Form Actions (replaces NextJS API routes for forms)

**Pattern:**
```svelte
<!-- src/routes/contact/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  
  let loading = $state(false);
</script>

<form 
  method="POST" 
  use:enhance={() => {
    loading = true;
    return async ({ result, update }) => {
      loading = false;
      await update();
    };
  }}
>
  <input name="email" type="email" required />
  <input name="message" type="text" required />
  <button type="submit" disabled={loading}>
    {loading ? 'Sending...' : 'Send'}
  </button>
</form>
```

```typescript
// src/routes/contact/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const message = data.get('message');
    
    if (!email || !message) {
      return fail(400, { error: 'Missing fields' });
    }
    
    await sendEmail({ email, message });
    return { success: true };
  }
};
```

**RULE:** Use form actions for mutations. Progressive enhancement works without JavaScript.[1]

## Project Organization Patterns

### Domain-Driven Structure (Recommended)

```
src/
├── domains/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.svelte
│   │   │   └── SignupForm.svelte
│   │   ├── stores/
│   │   │   └── auth.svelte.ts
│   │   └── utils/
│   │       └── validation.ts
│   ├── products/
│   │   ├── components/
│   │   ├── stores/
│   │   └── utils/
│   └── shared/
│       ├── components/
│       ├── stores/
│       └── utils/
├── lib/
│   ├── server/
│   │   ├── database.ts
│   │   └── email.ts
│   └── config.ts
└── routes/
    ├── (auth)/
    │   ├── login/
    │   └── signup/
    ├── products/
    │   └── [id]/
    └── +layout.svelte
```

**RULE:** Organize by domain for scalability. Use route groups `(name)` for shared layouts without URL segments.[2]

### Component Organization

**Atomic Structure:**
- **Atoms:** Basic UI elements (Button, Input, Icon)
- **Molecules:** Simple combinations (SearchBar, Card)
- **Organisms:** Complex combinations (Header, ProductList)
- **Templates:** Page layouts
- **Pages:** Route-specific pages[2]

**RULE:** Place shared atoms/molecules in `src/lib/components/`. Place page-specific components in route directories.[3][2]

## Styling and CSS Patterns

### Component-Scoped CSS (Default)

**Pattern:**
```svelte
<script>
  let { active = false } = $props();
</script>

<button class="btn" class:active>
  <slot />
</button>

<style>
  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    transition: all 0.2s;
  }
  
  .btn.active {
    background: blue;
    color: white;
  }
</style>
```

**RULE:** Styles are scoped automatically. Use `class:` directive for conditional classes.[4][1]

### Global Styles

**Pattern:**
```css
/* src/app.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #3b82f6;
  --spacing-base: 1rem;
}
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import '../app.css';
</script>

<slot />
```

**RULE:** Import global CSS in root `+layout.svelte`. Avoid `:global` in components unless necessary.[4][3]

## Performance Optimization

### Code Splitting Strategy

**Lazy Loading Components:**
```svelte
<script>
  const HeavyComponent = $derived.by(async () => {
    const module = await import('$lib/components/Heavy.svelte');
    return module.default;
  });
</script>

{#await HeavyComponent}
  <div>Loading...</div>
{:then Component}
  <Component />
{/await}
```

**RULE:** Use dynamic imports for heavy components. SvelteKit automatically code-splits routes.[2]

### Image Optimization

**Pattern:**
```svelte
<script>
  let { 
    src, 
    alt, 
    width, 
    height 
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } = $props();
  
  const webpSrc = $derived(src.replace(/\.(jpg|jpeg|png)$/, '.webp'));
  const avifSrc = $derived(src.replace(/\.(jpg|jpeg|png)$/, '.avif'));
</script>

<picture>
  <source srcset={avifSrc} type="image/avif" />
  <source srcset={webpSrc} type="image/webp" />
  <img {src} {alt} {width} {height} loading="lazy" decoding="async" />
</picture>
```

**RULE:** Use modern image formats. Implement lazy loading for below-fold images.[1]

## Testing Patterns

### Component Testing

**Pattern:**
```typescript
// Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Button from './Button.svelte';

describe('Button', () => {
  it('handles click events', async () => {
    let clicked = false;
    const { getByRole } = render(Button, {
      props: {
        onclick: () => { clicked = true; }
      }
    });
    
    await fireEvent.click(getByRole('button'));
    expect(clicked).toBe(true);
  });
});
```

**RULE:** Use Vitest + Testing Library for component tests. Place tests adjacent to components with `.test.ts` extension.[2]

### Integration Testing

**Pattern:**
```typescript
// routes.test.ts
import { expect, test } from '@playwright/test';

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('a[href="/about"]');
  await expect(page).toHaveURL('/about');
  await expect(page.locator('h1')).toContainText('About');
});
```

**RULE:** Use Playwright for E2E tests. Place in `tests/` directory.[3]

## TypeScript Integration

### Type-Safe Routing

**Pattern:**
```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  // params, fetch, etc. are fully typed
  return {
    user: await fetchUser(params.id)
  };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  // data.user is fully typed
</script>
```

**RULE:** Import types from `./$types` for automatic type inference. SvelteKit generates these types.[1]

## Error Handling

### Error Boundaries

**Pattern:**
```svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="error-page">
  <h1>{$page.status}: {$page.error?.message}</h1>
  <a href="/">Return home</a>
</div>
```

**RULE:** Create `+error.svelte` at any route level. SvelteKit renders nearest error boundary on errors.[3]

### Error Throwing

**Pattern:**
```typescript
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
  const item = await fetchItem(params.id);
  
  if (!item) {
    throw error(404, {
      message: 'Item not found'
    });
  }
  
  return { item };
};
```

**RULE:** Use `throw error()` from '@sveltejs/kit' for expected errors. Provides structured error responses.[1]

## Migration Checklist

### Pre-Migration Analysis
- [ ] Map all NextJS pages to SvelteKit routes
- [ ] Identify API routes and convert to `+server.ts` files
- [ ] List all React hooks and plan rune equivalents
- [ ] Document authentication/middleware patterns
- [ ] Catalog third-party dependencies for Svelte alternatives

### Core Migration Steps
- [ ] Set up SvelteKit project with TypeScript
- [ ] Configure Vite for existing asset pipeline
- [ ] Migrate layouts from `_app.js` to `+layout.svelte`
- [ ] Convert pages one route at a time
- [ ] Migrate API routes to SvelteKit endpoints
- [ ] Replace React state with Svelte 5 runes
- [ ] Convert event handlers (`onClick` → `onclick`)
- [ ] Update form submissions to use form actions
- [ ] Migrate authentication to hooks system
- [ ] Set up error boundaries with `+error.svelte`

### Component Conversion Process
- [ ] Replace `useState` with `$state`
- [ ] Replace `useMemo`/`useCallback` with `$derived`
- [ ] Replace `useEffect` with `$effect`
- [ ] Convert props destructuring to `$props()`
- [ ] Update event handler syntax (remove `on:` prefix)
- [ ] Replace children with slots or snippets
- [ ] Convert inline styles to component CSS
- [ ] Update className to class
- [ ] Remove React.Fragment (unnecessary in Svelte)

### Testing and Validation
- [ ] Set up Vitest for unit tests
- [ ] Set up Playwright for E2E tests
- [ ] Test server-side rendering
- [ ] Validate progressive enhancement
- [ ] Check TypeScript types
- [ ] Test authentication flows
- [ ] Verify form submissions
- [ ] Performance audit with Lighthouse

### Post-Migration Optimization
- [ ] Implement code splitting
- [ ] Optimize images
- [ ] Configure prerendering where appropriate
- [ ] Set up caching strategies
- [ ] Audit bundle size
- [ ] Remove unused dependencies
- [ ] Configure adapter for deployment

## Common Pitfalls and Solutions

### Pitfall 1: Incorrect Event Binding

**WRONG:**
```svelte
<button on:click={handleClick}>Click</button>
```

**CORRECT (Svelte 5):**
```svelte
<button onclick={handleClick}>Click</button>
```

**EXPLANATION:** Svelte 5 uses lowercase event handlers without the `on:` directive.[1]

### Pitfall 2: Mutating Props

**WRONG:**
```svelte
<script>
  let { count } = $props();
  count++; // Error: cannot mutate prop
</script>
```

**CORRECT:**
```svelte
<script>
  let { count } = $props();
  let localCount = $state(count);
  localCount++;
</script>
```

**EXPLANATION:** Props are read-only. Create local state for mutations.[1]

### Pitfall 3: Missing Server/Client Boundary

**WRONG:**
```typescript
// +page.svelte
const data = await fetch('/api/secret'); // Runs on client
```

**CORRECT:**
```typescript
// +page.server.ts
export const load = async ({ fetch }) => {
  const data = await fetch('/api/secret'); // Runs on server
  return { data };
};
```

**EXPLANATION:** Data fetching with secrets must happen server-side.[5][1]

### Pitfall 4: Circular Store Dependencies

**WRONG:**
```typescript
// storeA depends on storeB, storeB depends on storeA
```

**CORRECT:**
```typescript
// Create a third store that depends on both
const combined = $derived(storeA.value + storeB.value);
```

**EXPLANATION:** Avoid circular dependencies. Use derived values instead.[4]

### Pitfall 5: Overusing :global

**WRONG:**
```svelte
<style>
  :global(div) {
    margin: 0;
  }
</style>
```

**CORRECT:**
```svelte
<style>
  .container {
    margin: 0;
  }
</style>
```

**EXPLANATION:** Prefer scoped styles. Use `:global` only when necessary for third-party integration.[4]

## Essential Svelte 5 Syntax Reference

### Runes Quick Reference

| Purpose | Syntax | Example |
|---------|--------|---------|
| Local state | `$state()` | `let count = $state(0)` |
| Derived state | `$derived()` | `const doubled = $derived(count * 2)` |
| Derived async | `$derived.by()` | `const data = $derived.by(async () => fetch())` |
| Side effects | `$effect()` | `$effect(() => console.log(count))` |
| Props | `$props()` | `let { name } = $props()` |
| Two-way binding | `$bindable()` | `let { value = $bindable() } = $props()` |

### Conditional Rendering

```svelte
{#if condition}
  <p>Truthy</p>
{:else if otherCondition}
  <p>Other</p>
{:else}
  <p>Falsy</p>
{/if}
```

### List Rendering

```svelte
{#each items as item, index (item.id)}
  <div>{index}: {item.name}</div>
{:else}
  <p>No items</p>
{/each}
```

### Await Blocks

```svelte
{#await promise}
  <p>Loading...</p>
{:then value}
  <p>Value: {value}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

## Deployment Considerations

### Adapter Selection

- **Vercel:** `@sveltejs/adapter-vercel`
- **Netlify:** `@sveltejs/adapter-netlify`
- **Node.js:** `@sveltejs/adapter-node`
- **Static:** `@sveltejs/adapter-static` (for fully static sites)
- **Cloudflare Pages:** `@sveltejs/adapter-cloudflare`[1]

**RULE:** Choose adapter based on deployment target. Configure in `svelte.config.js`.[1]

### Environment Variables

**Pattern:**
```typescript
// Access in server-side code
import { SECRET_KEY } from '$env/static/private';

// Access in client-side code (must start with PUBLIC_)
import { PUBLIC_API_URL } from '$env/static/public';
```

**RULE:** Private vars available server-side only. Public vars (prefixed `PUBLIC_`) available everywhere.[3]

## Additional Resources

### Official Documentation
- SvelteKit: https://kit.svelte.dev
- Svelte 5: https://svelte.dev/docs/svelte/overview
- Svelte 5 Migration Guide: https://svelte.dev/docs/svelte/v5-migration-guide

### Community Patterns
- Svelte Society: https://sveltesociety.dev
- SvelteKit Examples: https://github.com/sveltejs/kit/tree/master/examples

***

**End of Document**

This guide prioritizes Svelte 5 patterns and SvelteKit conventions. All code examples use modern Svelte 5 rune syntax. For legacy Svelte 4 patterns, consult the official migration guide. When in doubt, prefer explicit over implicit, and leverage the compiler's static analysis capabilities.