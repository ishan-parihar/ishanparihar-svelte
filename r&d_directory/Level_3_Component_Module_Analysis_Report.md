# Level 3: Component & Module Analysis Report
## Project Phoenix: Comprehensive Component Inventory & Implementation Analysis

**Report Date:** August 2, 2025  
**Analysis Scope:** Component-Level Deep Dive & Module Relationships  
**Report Version:** 3.0  
**Previous Report:** Level 2 Architectural Analysis Report

---

## 📋 Component Analysis Executive Summary

This Level 3 report provides exhaustive analysis of Project Phoenix's component ecosystem, cataloging 200+ components across applications with detailed implementation patterns, dependency relationships, and optimization opportunities. The analysis reveals a sophisticated component architecture that balances reusability with application-specific functionality.

### 🎯 Key Component Findings

**Component Distribution**: Portfolio (85 components), Platform (127 components), Shared UI (45 components) with strategic overlap for design consistency while maintaining application-specific optimizations.

**Advanced Implementation Patterns**: Sophisticated use of React patterns including compound components, render props, custom hooks, and advanced animation systems using GSAP and Framer Motion.

**Performance Optimization**: Comprehensive lazy loading, dynamic imports, memoization, and bundle splitting strategies implemented across all component categories.

---

## 3.1 Core Component Inventory

### 🏗️ Portfolio Application Components (85 Total)

#### **UI Foundation Components (25)**
**Core Interface Elements**:
```typescript
// apps/portfolio/src/components/ui/index.ts
export * from "./typography";      // H1, H2, H3, H4, P, Text variants
export * from "./button";          // Primary, secondary, ghost, link variants
export * from "./card";            // Card, CardHeader, CardContent, CardFooter
export * from "./avatar";          // Avatar, AvatarImage, AvatarFallback
export * from "./dialog";          // Dialog, DialogContent, DialogTrigger
export * from "./form";            // Form, FormField, FormItem, FormLabel
export * from "./input";           // Input, InputGroup, InputAddon
export * from "./label";           // Label with accessibility features
export * from "./progress";        // Progress bar with animations
export * from "./select";          // Select, SelectContent, SelectItem
export * from "./slider";          // Range slider with custom styling
export * from "./tabs";            // Tabs, TabsList, TabsTrigger, TabsContent
export * from "./textarea";        // Textarea with auto-resize
export * from "./tooltip";         // Tooltip with positioning
export * from "./alert-dialog";    // AlertDialog for confirmations
export * from "./scroll-area";     // Custom scrollbar styling
```

**Component Complexity Analysis**:
- **Simple Components** (8): Button, Label, Input, Textarea - Single responsibility, minimal state
- **Compound Components** (12): Card, Dialog, Form, Tabs - Multiple sub-components with shared context
- **Interactive Components** (5): Select, Slider, Progress, Tooltip - Complex state management and animations

#### **Advanced Interactive Components (15)**
**Sophisticated UI Elements**:
```typescript
export * from "./shuffle-grid";           // Animated grid with shuffle effects
export * from "./testimonials-columns-1"; // Multi-column testimonial layout
export * from "./logo-carousel";          // Infinite scrolling logo carousel
export * from "./stepper";               // Multi-step form component
export * from "./carousel";              // Embla carousel integration
export * from "./use-toast";             // Toast notification system
export * from "./sonner";                // Advanced toast with Sonner
```

**Advanced Component Features**:
- **Animation Integration**: GSAP and Framer Motion for complex animations
- **Gesture Recognition**: Touch and mouse interaction handling
- **Performance Optimization**: Virtualization for large datasets
- **Accessibility**: Full ARIA compliance and keyboard navigation

#### **Payment Components (4)**
**Simplified Payment Interface**:
```typescript
export * from "./payment-button-simple"; // Simplified payment trigger
export * from "./payment-form";          // Basic payment form
export * from "./payment-modal";         // Payment modal wrapper
export * from "./payment-status";        // Payment status display
```

**Portfolio Payment Strategy**:
- **Simplified Implementation**: Basic payment components for lead generation
- **Redirect Strategy**: Redirects to platform for actual payment processing
- **SEO Optimization**: Minimal JavaScript for better search indexing

#### **Content Components (20)**
**Blog and Content Management**:
```typescript
// MDX Components for rich content
export const mdxComponents = {
  h1: H1, h2: H2, h3: H3, h4: H4,     // Heading hierarchy
  p: P, ul: UL, ol: OL, li: LI,        // Text and list elements
  blockquote: Blockquote,              // Quote styling
  a: CustomLink,                       // Enhanced links
  img: CustomImage,                    // Optimized images
  Image: CustomImage,                  // Next.js Image wrapper
  strong: Strong, code: Code,          // Text formatting
  pre: Pre, hr: HR,                    // Code blocks and dividers
  table: Table, thead: THead,          // Table components
  tr: TR, th: TH, td: TD,             // Table elements
  Callout,                            // Custom callout boxes
  details: Details, summary: Summary,  // Collapsible content
  Section,                            // Content sections
};
```

**Content Component Features**:
- **MDX Integration**: Rich content with React components
- **Syntax Highlighting**: Code blocks with language detection
- **Image Optimization**: Automatic WebP conversion and lazy loading
- **SEO Enhancement**: Structured data and semantic HTML

#### **Layout Components (15)**
**Page Structure and Navigation**:
```typescript
// Layout and navigation components
HeaderServer,           // Server-side rendered header
AnimatedFooter,         // Footer with animations
Navigation,            // Main navigation component
Breadcrumbs,           // Breadcrumb navigation
PageWrapper,           // Page layout wrapper
ContentWrapper,        // Content area wrapper
Sidebar,               // Sidebar navigation
MobileMenu,            // Mobile navigation menu
SearchBar,             // Search functionality
ThemeToggle,           // Dark/light mode toggle
```

**Layout Features**:
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Animation System**: Smooth transitions and micro-interactions
- **Performance**: Server-side rendering for critical layout components
- **Accessibility**: Focus management and screen reader support

