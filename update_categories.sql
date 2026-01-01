-- Categories tablosunu güncellemek için SQL sorguları
-- JSON'daki verilere göre parent_id, name, description, active, sort alanlarını günceller

-- 1. Parent_id güncellemeleri
UPDATE categories SET parent_id = NULL WHERE id = 22;
UPDATE categories SET parent_id = 77 WHERE id = 23;
UPDATE categories SET parent_id = 69 WHERE id = 24;
UPDATE categories SET parent_id = 69 WHERE id = 25;
UPDATE categories SET parent_id = 77 WHERE id = 26;
UPDATE categories SET parent_id = NULL WHERE id = 27;
UPDATE categories SET parent_id = 24 WHERE id = 28;
UPDATE categories SET parent_id = 69 WHERE id = 29;
UPDATE categories SET parent_id = 69 WHERE id = 30;
UPDATE categories SET parent_id = 36 WHERE id = 31;
UPDATE categories SET parent_id = 68 WHERE id = 32;
UPDATE categories SET parent_id = NULL WHERE id = 33;
UPDATE categories SET parent_id = 72 WHERE id = 34;
UPDATE categories SET parent_id = 72 WHERE id = 35;
UPDATE categories SET parent_id = NULL WHERE id = 36;
UPDATE categories SET parent_id = 69 WHERE id = 37;
UPDATE categories SET parent_id = 75 WHERE id = 38;
UPDATE categories SET parent_id = NULL WHERE id = 39;
UPDATE categories SET parent_id = NULL WHERE id = 40;
UPDATE categories SET parent_id = NULL WHERE id = 41;
UPDATE categories SET parent_id = 71 WHERE id = 42;
UPDATE categories SET parent_id = NULL WHERE id = 43;
UPDATE categories SET parent_id = NULL WHERE id = 44;
UPDATE categories SET parent_id = 33 WHERE id = 46;
UPDATE categories SET parent_id = 33 WHERE id = 47;
UPDATE categories SET parent_id = 33 WHERE id = 48;
UPDATE categories SET parent_id = 33 WHERE id = 49;
UPDATE categories SET parent_id = 33 WHERE id = 50;
UPDATE categories SET parent_id = 72 WHERE id = 51;
UPDATE categories SET parent_id = 72 WHERE id = 52;
UPDATE categories SET parent_id = 72 WHERE id = 53;
UPDATE categories SET parent_id = 72 WHERE id =
