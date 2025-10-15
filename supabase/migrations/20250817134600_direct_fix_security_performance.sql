-- Comprehensive fix for all remaining Supabase Security and Performance issues
-- This migration addresses all remaining issues after the previous migration

-- =============================================================================
-- 1. FIX SECURITY DEFINER VIEWS (9 errors) - FORCE RECREATION
-- =============================================================================

-- Force drop and recreate all views without SECURITY DEFINER
-- Use CASCADE to ensure all dependencies are handled
DROP VIEW IF EXISTS public.recent_suspension_activity CASCADE;
DROP VIEW IF EXISTS public.blog_posts_with_concepts CASCADE;
DROP VIEW IF EXISTS public.daily_sales_analytics CASCADE;
DROP VIEW IF EXISTS public.customer_purchase_summary_simple CASCADE;
DROP VIEW IF EXISTS public.customer_purchase_summary CASCADE;
DROP VIEW IF EXISTS public.service_sales_performance CASCADE;
DROP VIEW IF EXISTS public.projects_with_concepts CASCADE;
DROP VIEW IF EXISTS public.concepts_with_usage CASCADE;
DROP VIEW IF EXISTS public.banned_emails_stats CASCADE;

-- Recreate views without SECURITY DEFINER (uses SECURITY INVOKER by default)
CREATE VIEW public.recent_suspension_activity AS
SELECT
    ush.id,
    ush.user_id,
    ush.action,
    ush.reason,
    ush.performed_at,
    ush.performed_by,
    ush.metadata,
    u.email,
    u.name
FROM public.user_suspension_history ush
JOIN public.users u ON u.id = ush.user_id
WHERE ush.performed_at >= NOW() - INTERVAL '30 days'
ORDER BY ush.performed_at DESC;

CREATE VIEW public.blog_posts_with_concepts AS
SELECT
    bp.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', c.id,
                'name', c.name,
                'slug', c.slug
            )
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
    ) as concepts
FROM public.blog_posts bp
LEFT JOIN public.blog_post_concepts bpc ON bp.id = bpc.blog_post_id
LEFT JOIN public.concepts c ON bpc.concept_id = c.id
GROUP BY bp.id;

CREATE VIEW public.daily_sales_analytics AS
SELECT
    CURRENT_DATE as date,
    0 as total_sales,
    0 as total_revenue,
    0 as new_customers
WHERE FALSE; -- Empty view until sales tables exist

CREATE VIEW public.customer_purchase_summary_simple AS
SELECT
    gen_random_uuid() as customer_id,
    0 as total_purchases,
    0::decimal as total_spent
WHERE FALSE; -- Empty view until sales tables exist

CREATE VIEW public.customer_purchase_summary AS
SELECT
    gen_random_uuid() as customer_id,
    0 as total_purchases,
    0::decimal as total_spent,
    NULL::timestamp as last_purchase_date
WHERE FALSE; -- Empty view until sales tables exist

CREATE VIEW public.service_sales_performance AS
SELECT
    gen_random_uuid() as service_id,
    0 as total_sales,
    0::decimal as total_revenue
WHERE FALSE; -- Empty view until sales tables exist

CREATE VIEW public.projects_with_concepts AS
SELECT
    p.*,
    COALESCE(
        json_agg(
            json_build_object(
                'id', c.id,
                'name', c.name,
                'slug', c.slug
            )
        ) FILTER (WHERE c.id IS NOT NULL),
        '[]'::json
    ) as concepts
FROM public.projects p
LEFT JOIN public.project_concepts pc ON p.id = pc.project_id
LEFT JOIN public.concepts c ON pc.concept_id = c.id
GROUP BY p.id;

CREATE VIEW public.concepts_with_usage AS
SELECT
    c.*,
    COALESCE(blog_count, 0) as blog_posts_count,
    COALESCE(project_count, 0) as projects_count,
    COALESCE(blog_count, 0) + COALESCE(project_count, 0) as total_usage
FROM public.concepts c
LEFT JOIN (
    SELECT concept_id, COUNT(*) as blog_count
    FROM public.blog_post_concepts
    GROUP BY concept_id
) bc ON c.id = bc.concept_id
LEFT JOIN (
    SELECT concept_id, COUNT(*) as project_count
    FROM public.project_concepts
    GROUP BY concept_id
) pc ON c.id = pc.concept_id;

CREATE VIEW public.banned_emails_stats AS
SELECT
    COUNT(*) as total_banned,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as banned_last_30_days,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as banned_last_7_days
FROM public.banned_emails;

-- =============================================================================
-- 2. FIX AUTH RLS INITIALIZATION PLAN ISSUES (34 warnings)
-- =============================================================================

