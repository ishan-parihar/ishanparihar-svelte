-- Test script to verify the function works correctly
-- Run this in Supabase Studio SQL editor

-- First, let's check the structure of the products_services table
\d products_services;

-- Then test the function
SELECT * FROM get_featured_offerings_by_path();

-- Also test the debug function
SELECT * FROM get_featured_offerings_by_path_debug();

-- Let's also check what data we have in the table with path values
SELECT id, title, slug, path, published, available, featured 
FROM products_services 
WHERE path IS NOT NULL
ORDER BY path;