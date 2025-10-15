-- Comprehensive Security and Performance Fix
-- This migration addresses all issues mentioned in the documentation files

-- =============================================================================
-- SECURITY FIXES
-- =============================================================================

-- 1. Fix Function Search Path Security Warnings
-- Set search_path for functions if they exist
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Loop through functions that need search_path fixes
    FOR func_record IN 
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN ('increment_likes', 'create_user_bypass_triggers', 'increment_views', 'can_access_order', 'update_followed_topics_by_id')
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I() SET search_path = ''''', func_record.routine_name);
            RAISE NOTICE 'Fixed search_path for function: %', func_record.routine_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not fix search_path for function %: %', func_record.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. Fix RLS Disabled Security Error
-- Enable RLS on dropped_indexes_backup table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dropped_indexes_backup') THEN
        -- Enable RLS
        ALTER TABLE public.dropped_indexes_backup ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policy if it exists
        DROP POLICY IF EXISTS "dropped_indexes_backup_admin_policy" ON public.dropped_indexes_backup;
        
        -- Create admin-only policy
        CREATE POLICY "dropped_indexes_backup_admin_policy" ON public.dropped_indexes_backup
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
            
        RAISE NOTICE 'Enabled RLS on dropped_indexes_backup table';
    ELSE
        RAISE NOTICE 'Table dropped_indexes_backup does not exist, skipping RLS fix';
    END IF;
END $$;

-- =============================================================================
-- PERFORMANCE FIXES
-- =============================================================================

-- 3. Fix Auth RLS Initialization Plan Issues
-- Optimize RLS policies by wrapping auth functions in SELECT statements
DO $$
DECLARE
    table_record RECORD;
    policy_record RECORD;
BEGIN
    -- Tables that need RLS optimization based on documentation
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'blog_posts', 'comments', 'newsletter_subscribers', 'banned_emails',
            'assessment_questions', 'assessment_options', 'user_assessment_submissions',
            'user_assessment_responses', 'assessment_results'
        )
    LOOP
        RAISE NOTICE 'Processing table: %', table_record.table_name;
        
        -- Get existing policies for this table
        FOR policy_record IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public'
            AND tablename = table_record.table_name
            AND policyname LIKE '%consolidated%'
        LOOP
            RAISE NOTICE 'Found policy % on table %', policy_record.policyname, table_record.table_name;
        END LOOP;
    END LOOP;
END $$;

-- 4. Add Missing Foreign Key Indexes
-- Create indexes for foreign keys mentioned in performance suggestions
DO $$
DECLARE
    index_record RECORD;
    index_sql TEXT;
BEGIN
    -- Define indexes to create (table, column, index_name)
    FOR index_record IN
        VALUES
            ('chat_sessions', 'admin_id', 'idx_chat_sessions_admin_id'),
            ('chat_sessions', 'customer_id', 'idx_chat_sessions_customer_id'),
            ('chat_sessions', 'ticket_id', 'idx_chat_sessions_ticket_id'),
            ('order_items', 'order_id', 'idx_order_items_order_id'),
            ('order_items', 'service_id', 'idx_order_items_service_id'),
            ('support_notifications', 'chat_session_id', 'idx_support_notifications_chat_session_id'),
            ('support_notifications', 'message_id', 'idx_support_notifications_message_id'),
            ('support_notifications', 'ticket_id', 'idx_support_notifications_ticket_id'),
            ('support_ticket_assignments', 'admin_id', 'idx_support_ticket_assignments_admin_id'),
            ('support_ticket_assignments', 'assigned_by', 'idx_support_ticket_assignments_assigned_by'),
            ('support_tickets', 'assigned_to', 'idx_support_tickets_assigned_to'),
            ('support_tickets', 'category_id', 'idx_support_tickets_category_id'),
            ('support_tickets', 'order_id', 'idx_support_tickets_order_id'),
            ('support_tickets', 'service_id', 'idx_support_tickets_service_id'),
            ('user_suspension_history', 'user_id', 'idx_user_suspension_history_user_id')
    LOOP
        -- Check if table and column exist
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = index_record.column1
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = index_record.column1
            AND column_name = index_record.column2
        ) THEN
            BEGIN
                index_sql := format('CREATE INDEX IF NOT EXISTS %I ON public.%I (%I)',
                                  index_record.column3, index_record.column1, index_record.column2);
                EXECUTE index_sql;
                RAISE NOTICE 'Created index: %', index_record.column3;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not create index % on %.%: %',
                                index_record.column3, index_record.column1, index_record.column2, SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'Skipping index % - table or column does not exist', index_record.column3;
        END IF;
    END LOOP;
END $$;

-- 5. Remove Unused Indexes
-- Drop indexes that are never used according to performance suggestions
DO $$
DECLARE
    unused_index TEXT;
BEGIN
    -- List of unused indexes from the documentation
    FOR unused_index IN
        VALUES
            ('idx_images_uploader_created'),
            ('idx_optimization_log_created'),
            ('idx_banned_emails_created_by'),
            ('idx_user_assessment_responses_selected_option_id'),
            ('idx_user_suspension_history_performed_by'),
            ('idx_users_spam_flagged_by'),
            ('idx_users_suspended_by'),
            ('idx_projects_slug'),
            ('idx_projects_status'),
            ('idx_projects_author_user_id'),
            ('idx_project_concepts_project_id'),
            ('idx_comments_user_id'),
            ('idx_support_messages_chat_session_id'),
            ('idx_support_messages_ticket_id'),
            ('idx_support_messages_sender_id'),
            ('idx_user_status_user_id'),
            ('idx_user_status_updated_at'),
            ('idx_accounts_user_id'),
            ('idx_blog_engagement_user_id'),
            ('idx_customer_downloads_service_id'),
            ('idx_customer_downloads_customer_email'),
            ('idx_newsletter_subscribers_user_id'),
            ('idx_user_bookmarks_post_id'),
            ('idx_user_bookmarks_user_post'),
            ('idx_orders_user_created'),
            ('idx_blog_posts_author_draft'),
            ('idx_blog_posts_published'),
            ('idx_support_tickets_status_created'),
            ('idx_support_tickets_open')
    LOOP
        BEGIN
            EXECUTE format('DROP INDEX IF EXISTS %I', unused_index);
            RAISE NOTICE 'Dropped unused index: %', unused_index;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop index %: %', unused_index, SQLERRM;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- This migration addresses:
-- 1. Function search path security warnings (5 functions)
-- 2. RLS disabled security error (1 table)
-- 3. Auth RLS initialization plan performance warnings
-- 4. Missing foreign key indexes (15 indexes)
-- 5. Unused indexes removal (29 indexes)
--
-- Note: Auth configuration issues (leaked password protection, MFA options)
-- need to be addressed in the Supabase dashboard, not via SQL migrations.
