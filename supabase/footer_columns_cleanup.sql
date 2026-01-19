-- ============================================
-- FOOTER COLUMNS DUPLICATE CLEANUP
-- ============================================

-- 1. Identify duplicate columns by sort_order
WITH duplicate_columns AS (
  SELECT 
    sort_order,
    ARRAY_AGG(id ORDER BY id) as column_ids,
    COUNT(*) as dup_count
  FROM public.footer_columns
  GROUP BY sort_order
  HAVING COUNT(*) > 1
),
-- For each duplicate group, keep the lowest id
columns_to_delete AS (
  SELECT 
    unnest(column_ids[2:]) as column_id_to_delete,
    column_ids[1] as keep_column_id
  FROM duplicate_columns
)
-- First, update footer_column_links to point to kept column
UPDATE public.footer_column_links fcl
SET column_id = ctd.keep_column_id
FROM columns_to_delete ctd
WHERE fcl.column_id = ctd.column_id_to_delete;

-- Update footer_column_translations to point to kept column
UPDATE public.footer_column_translations fct
SET column_id = ctd.keep_column_id
FROM columns_to_delete ctd
WHERE fct.column_id = ctd.column_id_to_delete;

-- Now delete the duplicate columns (cascade will handle links/translations)
DELETE FROM public.footer_columns
WHERE id IN (SELECT column_id_to_delete FROM columns_to_delete);

-- 2. Verify cleanup
SELECT 'footer_columns duplicates' as check_type, COUNT(*) as duplicate_count
FROM (
  SELECT sort_order, COUNT(*)
  FROM public.footer_columns
  GROUP BY sort_order
  HAVING COUNT(*) > 1
) AS dupes;

-- Show remaining columns
SELECT id, sort_order FROM public.footer_columns ORDER BY sort_order;
