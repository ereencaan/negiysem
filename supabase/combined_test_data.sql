-- =============================================
-- Ne Giysem - Test Data Setup (all-in-one)
-- Run once on a fresh database after combined_setup.sql
-- =============================================

-- 5 Normal Kullanıcılar
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, email_change, phone_change, phone_change_token, reauthentication_token)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ayse@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Ayşe Yıldırım","phone":"05301112233"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', ''),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fatma@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Fatma Demir","phone":"05302223344"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', ''),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mehmet@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Mehmet Kaya","phone":"05303334455"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', ''),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'zeynep@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Zeynep Çelik","phone":"05304445566"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', ''),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emre@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Emre Aksoy","phone":"05305556677"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', '')
;

-- 5 Stilist Kullanıcıları
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, email_change, phone_change, phone_change_token, reauthentication_token)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stilist.selin@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Selin Aydın","phone":"05401112233"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', ''),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stilist.deniz@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Deniz Korkmaz","phone":"05402223344"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', ''),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stilist.ece@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Ece Şahin","phone":"05403334455"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', ''),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stilist.burcu@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Burcu Yılmaz","phone":"05404445566"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', ''),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stilist.ceren@negiysem.com', crypt('Test1234!', gen_salt('bf')), now(), '{"name":"Ceren Özdemir","phone":"05405556677"}'::jsonb, '{"provider":"email","providers":["email"]}'::jsonb, now(), now(), '', '', '', '', '', '', '', '')
;

-- Auth identities (required for sign-in)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now()
FROM auth.users u
WHERE u.email LIKE '%@negiysem.com'
  AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email');

-- Stilist Instagram bilgilerini güncelle
UPDATE public.users SET instagram_url = '@selinaydinstil' WHERE email = 'stilist.selin@negiysem.com';
UPDATE public.users SET instagram_url = '@denizkorkmaz' WHERE email = 'stilist.deniz@negiysem.com';
UPDATE public.users SET instagram_url = '@ecesahinstyle' WHERE email = 'stilist.ece@negiysem.com';
UPDATE public.users SET instagram_url = '@burcuyilmazmode' WHERE email = 'stilist.burcu@negiysem.com';
UPDATE public.users SET instagram_url = '@cerenozdemir' WHERE email = 'stilist.ceren@negiysem.com';

-- Stilist profilleri oluştur
INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Kişisel stil danışmanı. Modern ve şık kombinler ile gardırobunuzu yenileyin.', 'EĞİTİM
• Marmara Üniversitesi, Tekstil ve Moda Tasarımı (Lisans, 2014-2018)
• Istituto Marangoni Milano, Personal Styling Sertifikası (2019)
• Central Saint Martins London, Fashion Styling Short Course (2021)

DENEYİM
• Vogue Türkiye dergisinde 2 yıl asistan stilist (2018-2020)
• Elle Türkiye dergisinde moda yazarı ve kombin danışmanı (2020-2022)
• Freelance kişisel stilist ve moda danışmanı (2022-günümüz)
• 200+ birebir kişisel alışveriş seansı

UZMANLIK ALANLARI
• Klasik ve modern stilin harmanlanması
• Kurumsal / iş hayatı kombinleri
• Akşam ve davet kıyafetleri
• Gardırop analizi ve planlama', '@selinaydinstil', 175.00, 4.9, 48, true
FROM public.users WHERE email = 'stilist.selin@negiysem.com'
;

INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Minimalist tarz uzmanı. Kapsül gardırop oluşturma ve sürdürülebilir moda.', 'EĞİTİM
• Mimar Sinan Güzel Sanatlar Üniversitesi, Moda Tasarımı (Lisans, 2016-2020)
• Copenhagen Business School, Sustainable Fashion (Online Master Class, 2022)
• Parsons Paris, Minimalist Wardrobe Design Workshop (2023)

