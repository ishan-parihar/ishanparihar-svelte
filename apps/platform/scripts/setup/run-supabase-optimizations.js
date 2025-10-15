/**
 * Script to run Supabase security and performance optimizations
 * This script executes the SQL optimization files via the Supabase client
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error(
    "Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runOptimizations() {
  console.log("🚀 Starting Supabase Security & Performance Optimizations...\n");

  try {
    // Read the comprehensive optimization script
    const sqlPath = path.join(
      __dirname,
      "..",
      "sql",
      "run_all_optimizations.sql",
    );

    if (!fs.existsSync(sqlPath)) {
      console.error(`❌ SQL file not found: ${sqlPath}`);
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    console.log("📄 Loaded comprehensive optimization script");
    console.log(`📍 File: ${sqlPath}`);
    console.log(`📏 Size: ${sqlContent.length} characters\n`);

    // Execute the optimization script
    console.log("🔧 Executing security and performance optimizations...\n");

    const { data, error } = await supabase.rpc("exec_sql", {
      sql_query: sqlContent,
    });

    if (error) {
      console.error("❌ Error executing optimizations:", error);

      // Try to run individual scripts if the comprehensive one fails
      console.log(
        "\n🔄 Attempting to run individual optimization scripts...\n",
      );
      await runIndividualScripts();
    } else {
      console.log(
        "✅ Comprehensive optimization script executed successfully!",
      );
      console.log("📊 Result:", data);
    }

    // Verify the optimizations
    await verifyOptimizations();

    console.log("\n🎉 Supabase Optimization Process Complete!");
    console.log("\n📋 Next Steps:");
    console.log(
      "1. 🔍 Run Supabase Performance Advisor again to verify warnings are resolved",
    );
    console.log(
      "2. 🔐 Enable leaked password protection in Supabase Dashboard > Authentication > Settings",
    );
    console.log(
      "3. 🛡️  Configure additional MFA options in Supabase Dashboard > Authentication > Settings",
    );
    console.log("4. 📈 Monitor database performance and security logs");
  } catch (error) {
    console.error("❌ Optimization process failed:", error);
    process.exit(1);
  }
}

async function runIndividualScripts() {
  const scripts = [
    "01_enable_public_tables_rls.sql",
    "02_fix_function_search_paths.sql",
    "03_optimize_nextauth_rls_policies.sql",
    "04_auth_security_enhancements.sql",
  ];

  for (const scriptName of scripts) {
    try {
      const scriptPath = path.join(__dirname, "..", "sql", scriptName);

      if (!fs.existsSync(scriptPath)) {
        console.log(`⚠️  Script not found: ${scriptName}, skipping...`);
        continue;
      }

      const scriptContent = fs.readFileSync(scriptPath, "utf8");
      console.log(`🔧 Running ${scriptName}...`);

      const { data, error } = await supabase.rpc("exec_sql", {
        sql_query: scriptContent,
      });

      if (error) {
        console.error(`❌ Error in ${scriptName}:`, error.message);
      } else {
        console.log(`✅ ${scriptName} completed successfully`);
      }

      // Small delay between scripts
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`❌ Failed to run ${scriptName}:`, err.message);
    }
  }
}

async function verifyOptimizations() {
  console.log("\n🔍 Verifying optimizations...\n");

  try {
    // Check RLS status on public tables
    const { data: rlsData, error: rlsError } = await supabase.rpc("exec_sql", {
      sql_query: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN ('images', 'optimization_log')
        ORDER BY tablename;
      `,
    });

    if (!rlsError && rlsData) {
      console.log("📊 RLS Status on Public Tables:");
      rlsData.forEach((row) => {
        const status = row.rls_enabled ? "✅" : "❌";
        console.log(
          `   ${status} ${row.schemaname}.${row.tablename}: RLS ${row.rls_enabled ? "ENABLED" : "DISABLED"}`,
        );
      });
    }

    // Check function security settings
    const { data: funcData, error: funcError } = await supabase.rpc(
      "exec_sql",
      {
        sql_query: `
        SELECT 
          proname as function_name,
          prosecdef as security_definer
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname IN ('increment_likes', 'increment_views', 'can_access_order', 'create_missing_user_record')
        ORDER BY proname;
      `,
      },
    );

    if (!funcError && funcData) {
      console.log("\n🔧 Function Security Settings:");
      funcData.forEach((row) => {
        const status = row.security_definer ? "✅" : "❌";
        console.log(
          `   ${status} ${row.function_name}: SECURITY DEFINER ${row.security_definer ? "ENABLED" : "DISABLED"}`,
        );
      });
    }

    // Check NextAuth policy count
    const { data: policyData, error: policyError } = await supabase.rpc(
      "exec_sql",
      {
        sql_query: `
        SELECT 
          tablename,
          COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'next_auth'
        AND tablename IN ('users', 'sessions', 'accounts', 'verification_tokens')
        GROUP BY tablename
        ORDER BY tablename;
      `,
      },
    );

    if (!policyError && policyData) {
      console.log("\n🛡️  NextAuth RLS Policies:");
      policyData.forEach((row) => {
        console.log(
          `   📋 next_auth.${row.tablename}: ${row.policy_count} policies`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Error during verification:", error);
  }
}

// Run the optimization process
runOptimizations();
