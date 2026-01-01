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
UPDATE categories SET parent_id = 72 WHERE id = 54;
UPDATE categories SET parent_id = 36 WHERE id = 55;
UPDATE categories SET parent_id = 36 WHERE id = 56;
UPDATE categories SET parent_id = 36 WHERE id = 57;
UPDATE categories SET parent_id = 75 WHERE id = 58;
UPDATE categories SET parent_id = 75 WHERE id = 59;
UPDATE categories SET parent_id = 33 WHERE id = 60;
UPDATE categories SET parent_id = 33 WHERE id = 61;
UPDATE categories SET parent_id = 69 WHERE id = 62;
UPDATE categories SET parent_id = 71 WHERE id = 63;
UPDATE categories SET parent_id = 43 WHERE id = 64;
UPDATE categories SET parent_id = 43 WHERE id = 65;
UPDATE categories SET parent_id = 43 WHERE id = 66;
UPDATE categories SET parent_id = NULL WHERE id = 68;
UPDATE categories SET parent_id = NULL WHERE id = 69;
UPDATE categories SET parent_id = NULL WHERE id = 71;
UPDATE categories SET parent_id = NULL WHERE id = 72;
UPDATE categories SET parent_id = NULL WHERE id = 75;
UPDATE categories SET parent_id = NULL WHERE id = 77;

-- 2. Name ve description güncellemeleri
-- Not: Çok satırlı description'lar için E'...' syntax'ı kullanıldı
UPDATE categories SET 
  name = 'Kartvizitler', 
  description = E'Profesyonel Kimliğinizin İlk Adımı: Kartvizitler\n\nİş dünyasında ilk izlenim sadece bir kez bırakılır. Nost Copy olarak, markanızı ve profesyonel kimliğinizi en iyi şekilde yansıtacak kartvizit çözümleri sunuyoruz. İster klasik ve sade, ister yaratıcı ve modern tasarımlar olsun; yüksek baskı kalitemiz ve geniş kağıt seçeneklerimizle her zaman yanınızdayız.\n\nStandart kuşe kağıttan dokulu tuale kağıda, kabartma laklı özel uygulamalardan şeffaf kartvizitlere kadar geniş ürün yelpazemizle, müşterilerinizin aklında kalıcı bir iz bırakmanızı sağlıyoruz.'
WHERE id = 22;

