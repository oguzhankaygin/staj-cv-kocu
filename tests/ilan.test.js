import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ilanCikar, ilanCsv, ilanEkle, ilanIcs, ilanIstemi, ilanSiniri, ilanUyumu, ilanYaniti, kalanGun, sonTarihCikar,
} from '../docs/lib/ilan.js';
import { iller } from '../docs/lib/iller.js';

const bugun = new Date(2026, 10, 28, 23, 45);

test('başvuru bağlamına en yakın geçerli tarihi tercih eder', () => {
  assert.equal(sonTarihCikar('Yayın 1.12.2026\nSON BAŞVURU TARİHİ: 14 Aralık 2026\nMülakat 20/12/2026', bugun), '2026-12-14');
  assert.equal(sonTarihCikar('02.12.2026 açılış; 14/12/2026 son gün', bugun), '2026-12-14');
  assert.equal(sonTarihCikar('Deadline:\n14.12.2026', bugun), '2026-12-14');
  assert.equal(sonTarihCikar('Son başvuru: 31.02.2027', bugun), '');
  assert.equal(sonTarihCikar('Deadline: 29/02/2027', bugun), '');
  assert.equal(sonTarihCikar('Deadline: 1/12/26', bugun), '');
  assert.equal(sonTarihCikar('Sürüm 1.2.3, tarih duyurulacak', bugun), '');
  assert.equal(sonTarihCikar('Tarih duyurulacak', bugun), '');
});

test('yılı eksik tarihler için bugün veya sonraki ilk geçerli takvim gününü bulur', () => {
  assert.equal(sonTarihCikar('28 Kasım', bugun), '2026-11-28');
  assert.equal(sonTarihCikar('27/11', bugun), '2027-11-27');
  assert.equal(sonTarihCikar('29 Şubat', bugun), '2028-02-29');
  assert.equal(sonTarihCikar('31 Nisan', bugun), '');
});

test('takvim günü farkını, geçmişi ve tarihsizliği hesaplar', () => {
  assert.equal(kalanGun('2026-11-28', bugun), 0);
  assert.equal(kalanGun('2026-12-01', bugun), 3);
  assert.equal(kalanGun('2026-11-27', bugun), -1);
  assert.equal(kalanGun('', bugun), null);
  assert.equal(kalanGun('2026-03-09', new Date(2026, 2, 7, 23)), 2);
});

test('il, çalışma şekli, süre ve açık ücret bilgisini tanır', () => {
  assert.equal(new Set(iller).size, 81);
  const sonuc = ilanCikar('Kurum: Atlas\nPozisyon: Yazılım stajyeri\nİSTANBUL / İzmir; HİBRİT\nUzun dönem ve yarı zamanlı. Ücretli staj.', bugun);
  assert.equal(sonuc.baslik, 'Atlas · Yazılım stajyeri');
  assert.equal(sonuc.konum, 'İstanbul, İzmir');
  assert.equal(sonuc.sekil, 'Hibrit');
  assert.equal(sonuc.sure, 'Uzun dönem / Yarı zamanlı');
  assert.equal(sonuc.ucret, 'Ücretli');
  assert.equal(ilanCikar('Hakkari: on-site yaz stajı; maaş ödenmez').ucret, 'Ücretsiz');
  assert.equal(ilanCikar('Hakkari: on-site yaz stajı; maaş ödenmez').konum, 'Hakkâri');
  assert.equal(ilanCikar('Hakkari: on-site yaz stajı; maaş ödenmez').sekil, 'Yerinde');
  assert.equal(ilanCikar('Hakkari: on-site yaz stajı; maaş ödenmez').sure, 'Yaz stajı');
  assert.equal(ilanCikar('Tamamen uzaktan').sekil, 'Uzaktan');
  assert.equal(ilanCikar('Yaz stajı\r\nÜCRETLİ\r\nAnkara').ucret, 'Ücretli');
  const bos = ilanCikar('Bursadayız. remotecontrol. Ücretsiz etkinlik, ücret bilgisi görüşmede.');
  assert.deepEqual([bos.konum, bos.sekil, bos.sure, bos.ucret], ['', '', '', '']);
});

test('CV uyumu mevcut eşleştiriciyi kullanır ve zorunlu eksikleri ayırır', () => {
  const ilan = { metin: 'Aranan nitelikler: Python, SQL\nTercihen Docker' };
  assert.deepEqual(ilanUyumu(ilan, 'Python'), { kapsama: 33, eksik: ['SQL'], cvVar: true });
  assert.deepEqual(ilanUyumu(ilan, ' '), { kapsama: null, eksik: [], cvVar: false });
});