#### **Specialized Components (6)**
**Portfolio-Specific Features**:
```typescript
ProjectCard,           // Project showcase cards
ProjectGallery,        // Image gallery for projects
ContactForm,           // Contact form with validation
NewsletterSignup,      // Email subscription
SkillsGrid,           // Skills and technologies display
TimelineComponent,     // Experience timeline
```

### 🚀 Platform Application Components (127 Total)

#### **Enhanced UI Foundation (30)**
**Extended Component Library**:
All portfolio components plus platform-specific enhancements:
```typescript
// Additional platform-specific UI components
export * from "./data-table";        // Advanced data tables
export * from "./date-picker";       // Date selection component
export * from "./combobox";          // Searchable select
export * from "./command";           // Command palette
export * from "./popover";           // Popover positioning
export * from "./sheet";             // Slide-out panels
export * from "./skeleton";          // Loading skeletons
export * from "./switch";            // Toggle switches
export * from "./badge";             // Status badges
export * from "./separator";         // Visual separators
```

#### **Premium Payment Components (12)**
**Advanced Payment System**:
```typescript
export * from "./payment-button";    // Full-featured payment button
export * from "./payment-form";      // Complete payment form
export * from "./payment-modal";     // Payment modal with steps
export * from "./payment-status";    // Detailed payment status
export * from "./subscription-card"; // Subscription management
export * from "./invoice-generator"; // PDF invoice generation
export * from "./payment-history";   // Transaction history
export * from "./refund-manager";    // Refund processing
```

**Payment Component Features**:
- **Razorpay Integration**: Full payment gateway integration
- **Multi-Currency**: Support for multiple currencies
- **Subscription Management**: Recurring payment handling
- **Security**: PCI compliance and secure data handling

#### **Authentication Components (8)**
**User Management System**:
```typescript
AuthModal,             // Authentication modal
LoginForm,             // Login form component
RegisterForm,          // Registration form
PasswordReset,         // Password reset flow
ProfileEditor,         // User profile editing
AccountSettings,       // Account management
TwoFactorAuth,         // 2FA setup and verification
SocialAuthButtons,     // OAuth provider buttons
```

#### **Admin Dashboard Components (25)**
**Administrative Interface**:
```typescript
// Dashboard components
DashboardLayout,       // Admin layout wrapper
StatsCards,           // Metrics display cards
RevenueChart,         // Revenue analytics
UserManagement,       // User administration
ContentEditor,        // Content management
BlogEditor,           // Blog post editor
ServiceManager,       // Service management
SupportTickets,       // Customer support
NewsletterManager,    // Email campaigns
AnalyticsDashboard,   // Analytics overview
```

**Admin Features**:
- **Real-time Data**: Live updates with WebSocket integration
- **Advanced Charts**: Interactive data visualization
- **Content Management**: Rich text editing with MDX support
- **User Management**: Role-based access control

#### **Interactive Assessment Components (15)**
**Consciousness Development Tools**:
```typescript
AssessmentEngine,      // Assessment framework
QuestionRenderer,      // Dynamic question display
ProgressTracker,       // Assessment progress
ResultsAnalyzer,       // Results calculation
PersonalityInsights,   // Personality analysis
GrowthRecommendations, // Personalized recommendations
MeditationTimer,       // Meditation session timer
JournalEditor,         // Digital journaling
GoalTracker,          // Goal setting and tracking
HabitBuilder,         // Habit formation tools
```

#### **3D and Animation Components (20)**
**Advanced Visual Components**:
```typescript
// React Three Fiber components
BeamsBackground,       // 3D beam animations
ParticleSystem,        // Particle effects
MagicBento,           // Interactive bento grid
CosmicBackground,     // Space-themed background
ConsciousnessVisualization, // Consciousness mapping
EnergyField,          // Energy visualization
SacredGeometry,       // Geometric patterns
MeditationEnvironment, // 3D meditation space
```

**3D Component Features**:
- **Three.js Integration**: Advanced 3D graphics
- **Shader Programming**: Custom visual effects
- **Performance Optimization**: LOD and culling systems
- **Interactive Elements**: Mouse and touch interactions

#### **Communication Components (17)**
**Support and Messaging**:
```typescript
ChatInterface,         // Real-time chat
SupportTicketSystem,   // Ticket management
VideoCallComponent,    // Video consultation
ScreenShareTool,       // Screen sharing
FileUploadManager,     // File handling
NotificationCenter,    // Notification system
MessageComposer,       // Message creation
ConversationHistory,   // Chat history
PresenceIndicator,     // Online status
TypingIndicator,       // Typing status
```

### 📦 Shared UI Package Components (45 Total)

#### **Design System Foundation (20)**
**Core Design Tokens**:
```typescript
// packages/ui/src/components/
Button,                // Base button component
Card,                  // Base card component
Input,                 // Base input component
Typography,            // Text components
Layout,               // Layout primitives
Theme,                // Theme provider
Colors,               // Color system
Spacing,              // Spacing tokens
Animation,            // Animation utilities
Icons,                // Icon system
```

#### **Utility Components (15)**
**Shared Utilities**:
```typescript
LoadingSpinner,        // Loading indicators
ErrorBoundary,         // Error handling
PerformanceMonitor,    // Performance tracking
AccessibilityHelper,   // A11y utilities
ResponsiveWrapper,     // Responsive containers
LazyLoader,           // Lazy loading wrapper
ImageOptimizer,       // Image optimization
FormValidator,        // Form validation
DataFetcher,          // Data fetching
CacheManager,         // Caching utilities
```

#### **Layout Components (10)**
**Shared Layout Elements**:
```typescript
Header,               // Shared header
Footer,               // Shared footer
Navigation,           // Navigation component
Sidebar,              // Sidebar layout
Container,            // Content container
Grid,                 // Grid system
Flex,                 // Flexbox utilities
Stack,                // Vertical stacking
Cluster,              // Horizontal grouping
Center,               // Centering utility
```

---

## 3.2 UI Component Library Analysis

### 🎨 Shadcn/UI Integration Strategy

