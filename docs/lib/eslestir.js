import { beceriler } from './beceriler.js';
import { iletisimBilgisi } from './gizlilik.js';

const duraklar = new Set('ve veya ile için bir bu da de olan olarak gibi daha çok en ise the a an and or for of in to with is are on as by'.split(' '));

function parcalar(metin) {
  return [...metin.normalize('NFC').replaceAll('’', "'").matchAll(/ci\/cd|a\/b|(?:\.net\b|[\p{L}\d])+(?:[.'-][\p{L}\d]+)*(?:\+\+|#)?/giu)]
    .map(([ham]) => ({ ham, normal: ham.toLowerCase().replace(/\u0307/g, '').replaceAll('ı', 'i').replace(/'.*$/, '') }));
}

function kok(sozcuk) {
  const ek = /(?:lar|ler)(?:dan|den|da|de|in|i|a|e)?$|(?:dan|den|tan|ten|nin|nun|nün|in|un|ün|da|de|ta|te)$/;
  const aday = sozcuk.replace(ek, '');
  return aday.length >= 4 ? aday : sozcuk;
}

export function tokenize(metin) {
  return parcalar(metin).map(({ normal }) => normal).filter(sozcuk => !duraklar.has(sozcuk)).map(kok);
}

const sozluk = beceriler.flatMap(beceri => beceri.adlar.map(ad => ({
  beceri, aranan: parcalar(ad).map(({ normal }) => normal),
})));

function beceriBul(metin) {
  const kelimeler = parcalar(metin);
  const bulunan = new Set();
  for (const { beceri, aranan } of sozluk) {
    if (kelimeler.some((kelime, i) => aranan.every((ad, j) => {
      const hedef = kelimeler[i + j];
      if (!hedef) return false;
      if (aranan.length === 1 && (ad === 'c' || ad === 'go' || ad === 'r')) return hedef.ham.replace(/'.*$/, '') === beceri.ad;
      return hedef.normal === ad || kok(hedef.normal) === kok(ad);
    }))) bulunan.add(beceri.ad);
  }
  return bulunan;
}

const baslik = /^\s*(?:[-*•#]+\s*)?(?:(aranan nitelikler|zorunlu nitelikler|temel nitelikler|gereklilikler|requirements|required qualifications|minimum qualifications|must[- ]have)|(?:tercih edilen nitelikler|tercih sebebi|tercihen|nice[- ]to[- ]have|preferred qualifications|preferred|bonus))(?=\s|[:：–—-]|$)\s*[:：–—-]?\s*/iu;
const digerBaslik = /^\s*(?:#+\s*)?(?:görevler|sorumluluklar|iş tanımı|yan haklar|biz kimiz|responsibilities|about us|benefits|what we offer)\s*[:：]?\s*$/iu;

function ilanBecerileri(ilan) {
  const zorunlu = new Set();
  const tercih = new Set();
  let bolum = zorunlu;
  for (const satir of ilan.split(/\r?\n/)) {
    // JS'in /i bayrağı İ↔i eşlemez; Türkçe küçük harfe çevirip öyle eşle (tr'de uzunluk korunur).
    const kucuk = satir.toLocaleLowerCase('tr');
    const giris = kucuk.match(baslik);
    if (giris) {
      const kalan = satir.slice(giris[0].length);
      const hedef = giris[1] ? zorunlu : tercih;
      if (!kalan || /[:：–—]/.test(giris[0])) bolum = hedef;
      for (const ad of beceriBul(kalan)) hedef.add(ad);
      continue;
    }
    if (digerBaslik.test(kucuk)) bolum = zorunlu;
    const hedef = /(?:\btercih sebebidir|\btercihen\b|\bnice[- ]to[- ]have\b|\ba plus\b|\bpreferred\b)/iu.test(kucuk)
      ? tercih : bolum;
    for (const ad of beceriBul(satir)) hedef.add(ad);
  }
  for (const ad of zorunlu) tercih.delete(ad);
  return { zorunlu, tercih };
}

const eylem = /^(?:geliştir\p{L}*|tasarla\p{L}*|oluştur\p{L}*|uygula\p{L}*|yönet\p{L}*|analiz ett\p{L}*|test ett\p{L}*|ölç\p{L}*|artır\p{L}*|azalt\p{L}*|hazırla\p{L}*|kurdu\p{L}*|yazd\p{L}*|tamamla\p{L}*|otomatikleştir\p{L}*|built|developed|designed|created|implemented|led|analy[sz]ed|managed|tested|increased|reduced|automated|wrote|delivered)(?!\p{L})/iu;
const zayif = /(?<!\p{L})(?:sorumluydum|yardımcı oldum|görev aldım|responsible for|helped with|assisted with)(?!\p{L})/giu;

export function cvKontrol(cv) {
  const temiz = cv.trim();
  const kelimeSayisi = temiz ? temiz.split(/\s+/u).length : 0;
  const maddeler = [...cv.matchAll(/^\s*(?:[-*•–▪]|\d+[.)])[^\S\r\n]+(\S[^\r\n]*)/gm)].map(([, madde]) => madde);
  const oran = sayi => maddeler.length ? Math.round(100 * sayi / maddeler.length) : null;
  return {
    ...iletisimBilgisi(cv), kelimeSayisi,
    uzunluk: kelimeSayisi < 100 ? 'Kısa' : kelimeSayisi > 650 ? 'Uzun' : 'Önerilen aralıkta',
    maddeSayisi: maddeler.length,
    olculebilirOran: oran(maddeler.filter(madde => /\d/u.test(madde)).length),
    eylemOrani: oran(maddeler.filter(madde => eylem.test(madde.toLocaleLowerCase('tr'))).length),
    zayifIfadeler: [...new Set([...cv.toLocaleLowerCase('tr').matchAll(zayif)].map(([ifade]) => ifade.toLocaleLowerCase('tr')))],
  };
}

export function eslestir(ilan, cv) {
  const { zorunlu, tercih } = ilanBecerileri(ilan);
  const cvBecerileri = beceriBul(cv);
  const istenen = beceriler.filter(({ ad }) => zorunlu.has(ad) || tercih.has(ad))
    .map(({ ad, kategori }) => ({ ad, kategori, oncelik: zorunlu.has(ad) ? 'Zorunlu' : 'Tercih' }));
  const eslesen = istenen.filter(({ ad }) => cvBecerileri.has(ad));
  return {
    eslesen,
    eksik: istenen.filter(({ ad }) => !cvBecerileri.has(ad)),
    kapsama: istenen.length ? Math.round(100 * eslesen.length / istenen.length) : null,
    toplam: istenen.length,
    cv: cvKontrol(cv),
  };
}
