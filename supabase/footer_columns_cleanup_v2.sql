-- ============================================
-- FOOTER COLUMNS DUPLICATE CLEANUP V2
-- Uses temporary table to avoid CTE scope issues
-- ============================================

-- Create temporary table for duplicate columns
CREATE TEMP TABLE duplicate_columns_temp AS
SELECT 
  sort_order,
  ARRAY_AGG(id ORDER BY id) as column_ids,
  COUNT(*) as dup_count
FROM public.footer_columns
GROUP BY sort_order
HAVING COUNT(*) > 1;

-- Create temporary table for columns to delete
CREATE TEMP TABLE columns_to_delete_temp AS
SELECT 
  unnest(column_ids[2:]) as column_id_to_delete,
  column_ids[1] as keep_column_id
FROM duplicate_columns_temp;

-- 1. Update footer_column_links to point to kept column
UPDATE public.footer_column_links fcl
SET column_id = ctd.keep_column_id
FROM columns_to_delete_temp ctd
WHERE fcl.column_id = ctd.column_id_to_delete;

-- 2. Update footer_column_translations to point to kept column
UPDATE public.footer_column_translations fct
SET column_id = ctd.keep_column_id
FROM columns_to_delete_temp ctd
WHERE fct.column_id = ctd.column_id_to_delete;

-- 3. Now delete the duplicate columns (cascade will handle links/translations)
DELETE FROM public.footer_columns
WHERE id IN (SELECT column_id_to_delete FROM columns_to_delete_temp);

-- 4. Drop temporary tables
DROP TABLE duplicate_columns_temp;
DROP TABLE columns_to_delete_temp;

-- 5. Verify cleanup
SELECT 'footer_columns duplicates' as check_type, COUNT(*) as duplicate_count
FROM (
  SELECT sort_order, COUNT(*)
  FROM public.footer_columns
  GROUP BY sort_order
  HAVING COUNT(*) > 1
) AS dupes;

-- Show remaining columns
SELECT id, sort_order FROM public.footer_columns ORDER BY sort_order;