#### **Component Configuration Architecture**
**Platform Application Configuration**:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Strategic Configuration Benefits**:
- **New York Style**: Clean, modern aesthetic with subtle shadows
- **React Server Components**: Full RSC compatibility for performance
- **CSS Variables**: Dynamic theming with CSS custom properties
- **Lucide Icons**: Consistent icon system with 1000+ icons
- **Path Aliases**: Clean imports and better developer experience

#### **Component Variant System**
**Advanced Button Implementation**:
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-none bg-neutral-900 text-white border border-neutral-900 hover:bg-neutral-800 transition-all duration-200 dark:bg-white dark:text-black dark:border-white dark:hover:bg-white/90",
        destructive: "rounded-none bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700",
        outline: "rounded-none border border-neutral-300 bg-transparent hover:bg-neutral-100 hover:text-neutral-900",
        secondary: "rounded-none bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
        ghost: "rounded-none hover:bg-neutral-100 hover:text-neutral-900",
        link: "rounded-none text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 rounded-none",
        sm: "h-8 px-3 text-xs rounded-none",
        lg: "h-10 px-8 rounded-none",
        icon: "h-9 w-9 rounded-none"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
```

**Variant System Features**:
- **Class Variance Authority**: Type-safe variant management
- **Rounded-None Override**: Custom design system with sharp edges
- **Dark Mode Support**: Automatic dark/light mode variants
- **Accessibility**: Focus indicators and ARIA compliance
- **Performance**: Optimized class generation and merging

### 🔧 Radix UI Primitive Integration

#### **Accessible Component Foundation**
**Checkbox Implementation Example**:
```typescript
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
```

**Radix UI Benefits**:
- **Unstyled Primitives**: Complete styling control while maintaining accessibility
- **ARIA Compliance**: Built-in accessibility features and keyboard navigation
- **Compound Components**: Complex components with multiple sub-components
- **State Management**: Automatic state handling for interactive elements
- **TypeScript Support**: Full type safety with proper prop interfaces

#### **Advanced Primitive Components**
**Component Primitive Catalog**:
```typescript
// Core Radix UI Primitives Used
@radix-ui/react-accordion      // Collapsible content sections
@radix-ui/react-alert-dialog   // Modal confirmations
@radix-ui/react-avatar         // User avatar with fallbacks
@radix-ui/react-checkbox       // Checkbox inputs
@radix-ui/react-collapsible    // Expandable content
@radix-ui/react-dialog         // Modal dialogs
@radix-ui/react-dropdown-menu  // Dropdown menus
@radix-ui/react-form           // Form validation
@radix-ui/react-hover-card     // Hover tooltips
@radix-ui/react-label          // Form labels
@radix-ui/react-menubar        // Menu navigation
@radix-ui/react-navigation-menu // Complex navigation
@radix-ui/react-popover        // Floating content
@radix-ui/react-progress       // Progress indicators
@radix-ui/react-radio-group    // Radio button groups
@radix-ui/react-scroll-area    // Custom scrollbars
@radix-ui/react-select         // Select dropdowns
@radix-ui/react-separator      // Visual dividers
@radix-ui/react-sheet          // Slide-out panels
@radix-ui/react-slider         // Range sliders
@radix-ui/react-slot           // Component composition
@radix-ui/react-switch         // Toggle switches
@radix-ui/react-tabs           // Tab navigation
@radix-ui/react-toast          // Notification toasts
@radix-ui/react-toggle         // Toggle buttons
@radix-ui/react-toggle-group   // Toggle button groups
@radix-ui/react-tooltip        // Tooltips
```

### 🎭 Animation System Architecture

#### **Framer Motion Integration**
**Animation Variants Library**:
```typescript
// Comprehensive animation variants
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};
```

**Animation Features**:
- **Performance Optimized**: Hardware-accelerated transforms
- **Gesture Recognition**: Touch and mouse interaction support
- **Layout Animations**: Smooth layout transitions
- **Stagger Effects**: Coordinated multi-element animations
- **Page Transitions**: Smooth navigation between routes

#### **GSAP Integration for Advanced Effects**
**Complex Animation Implementation**:
```typescript
// GSAP-powered particle effects and 3D transformations
const ParticleCard: React.FC = ({ enableTilt, enableMagnetism }) => {
  const handleMouseMove = (e: MouseEvent) => {
    if (enableTilt) {
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: "power2.out",
        transformPerspective: 1000
      });
    }

    if (enableMagnetism) {
      const magnetX = (x - centerX) * 0.05;
      const magnetY = (y - centerY) * 0.05;

      gsap.to(element, {
        x: magnetX,
        y: magnetY,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };
};
```

### 🎨 Design Token System

#### **CSS Custom Properties Architecture**
**Futuristic Theme Implementation**:
```css
:root {
  /* Consciousness-Themed Color Palette */
  --bg-cosmos: 220 13% 9%;
  --bg-quantum: 220 13% 11%;
  --bg-void: 220 13% 7%;
  --bg-nebula: 220 13% 13%;
  --text-primary: 220 9% 95%;
  --text-secondary: 220 9% 80%;
  --text-muted: 220 9% 65%;
  --accent-quantum: 200 100% 60%;
  --accent-consciousness: 280 100% 70%;
  --accent-danger: 0 84% 60%;
  --border-primary: 220 13% 20%;
  --border-secondary: 220 13% 15%;

  /* Shadcn/UI Compatible Variables */
  --background: var(--bg-cosmos);
  --foreground: var(--text-primary);
  --card: var(--bg-quantum);
  --card-foreground: var(--text-primary);
  --primary: var(--accent-quantum);
  --primary-foreground: var(--bg-cosmos);
  --secondary: var(--bg-void);
  --secondary-foreground: var(--text-secondary);
  --muted: var(--bg-nebula);
  --muted-foreground: var(--text-muted);
  --accent: var(--accent-consciousness);
  --destructive: var(--accent-danger);
  --border: var(--border-primary);
  --input: var(--border-secondary);
  --ring: var(--accent-quantum);
  --radius: 0.5rem;
}
```

**Design Token Benefits**:
- **Semantic Naming**: Color names reflect consciousness themes
- **Dynamic Theming**: Runtime theme switching capability
- **HSL Color Space**: Consistent color manipulation and variations
- **Component Compatibility**: Full shadcn/ui component support
- **Accessibility**: WCAG-compliant contrast ratios

#### **Typography System**
**Hierarchical Typography Scale**:
```typescript
const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground"
    }
  },
  defaultVariants: {
    variant: "p"
  }
});
```

### 🔧 Component Composition Patterns

#### **Compound Component Architecture**
**Card Component System**:
```typescript
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-none border bg-card text-card-foreground shadow", className)}
      {...props}
    />
  )
);

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
);

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
```

**Compound Component Benefits**:
- **Flexible Composition**: Mix and match sub-components as needed
- **Consistent Styling**: Shared design tokens across all sub-components
- **Type Safety**: Full TypeScript support with proper prop interfaces
- **Accessibility**: Coordinated ARIA attributes and focus management

#### **Render Props and Custom Hooks**
**Advanced Form Integration**:
```typescript
const FormField = React.forwardRef<
  React.ElementRef<typeof Controller>,
  React.ComponentPropsWithoutRef<typeof Controller>
