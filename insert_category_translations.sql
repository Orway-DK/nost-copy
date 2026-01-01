-- category_translations tablosunu doldurmak için SQL sorguları
-- Tüm kategoriler için tr, en, de dillerinde çeviriler

-- Not: ID'ler bigserial olduğu için otomatik artacak, bu yüzden id belirtmiyoruz.

-- 1. Broşür ve El İlanı (id: 32)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(32, 'tr', 'Broşür ve El İlanı', 'Tanıtım ve duyurularınız için etkili broşür çözümleri.'),
(32, 'en', 'Brochure and Flyer', 'Effective brochure solutions for your promotions and announcements.'),
(32, 'de', 'Broschüre und Flyer', 'Effektive Broschürenlösungen für Ihre Werbung und Ankündigungen.');

-- 2. Kurumsal Ürünler (id: 33)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(33, 'tr', 'Kurumsal Ürünler', 'Antetli kağıt, dosya, zarf ve kurumsal kimlik ürünleri.'),
(33, 'en', 'Corporate Products', 'Letterhead, folders, envelopes and corporate identity products.'),
(33, 'de', 'Unternehmensprodukte', 'Briefpapier, Ordner, Umschläge und Corporate Identity Produkte.');

-- 3. Katalog ve Dergi (id: 34)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(34, 'tr', 'Katalog ve Dergi', 'Çok sayfalı tanıtım ürünleri ve yayınlar.'),
(34, 'en', 'Catalog and Magazine', 'Multi-page promotional products and publications.'),
(34, 'de', 'Katalog und Zeitschrift', 'Mehrseitige Werbeprodukte und Publikationen.');

-- 4. Afiş ve Poster (id: 35)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(35, 'tr', 'Afiş ve Poster', 'İç ve dış mekan için dikkat çekici poster baskıları.'),
(35, 'en', 'Poster and Billboard', 'Eye-catching poster prints for indoor and outdoor use.'),
(35, 'de', 'Plakat und Poster', 'Auffällige Poster-Drucke für Innen- und Außenbereiche.');

-- 5. Etiket & Sticker (id: 36)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(36, 'tr', 'Etiket & Sticker', 'Rulo, tabaka ve özel kesim etiket çözümleri.'),
(36, 'en', 'Label & Sticker', 'Roll, sheet and custom cut label solutions.'),
(36, 'de', 'Etikett & Aufkleber', 'Rollen-, Blatt- und maßgeschneiderte Etikettenlösungen.');

-- 6. Promosyon Ürünleri (id: 37)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(37, 'tr', 'Promosyon Ürünleri', 'Bloknot, takvim ve markalı promosyon ürünleri.'),
(37, 'en', 'Promotional Products', 'Notepads, calendars and branded promotional products.'),
(37, 'de', 'Werbeartikel', 'Notizblöcke, Kalender und markenbezogene Werbeartikel.');

-- 7. Ambalaj ve Kutu (id: 38)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(38, 'tr', 'Ambalaj ve Kutu', 'Ürün kutuları, karton çantalar ve paketleme çözümleri.'),
(38, 'en', 'Packaging and Box', 'Product boxes, cardboard bags and packaging solutions.'),
(38, 'de', 'Verpackung und Karton', 'Produktboxen, Kartontaschen und Verpackungslösungen.');

-- 8. Kurumsal Baskı (id: 39)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(39, 'tr', 'Kurumsal Baskı', 'Şirketinizin profesyonel yüzü için gerekli tüm evraklar.'),
(39, 'en', 'Corporate Printing', 'All necessary documents for your company''s professional face.'),
(39, 'de', 'Unternehmensdruck', 'Alle notwendigen Dokumente für das professionelle Erscheinungsbild Ihres Unternehmens.');

-- 9. Reklam & Tanıtım (id: 40)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(40, 'tr', 'Reklam & Tanıtım', 'Markanızı duyurmak için broşür, afiş ve katalog çözümleri.'),
(40, 'en', 'Advertising & Promotion', 'Brochure, poster and catalog solutions to promote your brand.'),
(40, 'de', 'Werbung & Promotion', 'Broschüren-, Poster- und Kataloglösungen zur Förderung Ihrer Marke.');

-- 10. Etiket & Ambalaj (id: 41)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(41, 'tr', 'Etiket & Ambalaj', 'Ürünleriniz için sticker, kutu ve paketleme ürünleri.'),
(41, 'en', 'Label & Packaging', 'Stickers, boxes and packaging products for your products.'),
(41, 'de', 'Etikett & Verpackung', 'Aufkleber, Kartons und Verpackungsprodukte für Ihre Produkte.');

