-- Fix Auth RLS Initialization Plan Issues
-- This migration addresses the remaining auth RLS initialization plan warnings
-- by optimizing policies that use auth.uid() directly

-- =============================================================================
-- Fix dropped_indexes_backup policy
-- =============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dropped_indexes_backup') THEN
        -- Drop and recreate the policy with optimized auth function call
        DROP POLICY IF EXISTS "dropped_indexes_backup_admin_policy" ON public.dropped_indexes_backup;
        
        CREATE POLICY "dropped_indexes_backup_admin_policy" ON public.dropped_indexes_backup
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = (select auth.uid()) 
                    AND users.role = 'admin'
                )
            );
            
        RAISE NOTICE 'Fixed auth RLS for dropped_indexes_backup table';
    END IF;
END $$;

-- =============================================================================
-- Fix any remaining old policies that weren't consolidated
-- =============================================================================

-- Fix banned_emails_consolidated_admin if it still exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'banned_emails' 
        AND policyname = 'banned_emails_consolidated_admin'
    ) THEN
        DROP POLICY IF EXISTS "banned_emails_consolidated_admin" ON public.banned_emails;
        RAISE NOTICE 'Removed old banned_emails_consolidated_admin policy';
    END IF;
END $$;

-- Fix any remaining assessment policies that use auth.uid() directly
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Check for old assessment policies that might still exist
    FOR policy_record IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('assessment_questions', 'assessment_options', 'assessment_results', 'user_assessment_submissions', 'user_assessment_responses')
        AND policyname LIKE '%consolidated%'
        AND policyname NOT LIKE '%unified%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Removed old policy % from table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- Fix any remaining blog_posts and comments policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Check for old policies that might still exist
    FOR policy_record IN 
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('blog_posts', 'comments', 'newsletter_subscribers')
        AND policyname LIKE '%consolidated%'
        AND policyname NOT LIKE '%unified%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_record.policyname, policy_record.tablename);
        RAISE NOTICE 'Removed old policy % from table %', policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- =============================================================================
-- Summary
-- =============================================================================
-- This migration should resolve the remaining auth RLS initialization plan warnings
-- by removing old policies that use auth.uid() directly and optimizing the 
-- dropped_indexes_backup policy.