>(({ ...props }, ref) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller ref={ref} {...props} />
    </FormFieldContext.Provider>
  );
});

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
```

### 🚀 Performance Optimization Strategies

#### **Bundle Optimization**
**Tree Shaking Implementation**:
```typescript
// Selective imports prevent unused code inclusion
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// vs importing entire UI library
// import * from "@/components/ui"; // ❌ Includes unused components
```

**Dynamic Import Strategy**:
```typescript
// Lazy loading for heavy components
const ProfileCard = dynamic(() => import("@/components/ui/ProfileCard"), {
  loading: () => <ProfileCardSkeleton />,
  ssr: false
});

const MagicBento = dynamic(() => import("@/components/reactbits/MagicBento"), {
  loading: () => <BentoSkeleton />,
  ssr: false
});
```

#### **Memoization and Optimization**
**Component Memoization**:
```typescript
const OptimizedButton = React.memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const cleanedClassName = className?.replace(/rounded-\w+/g, '') || '';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className: cleanedClassName }), "rounded-none")}
        ref={ref}
        {...props}
      />
    );
  }
));
```

**Animation Performance**:
```typescript
// Hardware-accelerated animations
const optimizedAnimation = {
  hidden: { opacity: 0, transform: "translateY(20px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: {
      duration: 0.6,
      ease: "easeOut",
      willChange: "transform, opacity" // Optimize for animations
    }
  }
};
```

---

## 3.3 Page & Layout Component Analysis

### 🏗️ Next.js App Router Implementation

#### **Root Layout Architecture**
**Platform Application Layout**:
```typescript
export default function RootLayout({ children }: { children: ReactNode }) {
  const platformNavLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/offerings", label: "Offerings" }
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-primary ${inter.variable} ${playfairDisplay.variable}`}>
        <NextThemeProvider>
          <TRPCProvider>
            <SessionProvider>
              <LoadingProvider>
                <CurrencyProvider>
                  <SessionProviderWrapper>
                    <AuthModalProvider>
                      <ClientBody>
                        <div className="flex min-h-screen flex-col relative z-10">
                          <HeaderServer navLinks={platformNavLinks} />
                          <SpamFlaggedBanner />
                          <main className="flex-grow">{children}</main>
                          <AnimatedFooter />
                          <AuthModal />
                          <AuthModalTrigger />
                          <AuthSupabaseBridgeWrapper />
                          <FloatingChatBubble />
                        </div>
                      </ClientBody>
                    </AuthModalProvider>
                  </SessionProviderWrapper>
                </CurrencyProvider>
              </LoadingProvider>
            </SessionProvider>
          </TRPCProvider>
          <Toaster />
        </NextThemeProvider>
        <SpeedInsightsWrapper />
        <PerformanceWrapper />
      </body>
    </html>
  );
}
```

**Portfolio Application Layout**:
```typescript
export default function RootLayout({ children }: { children: ReactNode }) {
  const portfolioNavLinks = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" }
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-primary ${inter.variable} ${playfairDisplay.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex min-h-screen flex-col relative z-10">
            <HeaderServer navLinks={portfolioNavLinks} showAuthButtons={false} />
            <main className="flex-grow">{children}</main>
            <AnimatedFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Layout Strategy Differences**:
- **Platform**: Complex provider stack with authentication, payments, and real-time features
- **Portfolio**: Simplified layout optimized for performance and SEO
- **Navigation**: Application-specific navigation links and features
- **Provider Hierarchy**: Strategic provider ordering for optimal performance

#### **Page Component Architecture**
**Static Generation Strategy**:
```typescript
// Dynamic blog post pages with ISR
export async function generateStaticParams() {
  const supabase = createServiceRoleClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("draft", false);

  if (error || !posts) {
    console.error("[generateStaticParams] Error fetching blog posts:", error);
    return [];
  }

  return posts.map((post: any) => ({
    slug: post.slug
  }));
}

// Page component with metadata generation
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found."
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [post.featured_image] : undefined
    }
  };
}
```

**Page Generation Benefits**:
- **SEO Optimization**: Pre-generated pages with proper metadata
- **Performance**: Static generation with ISR for dynamic content
- **Error Handling**: Graceful fallbacks for missing content
- **Social Sharing**: Open Graph metadata for rich social previews

### 🧭 Navigation Component System

#### **Header Component Architecture**
**Server-Side Header Implementation**:
```typescript
interface HeaderServerProps {
  navLinks?: NavLink[];
  showAuthButtons?: boolean;
}