DENEYİM
• COS ve Arket mağazalarında görsel mağazacılık (2020-2022)
• Sürdürülebilir moda blogu "Az Giyin Çok Stil" kurucusu (2021-günümüz)
• Freelance kapsül gardırop danışmanı (2022-günümüz)
• 120+ müşteri için sıfırdan kapsül gardırop oluşturdu

UZMANLIK ALANLARI
• Minimalist ve zamanötesi parçalar
• Kapsül gardırop kurulumu (30 parça ile 100+ kombin)
• Sürdürülebilir moda ve etik markalar
• Nötr ton paletleri', '@denizkorkmaz', 130.00, 4.7, 32, true
FROM public.users WHERE email = 'stilist.deniz@negiysem.com'
;

INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Streetwear ve casual kombin uzmanı. Gençlere özel stil danışmanlığı.', 'EĞİTİM
• Yıldız Teknik Üniversitesi, İletişim Tasarımı (Lisans, 2018-2022)
• Online Bootcamp: Streetwear Culture & Design (Highsnobiety Academy, 2022)
• TikTok Creator Academy Sertifikası (2023)

DENEYİM
• Moda blog yazarlığı ve içerik üreticiliği (2020-günümüz)
• 180K takipçili Instagram @ecesahinstyle hesabı (2021-günümüz)
• Nike, Adidas ve Zara ile influencer işbirlikleri
• Genç moda markaları için stil danışmanlığı (2022-günümüz)
• 80+ üniversite öğrencisi için bütçe dostu stil seansı

UZMANLIK ALANLARI
• Streetwear ve casual chic
• Genç ve öğrenci bütçesine uygun kombinler
• Y2K, 90s retro akımları', '@ecesahinstyle', 100.00, 4.5, 21, true
FROM public.users WHERE email = 'stilist.ece@negiysem.com'
;

INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Düğün ve özel gün stilisti. Şıklığınızı garanti altına alıyorum.', 'EĞİTİM
• İstanbul Moda Akademisi (İMA), Moda Tasarımı (Lisans, 2012-2016)
• Paris American Academy, Haute Couture Certification (2017)
• Swarovski Professional Development Program (2019)

DENEYİM
• Tuba Ergin Couture atölyesinde kalıpçı asistan (2016-2018)
• Zühre Özmen Couture ekibinde gelinlik stilisti (2018-2021)
• Freelance özel gün ve düğün stilisti (2021-günümüz)
• 150+ gelinlik denemesine eşlik, 90+ düğün kombin danışmanlığı

UZMANLIK ALANLARI
• Gelin, damat, anne ve şahit kombinleri
• Nişan & kına gecesi tematik stil
• Kokteyl ve gala davetleri', '@burcuyilmazmode', 220.00, 4.8, 55, true
FROM public.users WHERE email = 'stilist.burcu@negiysem.com'
;

INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Ofis ve iş hayatı kombincisi. Profesyonel görünümünüzü bir üst seviyeye taşıyın.', 'EĞİTİM
• Boğaziçi Üniversitesi, İşletme (Lisans, 2013-2017)
• London School of Image & Style, Corporate Styling Diploma (2018)
• MBA, Sabancı Üniversitesi - Markalaşma odaklı (2020-2022)

DENEYİM
• Deloitte Türkiye insan kaynakları biriminde 3 yıl kurumsal imaj danışmanı (2018-2021)
• Finansal kurumlar (Garanti BBVA, İş Bankası) için üst düzey yönetici imaj danışmanlığı (2021-günümüz)
• 250+ iş görüşmesi öncesi hazırlık seansı

UZMANLIK ALANLARI
• Kurumsal imaj ve power dressing
• İş görüşmesi / sunum kombinleri
• Executive presence & authority styling', '@cerenozdemir', 140.00, 4.6, 38, true
FROM public.users WHERE email = 'stilist.ceren@negiysem.com'
;

-- =============================================
-- 50 OUTFIT POSTS (10 per stylist)
-- =============================================

INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=8903', 'Beyaz gömlek + yüksek bel pantolon kombinasyonu', 142, 'ofis' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=2176', 'Siyah blazer ile zarif iş kombini', 98, 'ofis' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=8136', 'Bej trençkot ile sonbahar şıklığı', 156, 'ofis' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=8776', 'Midi elbise + topuklu klasik stil', 203, 'davet' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=8313', 'Kaşmir kazak + jean kombini', 89, 'gunluk' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=975', 'Çiçek desenli midi etek', 174, 'davet' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=3066', 'Oversize palto + yüksek bot', 132, 'ofis' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=9917', 'Beyaz gömlek + deri etek', 167, 'ofis' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=6853', 'Akşam yemeği için şık kombin', 245, 'davet' FROM public.users WHERE email = 'stilist.selin@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=3750', 'Monokrom siyah kombinasyon', 118, 'davet' FROM public.users WHERE email = 'stilist.selin@negiysem.com';

INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=1215', 'Minimalist beyaz tişört + bej pantolon', 76, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=9541', 'Kapsül gardırop temel parçalar', 124, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=3041', 'Toprak tonları ile nötr kombin', 91, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=5424', 'Sürdürülebilir moda - keten gömlek', 108, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=8739', 'Temiz çizgiler, sade renkler', 142, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=8131', 'Slow fashion - organik kumaşlar', 67, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=3529', 'Oversize beyaz gömlek stili', 135, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=8657', 'Vintage trench + modern detaylar', 89, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=5083', 'Haftanın 7 günü kombinleri', 201, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,casual,minimal?lock=9284', 'Az parça çok kombin', 156, 'gunluk' FROM public.users WHERE email = 'stilist.deniz@negiysem.com';

INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=2200', 'Oversize hoodie + bisiklet şort', 287, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=1761', 'Sneaker ile casual chic', 198, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=6010', 'Crop top + yüksek bel jean', 312, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=4734', 'Y2K tarzı retro kombin', 267, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=346', 'Grafikli tişört + kargo pantolon', 178, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=1263', 'Üniversite kombinleri haftası', 221, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=2065', 'Deri ceket + mini etek', 254, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=6420', 'Festival için ootd', 189, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=1966', 'Denim üzerine denim trendi', 145, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,streetwear,style?lock=7207', 'Ekoseli etek + bot', 234, 'sokak' FROM public.users WHERE email = 'stilist.ece@negiysem.com';

INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=2728', 'Düğün için kır eşarplı elbise', 356, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=314', 'Nişan töreni için pudra pembe tül', 412, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=120', 'Kokteyl partisi - siyah mini elbise', 287, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=1297', 'Gala gecesi için şampanya rengi tuval', 398, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=3607', 'Mezuniyet için zarif kombin', 245, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=18', 'Baloya özel payetli abiye', 321, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=8044', 'Nikah şahidi kombinasyonları', 198, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=9519', 'Kına gecesi lila elbise', 267, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=2479', 'Sünnet töreni anne kombini', 189, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,dress,evening,elegant?lock=2077', 'Yılbaşı partisi parlak stil', 434, 'davet' FROM public.users WHERE email = 'stilist.burcu@negiysem.com';

INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=25', 'İş görüşmesi için lacivert takım', 178, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=7141', 'Ofis için beyaz bluz + pantolon', 145, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=6546', 'Power suit - güçlü iş kadını', 267, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=1396', 'Bej blazer ile profesyonel şıklık', 198, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=3564', 'Sunum günü için etkili kombin', 156, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=740', 'Yapılandırılmış elbise - toplantı', 134, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=6819', 'Kurumsal iş yemeği kıyafeti', 112, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=6992', 'Midi kalem etek + gömlek', 189, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=7277', 'Office casual - cuma kombin', 165, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
INSERT INTO public.feed_posts (user_id, image_path, caption, likes_count, category)
SELECT id, 'https://loremflickr.com/600/800/fashion,outfit,office,suit?lock=3671', 'Konferans günü profesyonel stil', 223, 'ofis' FROM public.users WHERE email = 'stilist.ceren@negiysem.com';
