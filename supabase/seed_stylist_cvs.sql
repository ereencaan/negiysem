-- =============================================
-- 5 Stilist için detaylı CV / Eğitim ve Deneyim bilgileri
-- stylist_profiles.cv_text alanını günceller
-- =============================================

-- Selin Aydın - Klasik / modern, profesyonel deneyim
UPDATE public.stylist_profiles
SET cv_text = 'EĞİTİM
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
• Gardırop analizi ve planlama

SERTİFİKALAR
• AICI (Association of Image Consultants International) sertifikalı
• Renk Analizi Uzmanı (House of Colour)'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.selin@negiysem.com');

-- Deniz Korkmaz - Minimalist / kapsül gardırop uzmanı
UPDATE public.stylist_profiles
SET cv_text = 'EĞİTİM
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
• Nötr ton paletleri

YAYIN VE KONUŞMALAR
• TEDx Istanbul: "Az Parça Çok Kombin" (2023)
• Hürriyet Kelebek köşe yazarı
• Fashion Sustainability Summit konuşmacısı (2024)'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.deniz@negiysem.com');

-- Ece Şahin - Streetwear / genç stil uzmanı
UPDATE public.stylist_profiles
SET cv_text = 'EĞİTİM
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
• Y2K, 90s retro akımları
• Sosyal medyaya uygun ootd fotoğraf stilizasyonu
• İkinci el & vintage alışveriş rehberliği

PROJELER
• "Üniversite Kampüs Stili" YouTube serisi (35 bölüm)
• Bershka için Gen Z kampanya koordinasyonu (2023)'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.ece@negiysem.com');

-- Burcu Yılmaz - Özel gün / düğün / davet stilisti
UPDATE public.stylist_profiles
SET cv_text = 'EĞİTİM
• İstanbul Moda Akademisi (İMA), Moda Tasarımı (Lisans, 2012-2016)
• Paris American Academy, Haute Couture Certification (2017)
• Swarovski Professional Development Program (2019)

DENEYİM
• Tuba Ergin Couture atölyesinde kalıpçı asistan (2016-2018)
• Zühre Özmen Couture ekibinde gelinlik stilisti (2018-2021)
• Freelance özel gün ve düğün stilisti (2021-günümüz)
• 150+ gelinlik denemesine eşlik, 90+ düğün kombin danışmanlığı
• 40+ nişan, kına ve özel davet organizasyonu

UZMANLIK ALANLARI
• Gelin, damat, anne ve şahit kombinleri
• Nişan & kına gecesi tematik stil
• Kokteyl ve gala davetleri
• Abiye seçimi ve vücut tipine uygun kesim önerileri
• Düğün günü genel görsel koordinasyon

ÖZEL NİTELİKLER
• Aksesuar danışmanlığı (Swarovski / La Moda Istanbul partneri)
• Makyaj ve saç tasarımı ekibi ile koordineli çalışma
• Gelinlik ikinci el & özel tasarım ağı'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.burcu@negiysem.com');

-- Ceren Özdemir - Ofis / iş hayatı stilisti
UPDATE public.stylist_profiles
SET cv_text = 'EĞİTİM
• Boğaziçi Üniversitesi, İşletme (Lisans, 2013-2017)
• London School of Image & Style, Corporate Styling Diploma (2018)
• MBA, Sabancı Üniversitesi - Markalaşma odaklı (2020-2022)

DENEYİM
• Deloitte Türkiye insan kaynakları biriminde 3 yıl kurumsal imaj danışmanı (2018-2021)
• Finansal kurumlar (Garanti BBVA, İş Bankası) için üst düzey yönetici imaj danışmanlığı (2021-günümüz)
• C-level executive''lere özel 1:1 power dressing seansları
• 250+ iş görüşmesi öncesi hazırlık seansı

UZMANLIK ALANLARI
• Kurumsal imaj ve power dressing
• İş görüşmesi / sunum kombinleri
• Executive presence & authority styling
• Konferans, kongre, seminer kıyafet danışmanlığı
• Business casual & smart casual denge

KURUMSAL HİZMETLER
• İnsan kaynakları departmanlarına toplu imaj eğitimleri
• Yeni mezunlar için ilk iş kıyafeti paketleri
• Uluslararası toplantı & yurtdışı iş seyahati dress code rehberliği

SEKTÖR BİRLİKLERİ
• AICI Türkiye üyesi
• Kurumsal İletişimciler Derneği (KİD) moda komisyonu'
WHERE user_id = (SELECT id FROM public.users WHERE email = 'stilist.ceren@negiysem.com');