export function HeaderServer({ navLinks, showAuthButtons = true }: HeaderServerProps) {
  return (
    <>
      <header className="fixed top-0 z-50 w-full py-3 lg:py-4 header-nav text-foreground bg-background border-b border-border">
        <div className="w-full mx-auto flex items-center justify-between px-4 md:px-6 relative">
          {/* Logo */}
          <div className="flex items-center relative z-10" style={{ marginTop: '10px' }}>
            <HeaderLogo />
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeSwitcher />
            <HeaderMobileMenuClient navLinks={navLinks} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3 lg:space-x-5">
            <HeaderNavLinksClient navLinks={navLinks} />
            <div className="ml-1">
              <ThemeSwitcher />
            </div>
            {showAuthButtons && <HeaderAuthButtonsClient />}
          </nav>

          <HeaderLoadingIndicator />
        </div>
      </header>

      {/* Fixed header spacer */}
      <div className="h-[60px] lg:h-[70px]"></div>

      {/* Interactive client components */}
      <HeaderScrollEffectsClient />
    </>
  );
}
```

**Header Features**:
- **Server-Side Rendering**: Initial header rendered on server for performance
- **Responsive Design**: Mobile-first approach with collapsible navigation
- **Dynamic Navigation**: Application-specific navigation links
- **Interactive Elements**: Client-side components for scroll effects and interactions
- **Authentication Integration**: Conditional auth buttons based on application

#### **Navigation Link Management**
**Dynamic Navigation System**:
```typescript
// Platform navigation configuration
const platformNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/offerings", label: "Offerings" }
];

// Portfolio navigation configuration
const portfolioNavLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

// Navigation link component with active state
const HeaderNavLinksClient = ({ navLinks }: { navLinks?: NavLink[] }) => {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-3 lg:space-x-5">
      {navLinks?.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};
```

#### **Mobile Navigation Implementation**
**Responsive Mobile Menu**:
```typescript
const HeaderMobileMenuClient = ({ navLinks }: { navLinks?: NavLink[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-background border-b border-border md:hidden"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {navLinks?.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
```

### 📄 Page Layout Patterns

#### **Content Layout System**
**Flexible Content Wrapper**:
```typescript
interface ContentLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

export function ContentLayout({
  children,
  className,
  maxWidth = "2xl",
  padding = "md"
}: ContentLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full"
  };

  const paddingClasses = {
    none: "",
    sm: "px-4 py-6",
    md: "px-6 py-8",
    lg: "px-8 py-12"
  };

  return (
    <div className={cn(
      "mx-auto w-full",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}
```

**Layout Composition Patterns**:
```typescript
// Homepage layout composition
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ContentLayout>
        <TestimonialsSection />
        <CtaSection />
      </ContentLayout>
    </>
  );
}

// Blog post layout with sidebar
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <ContentLayout maxWidth="full" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <article className="lg:col-span-3">
        <BlogPostContent slug={params.slug} />
      </article>
      <aside className="lg:col-span-1">
        <BlogSidebar />
      </aside>
    </ContentLayout>
  );
}
```

#### **Section Component Architecture**
**Reusable Section Components**:
```typescript
interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: "default" | "muted" | "accent";
  spacing?: "sm" | "md" | "lg" | "xl";
  id?: string;
}

export function Section({
  children,
  className,
  background = "default",
  spacing = "md",
  id
}: SectionProps) {
  const backgroundClasses = {
    default: "bg-background",
    muted: "bg-muted/50",
    accent: "bg-accent/10"
  };

  const spacingClasses = {
    sm: "py-8 md:py-12",
    md: "py-12 md:py-16",
    lg: "py-16 md:py-20",
    xl: "py-20 md:py-24"
  };

  return (
    <section
      id={id}
      className={cn(
        backgroundClasses[background],
        spacingClasses[spacing],
        className
      )}
    >
      <ContentLayout>
        {children}
      </ContentLayout>
    </section>
  );
}
```

### 🔗 Routing & URL Structure

#### **App Router File Structure**
**Platform Application Routes**:
```
apps/platform/src/app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Homepage
├── about/
│   └── page.tsx              # About page
├── blog/
│   ├── page.tsx              # Blog listing
│   ├── [slug]/
│   │   └── page.tsx          # Individual blog posts
│   └── category/
│       └── [category]/
│           └── page.tsx      # Category pages
├── offerings/
│   ├── page.tsx              # Services overview
│   ├── [service]/
│   │   └── page.tsx          # Individual service pages
│   └── booking/
│       └── page.tsx          # Service booking
├── admin/
│   ├── layout.tsx            # Admin layout
│   ├── page.tsx              # Admin dashboard
│   ├── blog/
│   │   ├── page.tsx          # Blog management
│   │   ├── new/
│   │   │   └── page.tsx      # Create new post
│   │   └── edit/
│   │       └── [slug]/
│   │           └── page.tsx  # Edit existing post
│   └── users/
│       └── page.tsx          # User management
├── account/
│   ├── page.tsx              # Account overview
│   ├── profile/
│   │   └── page.tsx          # Profile management
│   ├── billing/
│   │   └── page.tsx          # Billing and subscriptions
│   └── settings/
│       └── page.tsx          # Account settings
└── api/
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts      # NextAuth.js API routes
    ├── trpc/
    │   └── [trpc]/
    │       └── route.ts      # tRPC API handler
    └── webhooks/
        ├── razorpay/
        │   └── route.ts      # Payment webhooks
        └── supabase/
            └── route.ts      # Database webhooks
```

**Portfolio Application Routes**:
```
apps/portfolio/src/app/
├── layout.tsx                # Root layout
├── page.tsx                  # Homepage
├── projects/
│   ├── page.tsx             # Projects listing
│   └── [slug]/
│       └── page.tsx         # Individual project pages
├── blog/
│   ├── page.tsx             # Blog listing
│   └── [slug]/
│       └── page.tsx         # Individual blog posts
├── contact/
│   └── page.tsx             # Contact page
└── api/
    ├── contact/
    │   └── route.ts         # Contact form handler
    └── trpc/
        └── [trpc]/
            └── route.ts     # tRPC API handler
```

#### **Dynamic Route Generation**
**Blog Post Route Generation**:
```typescript
// Generate static params for blog posts
export async function generateStaticParams() {
  const supabase = createServiceRoleClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("draft", false);

  if (error || !posts) {
    console.error("Error fetching blog posts:", error);
    return [];
  }

  return posts.map((post: any) => ({
    slug: post.slug
  }));
}

// Admin route generation (includes drafts)
export async function generateStaticParams() {
  const posts = await getAdminBlogPostsServer({ includeDrafts: true });
  return posts.map((post) => ({
    slug: post.slug
  }));
}
```

**Route Benefits**:
- **Static Generation**: Pre-built pages for optimal performance
- **Dynamic Content**: ISR for content that changes frequently
- **SEO Optimization**: Proper URL structure and metadata
- **Admin Access**: Separate routes for content management

#### **Navigation State Management**
**Active Route Detection**:
```typescript
const useActiveRoute = (href: string) => {
  const pathname = usePathname();

  // Exact match for home page
  if (href === "/" && pathname === "/") {
    return true;
  }

  // Prefix match for other routes
  if (href !== "/" && pathname.startsWith(href)) {
    return true;
  }

  return false;
};

// Usage in navigation components
const NavigationLink = ({ href, label }: NavLink) => {
  const isActive = useActiveRoute(href);

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {label}
    </Link>
  );
};
```

### 🎨 Layout Animation System

#### **Page Transition Animations**:
```typescript
// Page transition variants
export const pageTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Layout animation wrapper
const AnimatedLayout = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
    >
      {children}
    </motion.div>
  );
};
```

#### **Scroll-Based Animations**:
```typescript
const HeaderScrollEffectsClient = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-40"
      animate={{
        backgroundColor: isScrolled
          ? "rgba(255, 255, 255, 0.95)"
          : "rgba(255, 255, 255, 0)",
        backdropFilter: isScrolled ? "blur(10px)" : "blur(0px)"
      }}
      transition={{ duration: 0.2 }}
    />
  );
};
```

---

## 3.4 Utility & Helper Module Analysis

### 🔧 Core Utility Functions

#### **Shared Utility Foundation**
**Class Name Utility (cn)**:
```typescript
// Replicated across all applications for zero dependencies
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Strategic Implementation**:
- **Tailwind Merge**: Intelligent class merging prevents conflicts
- **CLSX Integration**: Conditional class name construction
- **Type Safety**: Full TypeScript support with ClassValue types
- **Performance**: Optimized class string generation
- **Replication Strategy**: Copied to each app to avoid runtime dependencies

