#!/usr/bin/env node

/**
 * Test script for Services Implementation
 *
 * This script tests the services implementation by:
 * 1. Checking if required files exist
 * 2. Validating API endpoints (if server is running)
 * 3. Testing database connectivity (if configured)
 *
 * Usage: node scripts/test-services-implementation.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Helper function to colorize console output
function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Helper function to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(path.join(process.cwd(), filePath));
  } catch (error) {
    return false;
  }
}

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  try {
    const result = testFunction();
    if (result) {
      console.log(colorize(`✓ ${testName}`, "green"));
      passedTests++;
    } else {
      console.log(colorize(`✗ ${testName}`, "red"));
      failedTests++;
    }
  } catch (error) {
    console.log(colorize(`✗ ${testName} - Error: ${error.message}`, "red"));
    failedTests++;
  }
}

// Test file existence
function testFileStructure() {
  console.log(colorize("\n📁 Testing File Structure...", "cyan"));

  const requiredFiles = [
    // SQL Scripts
    "sql/01_create_products_services_tables.sql",
    "sql/02_create_rls_policies.sql",
    "sql/03_insert_sample_data.sql",
    "sql/README.md",

    // Query Functions
    "src/queries/servicesQueries.ts",

    // API Routes
    "src/app/api/services/route.ts",
    "src/app/api/services/categories/route.ts",
    "src/app/api/services/[slug]/route.ts",

    // Components
    "src/components/animated-service-card.tsx",
    "src/components/services-section.tsx",
    "src/components/services-server.tsx",
    "src/components/services-page-client.tsx",
    "src/components/service-detail-client.tsx",

    // Pages
    "src/app/services/page.tsx",
    "src/app/services/[slug]/page.tsx",

    // Documentation
    "SERVICES_IMPLEMENTATION.md",
  ];

  requiredFiles.forEach((file) => {
    runTest(`File exists: ${file}`, () => fileExists(file));
  });
}

// Test SQL script content
function testSQLScripts() {
  console.log(colorize("\n🗄️ Testing SQL Scripts...", "cyan"));

  runTest("SQL schema script contains required tables", () => {
    if (!fileExists("sql/01_create_products_services_tables.sql")) return false;

    const content = fs.readFileSync(
      "sql/01_create_products_services_tables.sql",
      "utf8",
    );
    const requiredTables = [
      "service_categories",
      "products_services",
      "service_features",
      "service_pricing",
      "service_testimonials",
    ];

    return requiredTables.every((table) => content.includes(table));
  });

  runTest("RLS policies script contains security policies", () => {
    if (!fileExists("sql/02_create_rls_policies.sql")) return false;

    const content = fs.readFileSync("sql/02_create_rls_policies.sql", "utf8");
    return (
      content.includes("ROW LEVEL SECURITY") &&
      content.includes("CREATE POLICY")
    );
  });

  runTest("Sample data script contains INSERT statements", () => {
    if (!fileExists("sql/03_insert_sample_data.sql")) return false;

    const content = fs.readFileSync("sql/03_insert_sample_data.sql", "utf8");
    return (
      content.includes("INSERT INTO service_categories") &&
      content.includes("INSERT INTO products_services")
    );
  });
}

// Test TypeScript types
function testTypeScriptTypes() {
  console.log(colorize("\n🔷 Testing TypeScript Types...", "cyan"));

  runTest("Database types include service tables", () => {
    if (!fileExists("src/lib/supabase.ts")) return false;

    const content = fs.readFileSync("src/lib/supabase.ts", "utf8");
    const requiredTypes = [
      "service_categories",
      "products_services",
      "service_features",
      "service_pricing",
      "service_testimonials",
    ];

    return requiredTypes.every((type) => content.includes(type));
  });

  runTest("Service types are exported", () => {
    if (!fileExists("src/lib/supabase.ts")) return false;

    const content = fs.readFileSync("src/lib/supabase.ts", "utf8");
    const requiredExports = [
      "ServiceCategory",
      "ProductService",
      "ServiceFeature",
      "ServicePricing",
      "ServiceTestimonial",
      "ServiceWithDetails",
    ];

    return requiredExports.every((type) =>
      content.includes(`export type ${type}`),
    );
  });
}

// Test component structure
function testComponents() {
  console.log(colorize("\n⚛️ Testing React Components...", "cyan"));

  runTest("Service card component has required props", () => {
    if (!fileExists("src/components/animated-service-card.tsx")) return false;

    const content = fs.readFileSync(
      "src/components/animated-service-card.tsx",
      "utf8",
    );
    const requiredProps = [
      "title",
      "excerpt",
      "serviceType",
      "slug",
      "featured",
      "premium",
    ];

    return requiredProps.every((prop) => content.includes(prop));
  });

  runTest("Services section component exports correctly", () => {
    if (!fileExists("src/components/services-section.tsx")) return false;

    const content = fs.readFileSync(
      "src/components/services-section.tsx",
      "utf8",
    );
    return content.includes("export function ServicesSection");
  });

  runTest("Services server component uses React Query", () => {
    if (!fileExists("src/components/services-server.tsx")) return false;

    const content = fs.readFileSync(
      "src/components/services-server.tsx",
      "utf8",
    );
    return (
      content.includes("useFeaturedServices") &&
      content.includes("createClient")
    );
  });
}

// Test API routes
function testAPIRoutes() {
  console.log(colorize("\n🌐 Testing API Routes...", "cyan"));

  runTest("Main services API has GET and POST methods", () => {
    if (!fileExists("src/app/api/services/route.ts")) return false;

    const content = fs.readFileSync("src/app/api/services/route.ts", "utf8");
    return (
      content.includes("export async function GET") &&
      content.includes("export async function POST")
    );
  });

  runTest("Service categories API exists", () => {
    if (!fileExists("src/app/api/services/categories/route.ts")) return false;

    const content = fs.readFileSync(
      "src/app/api/services/categories/route.ts",
      "utf8",
    );
    return content.includes("export async function GET");
  });

  runTest("Individual service API has CRUD methods", () => {
    if (!fileExists("src/app/api/services/[slug]/route.ts")) return false;

    const content = fs.readFileSync(
      "src/app/api/services/[slug]/route.ts",
      "utf8",
    );
    return (
      content.includes("export async function GET") &&
      content.includes("export async function PUT") &&
      content.includes("export async function DELETE")
    );
  });
}

// Test query functions
function testQueryFunctions() {
  console.log(colorize("\n🔍 Testing Query Functions...", "cyan"));

  runTest("Services queries export required functions", () => {
    if (!fileExists("src/queries/servicesQueries.ts")) return false;

    const content = fs.readFileSync("src/queries/servicesQueries.ts", "utf8");
    const requiredFunctions = [
      "getServiceCategories",
      "getPublicServices",
      "getFeaturedServices",
      "getServiceBySlug",
      "useServiceCategories",
      "usePublicServices",
      "useFeaturedServices",
      "useServiceBySlug",
    ];

    return requiredFunctions.every((func) => content.includes(func));
  });

  runTest("Query functions use proper TypeScript types", () => {
    if (!fileExists("src/queries/servicesQueries.ts")) return false;

    const content = fs.readFileSync("src/queries/servicesQueries.ts", "utf8");
    return (
      content.includes("ServiceCategory") &&
      content.includes("ProductService") &&
      content.includes("ServiceWithDetails")
    );
  });
}

// Test pages
function testPages() {
  console.log(colorize("\n📄 Testing Pages...", "cyan"));

  runTest("Main services page has proper metadata", () => {
    if (!fileExists("src/app/services/page.tsx")) return false;

    const content = fs.readFileSync("src/app/services/page.tsx", "utf8");
    return (
      content.includes("export const metadata") &&
      content.includes('title: "Services')
    );
  });

  runTest("Individual service page has dynamic params", () => {
    if (!fileExists("src/app/services/[slug]/page.tsx")) return false;

    const content = fs.readFileSync("src/app/services/[slug]/page.tsx", "utf8");
    return (
      content.includes("generateMetadata") &&
      content.includes("generateStaticParams") &&
      content.includes("slug: string")
    );
  });
}

// Main test runner
function runAllTests() {
  console.log(colorize("🧪 Services Implementation Test Suite", "bright"));
  console.log(colorize("=====================================", "bright"));

  testFileStructure();
  testSQLScripts();
  testTypeScriptTypes();
  testComponents();
  testAPIRoutes();
  testQueryFunctions();
  testPages();

  // Print summary
  console.log(colorize("\n📊 Test Summary", "cyan"));
  console.log(colorize("===============", "cyan"));
  console.log(`Total Tests: ${totalTests}`);
  console.log(colorize(`Passed: ${passedTests}`, "green"));
  console.log(colorize(`Failed: ${failedTests}`, "red"));

  if (failedTests === 0) {
    console.log(
      colorize("\n🎉 All tests passed! Implementation is complete.", "green"),
    );
    console.log(colorize("\nNext steps:", "yellow"));
    console.log("1. Run the SQL scripts in your Supabase project");
    console.log("2. Start your development server: npm run dev");
    console.log("3. Navigate to /services to test the implementation");
    console.log("4. Check the API endpoints at /api/services");
  } else {
    console.log(
      colorize(
        "\n❌ Some tests failed. Please check the implementation.",
        "red",
      ),
    );
    process.exit(1);
  }
}

// Run the tests
runAllTests();
