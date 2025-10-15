-- Create a function to get one featured offering for each archetype path
CREATE OR REPLACE FUNCTION get_featured_offerings_by_path()
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    cover_image TEXT,
    path archetype_path,
    featured BOOLEAN,
    sort_order INTEGER,
    published BOOLEAN,
    available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_offerings AS (
        SELECT 
            ps.id,
            ps.title::TEXT,
            ps.slug::TEXT,
            ps.excerpt,
            ps.cover_image,
            ps.path,
            ps.featured,
            ps.sort_order,
            ps.published,
            ps.available,
            ROW_NUMBER() OVER (PARTITION BY ps.path ORDER BY ps.sort_order ASC, ps.created_at DESC) as rn
        FROM products_services ps
        WHERE ps.published = true 
        AND ps.available = true
        AND ps.path IS NOT NULL
    )
    SELECT 
        ro.id,
        ro.title,
        ro.slug,
        ro.excerpt,
        ro.cover_image,
        ro.path,
        ro.featured,
        ro.sort_order,
        ro.published,
        ro.available
    FROM ranked_offerings ro
    WHERE ro.rn = 1
    ORDER BY ro.path;
END;
$$ LANGUAGE plpgsql STABLE;