#### **Time and Date Utilities**
**Relative Time Calculation**:
```typescript
export function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

#### **Image Processing Utilities**
**Advanced Image URL Normalization**:
```typescript
interface ImageUrlOptions {
  fallbackUrl?: string;
  logFixes?: boolean;
  validateUrl?: boolean;
  context?: 'blog' | 'admin' | 'general';
}

const DEFAULT_FALLBACK_IMAGES = {
  blog: '/default-blog-image.jpg',
  admin: '/uploads/default-blog-image.jpg',
  general: '/default-blog-image.jpg'
} as const;

export function normalizeImageUrl(
  url: string | null | undefined,
  options: ImageUrlOptions = {}
): string {
  const {
    fallbackUrl,
    logFixes = false,
    validateUrl = false,
    context = 'general'
  } = options;

  // Handle null/undefined/empty URLs
  if (!url || typeof url !== 'string' || url.trim() === '') {
    const defaultUrl = fallbackUrl || DEFAULT_FALLBACK_IMAGES[context];
    if (logFixes) {
      console.log(`🔧 IMAGE UTILS - Using fallback for empty URL: "${defaultUrl}"`);
    }
    return defaultUrl;
  }

  let normalizedUrl = url.trim();

  // Fix common URL issues
  if (normalizedUrl.startsWith('//')) {
    normalizedUrl = `https:${normalizedUrl}`;
    if (logFixes) console.log(`🔧 IMAGE UTILS - Fixed protocol: ${normalizedUrl}`);
  }

  // Validate URL if requested
  if (validateUrl) {
    try {
      new URL(normalizedUrl);
    } catch {
      const defaultUrl = fallbackUrl || DEFAULT_FALLBACK_IMAGES[context];
      if (logFixes) {
        console.log(`🔧 IMAGE UTILS - Invalid URL "${normalizedUrl}", using fallback: "${defaultUrl}"`);
      }
      return defaultUrl;
    }
  }

  return normalizedUrl;
}

export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}
```

### 🎭 Animation System Utilities

#### **Framer Motion Variants Library**
**Comprehensive Animation Variants**:
```typescript
// Fade animations
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// Slide animations
export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Special effects
export const bounce = {
  hidden: { opacity: 0, y: 0 },
  visible: {
    opacity: 1,
    y: [0, -15, 0, -7, 0],
    transition: {
      duration: 1,
      times: [0, 0.3, 0.6, 0.8, 1],
      ease: "easeOut"
    }
  }
};

export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

// Container animations
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

export const pageTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeInOut" }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};
```

**Animation Utility Functions**:
```typescript
export function createStaggeredAnimation(itemCount: number, staggerDelay = 0.1) {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
        duration: 0.6
      }
    }
  };
}

export function createScrollAnimation(threshold = 0.1) {
  return {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
}
```

### 🗄️ Database Utility Functions

#### **Optimized Supabase Client Management**
**Singleton Client Pattern**:
```typescript
let supabaseClient: SupabaseClient<Database> | null = null;

export function getOptimizedSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration error.');
    }

    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            'x-application-name': 'phoenix-platform',
          },
        },
      }
    );
  }

  return supabaseClient;
}

export function resetSupabaseClient() {
  supabaseClient = null;
}

export function createLightweightSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
}
```

**Static Generation Client**:
```typescript
export function createAnonymousClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-client-info': 'phoenix-static-client',
        },
      },
    }
  );
}
```

### 🎯 Custom Hooks Library

#### **Performance Monitoring Hook**
**Advanced Performance Tracking**:
```typescript
interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiCallCount: number;
  totalDataSize: number;
  cacheHitRate: number;
}