UPDATE categories SET name = 'Giyim', description = 'Tişört, sweatshirt, hoodie ve diğer giyim ürünlerinde yüksek kaliteli baskı çözümleri. Kurumsal kimlik ve promosyon ürünleri.' WHERE id = 23;
UPDATE categories SET name = 'Teknoloji & Aksesuar', description = 'Telefon kılıfları, mouse pad, powerbank ve diğer teknoloji aksesuarlarında özel baskı ve kişiselleştirme.' WHERE id = 24;
UPDATE categories SET name = 'Ev & Yaşam', description = 'Ev dekorasyonu, mutfak ürünleri ve günlük kullanım eşyalarında kaliteli baskı çözümleri.' WHERE id = 25;
UPDATE categories SET name = 'Çantalar', description = 'Bez çanta, karton çanta, sırt çantası ve diğer çanta modellerinde markalı baskı hizmetleri.' WHERE id = 26;
UPDATE categories SET name = 'Kırtasiye & Etiket', description = 'Ofis ve kırtasiye ürünleri, etiketler ve sticker çözümleri.' WHERE id = 27;
UPDATE categories SET name = 'Telefon Kılıfları', description = 'Akıllı telefon kılıflarında yüksek çözünürlüklü dijital baskı ve kişiselleştirme.' WHERE id = 28;
UPDATE categories SET name = 'Kupalar', description = 'Seramik ve travel mug kupalarda kalıcı ve sağlıklı baskı çözümleri.' WHERE id = 29;
UPDATE categories SET name = 'Mouse Padler', description = 'Oyuncu ve ofis kullanımı için özel tasarımlı mouse padler.' WHERE id = 30;
UPDATE categories SET name = 'Şeffaf Etiketler', description = 'Şeffaf yapışkanlı etiketlerle ürünlerinize profesyonel görünüm.' WHERE id = 31;
UPDATE categories SET name = 'Broşür ve El İlanı', description = 'Tanıtım ve duyurularınız için etkili broşür çözümleri.' WHERE id = 32;
UPDATE categories SET name = 'Kurumsal Ürünler', description = 'Antetli kağıt, dosya, zarf ve kurumsal kimlik ürünleri.' WHERE id = 33;
UPDATE categories SET name = 'Katalog ve Dergi', description = 'Çok sayfalı tanıtım ürünleri ve yayınlar.' WHERE id = 34;
UPDATE categories SET name = 'Afiş ve Poster', description = 'İç ve dış mekan için dikkat çekici poster baskıları.' WHERE id = 35;
UPDATE categories SET name = 'Etiket & Sticker', description = 'Rulo, tabaka ve özel kesim etiket çözümleri.' WHERE id = 36;
UPDATE categories SET name = 'Promosyon Ürünleri', description = 'Bloknot, takvim ve markalı promosyon ürünleri.' WHERE id = 37;
UPDATE categories SET name = 'Ambalaj ve Kutu', description = 'Ürün kutuları, karton çantalar ve paketleme çözümleri.' WHERE id = 38;
UPDATE categories SET name = 'Kurumsal Baskı', description = 'Şirketinizin profesyonel yüzü için gerekli tüm evraklar.' WHERE id = 39;
UPDATE categories SET name = 'Reklam & Tanıtım', description = 'Markanızı duyurmak için broşür, afiş ve katalog çözümleri.' WHERE id = 40;
UPDATE categories SET name = 'Etiket & Ambalaj', description = 'Ürünleriniz için sticker, kutu ve paketleme ürünleri.' WHERE id = 41;
UPDATE categories SET name = 'Restoran & Cafe', description = 'Menü, amerikan servis ve gıda paketleme ürünleri.' WHERE id = 42;
UPDATE categories SET name = 'Açık Hava (Display)', description = 'Roll-up, branda ve tabela baskıları.' WHERE id = 43;
UPDATE categories SET name = 'Promosyon Ürünleri', description = 'Eşantiyon ve hediye ürünleri.' WHERE id = 44;
UPDATE categories SET name = 'Antetli Kağıt', description = 'Kurumsal kimliğinizi yansıtan antetli kağıt, kartvizit ve zarf setleri.' WHERE id = 46;
UPDATE categories SET name = 'Diplomat Zarf', description = 'Resmi yazışmalar için şık ve dayanıklı diplomat zarflar.' WHERE id = 47;
UPDATE categories SET name = 'Cepli Sunum Dosyası', description = 'Sunumlarınız için profesyonel cepli dosya ve klasörler.' WHERE id = 48;
UPDATE categories SET name = 'Bloknotlar', description = 'Markalı bloknot ve not defterleri, ofis ve promosyon kullanımı için.' WHERE id = 49;
UPDATE categories SET name = 'Otokopili Evraklar (Fatura/İrsaliye)', description = 'Otokopili fatura, irsaliye ve resmi evrak baskıları.' WHERE id = 50;
UPDATE categories SET name = 'Broşürler', description = 'Tanıtım ve bilgilendirme amaçlı çok sayfalı broşür baskıları.' WHERE id = 51;
UPDATE categories SET name = 'El İlanları', description = 'Duyuru ve kampanyalar için etkili el ilanı tasarımları.' WHERE id = 52;
UPDATE categories SET name = 'Katalog & Dergi', description = 'Ürün katalogları ve dergi baskıları, ciltli ve ciltsiz seçenekler.' WHERE id = 53;
UPDATE categories SET name = 'Afiş & Poster', description = 'İç ve dış mekan için büyük format afiş ve poster baskıları.' WHERE id = 54;
UPDATE categories SET name = 'Rulo Etiketler', description = 'Endüstriyel kullanım için rulo halinde etiket çözümleri.' WHERE id = 55;
UPDATE categories SET name = 'Tabaka Sticker', description = 'Tabaka halinde kesilmiş stickerlar, kolay uygulama için.' WHERE id = 56;
UPDATE categories SET name = 'Damla Etiket', description = 'Damla kesim etiketler, özel şekilli ürün etiketleme.' WHERE id = 57;
UPDATE categories SET name = 'Karton Çanta', description = 'Alışveriş ve promosyon amaçlı karton çanta baskıları.' WHERE id = 58;
UPDATE categories SET name = 'Kutu Baskı', description = 'Ürün kutuları ve paketleme malzemeleri üzerine baskı.' WHERE id = 59;
UPDATE categories SET name = 'Amerikan Servis', description = 'Restoran ve kafeler için amerikan servis ve placemat baskıları.' WHERE id = 60;
UPDATE categories SET name = 'Menüler', description = 'Restoran, cafe ve bar menüleri, dayanıklı ve şık tasarımlar.' WHERE id = 61;
UPDATE categories SET name = 'Islak Mendil', description = 'Kişisel bakım ve temizlik için markalı ıslak mendil paketleri.' WHERE id = 62;
UPDATE categories SET name = 'Bardak Altlığı', description = 'Kafe ve restoranlar için bardak altlığı ve coaster baskıları.' WHERE id = 63;
UPDATE categories SET name = 'Roll-up Banner', description = 'Taşınabilir ve pratik roll-up banner standları.' WHERE id = 64;
UPDATE categories SET name = 'Branda Vinil Baskı', description = 'Açık hava reklamcılığı için dayanıklı branda ve vinil baskı.' WHERE id = 65;
UPDATE categories SET name = 'Forex (Dakota) Baskı', description = 'Forex (Dakota) malzeme üzerine yüksek kaliteli baskı çözümleri.' WHERE id = 66;
UPDATE categories SET name = 'Pazarlama & Etiket', description = 'Broşür, etiket ve tanıtım ürünleri.' WHERE id = 68;
UPDATE categories SET name = 'Promosyon & Hediye', description = 'Tekstil, kupa ve promosyon ürünleri.' WHERE id = 69;
UPDATE categories SET name = 'Sektörel Çözümler', description = 'Restoran, Cafe ve Mağaza ürünleri.' WHERE id = 71;
UPDATE categories SET name = 'Broşür & İlan', description = 'Broşür, el ilanı ve insat baskıları.' WHERE id = 72;
UPDATE categories SET name = 'Ambalaj & Çanta', description = 'Kutu, çanta ve paketleme.' WHERE id = 75;
UPDATE categories SET name = 'Giyim & Tekstil', description = 'Tişört, sweatshirt, hoodie, polo yaka ve diğer tekstil ürünlerinde yüksek kaliteli baskı çözümleri. Kurumsal kimlik, etkinlik ve promosyon ürünleri için geniş ürün yelpazesi.' WHERE id = 77;

