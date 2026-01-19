-- ============================================
-- FOOTER DUPLICATE CLEANUP SCRIPT
-- Run this after main migration script
-- ============================================

-- 1. First, clean up duplicate translations
DELETE FROM public.footer_column_link_translations fclt1
USING public.footer_column_link_translations fclt2
WHERE fclt1.id > fclt2.id
  AND fclt1.link_id = fclt2.link_id
  AND fclt1.lang_code = fclt2.lang_code;

-- 2. Now clean up duplicate links (translations already cleaned)
DELETE FROM public.footer_column_links fcl1
USING public.footer_column_links fcl2
WHERE fcl1.id > fcl2.id
  AND fcl1.column_id = fcl2.column_id
  AND fcl1.url = fcl2.url;

-- 3. Verify cleanup
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