-- 11. Restoran & Cafe (id: 42)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(42, 'tr', 'Restoran & Cafe', 'Menü, amerikan servis ve gıda paketleme ürünleri.'),
(42, 'en', 'Restaurant & Cafe', 'Menu, American service and food packaging products.'),
(42, 'de', 'Restaurant & Cafe', 'Menü, amerikanischer Service und Lebensmittelverpackungsprodukte.');

-- 12. Açık Hava (Display) (id: 43)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(43, 'tr', 'Açık Hava (Display)', 'Roll-up, branda ve tabela baskıları.'),
(43, 'en', 'Outdoor (Display)', 'Roll-up, tarpaulin and signboard prints.'),
(43, 'de', 'Außenbereich (Display)', 'Roll-up, Planen und Schilddrucke.');

-- 13. Promosyon Ürünleri (id: 44) - Bu isimde iki kategori var, id: 37 ve id: 44
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(44, 'tr', 'Promosyon Ürünleri', 'Eşantiyon ve hediye ürünleri.'),
(44, 'en', 'Promotional Products', 'Giveaway and gift products.'),
(44, 'de', 'Werbeartikel', 'Giveaway- und Geschenkartikel.');

-- 14. Antetli Kağıt (id: 46)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(46, 'tr', 'Antetli Kağıt', 'Kurumsal kimliğinizi yansıtan antetli kağıt, kartvizit ve zarf setleri.'),
(46, 'en', 'Letterhead Paper', 'Letterhead paper, business cards and envelope sets that reflect your corporate identity.'),
(46, 'de', 'Briefpapier', 'Briefpapier, Visitenkarten und Umschlag-Sets, die Ihre Corporate Identity widerspiegeln.');

-- 15. Diplomat Zarf (id: 47)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(47, 'tr', 'Diplomat Zarf', 'Resmi yazışmalar için şık ve dayanıklı diplomat zarflar.'),
(47, 'en', 'Diplomat Envelope', 'Elegant and durable diplomat envelopes for official correspondence.'),
(47, 'de', 'Diplomatenumschlag', 'Elegante und langlebige Diplomatenumschläge für offizielle Korrespondenz.');

-- 16. Cepli Sunum Dosyası (id: 48)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(48, 'tr', 'Cepli Sunum Dosyası', 'Sunumlarınız için profesyonel cepli dosya ve klasörler.'),
(48, 'en', 'Pocket Presentation Folder', 'Professional pocket folders and binders for your presentations.'),
(48, 'de', 'Präsentationsmappe mit Tasche', 'Professionelle Präsentationsmappen und Ordner für Ihre Präsentationen.');

-- 17. Bloknotlar (id: 49)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(49, 'tr', 'Bloknotlar', 'Markalı bloknot ve not defterleri, ofis ve promosyon kullanımı için.'),
(49, 'en', 'Notepads', 'Branded notepads and notebooks for office and promotional use.'),
(49, 'de', 'Notizblöcke', 'Markennotizblöcke und Notizbücher für Büro- und Werbezwecke.');

-- 18. Otokopili Evraklar (Fatura/İrsaliye) (id: 50)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(50, 'tr', 'Otokopili Evraklar (Fatura/İrsaliye)', 'Otokopili fatura, irsaliye ve resmi evrak baskıları.'),
(50, 'en', 'Carbon Copy Documents (Invoice/Delivery Note)', 'Carbon copy invoices, delivery notes and official document prints.'),
(50, 'de', 'Durchschlagdokumente (Rechnung/Lieferschein)', 'Durchschlagrechnungen, Lieferscheine und offizielle Dokumentendrucke.');

-- 19. Broşürler (id: 51)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(51, 'tr', 'Broşürler', 'Tanıtım ve bilgilendirme amaçlı çok sayfalı broşür baskıları.'),
(51, 'en', 'Brochures', 'Multi-page brochure prints for promotion and information purposes.'),
(51, 'de', 'Broschüren', 'Mehrseitige Broschürendrucke für Werbe- und Informationszwecke.');

-- 20. El İlanları (id: 52)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(52, 'tr', 'El İlanları', 'Duyuru ve kampanyalar için etkili el ilanı tasarımları.'),
(52, 'en', 'Flyers', 'Effective flyer designs for announcements and campaigns.'),
(52, 'de', 'Flyer', 'Effektive Flyer-Designs für Ankündigungen und Kampagnen.');

-- 21. Katalog & Dergi (id: 53)
INSERT INTO category_translations (category_id, lang_code, name, description) VALUES
(53, 'tr',
