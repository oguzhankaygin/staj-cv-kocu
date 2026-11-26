const epostaAdayi = /[\p{L}\d._%+'-]+\s*@\s*[\p{L}\d._%-]*/gu;
const gecerliEposta = /^[A-Za-z0-9_+%'-]+(?:\.[A-Za-z0-9_+%'-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
const kimlik = /(?<!\d)\d{11}(?!\d)/g;
const telefon = /(?<![\w+])\+\d{10,15}(?!\d)|(?<![\w+])(?:\+\d{1,3}[ .-]?)?(?:\(\d{2,4}\)[ .-]?|\d{2,4}[ .-]?)\d{3,4}[ .-]?\d{2}[ .-]?\d{2}(?!\d)|(?<![\w+])(?:0\d{10}|\d{10})(?!\d)/g;
const adres = /^\s*(?:[-•]\s*)?(?:(?:ev\s+)?adres(?:i|im)?\s*[:：-]|(?:home\s+)?address\s*[:：-])|\b(?:mahallesi|caddesi|sokağı|mah\.|cad\.|sok\.)/iu;

function telefonlariBul(metin) {
  return [...metin.matchAll(telefon)].filter(([deger]) => {
    const hane = deger.replace(/\D/g, '').length;
    return deger.startsWith('+') ? hane >= 10 && hane <= 15 : hane === 10 || (hane === 11 && deger.startsWith('0'));
  });
}

export function iletisimBilgisi(metin) {
  const adaylar = [...metin.matchAll(epostaAdayi)].map(([deger]) => deger.replace(/\.$/, ''));
  const gecerli = adaylar.filter(deger => gecerliEposta.test(deger)).length;
  const telefonVar = Boolean(telefonlariBul(metin).length);
  return { iletisimVar: gecerli > 0 || telefonVar, epostaVar: adaylar.length > 0,
    epostaGecerli: adaylar.length > 0 && gecerli === adaylar.length, telefonVar };
}

export function maskele(metin) {
  return metin.split(/\r?\n/).map(satir => {
    if (adres.test(satir.toLocaleLowerCase('tr'))) return '[GİZLİ]';
    let guvenli = satir.replace(epostaAdayi, '[GİZLİ]');
    for (const aday of telefonlariBul(guvenli).reverse()) {
      guvenli = guvenli.slice(0, aday.index) + '[GİZLİ]' + guvenli.slice(aday.index + aday[0].length);
    }
    return guvenli.replace(kimlik, '[GİZLİ]');
  }).join('\n');
}
