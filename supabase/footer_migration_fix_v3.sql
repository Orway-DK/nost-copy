-- ============================================
-- FOOTER DUPLICATE CLEANUP SCRIPT V3
-- Fixed CTE scope issue
-- ============================================

-- Create a temporary table to store link IDs to delete
CREATE TEMP TABLE links_to_delete_temp AS
SELECT 
  unnest(link_ids[2:]) as link_id_to_delete
FROM (
  SELECT 
    column_id,
    url,
    ARRAY_AGG(id ORDER BY id) as link_ids
  FROM public.footer_column_links
  GROUP BY column_id, url
  HAVING COUNT(*) > 1
) AS duplicate_links;

-- 1. First, delete translations for links that will be deleted
DELETE FROM public.footer_column_link_translations
WHERE link_id IN (SELECT link_id_to_delete FROM links_to_delete_temp);

-- 2. Now delete the duplicate links (translations already removed)
DELETE FROM public.footer_column_links
WHERE id IN (SELECT link_id_to_delete FROM links_to_delete_temp);

-- 3. Clean up any remaining translation duplicates (same link_id and lang_code)
DELETE FROM public.footer_column_link_translations fclt1
USING public.footer_column_link_translations fclt2
WHERE fclt1.id > fclt2.id
  AND fclt1.link_id = fclt2.link_id
  AND fclt1.lang_code = fclt2.lang_code;

-- 4. Drop temporary table
DROP TABLE links_to_delete_temp;

-- 5. Verify cleanup
SELECT 'footer_column_links duplicates' as check_type, COUNT(*) as duplicate_count
FROM (
  SELECT column_id, url, COUNT(*)
  FROM public.footer_column_links
  GROUP BY column_id, url
  HAVING COUNT(*) > 1
) AS dupes;

SELECT 'footer_column_link_translations duplicates' as check_type, COUNT(*) as duplicate_count
FROM (
  SELECT link_id, lang_code, COUNT(*)
  FROM public.footer_column_link_translations
  GROUP BY link_id, lang_code
  HAVING COUNT(*) > 1
) AS dupes;
