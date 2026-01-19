-- Remove duplicate footer_column_links (keep the one with lower id)
DELETE FROM public.footer_column_links fcl1
USING public.footer_column_links fcl2
WHERE fcl1.id > fcl2.id
  AND fcl1.column_id = fcl2.column_id
  AND fcl1.url = fcl2.url;

-- Remove duplicate footer_column_link_translations (keep the one with lower id)
DELETE FROM public.footer_column_link_translations fclt1
USING public.footer_column_link_translations fclt2
WHERE fclt1.id > fclt2.id
  AND fclt1.link_id = fclt2.link_id
  AND fclt1.lang_code = fclt2.lang_code;
