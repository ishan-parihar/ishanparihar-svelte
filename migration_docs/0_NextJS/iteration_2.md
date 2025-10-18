# Component Analysis for Svelte Porting

## Executive Summary

This document provides an analysis of the component structure within the `apps/platform/src/components/` directory to guide the porting process to Svelte. The analysis categorizes components by type (UI primitives, layout, business logic), identifies their primary dependencies, and distinguishes between server and client components.

## Component Inventory

### 1. UI Primitives (Reusable Elements)
Located in `apps/platform/src/components/ui/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `button.tsx` | Primitive | Radix UI, class-variance-authority | Client component with variants |
| `badge.tsx` | Primitive | Radix UI, class-variance-authority | Client component |
| `card.tsx` | Primitive | Radix UI | Client component |
| `input.tsx` | Primitive | Radix UI | Client component |
| `label.tsx` | Primitive | Radix UI | Client component |
| `avatar.tsx` | Primitive | Radix UI | Client component |
| `dropdown-menu.tsx` | Primitive | Radix UI | Client component |
| `dialog.tsx` | Primitive | Radix UI | Client component |
| `checkbox.tsx` | Primitive | Radix UI | Client component |
| `alert.tsx` | Primitive | Radix UI | Client component |
| `alert-dialog.tsx` | Primitive | Radix UI | Client component |
| `form.tsx` | Primitive | Radix UI, Zod | Client component |
| `accordion.tsx` | Primitive | Radix UI | Client component |
| `carousel.tsx` | Primitive | Radix UI | Client component |
| `pagination.tsx` | Primitive | Radix UI | Client component |
| `popover.tsx` | Primitive | Radix UI | Client component |
| `radio-group.tsx` | Primitive | Radix UI | Client component |
| `select.tsx` | Primitive | Radix UI | Client component |
| `separator.tsx` | Primitive | Radix UI | Client component |
| `sheet.tsx` | Primitive | Radix UI | Client component |
| `skeleton.tsx` | Primitive | Radix UI | Client component |
| `slider.tsx` | Primitive | Radix UI | Client component |
| `switch.tsx` | Primitive | Radix UI | Client component |
| `table.tsx` | Primitive | Radix UI | Client component |
| `tabs.tsx` | Primitive | Radix UI | Client component |
| `textarea.tsx` | Primitive | Radix UI | Client component |
| `progress.tsx` | Primitive | Radix UI | Client component |
| `stepper.tsx` | Primitive | Radix UI | Client component |
| `sonner.tsx` | Primitive | Sonner | Client component |
| `use-toast.ts` | Hook | React | Client component |
| `theme-provider.tsx` | Provider | React | Client component |
| `data-table.tsx` | Complex | React Table | Client component |

### 2. Layout Components
Located in `apps/platform/src/components/layout/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `HeaderServer.tsx` | Layout | Next.js | Server component for header |
| `HeaderServerCardNav.tsx` | Layout | Next.js | Server component for navigation |

### 3. Business Logic Components
Various directories with business logic

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `ServicesServer.tsx` | Business Logic | React Query, Supabase | Server component with data fetching |
| `ServicesSection.tsx` | Business Logic | Framer Motion | Client component with animations |
| `AnimatedServiceCard.tsx` | Business Logic | Framer Motion, Next.js | Client component with animations |
| `ReadingProgressServer.tsx` | Business Logic | React | Server component wrapper |
| `ReadingProgressClient.tsx` | Business Logic | React hooks | Client component with scroll tracking |
| `FeaturedArticlesServer.tsx` | Business Logic | React Query, Supabase | Server component with data fetching |
| `BlogPostClient.tsx` | Business Logic | React, MDX | Client component for blog posts |
| `MdxRenderer.tsx` | Business Logic | MDX, React | Client component for MDX content |
| `SocialShareServer.tsx` | Business Logic | React | Server component wrapper |
| `SocialShareClient.tsx` | Business Logic | React hooks | Client component for social sharing |

### 4. Authentication Components
Located in `apps/platform/src/components/auth/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `AuthButton.tsx` | Auth | NextAuth, React | Client component for auth |
| `AuthModal.tsx` | Auth | Radix UI, React | Client component for auth modal |
| `AuthModalTrigger.tsx` | Auth | Radix UI, React | Client component for auth trigger |
| `SignInForm.tsx` | Auth | React Hook Form, Zod | Client component for sign in |
| `SignUpForm.tsx` | Auth | React Hook Form, Zod | Client component for sign up |
| `ForgotPasswordForm.tsx` | Auth | React Hook Form, Zod | Client component for password reset |
| `AuthGuard.tsx` | Auth | NextAuth, React | Client component for auth protection |
| `UserSession.tsx` | Auth | NextAuth | Client component for session management |

### 5. Section Components
Located in `apps/platform/src/components/sections/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `BrandsSectionServer.tsx` | Section | React | Server component |
| `BrandsSectionClient.tsx` | Section | React hooks | Client component |
| `ContactSectionClient.tsx` | Section | React, Form validation | Client component |
| `CtaSectionClient.tsx` | Section | React | Client component |
| `HeaderAuthButtonsClient.tsx` | Section | React, NextAuth | Client component |
| `HeaderNavLinksClient.tsx` | Section | React, Next.js | Client component |
| `NewsletterFormClient.tsx` | Section | React, Form validation | Client component |
| `SimpleHeroSectionClient.tsx` | Section | React, Framer Motion | Client component |

### 6. Animation/Motion Components
Located in `apps/platform/src/components/motion/` and scattered

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `AnimatedSection.tsx` | Animation | Framer Motion | Client component |
| `InteractiveCard.tsx` | Animation | Framer Motion | Client component |
| `StaggeredList.tsx` | Animation | Framer Motion | Client component |
| `ScrollReveal.tsx` | Animation | Framer Motion | Client component |
| `AnimateOnScroll.tsx` | Animation | React hooks | Client component |

