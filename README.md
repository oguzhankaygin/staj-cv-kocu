# Staj ve CV Başvuru Koçu

Staj ve ilk iş ilanlarını CV’nizle karşılaştırın, eksik becerileri görün ve mülakat pratiği yapın.

[Tarayıcıda kullan](https://oguzhankaygin.github.io/staj-cv-kocu/)

Telefonda tarayıcı menüsündeki **Ana ekrana ekle** (iPhone’da Paylaş → Ana Ekrana Ekle) seçeneğiyle uygulama gibi açabilirsiniz; bir kez açıldıktan sonra internetsiz de çalışır.

## Nasıl çalışır?

1. **Çevrimdışı eşleştirme.** İlanı ve CV’yi düz metin olarak yapıştırıp **CV’yi karşılaştır** düğmesine basın. Araç, becerileri ve CV biçimini tarayıcınızda inceler. Kurgusal bir yazılım stajıyla denemek için **Örnek yükle** düğmesini kullanın.
2. **Claude’da aç.** Araç, Türkçe istemi panoya kopyalar ve Claude’u yeni sekmede açar. Otomatik kopyalama kullanılamazsa hazır istemi elle kopyalayın. İstemi kendi Claude hesabınızdaki yeni sohbete yapıştırıp gönderin.
3. **Claude’un yanıtını yapıştır.** JSON yanıtının tamamını yapıştırıp **Yanıtı incele** düğmesine basın. Eksik becerileri, CV madde önerilerini, mülakat sorularını ve ön yazı açılışını sekmelerde inceleyin. Mülakat bölümünde sorulara kendi yanıtlarınızı yazıp STAR kontrol listesini kullanabilirsiniz.

## İlan takibi

**İlan takibi** bölümüne ilan metnini yapıştırıp bilgileri çıkarın. Kurum ve pozisyon başlığını, konumu, çalışma şeklini ve son tarihi kontrol edip kaydedin. Tarih eksikse elle ekleyebilirsiniz. Yıl yazılmamışsa bugün veya sonrasındaki ilk geçerli tarih kullanılır.

En fazla 100 ilanı son tarihe veya CV uyumuna göre sıralayın. CV’nizi **İlan ve CV** bölümüne bir kez ekleyerek her ilanın kapsama oranını ve eksik zorunlu becerilerini görün. Durum ve notları tablodan güncelleyin. Tüm listeyi CSV olarak, seçili ilanların son tarihlerini ise 1 ve 3 gün öncesine hatırlatma içeren gün boyu etkinlikler olarak (.ics) indirin.

Toplu önceliklendirme için ilanları seçip **Seçili ilanları Claude’da aç** düğmesine basın. İstem, maskelenmiş başlıkları, tanınan gereksinim bölümlerini ve CV’yi en fazla 30.000 karaktere sığdırır. Claude’un JSON yanıtını sıralama alanına yapıştırarak öncelikleri, gerekçeleri ve başvuru stratejilerini inceleyin. Geçersiz öğelerin sayısı sonuçta gösterilir.

## Gizlilik

Sayfa girdi ve yanıtları tarayıcıda işler. **Temizle** CV karşılaştırması alanındaki metinleri ve sonuçları siler. İlanlar, notlar ve CV yalnızca takip bölümündeki saklama kutusunu işaretlediğinizde localStorage’a yazılır. İşareti kaldırmak saklanan kopyayı siler. **Verilerimi sil** takip verilerini ve CV’yi hem sayfadan hem tarayıcı kaydından kaldırır. İşletim sistemi panosuna kopyalanan istemi pano geçmişinizden ayrıca kaldırabilirsiniz.

Tek ilan isteminde maskeleme varsayılan olarak açıktır. Toplu ilan isteminde maskeleme her zaman uygulanır. İlan ve CV’deki yaygın e-posta, telefon, 11 haneli kimlik numarası ve adres satırı biçimlerini `[GİZLİ]` ile değiştirir. Maskeleme adları ve tüm adres biçimlerini yakalayamaz. Paylaşmadan önce hazır istemi okuyun. İstemi Claude’a yapıştırıp gönderirseniz paylaştığınız metin Claude’a aktarılır.

## Sınırlamalar

Beceri kapsaması yerel sözlüğe ve dil sezgisellerine dayanır. Bölüm başlıkları, eşanlamlılar ve Türkçe ekler her yazımda yakalanmayabilir. Beceri geçişleri yetkinliğin düzeyini göstermez. CV uzunluğu için kullanılan 100–650 kelime aralığı ve madde ölçümleri genel göstergelerdir. Kapsama oranı bir işverenin ATS puanını veya başvuru sonucunu tahmin etmez. Alıntıları CV’de birebir geçmeyen öneriler, maskeli alıntılar da dahil olmak üzere, sonuçtan çıkarılır. Claude’un önerilerini kullanmadan önce doğrulayın. İlan bilgileri metindeki anahtar kelimelerden çıkarılır. Kaydetmeden önce özellikle son başvuru tarihini ve konumu kontrol edin. Takvim uygulamanızın içe aktarılan hatırlatmaları desteklediğini doğrulayın.

## Yerel çalıştırma ve test

```sh
python3 -m http.server -d docs
npm test
```

Tarayıcıda `http://localhost:8000` adresini açın. Testleri Node.js 22 ile çalıştırın.

## Katkı

Beceri ve eşanlamlılar `docs/lib/beceriler.js` dosyasında yer alır. Değişiklikleri `node --test tests/` ile doğrulayın. Site dosyaları `docs/` dizininden GitHub Pages üzerinde yayınlanabilir. Uygulama derleme ve bağımlılık kurulumu gerektirmez.

Lisans MIT.

## Gerekli bilgiler

Yok.
