-- ============================================
-- FOOTER FOREIGN KEY CASCADE UPDATE
-- ============================================

-- Drop existing foreign key constraints
ALTER TABLE public.footer_column_translations
DROP CONSTRAINT IF EXISTS footer_column_translations_column_id_fkey;

ALTER TABLE public.footer_column_links
DROP CONSTRAINT IF EXISTS footer_column_links_column_id_fkey;

ALTER TABLE public.footer_column_link_translations
DROP CONSTRAINT IF EXISTS footer_column_link_translations_link_id_fkey;

-- Re-add with CASCADE DELETE
ALTER TABLE public.footer_column_translations
ADD CONSTRAINT footer_column_translations_column_id_fkey
FOREIGN KEY (column_id) REFERENCES public.footer_columns(id)
ON DELETE CASCADE;

ALTER TABLE public.footer_column_links
ADD CONSTRAINT footer_column_links_column_id_fkey
FOREIGN KEY (column_id) REFERENCES public.footer_columns(id)
ON DELETE CASCADE;

ALTER TABLE public.footer_column_link_translations
ADD CONSTRAINT footer_column_link_translations_link_id_fkey
FOREIGN KEY (link_id) REFERENCES public.footer_column_links(id)
ON DELETE CASCADE;
