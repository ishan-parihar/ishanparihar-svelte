/**
 * Dynamic Import System for Bundle Optimization
 * Implements aggressive code splitting to reduce initial bundle size
 */

import dynamic from "next/dynamic";
import React, { ComponentType } from "react";

// Loading component for better UX during code splitting
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
  </div>
);

// Enhanced loading skeleton for admin components
const AdminLoadingSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-between">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
        ></div>
      ))}
    </div>
  </div>
);

// Admin Components - Heavy components that should only load when needed
export const AdminComponents = {
  Dashboard: dynamic(
    () =>
      import("@/components/admin/admin-dashboard-client").then((mod) => ({
        default: mod.AdminDashboardClient,
      })),
    {
      loading: () => <AdminLoadingSkeleton />,
    },
  ),

  Blog: dynamic(
    () =>
      import("@/components/admin/admin-blog-client").then((mod) => ({
        default: mod.AdminBlogClient,
      })),
    {
      loading: () => <AdminLoadingSkeleton />,
    },
  ),

  Services: dynamic(
    () =>
      import("@/components/admin/admin-services-client").then((mod) => ({
        default: mod.AdminServicesClient,
      })),
    {
      loading: () => <AdminLoadingSkeleton />,
    },
  ),

  Comments: dynamic(
    () =>
      import("@/components/admin/admin-comments-client").then((mod) => ({
        default: mod.AdminCommentsClient,
      })),
    {
      loading: () => <AdminLoadingSkeleton />,
    },
  ),

  Sales: dynamic(
    () =>
      import("@/components/admin/sales/sales-dashboard-client").then((mod) => ({
        default: mod.SalesDashboardClient,
      })),
    {
      loading: () => <AdminLoadingSkeleton />,
    },
  ),

  Support: dynamic(
    () =>
      import("@/components/admin/support/support-dashboard-client").then(
        (mod) => ({ default: mod.SupportDashboardClient }),
      ),
    {
      loading: () => <AdminLoadingSkeleton />,
    },
  ),

  Newsletter: dynamic(
    () =>
      import("@/components/admin/newsletter/newsletter-admin-client").then(
        (mod) => ({ default: mod.NewsletterAdminClient }),
      ),
    {
      loading: () => <AdminLoadingSkeleton />,
    },
  ),
};

// Blog Components - Heavy MDX and editor components
export const BlogComponents = {
  MDXEditor: dynamic(
    () =>
      import("@/components/admin/mdx-editor").then((mod) => ({
        default: mod.MDXEditorWrapper,
      })),
    {
      loading: () => <LoadingSpinner />,
    },
  ),

  BlogForm: dynamic(
    () =>
      import("@/components/admin/blog-post-form").then((mod) => ({
        default: mod.BlogPostForm,
      })),
    {
      loading: () => <LoadingSpinner />,
    },
  ),
};

// Chart Components - Heavy visualization libraries
export const ChartComponents = {
  RevenueChart: dynamic(
    () =>
      import("@/components/admin/sales/revenue-chart").then((mod) => ({
        default: mod.RevenueChart,
      })),
    {
      loading: () => <LoadingSpinner />,
    },
  ),
};

// Advanced UI Components - Complex interactive components
export const AdvancedUIComponents = {
  // Note: Libraries like react-image-crop and embla-carousel-react
  // should be imported directly in components that use them
  // rather than being dynamically imported here
};

// Utility function to create dynamic component with consistent loading
export function createDynamicComponent<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    loading?: () => React.JSX.Element;
    ssr?: boolean;
  } = {},
) {
  return dynamic(importFn, {
    loading: options.loading || (() => <LoadingSpinner />),
    ssr: options.ssr ?? false,
  });
}

const DynamicImports = {
  AdminComponents,
  BlogComponents,
  ChartComponents,
  AdvancedUIComponents,
  createDynamicComponent,
};

export default DynamicImports;
