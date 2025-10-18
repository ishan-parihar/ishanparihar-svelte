# Next.js Application Architecture Overview - Platform App

## Core Architectural Pillars

### 1. Authentication System
The application implements a comprehensive authentication system using NextAuth.js with Supabase as the database adapter. Key features include:

- **OAuth Integration**: Google OAuth provider with automatic account linking
- **Email/Password Authentication**: Credentials provider with bcrypt password hashing
- **Magic Link Authentication**: Custom email provider for passwordless login
- **JWT Sessions**: JWT-based session management for Edge Runtime compatibility
- **Role-Based Access Control**: User roles (admin/user) with dynamic assignment
- **Account Management**: Suspension and spam flagging capabilities with automatic revalidation
- **Multi-Provider Support**: Handles Google, email, and credentials authentication methods

The authentication system includes middleware protection for admin routes (`/admin`) and account routes (`/account`), with proper session validation and revalidation on each request.

### 2. Data Access Layer
The application uses Supabase as the primary database and storage solution with a well-defined data access strategy:

- **Supabase Integration**: Uses `@supabase/supabase-js` client with Row Level Security (RLS) support
- **Type Safety**: Generated TypeScript types for database schema with comprehensive table definitions
- **Storage Management**: File upload/download capabilities with proper URL normalization
- **RLS Implementation**: Proper handling of Row Level Security with service role bypass for admin operations
- **Direct API Fallbacks**: Alternative direct API methods for cases where client library fails
- **Connection Management**: Different clients for browser vs server contexts with proper authentication context

Key database entities include:
- Blog posts with content, metadata, and engagement tracking
- User management with roles, permissions, and account status
- Service/product catalog with pricing tiers and features
- Payment and order management system
- Newsletter subscription management
- Assessment and questionnaire system

### 3. UI Components & Design System
The application implements a comprehensive component library with:

- **UI Component Library**: Reusable components following shadcn/ui patterns (buttons, cards, forms, etc.)
- **Layout Components**: Header, navigation, hero sections, testimonials, CTAs
- **Specialized Components**: Blog content rendering, service listings, payment forms, admin interfaces
- **Animation Integration**: Framer Motion and GSAP for advanced animations
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Radix UI primitives for accessible components
- **Performance Optimized**: Lazy loading and optimized image components

### 4. State Management
The application implements a multi-layered state management approach:

- **Client-Specific State**: React hooks and Zustand for local component state
- **Server State**: tRPC for type-safe API calls and server state management
- **Query Caching**: TanStack Query (React Query) for server state caching with configurable stale times
- **Session State**: NextAuth.js session management with automatic revalidation
- **Global State**: Context API for cross-cutting concerns (theme, loading states, auth modal)
- **Form State**: React Hook Form for complex form management with Zod validation

### 5. API Integrations
The application provides a comprehensive API layer built with tRPC:

- **tRPC Integration**: Type-safe API endpoints with Zod validation
- **Router Organization**: Modular routers for different domains (auth, blog, user, admin, payments, etc.)
- **Authentication Middleware**: Protected, limited, and admin procedures with different permission levels
- **Database Integration**: Direct Supabase integration within API routes
- **External Services**: Integration with payment gateways (Razorpay), email services (Nodemailer), and Google APIs
- **File Handling**: Supabase storage integration for file uploads and management

## System Architecture Overview

The application follows a modern Next.js architecture with:
- **App Router**: Using the Next.js 13+ app directory structure
- **Server Components**: Heavy use of server components for data fetching and rendering
- **Client Components**: Strategic use of client components for interactivity
- **API Routes**: tRPC-based API layer for type-safe communication
- **Middleware**: Authentication and authorization middleware
- **Caching Strategy**: Multi-layer caching with React Query and Next.js data fetching
- **Security**: RLS implementation, JWT validation, and permission-based access control

## Data Flow Patterns

The application implements several key data flow patterns:
- **Server-Side Data Fetching**: Most data fetching happens in server components with proper caching
- **Client-Side Mutations**: tRPC mutations for user interactions with optimistic updates
- **Real-time Updates**: WebSocket integration for real-time features where applicable
- **Background Processing**: Scheduled tasks and webhook handling for external integrations

## Security Architecture

The security model includes:
- **Authentication**: Multi-provider authentication with proper session management
- **Authorization**: Role-based access control with granular permissions
- **Data Protection**: RLS implementation to protect sensitive data at the database level
- **Input Validation**: Zod schemas for all API inputs and database operations
- **Secure Storage**: Proper handling of sensitive information with encryption where needed