-- Drop all existing policies that need to be optimized
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop policies on user_permissions
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_permissions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_permissions', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on comments
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'comments'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.comments', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on newsletter_subscribers
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.newsletter_subscribers', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on banned_emails
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'banned_emails'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.banned_emails', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on user_suspension_history
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_suspension_history'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_suspension_history', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on concepts
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'concepts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.concepts', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on blog_post_concepts
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'blog_post_concepts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.blog_post_concepts', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on projects
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'projects'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.projects', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on project_concepts
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'project_concepts'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_concepts', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on user_status
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_status'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_status', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on assessments
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'assessments'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.assessments', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on assessment_questions
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'assessment_questions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.assessment_questions', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on assessment_options
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'assessment_options'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.assessment_options', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on user_assessment_submissions
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_assessment_submissions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_assessment_submissions', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on user_assessment_responses
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'user_assessment_responses'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_assessment_responses', policy_record.policyname);
    END LOOP;
    
    -- Drop policies on assessment_results
    FOR policy_record IN
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'assessment_results'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.assessment_results', policy_record.policyname);
    END LOOP;
END $$;

-- Create optimized RLS policies using (select auth.uid()) instead of auth.uid()

-- user_permissions table
CREATE POLICY "Admins can manage user permissions" ON public.user_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view user permissions" ON public.user_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

-- comments table
CREATE POLICY "Admins can manage all comments" ON public.comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all comments" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        (select auth.uid()) IS NOT NULL
        AND (select auth.uid()) = user_id
    );

CREATE POLICY "Users can delete own comments" ON public.comments
    FOR UPDATE USING (
        (select auth.uid()) = user_id
    ) WITH CHECK (
        (select auth.uid()) = user_id
    );

CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (
        (select auth.uid()) = user_id
    ) WITH CHECK (
        (select auth.uid()) = user_id
    );

CREATE POLICY "Users can view own comments" ON public.comments
    FOR SELECT USING (
        (select auth.uid()) = user_id
    );

-- newsletter_subscribers table
CREATE POLICY "Service role has full access to newsletter_subscribers" ON public.newsletter_subscribers
    FOR ALL USING (
        (select auth.role()) = 'service_role'
    );

CREATE POLICY "Users can update their own newsletter subscription" ON public.newsletter_subscribers
    FOR UPDATE USING (
        (select auth.uid()) = user_id
    ) WITH CHECK (
        (select auth.uid()) = user_id
    );

CREATE POLICY "Users can view their own newsletter subscription" ON public.newsletter_subscribers
    FOR SELECT USING (
        (select auth.uid()) = user_id
    );

-- banned_emails table
CREATE POLICY "Admins can manage banned emails" ON public.banned_emails
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Admins can view banned emails" ON public.banned_emails
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

-- user_suspension_history table
CREATE POLICY "Admins can manage suspension history" ON public.user_suspension_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Users can view own suspension history" ON public.user_suspension_history
    FOR SELECT USING (
        (select auth.uid()) = user_id
    );

-- concepts table
CREATE POLICY "Admins can manage concepts" ON public.concepts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

-- blog_post_concepts table
CREATE POLICY "Admins can manage blog post concepts" ON public.blog_post_concepts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

-- projects table
CREATE POLICY "Admins can manage projects" ON public.projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

-- project_concepts table
CREATE POLICY "Admins can manage project concepts" ON public.project_concepts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

-- user_status table
CREATE POLICY "Admins can manage user status" ON public.user_status
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

-- assessments table
CREATE POLICY "Admins can manage assessments" ON public.assessments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

-- assessment_questions table - Consolidate multiple permissive policies
CREATE POLICY "Admins can manage assessment questions" ON public.assessment_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Public can view assessment questions" ON public.assessment_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assessments
            WHERE public.assessments.id = assessment_questions.assessment_id
            AND public.assessments.is_published = true
        )
    );

-- assessment_options table - Consolidate multiple permissive policies
CREATE POLICY "Admins can manage assessment options" ON public.assessment_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Public can view assessment options" ON public.assessment_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assessment_questions aq
            JOIN public.assessments a ON a.id = aq.assessment_id
            WHERE aq.id = assessment_options.question_id
            AND a.is_published = true
        )
    );

-- user_assessment_submissions table
CREATE POLICY "Admins can view all assessment submissions" ON public.user_assessment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Users can create own assessment submissions" ON public.user_assessment_submissions
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view own assessment submissions" ON public.user_assessment_submissions
    FOR SELECT USING ((select auth.uid()) = user_id);

-- user_assessment_responses table
CREATE POLICY "Admins can view all assessment responses" ON public.user_assessment_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Users can create own assessment responses" ON public.user_assessment_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_assessment_submissions uas
            WHERE uas.id = user_assessment_responses.submission_id
            AND uas.user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view own assessment responses" ON public.user_assessment_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_assessment_submissions uas
            WHERE uas.id = user_assessment_responses.submission_id
            AND uas.user_id = (select auth.uid())
        )
    );

-- assessment_results table
CREATE POLICY "Admins can view all assessment results" ON public.assessment_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE public.users.id = (select auth.uid())
            AND public.users.role = 'admin'
        )
    );

CREATE POLICY "Users can insert their own assessment results" ON public.assessment_results
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own assessment results" ON public.assessment_results
    FOR SELECT USING ((select auth.uid()) = user_id);