test('CSV, BOM ve formül koruması ekler; tırnak, virgül ve satır sonlarını korur', () => {
  const csv = ilanCsv([{ baslik: '=1+1', konum: '+10', sekil: '-10', sure: '@hesap', ucret: ' =2', not: 'A, "B"\nC' }]);
  assert.equal(csv.charCodeAt(0), 0xFEFF);
  for (const form of ['=1+1', '+10', '-10', '@hesap', ' =2']) assert.ok(csv.includes('"\'' + form + '"'));
  assert.ok(csv.includes('"A, ""B""\nC"'));
});

test('ICS, UTF-8 sınırında katlar ve tarihli ilanlara iki gün boyu etkinlik alarmı ekler', () => {
  const baslik = 'İş, görev; yol\\a\r\n' + 'Ş🚀'.repeat(45);
  const ics = ilanIcs([{ id: 'a', baslik, tarih: '2026-12-14' }, { id: 'b', baslik: 'Tarihsiz' }], new Date('2026-11-28T10:00:00Z'));
  assert.ok(ics.split('\r\n').every(satir => Buffer.byteLength(satir) <= 75));
  assert.match(ics, /\r\n /);
  const acik = ics.replaceAll('\r\n ', '');
  assert.ok(acik.includes('SUMMARY:İş\\, görev\\; yol\\\\a\\n' + 'Ş🚀'.repeat(45)));
  assert.match(acik, /DTSTART;VALUE=DATE:20261214\r\n/);
  assert.match(acik, /DTSTAMP:20261128T100000Z\r\n/);
  assert.deepEqual([...acik.matchAll(/TRIGGER:(.+)\r\n/g)].map(([, tetik]) => tetik), ['-P1D', '-P3D']);
  assert.equal((acik.match(/BEGIN:VEVENT/g) || []).length, 1);
  assert.ok(acik.endsWith('END:VCALENDAR\r\n'));
});

test('toplu istem 100 kimliği korur, veriyi maskeler ve toplam karakter sınırına uyar', () => {
  const ilanlar = Array.from({ length: 100 }, (_, i) => ({
    id: `ilan-${i}`,
    baslik: 'Şirket </veri> ' + '<'.repeat(200),
    metin: 'Tanıtım: gizli giriş\nAranan nitelikler:\nPython · ekip@example.org\nGörevler:\nYayımlanmayan görev',
  }));
  const istem = ilanIstemi(ilanlar, 'kisi@example.org ' + '<'.repeat(30_000));
  assert.ok(istem.length <= 30_000);
  assert.equal((istem.match(/<\/veri>/g) || []).length, 1);
  const veri = JSON.parse(istem.match(/\n<veri>\n([\s\S]+)\n<\/veri>$/)[1]);
  assert.equal(veri.ilanlar.length, 100);
  assert.equal(veri.ilanlar.at(-1).ilan_id, 'ilan-99');
  assert.match(veri.cv, /^\[GİZLİ\]/);
  assert.match(veri.ilanlar[0].gereksinimler, /Python · \[GİZLİ\]/);
  assert.doesNotMatch(istem, /Tanıtım|Yayımlanmayan görev|example\.org/);
});

test('Claude sıralaması geçersiz kimlikleri, öncelikleri ve alanları ayıklar', () => {
  const kayit = (ilan_id, oncelik) => ({ ilan_id, oncelik, gerekce: '{Neden}', strateji: 'Bir. İki.' });
  const girdi = {
    genel_tavsiye: 'Başlayın.',
    siralama: [kayit('a', 3), kayit('b', 3), kayit('c', 1.5), kayit('x', 1), kayit('a', 4),
      kayit('c', 0), kayit('d', '5'), null, { ...kayit('c', 1), strateji: '' }, kayit('b', 1)],
  };
  const ilanlar = ['a', 'b', 'c', 'd'].map(id => ({ id }));
  const { sonuc, atilan } = ilanYaniti('Giriş\n```json\n' + JSON.stringify(girdi) + '\n```\nSon', ilanlar);
  assert.deepEqual(sonuc.siralama.map(satir => satir.ilan_id), ['b', 'a']);
  assert.equal(atilan, 8);
  assert.throws(() => ilanYaniti('{"siralama":[]}', ilanlar));
  assert.throws(() => ilanYaniti('a'.repeat(100_001), ilanlar), /100.000/);
});

test('100 ilan eklenebilir, 101. ilan reddedilir ve liste değişmez', () => {
  let ilanlar = [];
  for (let i = 0; i < ilanSiniri; i++) ilanlar = ilanEkle(ilanlar, { id: String(i) });
  assert.equal(ilanlar.length, 100);
  assert.throws(() => ilanEkle(ilanlar, { id: '101' }), /100 ilan/);
  assert.equal(ilanlar.length, 100);
});