-- 3. Active ve sort değerlerini güncelle
UPDATE categories SET active = true, sort = 1 WHERE id = 22;
UPDATE categories SET active = true, sort = 8 WHERE id = 23;
UPDATE categories SET active = true, sort = 1 WHERE id = 24;
UPDATE categories SET active = true, sort = 2 WHERE id = 25;
UPDATE categories SET active = true, sort = 3 WHERE id = 26;
UPDATE categories SET active = false, sort = 7 WHERE id = 27;
UPDATE categories SET active = true, sort = 4 WHERE id = 28;
UPDATE categories SET active = true, sort = 5 WHERE id = 29;
UPDATE categories SET active = true, sort = 6 WHERE id = 30;
UPDATE categories SET active = true, sort = 9 WHERE id = 31;
UPDATE categories SET active = true, sort = 10 WHERE id = 32;
UPDATE categories SET active = true, sort = 3 WHERE id = 33;
UPDATE categories SET active = true, sort = 12 WHERE id = 34;
UPDATE categories SET active = true, sort = 13 WHERE id = 35;
UPDATE categories SET active = true, sort = 4 WHERE id = 36;
UPDATE categories SET active = true, sort = 15 WHERE id = 37;
UPDATE categories SET active = true, sort = 16 WHERE id = 38;
UPDATE categories SET active = false, sort = 1 WHERE id = 39;
UPDATE categories SET active = false, sort = 2 WHERE id = 40;
UPDATE categories SET active = false, sort = 3 WHERE id = 41;
UPDATE categories SET active = true, sort = 4 WHERE id = 42;
UPDATE categories SET active = true, sort = 8 WHERE id = 43;
UPDATE categories SET active = false, sort = 6 WHERE id = 44;
UPDATE categories SET active = true, sort = 2 WHERE id = 46;
UPDATE categories SET active = true, sort = 3 WHERE id = 47;
UPDATE categories SET active = true, sort = 4 WHERE id = 48;
UPDATE categories SET active = true, sort = 5 WHERE id = 49;
UPDATE categories SET active = true, sort = 6 WHERE id = 50;
UPDATE categories SET active = true, sort = 1 WHERE id = 51;
UPDATE categories SET active = true, sort = 2 WHERE id = 52;
UPDATE categories SET active = true, sort = 3 WHERE id = 53;
UPDATE categories SET active = true, sort = 4 WHERE id = 54;
UPDATE categories SET active = true, sort = 1 WHERE id = 55;
UPDATE categories SET active = true, sort = 2 WHERE id = 56;
UPDATE categories SET active = true, sort = 3 WHERE id = 57;
UPDATE categories SET active = true, sort = 4 WHERE id = 58;
UPDATE categories SET active = true, sort = 5 WHERE id = 59;
UPDATE categories SET active = true, sort = 1 WHERE id = 60;
UPDATE categories SET active = true, sort = 2 WHERE id = 61;
UPDATE categories SET active = true, sort = 3 WHERE id = 62;
UPDATE categories SET active = true, sort = 4 WHERE id = 63;
UPDATE categories SET active = true, sort = 1 WHERE id = 64;
UPDATE categories SET active = true, sort = 2 WHERE id = 65;
UPDATE categories SET active = true, sort = 3 WHERE id = 66;
UPDATE categories SET active = false, sort = 2 WHERE id = 68;
UPDATE categories SET active = true, sort = 6 WHERE id = 69;
UPDATE categories SET active = false, sort = 5 WHERE id = 71;
UPDATE categories SET active = true, sort = 2 WHERE id = 72;
UPDATE categories SET active = true, sort = 5 WHERE id = 75;
UPDATE categories SET active = true, sort = 7 WHERE id = 77;

-- 4. Kontrol sorgusu: Parent-child ilişkilerini kontrol et
SELECT 
  c.id,
  c.name,
  c.parent_id,
  p.name as parent_name
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY c.sort, c.id;
