# Staj ve CV Başvuru Koçu

Staj ve ilk iş ilanlarını CV’nizle karşılaştırın, eksik becerileri görün ve mülakat pratiği yapın.

[Tarayıcıda kullan](https://oguzhankaygin.github.io/staj-cv-kocu/)

Telefonda tarayıcı menüsündeki **Ana ekrana ekle** (iPhone’da Paylaş → Ana Ekrana Ekle) seçeneğiyle uygulama gibi açabilirsiniz; bir kez açıldıktan sonra internetsiz de çalışır.

## Nasıl çalışır?

1. **Çevrimdışı eşleştirme.** İlanı ve CV’yi düz metin olarak yapıştırıp **CV’yi karşılaştır** düğmesine basın. Araç, becerileri ve CV biçimini tarayıcınızda inceler. Kurgusal bir yazılım stajıyla denemek için **Örnek yükle** düğmesini kullanın.
2. **Claude’da aç.** Araç, Türkçe istemi panoya kopyalar ve Claude’u yeni sekmede açar. Otomatik kopyalama kullanılamazsa hazır istemi elle kopyalayın. İstemi kendi Claude hesabınızdaki yeni sohbete yapıştırıp gönderin.
3. **Claude’un yanıtını yapıştır.** JSON yanıtının tamamını yapıştırıp **Yanıtı incele** düğmesine basın. Eksik becerileri, CV madde önerilerini, mülakat sorularını ve ön yazı açılışını sekmelerde inceleyin. Mülakat bölümünde sorulara kendi yanıtlarınızı yazıp STAR kontrol listesini kullanabilirsiniz.

## Gizlilik

Sayfa, girdi ve yanıtları tarayıcı belleğinde işler ve sunucuya göndermez. **Temizle** sayfadaki metinleri ve sonuçları siler. İşletim sistemi panosuna kopyalanan istemi pano geçmişinizden ayrıca kaldırabilirsiniz.

İstem oluştururken maskeleme varsayılan olarak açıktır. İlan ve CV’deki yaygın e-posta, telefon, 11 haneli kimlik numarası ve adres satırı biçimlerini `[GİZLİ]` ile değiştirir. Maskeleme adları ve tüm adres biçimlerini yakalayamaz. Paylaşmadan önce hazır istemi okuyun. İstemi Claude’a yapıştırıp gönderirseniz paylaştığınız metin Claude’a aktarılır.

## Sınırlamalar

Beceri kapsaması yerel sözlüğe ve dil sezgisellerine dayanır. Bölüm başlıkları, eşanlamlılar ve Türkçe ekler her yazımda yakalanmayabilir. Beceri geçişleri yetkinliğin düzeyini göstermez. CV uzunluğu için kullanılan 100–650 kelime aralığı ve madde ölçümleri genel göstergelerdir. Kapsama oranı bir işverenin ATS puanını veya başvuru sonucunu tahmin etmez. Alıntıları CV’de birebir geçmeyen öneriler, maskeli alıntılar da dahil olmak üzere, sonuçtan çıkarılır. Claude’un önerilerini kullanmadan önce doğrulayın.

## Katkı

Beceri ve eşanlamlılar `docs/lib/beceriler.js` dosyasında yer alır. Değişiklikleri `node --test tests/` ile doğrulayın. Site dosyaları `docs/` dizininden GitHub Pages üzerinde yayınlanabilir. Uygulama derleme ve bağımlılık kurulumu gerektirmez.

Lisans MIT.
