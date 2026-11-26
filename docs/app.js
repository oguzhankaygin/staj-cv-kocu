import { eslestir } from './lib/eslestir.js';
import { promptUret, yanitAyristir } from './lib/claude.js';
import { ornekIlan, ornekCv } from './lib/ornek.js';

const id = ad => document.getElementById(ad);
const ilan = id('ilan');
const cv = id('cv');
const maske = id('maske');
const istem = id('istem');

function oge(tur, metin, sinif) {
  const dugum = document.createElement(tur);
  if (metin !== undefined) dugum.textContent = metin;
  if (sinif) dugum.className = sinif;
  return dugum;
}

function girdiHazir() {
  const bos = [ilan, cv].find(alan => !alan.value.trim());
  id('girdi-durum').textContent = bos ? 'İlan ve CV metnini girin.' : '';
  if (bos) bos.focus();
  return !bos;
}

function liste(satirlar) {
  const ul = oge('ul');
  ul.append(...satirlar.map(satir => oge('li', satir)));
  return ul;
}

function kutu(baslik, satirlar, bosMesaj) {
  const bolum = oge('div', undefined, 'result-box');
  bolum.append(oge('h3', baslik), satirlar.length ? liste(satirlar) : oge('p', bosMesaj));
  return bolum;
}

function analizEt() {
  const sonuc = eslestir(ilan.value, cv.value);
  const ozet = sonuc.kapsama === null ? 'İlanda sözlükte yer alan bir beceri bulunamadı.'
    : `% ${sonuc.kapsama} kapsama · ${sonuc.eslesen.length}/${sonuc.toplam} beceri`;
  const yuzde = deger => deger === null ? 'Madde bulunamadı' : `%${deger}`;
  const kontrol = sonuc.cv;
  const grid = oge('div', undefined, 'result-grid');
  const beceriSatirlari = beceriler => beceriler.map(b => `${b.ad} · ${b.kategori} · ${b.oncelik}`);
  grid.append(
    kutu('Eksik beceriler', beceriSatirlari(sonuc.eksik), 'Eksik beceri bulunamadı.'),
    kutu('Eşleşen beceriler', beceriSatirlari(sonuc.eslesen), 'Eşleşen beceri bulunamadı.'),
    kutu('CV biçimi', [
      `İletişim bilgisi · ${kontrol.iletisimVar ? 'Var' : 'Geçerli e-posta veya telefon bulunamadı'}`,
      `E-posta · ${kontrol.epostaVar ? (kontrol.epostaGecerli ? 'Biçim uygun' : 'Biçimi kontrol edin') : 'Bulunamadı'}`,
      `Uzunluk · ${kontrol.kelimeSayisi} kelime · ${kontrol.uzunluk}`,
      `Sayı içeren maddeler · ${yuzde(kontrol.olculebilirOran)}`,
      `Eylem fiiliyle başlayan maddeler · ${yuzde(kontrol.eylemOrani)}`,
      `Zayıf ifadeler · ${kontrol.zayifIfadeler.join(', ') || 'Bulunamadı'}`,
    ])
  );
  id('eslesme').replaceChildren(oge('p', ozet, 'score'), grid);
  id('analiz').hidden = false;
  id('analiz-baslik').focus();
}

function istemiKaldir() {
  istem.value = '';
  id('istem-alani').hidden = true;
  id('claude-durum').textContent = '';
}

function geriBildirimiKaldir() {
  id('geri-bildirim').hidden = true;
  id('genel').textContent = '';
  id('sekmeler').replaceChildren();
  id('paneller').replaceChildren();
  id('yanit-durum').textContent = '';
}

function sonuclariKaldir() {
  id('analiz').hidden = true;
  id('eslesme').replaceChildren();
  id('yanit').value = '';
  istemiKaldir();
  geriBildirimiKaldir();
  id('girdi-durum').textContent = '';
}

id('girdi').addEventListener('submit', olay => {
  olay.preventDefault();
  if (girdiHazir()) analizEt();
});

for (const alan of [ilan, cv]) alan.addEventListener('input', sonuclariKaldir);
maske.addEventListener('change', istemiKaldir);
id('ornek').addEventListener('click', () => {
  sonuclariKaldir();
  ilan.value = ornekIlan;
  cv.value = ornekCv;
  analizEt();
});
id('temizle').addEventListener('click', () => {
  id('girdi').reset();
  maske.checked = true;
  sonuclariKaldir();
  ilan.focus();
  id('girdi-durum').textContent = 'Sayfadaki metinler ve sonuçlar temizlendi.';
});

id('claude-ac').addEventListener('click', async () => {
  if (!girdiHazir()) return;
  const hazirIstem = promptUret(ilan.value, cv.value, maske.checked);
  istem.value = hazirIstem;
  id('istem-alani').hidden = false;
  let kopyalandi = false;
  // Her iki işlemi de tıklama sırasında başlat, açılır pencere izni beklerken sona ermesin.
  const kopyala = (async () => navigator.clipboard?.writeText(hazirIstem))();
  window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer');
  try {
    await kopyala;
    kopyalandi = Boolean(navigator.clipboard);
  } catch {
    kopyalandi = false;
  }
  if (istem.value !== hazirIstem) return;
  id('claude-durum').textContent = kopyalandi ? 'İstem panoya kopyalandı.'
    : 'Otomatik kopyalama kullanılamadı. Seçili istemi kopyalayıp Claude’a yapıştırın.';
  if (!kopyalandi) {
    istem.focus();
    istem.select();
  }
});

