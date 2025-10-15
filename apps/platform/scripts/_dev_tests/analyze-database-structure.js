import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeDatabase() {
  console.log("🔍 Analyzing Supabase Database Structure...\n");

  try {
    // Get all tables in public schema using information_schema
    console.log("📊 PUBLIC SCHEMA TABLES:");
    console.log("========================");

    // List known tables from your codebase
    const knownTables = [
      "users",
      "blog_posts",
      "comments",
      "user_bookmarks",
      "blog_engagement",
      "products_services",
      "service_categories",
      "service_features",
      "service_pricing",
      "service_testimonials",
      "orders",
      "order_items",
      "payments",
      "customer_downloads",
      "support_tickets",
      "support_ticket_categories",
      "support_ticket_assignments",
      "support_messages",
      "chat_sessions",
      "support_notifications",
      "accounts",
      "image_slots",
      "newsletter_subscribers",
    ];

    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });

        if (!error) {
          console.log(`• ${tableName} (${data?.length || 0} records)`);
        }
      } catch (err) {
        console.log(`• ${tableName} (table may not exist or access denied)`);
      }
    }

    // Check auth schema tables
    console.log("\n📊 AUTH SCHEMA TABLES:");
    console.log("======================");

    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        console.log("• auth.users (accessible via Supabase Auth)");
      }
    } catch (err) {
      console.log("• auth.users (access denied or not available)");
    }

    // Check next_auth schema tables
    console.log("\n📊 NEXT_AUTH SCHEMA TABLES:");
    console.log("===========================");

    const nextAuthTables = [
      "users",
      "accounts",
      "sessions",
      "verification_tokens",
    ];

    for (const tableName of nextAuthTables) {
      try {
        const { data, error } = await supabase
          .schema("next_auth")
          .from(tableName)
          .select("*", { count: "exact", head: true });

        if (!error) {
          console.log(
            `• next_auth.${tableName} (${data?.length || 0} records)`,
          );
        }
      } catch (err) {
        console.log(
          `• next_auth.${tableName} (table may not exist or access denied)`,
        );
      }
    }

    // Analyze user-related tables specifically
    console.log("\n🔍 USER TABLE ANALYSIS:");
    console.log("=======================");

    // Check public.users
    try {
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      if (!error) {
        console.log(`• public.users: ${count || 0} records`);
      } else {
        console.log(`• public.users: Error - ${error.message}`);
      }
    } catch (err) {
      console.log(`• public.users: Access denied or table doesn't exist`);
    }

    // Check next_auth.users
    try {
      const { count, error } = await supabase
        .schema("next_auth")
        .from("users")
        .select("*", { count: "exact", head: true });

      if (!error) {
        console.log(`• next_auth.users: ${count || 0} records`);
      } else {
        console.log(`• next_auth.users: Error - ${error.message}`);
      }
    } catch (err) {
      console.log(`• next_auth.users: Access denied or table doesn't exist`);
    }

    // Check for foreign key dependencies by testing known relationships
    console.log("\n🔗 CHECKING KNOWN FOREIGN KEY RELATIONSHIPS:");
    console.log("============================================");

    const tablesWithUserForeignKeys = [
      "blog_posts",
      "comments",
      "user_bookmarks",
      "blog_engagement",
      "orders",
      "support_tickets",
      "support_messages",
      "chat_sessions",
      "accounts",
    ];

    for (const tableName of tablesWithUserForeignKeys) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (!error) {
          console.log(`• ${tableName}: Has potential user_id foreign key`);
        }
      } catch (err) {
        console.log(`• ${tableName}: Table may not exist or access denied`);
      }
    }

    // Check for empty tables
    console.log("\n📭 EMPTY TABLES ANALYSIS:");
    console.log("=========================");

    for (const tableName of knownTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select("*", { count: "exact", head: true });

        if (!error && count === 0) {
          console.log(
            `• public.${tableName}: EMPTY (0 records) - CANDIDATE FOR REMOVAL`,
          );
        } else if (!error) {
          console.log(`• public.${tableName}: ${count} records`);
        }
      } catch (err) {
        // Skip tables we can't access
      }
    }

    console.log("\n✅ Database analysis complete!");
  } catch (error) {
    console.error("❌ Error analyzing database:", error);
  }
}

analyzeDatabase();
