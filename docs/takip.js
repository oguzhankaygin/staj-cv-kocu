import {
  durumlar, ilanCikar, ilanCsv, ilanEkle, ilanIcs, ilanIstemi, ilanSiniri, ilanUyumu, ilanYaniti, kalanGun,
} from './lib/ilan.js';

const saklamaAnahtari = 'staj-cv-kocu-ilan-takibi';
const alanSinirlari = { baslik: 160, tarih: 10, konum: 500, sekil: 100, sure: 100, ucret: 100, metin: 30_000, not: 2000 };

export function takipBaslat({ id, oge, cv, claudeAc }) {
  const metin = id('takip-metin');
  const form = id('takip-ekle');
  const onay = id('takip-onay');
  const tarih = id('takip-tarih');
  const durum = id('takip-durum');
  const islemDurum = id('takip-islem-durum');
  const saklamaDurum = id('takip-saklama-durum');
  const yanitDurum = id('takip-yanit-durum');
  const istem = id('takip-istem');
  const secilenler = new Set();
  let ilanlar = [];
  let taslak = null;

  try {
    const kayit = JSON.parse(localStorage.getItem(saklamaAnahtari));
    if (kayit?.onay === true && Array.isArray(kayit.ilanlar)) {
      ilanlar = kayit.ilanlar.slice(0, ilanSiniri).filter(ilan =>
        typeof ilan?.id === 'string' && /^[\w-]{1,40}$/.test(ilan.id)
        && durumlar.includes(ilan.durum) && Object.entries(alanSinirlari).every(([alan, sinir]) =>
          typeof ilan[alan] === 'string' && ilan[alan].length <= sinir)
        && (!ilan.tarih || /^\d{4}-\d{2}-\d{2}$/.test(ilan.tarih)));
      if (typeof kayit.cv === 'string' && !cv.value) cv.value = kayit.cv.slice(0, 30_000);
      onay.checked = true;
    }
  } catch {
    saklamaDurum.textContent = 'Saklanan takip verileri okunamadı.';
  }

  function sakla() {
    try {
      if (onay.checked) {
        localStorage.setItem(saklamaAnahtari, JSON.stringify({ onay: true, ilanlar, cv: cv.value }));
      } else {
        localStorage.removeItem(saklamaAnahtari);
      }
      return true;
    } catch {
      saklamaDurum.textContent = onay.checked
        ? 'Veriler tarayıcıya kaydedilemedi.' : 'Tarayıcıdaki kayıt silinemedi.';
      return false;
    }
  }

  function istemiTemizle() {
    istem.value = '';
    id('takip-istem-alani').hidden = true;
    islemDurum.textContent = '';
  }

  function guncelListe() {
    const bugun = new Date();
    return ilanlar.map(ilan => ({ ...ilan, uyum: ilanUyumu(ilan, cv.value), gun: kalanGun(ilan.tarih, bugun) }));
  }

  function secilenIlanlar() {
    return ilanlar.filter(ilan => secilenler.has(ilan.id));
  }

  function dugmeleriGuncelle() {
    id('takip-csv').disabled = !ilanlar.length;
    id('takip-ics').disabled = !secilenIlanlar().some(ilan => ilan.tarih);
    id('takip-claude').disabled = !secilenler.size;
  }

  function etiketiEkle(alan, ad) {
    const etiket = oge('label', ad, 'ekran-okuyucu');
    etiket.htmlFor = alan.id;
    return etiket;
  }

  function satirOlustur(ilan) {
    const satir = oge('tr');
    const secim = oge('input');
    secim.type = 'checkbox';
    secim.id = 'takip-sec-' + ilan.id;
    secim.checked = secilenler.has(ilan.id);
    secim.addEventListener('change', () => {
      if (secim.checked) secilenler.add(ilan.id);
      else secilenler.delete(ilan.id);
      istemiTemizle();
      dugmeleriGuncelle();
    });
    const secimHucre = oge('td');
    secimHucre.append(etiketiEkle(secim, ilan.baslik + ' ilanını seç'), secim);

    const adHucre = oge('th', ilan.baslik);
    adHucre.scope = 'row';
    const duzenle = oge('button', 'Düzenle', 'secondary');
    duzenle.type = 'button';
    duzenle.setAttribute('aria-label', ilan.baslik + ' ilanını düzenle');
    duzenle.addEventListener('click', () => {
      metin.value = ilan.metin;
      formuAc(ilan);
    });
    adHucre.append(duzenle);

    const tarihHucre = oge('td');
    if (!ilan.tarih) tarihHucre.textContent = 'Son tarih yok';
    else {
      const zaman = oge('time', ilan.tarih.split('-').reverse().join('.'));
      zaman.dateTime = ilan.tarih;
      const kalan = ilan.gun < 0 ? `Geçmiş · ${-ilan.gun} gün önce`
        : ilan.gun === 0 ? 'Bugün son gün' : `${ilan.gun} gün kaldı`;
      const uyari = ilan.gun < 0 ? 'takip-gecmis' : ilan.gun < 7 ? 'takip-yakin' : '';
      tarihHucre.append(zaman, oge('div', kalan, uyari));
    }

    const konumHucre = oge('td', [ilan.konum, ilan.sekil].filter(Boolean).join(' · ') || 'Belirtilmemiş');
    const ipuclari = [ilan.sure, ilan.ucret].filter(Boolean).join(' · ');
    if (ipuclari) konumHucre.append(oge('div', ipuclari, 'muted'));
    const uyumHucre = oge('td', !ilan.uyum.cvVar ? 'CV ekleyin'
      : ilan.uyum.kapsama === null ? 'Beceri bulunamadı' : `% ${ilan.uyum.kapsama}`);
    if (ilan.uyum.eksik.length) uyumHucre.append(oge('div', 'Eksik zorunlu beceriler · ' + ilan.uyum.eksik.join(', ')));

    const durumSecimi = oge('select');
    durumSecimi.id = 'takip-durum-' + ilan.id;
    for (const ad of durumlar) durumSecimi.append(oge('option', ad));
    durumSecimi.value = ilan.durum;
    durumSecimi.addEventListener('change', () => satiriGuncelle(ilan.id, 'durum', durumSecimi.value));
    const durumHucre = oge('td');
    durumHucre.append(etiketiEkle(durumSecimi, ilan.baslik + ' ilanının durumu'), durumSecimi);

    const not = oge('textarea');
    not.id = 'takip-not-' + ilan.id;
    not.rows = 2;
    not.maxLength = alanSinirlari.not;
    not.value = ilan.not;
    not.addEventListener('input', () => satiriGuncelle(ilan.id, 'not', not.value));
    const notHucre = oge('td');
    notHucre.append(etiketiEkle(not, ilan.baslik + ' ilanının notu'), not);

    satir.append(secimHucre, adHucre, tarihHucre, konumHucre, uyumHucre, durumHucre, notHucre);
    return satir;
  }

  function satiriGuncelle(kimlik, alan, deger) {
    const ilan = ilanlar.find(kayit => kayit.id === kimlik);
    ilan[alan] = deger;
    if (onay.checked) sakla();
  }

  function tabloyuGoster() {
    const liste = guncelListe();
    const tariheGore = (a, b) => (a.gun ?? Infinity) - (b.gun ?? Infinity);
    const uyumaGore = (a, b) => (b.uyum.kapsama ?? -1) - (a.uyum.kapsama ?? -1) || tariheGore(a, b);
    liste.sort(id('takip-sirala').value === 'uyum' ? uyumaGore : tariheGore);
    id('takip-satirlar').replaceChildren(...liste.map(satirOlustur));
    id('takip-sayac').textContent = `${ilanlar.length} / ${ilanSiniri} ilan`;
    dugmeleriGuncelle();
  }

  function tarihUyarisi() {
    id('takip-tarih-uyari').textContent = tarih.value ? '' : 'Son başvuru tarihi yok. Biliyorsanız tarih ekleyin.';
  }

  function formuAc(ilan) {
    taslak = ilan;
    id('takip-ad').value = ilan.baslik;
    tarih.value = ilan.tarih;
    id('takip-konum').value = ilan.konum;
    id('takip-sekil').value = ilan.sekil;
    id('takip-ipuclari').textContent = [ilan.sure, ilan.ucret].filter(Boolean).join(' · ');
    id('takip-kaydet').textContent = ilan.id ? 'Değişiklikleri kaydet' : 'Takibe ekle';
    form.hidden = false;
    durum.textContent = '';
    tarihUyarisi();
    id('takip-ad').focus();
  }

  function formuKapat(odakla = true) {
    taslak = null;
    form.reset();
    form.hidden = true;
    metin.value = '';
    if (odakla) metin.focus();
  }

  tarih.addEventListener('input', tarihUyarisi);
  id('takip-vazgec').addEventListener('click', () => formuKapat());
  id('takip-cikar').addEventListener('submit', olay => {
    olay.preventDefault();
    if (!metin.value.trim()) {
      durum.textContent = 'İlan metnini yapıştırın.';
      metin.focus();
      return;
    }
    formuAc({ id: taslak?.id, ...ilanCikar(metin.value) });
  });

  form.addEventListener('submit', olay => {
    olay.preventDefault();
    const baslik = id('takip-ad').value.trim();
    if (!baslik || !metin.value.trim()) {
      durum.textContent = 'İlan metnini ve kurum / pozisyon alanını doldurun.';
      (baslik ? metin : id('takip-ad')).focus();
      return;
    }
    const { sure, ucret } = ilanCikar(metin.value);
    const veriler = {
      metin: metin.value, baslik, tarih: tarih.value, sure, ucret,
      konum: id('takip-konum').value.trim(), sekil: id('takip-sekil').value.trim(),
    };
    try {
      if (taslak.id) ilanlar = ilanlar.map(ilan => ilan.id === taslak.id ? { ...ilan, ...veriler } : ilan);
      else ilanlar = ilanEkle(ilanlar, { ...veriler, id: crypto.randomUUID(), durum: durumlar[0], not: '' });
    } catch (hata) {
      durum.textContent = hata.message;
      return;
    }
    durum.textContent = taslak.id ? 'İlan güncellendi.' : 'İlan takibe eklendi.';
    formuKapat();
    istemiTemizle();
    tabloyuGoster();
    if (onay.checked) sakla();
  });

  onay.addEventListener('change', () => {
    if (sakla()) saklamaDurum.textContent = onay.checked
      ? 'İlanlar ve CV bu tarayıcıda saklanıyor.' : 'Tarayıcıdaki kayıt silindi.';
  });
  function cvDegisti() {
    istemiTemizle();
    tabloyuGoster();
    if (onay.checked) sakla();
  }
  cv.addEventListener('input', () => {
    istemiTemizle();
    if (onay.checked) sakla();
  });
  cv.addEventListener('change', tabloyuGoster);
  for (const dugme of ['ornek', 'temizle']) id(dugme).addEventListener('click', cvDegisti);

  id('takip-sil').addEventListener('click', () => {
    if (!window.confirm('Takip edilen tüm ilanlar, notlar ve sayfadaki CV silinsin mi?')) return;
    onay.checked = false;
    ilanlar = [];
    secilenler.clear();
    formuKapat(false);
    istemiTemizle();
    id('takip-yanit').value = '';
    id('takip-sonuc').replaceChildren();
    yanitDurum.textContent = '';
    durum.textContent = '';
    cv.value = '';
    cv.dispatchEvent(new Event('input'));
    tabloyuGoster();
    if (sakla()) saklamaDurum.textContent = 'İlanlar, notlar ve CV silindi.';
  });

  function indir(icerik, tur, ad) {
    const adres = URL.createObjectURL(new Blob([icerik], { type: tur }));
    const baglanti = oge('a');
    baglanti.href = adres;
    baglanti.download = ad;
    baglanti.click();
    setTimeout(() => URL.revokeObjectURL(adres), 1000);
  }

  id('takip-sirala').addEventListener('change', tabloyuGoster);
  id('takip-csv').addEventListener('click', () => indir(ilanCsv(guncelListe()), 'text/csv;charset=utf-8', 'ilanlar.csv'));
  id('takip-ics').addEventListener('click', () => {
    const secili = secilenIlanlar();
    indir(ilanIcs(secili), 'text/calendar;charset=utf-8', 'son-basvuru.ics');
    const tarihsiz = secili.filter(ilan => !ilan.tarih).length;
    islemDurum.textContent = tarihsiz ? `${tarihsiz} tarihsiz ilan takvime eklenmedi.` : 'Takvim dosyası hazırlandı.';
  });

  id('takip-claude').addEventListener('click', () => {
    if (!cv.value.trim()) {
      islemDurum.textContent = 'Claude sıralaması için CV ekleyin.';
      cv.focus();
      return;
    }
    claudeAc(ilanIstemi(secilenIlanlar(), cv.value), istem, id('takip-istem-alani'), islemDurum);
  });

  id('takip-yanit-formu').addEventListener('submit', olay => {
    olay.preventDefault();
    const sonucAlani = id('takip-sonuc');
    sonucAlani.replaceChildren();
    try {
      const { sonuc, atilan } = ilanYaniti(id('takip-yanit').value, ilanlar);
      const siralama = oge('ol');
      for (const satir of sonuc.siralama) {
        const ilan = ilanlar.find(ilan => ilan.id === satir.ilan_id);
        const eleman = oge('li');
        eleman.value = satir.oncelik;
        eleman.append(oge('h3', ilan.baslik), oge('p', satir.gerekce), oge('p', satir.strateji));
        siralama.append(eleman);
      }
      sonucAlani.append(oge('h3', 'Genel tavsiye'), oge('p', sonuc.genel_tavsiye), siralama);
      yanitDurum.textContent = `${sonuc.siralama.length} ilan sıralandı. ${atilan} geçersiz öğe çıkarıldı.`;
    } catch (hata) {
      yanitDurum.textContent = hata.message;
    }
  });

  tabloyuGoster();
}