function pratik(sorular) {
  const alan = oge('section', undefined, 'practice');
  const baslik = oge('h3', 'Mülakat pratiği');
  const soru = oge('p');
  soru.tabIndex = -1;
  const etiket = oge('label', 'Yanıtınız');
  const yanit = oge('textarea');
  yanit.rows = 4;
  yanit.id = 'pratik-yanit';
  etiket.htmlFor = yanit.id;
  const onceki = oge('button', 'Önceki soru', 'secondary');
  const sonraki = oge('button', 'Sonraki soru', 'secondary');
  const gezinme = oge('div', undefined, 'actions');
  gezinme.append(onceki, sonraki);
  const kontrol = oge('fieldset');
  kontrol.append(oge('legend', 'STAR öz değerlendirmesi'));
  const olcutler = ['Durumu anlattım.', 'Görevimi açıkladım.', 'Yaptığım eylemi anlattım.', 'Sonucu açıkladım.'];
  const durumlar = sorular.map(() => ({ yanit: '', isaretler: olcutler.map(() => false) }));
  let sira = 0;
  const kutular = olcutler.map((metin, i) => {
    const label = oge('label', undefined, 'check');
    const input = oge('input');
    input.type = 'checkbox';
    input.addEventListener('change', () => { durumlar[sira].isaretler[i] = input.checked; });
    label.append(input, oge('span', metin));
    kontrol.append(label);
    return input;
  });
  yanit.addEventListener('input', () => { durumlar[sira].yanit = yanit.value; });
  function goster() {
    soru.textContent = `${sira + 1}/${sorular.length} · ${sorular[sira].soru}`;
    yanit.value = durumlar[sira].yanit;
    kutular.forEach((kutu, i) => { kutu.checked = durumlar[sira].isaretler[i]; });
    onceki.disabled = sira === 0;
    sonraki.disabled = sira === sorular.length - 1;
  }
  for (const [dugme, yon] of [[onceki, -1], [sonraki, 1]]) {
    dugme.addEventListener('click', () => {
      sira += yon;
      goster();
      soru.focus();
    });
  }
  alan.append(baslik, soru, gezinme, etiket, yanit, kontrol);
  goster();
  return alan;
}

function kart(baslik, ...satirlar) {
  const eleman = oge('article');
  if (baslik) eleman.append(oge('h3', baslik));
  eleman.append(...satirlar);
  return eleman;
}

function geriBildirimGoster(sonuc) {
  id('genel').textContent = sonuc.genel_degerlendirme;
  const veriler = [
    ['Eksikler', sonuc.eksik_beceriler.map(b => kart(b.beceri, oge('p', b.neden_onemli), oge('p', b.nasil_gosterilir)))],
    ['Madde önerileri', sonuc.madde_onerileri.map(m => kart('', oge('blockquote', m.alinti), oge('p', m.sorun), oge('p', m.oneri)))],
    ['Mülakat', sonuc.mulakat_sorulari.map(s => kart(s.soru, oge('p', s.star_iskeleti)))],
    ['Ön yazı', [oge('p', sonuc.on_yazi_acilisi)]],
  ];
  if (sonuc.mulakat_sorulari.length) veriler[2][1].unshift(pratik(sonuc.mulakat_sorulari));

  const sekmeler = [];
  const paneller = [];
  function sec(sira, odakla) {
    sekmeler.forEach((sekme, i) => {
      sekme.setAttribute('aria-selected', String(i === sira));
      sekme.tabIndex = i === sira ? 0 : -1;
      paneller[i].hidden = i !== sira;
    });
    if (odakla) sekmeler[sira].focus();
  }

  veriler.forEach(([ad, icerik], i) => {
    const sekme = oge('button', ad);
    sekme.id = `sekme-${i}`;
    sekme.setAttribute('role', 'tab');
    const panel = oge('section');
    panel.id = `panel-${i}`;
    panel.tabIndex = 0;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', sekme.id);
    sekme.setAttribute('aria-controls', panel.id);
    panel.append(...(icerik.length ? icerik : [oge('p', 'Bu bölümde gösterilecek kayıt yok.')]));
    sekme.addEventListener('click', () => sec(i, true));
    sekme.addEventListener('keydown', olay => {
      const hedefler = { ArrowRight: (i + 1) % veriler.length, ArrowLeft: (i + veriler.length - 1) % veriler.length,
        Home: 0, End: veriler.length - 1 };
      if (!Object.hasOwn(hedefler, olay.key)) return;
      olay.preventDefault();
      sec(hedefler[olay.key], true);
    });
    sekmeler.push(sekme);
    paneller.push(panel);
  });
  id('sekmeler').replaceChildren(...sekmeler);
  id('paneller').replaceChildren(...paneller);
  sec(0, false);
  id('geri-bildirim').hidden = false;
  id('geri-baslik').focus();
}

id('yanit-formu').addEventListener('submit', olay => {
  olay.preventDefault();
  geriBildirimiKaldir();
  if (!cv.value.trim()) {
    id('yanit-durum').textContent = 'Alıntıları doğrulamak için CV metnini girin.';
    cv.focus();
    return;
  }
  try {
    const { sonuc, atilan } = yanitAyristir(id('yanit').value, cv.value);
    geriBildirimGoster(sonuc);
    id('yanit-durum').textContent = atilan
      ? `${atilan} madde önerisi alıntı denetiminden geçemediği için çıkarıldı.` : 'Yanıt doğrulandı.';
  } catch (hata) {
    id('yanit-durum').textContent = hata.message;
    id('yanit').focus();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
