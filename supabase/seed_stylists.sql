-- 5 Örnek Stilist Hesabı
-- ADIM 1: Önce Supabase Dashboard > Authentication > Users'dan bu 5 kullanıcıyı oluşturun:
--   Email: stilist1@negiysem.com, Password: Test1234!
--   Email: stilist2@negiysem.com, Password: Test1234!
--   Email: stilist3@negiysem.com, Password: Test1234!
--   Email: stilist4@negiysem.com, Password: Test1234!
--   Email: stilist5@negiysem.com, Password: Test1234!
--
-- ADIM 2: Dashboard'dan oluşturduğunuz kullanıcıların UUID'lerini alın
-- ADIM 3: Aşağıdaki SQL'i Dashboard SQL Editor'da çalıştırın (UUID'leri değiştirin)

-- NOT: handle_new_user trigger otomatik olarak users tablosuna kayıt oluşturacak.
-- Sadece name güncellemesi ve stylist_profiles oluşturması gerekiyor.

-- Kullanıcı isimlerini güncelle
UPDATE public.users SET name = 'Ayşe Yılmaz', instagram_url = '@aysestilist'
WHERE email = 'stilist1@negiysem.com';

UPDATE public.users SET name = 'Elif Kaya', instagram_url = '@elifmoda'
WHERE email = 'stilist2@negiysem.com';

UPDATE public.users SET name = 'Zeynep Demir', instagram_url = '@zeynepstyle'
WHERE email = 'stilist3@negiysem.com';

UPDATE public.users SET name = 'Selin Çelik', instagram_url = '@selintarz'
WHERE email = 'stilist4@negiysem.com';

UPDATE public.users SET name = 'Merve Arslan', instagram_url = '@mervekombinler'
WHERE email = 'stilist5@negiysem.com';

-- Stilist profilleri oluştur
INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Moda tasarımcısı ve kişisel stilist. 10 yıllık deneyim ile gardırobunuzu yeniden keşfedin.',
       '10 yıl moda sektörü deneyimi. İstanbul Moda Akademisi mezunu.',
       '@aysestilist', 150.00, 4.8, 42, true
FROM public.users WHERE email = 'stilist1@negiysem.com';

INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Minimalist ve modern tarzları birleştiren stilist. Kapsül gardırop uzmanı.',
       '5 yıl kişisel stilistlik deneyimi. Sustainable fashion odaklı.',
       '@elifmoda', 120.00, 4.6, 28, true
FROM public.users WHERE email = 'stilist2@negiysem.com';

INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Streetwear ve casual kombinlerin uzmanı. Gençlere özel kombin önerileri.',
       '3 yıl moda blog yazarlığı, 2 yıl kişisel stilistlik.',
       '@zeynepstyle', 100.00, 4.5, 19, true
FROM public.users WHERE email = 'stilist3@negiysem.com';

INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'Özel gün ve davet kıyafetleri konusunda uzman stilist. Şıklığınızı garanti ediyorum.',
       '7 yıl moda danışmanlığı. Düğün ve özel etkinlik stilisti.',
       '@selintarz', 200.00, 4.9, 56, true
FROM public.users WHERE email = 'stilist4@negiysem.com';

INSERT INTO public.stylist_profiles (user_id, bio, cv_text, instagram_url, price_per_outfit, rating, total_reviews, is_verified)
SELECT id, 'İş hayatı ve ofis kombinleri uzmanı. Profesyonel görünümünüzü bir üst seviyeye taşıyın.',
       '4 yıl kurumsal moda danışmanlığı deneyimi.',
       '@mervekombinler', 130.00, 4.7, 35, true
FROM public.users WHERE email = 'stilist5@negiysem.com';