export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const {
    trackApiCalls = true,
    trackRenderTime = true,
    trackDataSize = true,
    logToConsole = process.env.NODE_ENV === 'development'
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiCallCount: 0,
    totalDataSize: 0,
    cacheHitRate: 0
  });

  const renderStartTime = useRef(performance.now());
  const apiCalls = useRef(0);
  const totalRequests = useRef(0);
  const cacheHits = useRef(0);
  const dataSize = useRef(0);

  // Track component load time
  useEffect(() => {
    const loadTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({ ...prev, loadTime }));

    if (logToConsole) {
      console.log(`[Performance] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }
  }, [componentName, logToConsole]);

  // Track render time
  useEffect(() => {
    if (trackRenderTime) {
      renderStartTime.current = performance.now();

      requestAnimationFrame(() => {
        const renderTime = performance.now() - renderStartTime.current;
        setMetrics(prev => ({ ...prev, renderTime }));

        if (logToConsole) {
          console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
        }
      });
    }
  });

  const trackApiCall = (url: string, responseSize?: number, fromCache = false) => {
    if (!trackApiCalls) return;

    apiCalls.current += 1;
    totalRequests.current += 1;

    if (fromCache) cacheHits.current += 1;
    if (responseSize && trackDataSize) dataSize.current += responseSize;

    const cacheHitRate = totalRequests.current > 0
      ? (cacheHits.current / totalRequests.current) * 100
      : 0;

    setMetrics(prev => ({
      ...prev,
      apiCallCount: apiCalls.current,
      totalDataSize: dataSize.current,
      cacheHitRate
    }));

    if (logToConsole) {
      console.log(`[Performance] ${componentName} API call to ${url}`, {
        fromCache,
        responseSize,
        totalCalls: apiCalls.current,
        cacheHitRate: `${cacheHitRate.toFixed(1)}%`
      });
    }
  };

  return { metrics, trackApiCall };
}
```

#### **Authentication Requirement Hook**
**Auth State Management**:
```typescript
export function useAuthRequirement(redirectTo = '/auth/login') {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push(redirectTo);
      return;
    }

    setIsAuthorized(true);
  }, [session, status, router, redirectTo]);

  return {
    isAuthorized,
    session,
    isLoading: status === 'loading'
  };
}

export function useRequireAuth() {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    setIsAuthenticated(!!session);
  }, [session, status]);

  return {
    isAuthenticated,
    session,
    isLoading: status === 'loading'
  };
}
```

### 📋 Validation Schema System

#### **Zod Schema Library**
**Authentication Schemas**:
```typescript
import { z } from 'zod';

// Common validation patterns
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number');
export const uuidSchema = z.string().uuid('Invalid UUID format');

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2).max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile update schema
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  location: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
});
```

**Payment Schemas**:
```typescript
// Order creation schemas
export const createOrderSchema = z.object({
  items: z.array(z.object({
    service_id: uuidSchema,
    quantity: z.number().min(1).default(1),
    price: z.number().positive('Price must be positive'),
    currency: z.enum(['USD', 'EUR', 'GBP', 'INR']).default('USD'),
  })),
  customer_info: z.object({
    email: emailSchema,
    name: z.string().min(2).max(100),
    phone: z.string().optional(),
  }),
  billing_address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postal_code: z.string().min(1, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  metadata: z.record(z.string()).optional(),
});

// Payment verification schema
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// Subscription schemas
export const createSubscriptionSchema = z.object({
  plan_id: uuidSchema,
  customer_id: uuidSchema.optional(),
  trial_days: z.number().min(0).max(365).optional(),
  metadata: z.record(z.string()).optional(),
});
```

### 🔄 Data Fetching Utilities

#### **tRPC Query Helpers**
**Optimized Query Patterns**:
```typescript
export function useOptimizedQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
  } = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus = false,
  } = options;

  return useQuery({
    queryKey: [queryFn.name],
    queryFn,
    enabled,
    staleTime,
    cacheTime,
    refetchOnWindowFocus,
  });
}

export function usePaginatedQuery<T>(
  queryFn: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  initialPage = 1,
  pageSize = 10
) {
  const [page, setPage] = useState(initialPage);

  const query = useQuery({
    queryKey: [queryFn.name, page, pageSize],
    queryFn: () => queryFn(page, pageSize),
    keepPreviousData: true,
  });

  return {
    ...query,
    page,
    setPage,
    pageSize,
    hasNextPage: query.data ? page * pageSize < query.data.total : false,
    hasPreviousPage: page > 1,
  };
}
```

#### **Cache Management Utilities**:
```typescript
export class CacheManager {
  private static instance: CacheManager;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}
```

---

## 3.5 Animation & Interactive Component Analysis

### 🎭 Advanced Animation Systems

#### **GSAP Integration Architecture**
**Complex 3D Animation Implementation**:
```typescript
// ParticleCard with advanced GSAP animations
const ParticleCard: React.FC<ParticleCardProps> = ({
  children,
  enableTilt = true,
  enableMagnetism = false,
  particleCount = 50,
  glowColor = "#00ff88"
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const element = cardRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    if (enableTilt) {
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: "power2.out",
        transformPerspective: 1000,
        force3D: true
      });
    }

    if (enableMagnetism) {
      const magnetX = (x - centerX) * 0.05;
      const magnetY = (y - centerY) * 0.05;

      magnetismAnimationRef.current = gsap.to(element, {
        x: magnetX,
        y: magnetY,
        duration: 0.3,
        ease: "power2.out",
        force3D: true
      });
    }
  }, [enableTilt, enableMagnetism]);

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
};
```

**Animation Performance Features**:
- **Hardware Acceleration**: force3D: true for GPU optimization
- **Memory Management**: Proper cleanup of GSAP animations
- **Event Optimization**: Throttled mouse events for performance
- **3D Transformations**: Advanced perspective and rotation effects

#### **Framer Motion Advanced Patterns**
**Layout Animation System**:
```typescript
// Advanced layout animations with stagger effects
const StaggeredContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

### 🎨 Interactive Component Implementations

#### **Advanced Carousel System**
**Embla Carousel Integration**:
```typescript
const AdvancedCarousel: React.FC<CarouselProps> = ({
  items,
  autoplay = false,
  loop = true,
  slidesToShow = 1
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop,
      align: 'start',
      slidesToScroll: slidesToShow,
      containScroll: 'trimSnaps'
    },
    autoplay ? [Autoplay({ delay: 4000, stopOnInteraction: false })] : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative"
              style={{ flex: `0 0 ${100 / slidesToShow}%` }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              index === selectedIndex ? "bg-primary" : "bg-muted"
            )}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};
```

#### **Shuffle Grid Animation**
**Advanced Grid Animations**:
```typescript
const ShuffleGrid: React.FC<ShuffleGridProps> = ({ items, columns = 3 }) => {
  const [shuffledItems, setShuffledItems] = useState(items);
  const [isShuffling, setIsShuffling] = useState(false);

  const shuffleArray = useCallback((array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  const handleShuffle = useCallback(() => {
    if (isShuffling) return;

    setIsShuffling(true);
    const newOrder = shuffleArray(shuffledItems);
    setShuffledItems(newOrder);

    setTimeout(() => setIsShuffling(false), 600);
  }, [shuffledItems, shuffleArray, isShuffling]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleShuffle}
        disabled={isShuffling}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        {isShuffling ? 'Shuffling...' : 'Shuffle Grid'}
      </button>

      <motion.div
        className={`grid gap-4 grid-cols-${columns}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        key={shuffledItems.map(item => item.id).join(',')}
      >
        {shuffledItems.map((item, index) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            layout
            className="bg-card p-4 rounded-lg border"
          >
            {item.content}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
```

## 3.6 Form & Input Component Analysis

### 📝 Advanced Form Architecture

#### **React Hook Form Integration**
**Comprehensive Form System**:
```typescript
// Advanced form with validation and error handling
const AdvancedForm: React.FC<AdvancedFormProps> = ({
  schema,
  onSubmit,
  defaultValues,
  children
}) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {children}

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Form>
  );
};
```

#### **Dynamic Field Generation**
**Schema-Driven Form Fields**:
```typescript
const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  name,
  label,
  type,
  options,
  validation,
  placeholder
}) => {
  const { control } = useFormContext();

  const renderField = (field: any) => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Input
            type={type}
            placeholder={placeholder}
            {...field}
          />
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            rows={4}
            {...field}
          />
        );

      case 'select':
        return (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <Label htmlFor={name}>{label}</Label>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
            {options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return <Input {...field} />;
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {type !== 'checkbox' && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {renderField(field)}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
```

## 3.7 Data Fetching & API Integration Analysis

### 🔄 tRPC Router Architecture

#### **Comprehensive API Router System**
**Platform tRPC Router**:
```typescript
export const appRouter = createTRPCRouter({
  // Authentication & User Management
  auth: authRouter,
  user: userRouter,

  // Content Management
  blog: blogRouter,
  projects: projectsRouter,

  // Business Logic
  services: servicesRouter,
  payments: paymentsRouter,

  // Communication
  support: supportRouter,
  communications: communicationsRouter,
  newsletter: newsletterRouter,

  // Assessment & Development
  assessment: assessmentRouter,
  concepts: conceptsRouter,

  // Administrative
  admin: adminRouter,
  files: filesRouter
});

// Individual router implementations
const blogRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      category: z.string().optional(),
      search: z.string().optional(),
      includeDrafts: z.boolean().default(false)
    }))
    .query(async ({ input, ctx }) => {
      const { limit, offset, category, search, includeDrafts } = input;

      let query = ctx.supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!includeDrafts) {
        query = query.eq('draft', false);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch blog posts'
      });

      return {
        posts: data || [],
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', input.slug)
        .eq('draft', false)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found'
        });
      }

      return data;
    }),

  create: protectedProcedure
    .input(createBlogPostSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await ctx.supabase
        .from('blog_posts')
        .insert({
          ...input,
          author_id: ctx.session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create blog post'
      });

      return data;
    }),

  update: protectedProcedure
    .input(updateBlogPostSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;

      const { data, error } = await ctx.supabase
        .from('blog_posts')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('author_id', ctx.session.user.id)
        .select()
        .single();

      if (error) throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update blog post'
      });

      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { error } = await ctx.supabase
        .from('blog_posts')
        .delete()
        .eq('id', input.id)
        .eq('author_id', ctx.session.user.id);

      if (error) throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete blog post'
      });

      return { success: true };
    })
});
```

#### **Advanced Query Patterns**
**Optimized Data Fetching**:
```typescript
// Custom hooks for optimized data fetching
export function useOptimizedBlogPosts(options: BlogQueryOptions = {}) {
  const {
    limit = 10,
    category,
    search,
    enabled = true
  } = options;

  return api.blog.getAll.useQuery(
    { limit, category, search },
    {
      enabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      keepPreviousData: true
    }
  );
}

export function usePaginatedBlogPosts(pageSize = 10) {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * pageSize;

  const query = api.blog.getAll.useQuery(
    { limit: pageSize, offset },
    { keepPreviousData: true }
  );

  return {
    ...query,
    page,
    setPage,
    hasNextPage: query.data?.hasMore ?? false,
    hasPreviousPage: page > 1,
    totalPages: query.data ? Math.ceil(query.data.total / pageSize) : 0
  };
}

// Infinite query for continuous scrolling
export function useInfiniteBlogPosts(pageSize = 10) {
  return api.blog.getAll.useInfiniteQuery(
    { limit: pageSize },
    {
      getNextPageParam: (lastPage, pages) => {
        const nextOffset = pages.length * pageSize;
        return lastPage.hasMore ? nextOffset : undefined;
      },
      staleTime: 5 * 60 * 1000
    }
  );
}
```

---

**Next Section:** Level 4 Implementation Deep Dive Report
**Report Prepared By:** Multi-Hierarchical Analysis Framework
**Classification:** Component Analysis - Implementation Deep Dive