### 7. Loading Components
Located in `apps/platform/src/components/loading/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `PageLoadingManager.tsx` | Loading | React | Client component |

### 8. Blog Components
Located in `apps/platform/src/components/blog/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `BlogHeader.tsx` | Blog | Next.js, React | Client component |
| `BlogSidebar.tsx` | Blog | Next.js, React | Server component |
| `BlogSidebarClient.tsx` | Blog | Next.js, React | Client component |
| `ImageViewer.tsx` | Blog | React hooks | Client component |
| `LikeButton.tsx` | Blog | React, API calls | Client component |
| `BookmarkButton.tsx` | Blog | React, API calls | Client component |

### 9. Framework Components
Located in `apps/platform/src/components/frameworks/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `FrameworkCard.tsx` | Framework | React | Client component |
| `FrameworkGrid.tsx` | Framework | React | Client component |
| `HeroBlock.tsx` | Framework | React | Client component |
| `OverviewBlock.tsx` | Framework | React | Client component |
| `MethodologyBlock.tsx` | Framework | React | Client component |

### 10. Assessment Components
Located in `apps/platform/src/components/assessments/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `AssessmentPlayer.tsx` | Assessment | React | Client component |
| `QuestionCard.tsx` | Assessment | React | Client component |

### 11. Customer Support Components
Located in `apps/platform/src/components/customer/support/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `CustomerSupportWidget.tsx` | Support | React | Client component |
| `FloatingChatBubble.tsx` | Support | React | Client component |
| `CreateTicketModal.tsx` | Support | React | Client component |

### 12. Optimized Components
Located in `apps/platform/src/components/optimized/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `OptimizedImage.tsx` | Optimization | Next.js Image | Client component |
| `OptimizedBlogCard.tsx` | Optimization | React | Client component |
| `LightweightAnimations.tsx` | Optimization | React | Client component |

### 13. Utility Components
Located in `apps/platform/src/components/utils/`

| Component Name | Type | Dependencies | Notes |
|----------------|------|--------------|-------|
| `AnimateOnScroll.tsx` | Utility | React | Client component |

## Server vs Client Component Identification

### Server Components (End with `Server` or `server`)
- `reading-progress-server.tsx`
- `featured-articles-server.tsx`
- `services-server.tsx`
- `social-share-server.tsx`
- `brands-section-server.tsx`
- `blog-sidebar.tsx`
- `blog-author-server.tsx`

### Client Components (Have `"use client"` directive)
- All UI components in `ui/` directory
- All components with `"use client"` directive
- Components with browser APIs (localStorage, window, document)
- Components with React hooks (useState, useEffect, etc.)
- Components with event handlers

## Primary Dependencies Analysis

### React-based Dependencies
- React (core library)
- React DOM
- React Query (data fetching)
- React Hook Form (form handling)
- Framer Motion (animations)

### UI Framework Dependencies
- Radix UI (accessible UI primitives)
- Tailwind CSS (styling)
- Class Variance Authority (conditional class names)
- Lucide React (icons)

### Data Management Dependencies
- Supabase (database client)
- NextAuth (authentication)
- Zod (validation)

### Routing Dependencies
- Next.js (routing, Link, etc.)

### External Libraries
- Framer Motion (animations)
- Sonner (notifications)
- React Table (data tables)

## Porting Considerations for Svelte

### 1. Component Architecture Differences
- Next.js server/client components → SvelteKit server/client load functions
- React hooks → Svelte reactive statements and stores
- JSX → Svelte template syntax
- Conditional rendering (React: {condition && component}) → Svelte: {#if condition}

### 2. UI Component Migration Strategy
- Radix UI primitives → Svelte A11y or custom implementations
- Tailwind CSS → Tailwind or Svelte styling approaches
- Framer Motion → Svelte motion libraries or custom animations

### 3. Data Fetching Migration
- React Query → SvelteKit load functions and server API routes
- Supabase integration → Maintain same backend, adjust frontend API calls

### 4. State Management
- React Context → Svelte stores
- React hooks → Svelte reactive declarations
- Client-side state → Svelte reactive variables

### 5. Authentication Migration
- NextAuth.js → SvelteKit authentication solutions (Lucia, Auth.js for SvelteKit)
- Session management → SvelteKit session handling

### 6. File Structure Migration
- Next.js app directory → SvelteKit src/routes
- Component organization → Maintain logical groupings in SvelteKit
- Server components → SvelteKit server load functions or API routes

## Recommended Migration Approach

### Phase 1: Foundation Components
1. Migrate UI primitives first (buttons, cards, etc.)
2. Establish SvelteKit project structure
3. Set up styling system (Tailwind CSS)

### Phase 2: Data-Dependent Components
1. Migrate components with data fetching
2. Implement SvelteKit load functions
3. Connect to existing Supabase backend

### Phase 3: Complex Components
1. Migrate components with complex animations
2. Implement Svelte motion solutions
3. Handle complex form components

### Phase 4: Integration
1. Connect all components together
2. Implement authentication flow
3. Test complete user journeys

## Risk Assessment

### High Risk Components
- Components with complex animations (Framer Motion → Svelte motion)
- Authentication components (NextAuth → SvelteKit auth)
- Data fetching components (React Query → SvelteKit load)

### Low Risk Components
- Simple UI primitives (will be straightforward to recreate)
- Static content components
- Utility components

### Dependency Concerns
- Radix UI has no direct Svelte equivalent
- Framer Motion needs Svelte alternative
- Some React-specific patterns need re-architecting