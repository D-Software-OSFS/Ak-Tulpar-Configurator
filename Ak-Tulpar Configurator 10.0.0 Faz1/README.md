# AK-Tulpar Configurator

AK-Tulpar İHA Takımı için D Software tarafından özelleştirilmiş, [INAV](https://github.com/inavflight/inav) tabanlı bir yer kontrol istasyonu (Configurator) uygulamasıdır. Electron ile geliştirilmiş masaüstü uygulamasıdır; Windows, macOS ve Linux üzerinde çalışır.

## Özellikler

- INAV kontrolcüleri ile bağlantı (seri port, TCP/UDP, Bluetooth, DFU/SITL)
- Yapılandırma sekmeleri (kurulum, portlar, alıcı, modlar, karıştırıcı, motorlar, sensörler, GPS, OSD, kumanda, kurtarma vb.)
- **JavaScript Programlama sekmesi:** INAV "Mantık Koşulları"nın (Logic Conditions) JavaScript benzeri bir sözdizimiyle yazılabildiği transpiler; kodunuz otomatik olarak INAV CLI `logic` komutlarına derlenir ve ters derlenebilir
- **Harita Oluşturucu sekmesi:** Uçuş verilerinden harita/rota görselleştirme
- OSD yazı tipi ve sembol yönetimi (analog ve dijital/HD)
- 3D model önizleme (glTF)
- Yerel yedekleme/geri yükleme, çok dilli arayüz (Türkçe dahil)

## Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
yarn install

# Geliştirme modunda çalıştır (Electron)
yarn start

# Üretim paketleri oluştur
yarn package        # geçerli platform için paket
yarn make           # tüm dağıtımlar (exe/msi, dmg, zip, deb, rpm)
```

Web tarayıcı sürümü için ayrı bir Vite yapılandırması (`vite.web.config.js`) ile derleme yapılabilir; however seri bağlantı için Web Serial API gereklidir (yalnızca Chromium tabanlı tarayıcılarda, güvenli bağlamda çalışır).

## Proje Yapısı

| Dizin | Açıklama |
|-------|----------|
| `js/` | Uygulama kaynak kodu (bağlantı, MSP, sekmeler, transpiler vb.) |
| `js/transpiler/` | JavaScript → INAV Mantık Koşulları transpiler'ı (parser, analyzer, codegen, decompiler, API tanımları) |
| `js/main/` | Electron ana süreç dosyaları (seri port, dosya sistemi, IPC) |
| `tabs/` | Configurator sekmeleri |
| `locale/` | Dil dosyaları (`tr`, `en` vb.) |
| `resources/osd/` | OSD yazı tipleri ve sembol haritası |
| `tests/` | Testler (özellikle `tests/transpiler/`) |
| `docs/` | Geliştirici belgeleri ve desenler |

## Transpiler (JavaScript Programlama)

`js/transpiler/` altında bulunur. Kullanım:

```javascript
const { flight, gvar, override } = inav;

let maxAlt = 500;              // 'let' = derleme zamanı sabiti (yerine konur)
var durum = 0;                 // 'var' = çalışma zamanı değişkeni (gvar yuvası kullanır)

if (flight.altitude > maxAlt) {
  gvar[0] = 1;
}

on.arm(() => { gvar[0] = 0; });
```

- Ayrıntılı test kılavuzu: `tests/transpiler/TESTING_GUIDE.md`
- Manuel test örnekleri: `tests/transpiler/manual_test_examples.md`
- API doğrulama raporları: `js/transpiler/API_BUGS_FOUND.md`, `VERIFICATION_SUMMARY.md`, `FIXES_COMPLETE.md`

## Testler

```bash
npm test                              # tüm testler
node tests/transpiler/run_all_tests.cjs   # yalnızca transpiler testleri
```

## Lisans

INAV Configurator ile aynı lisans (GPL-3.0) kapsamındadır.
Ekstra olarak Tulpar Configurator için MIT Lisansı.
