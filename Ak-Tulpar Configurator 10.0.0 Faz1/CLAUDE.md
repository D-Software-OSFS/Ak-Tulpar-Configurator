# CLAUDE.md - AK-Tulpar Configurator

Bu dosya, Claude Code (ve benzeri yapay zeka ajanları) için depoya özel talimatları içerir. Genel ajan kuralları için `AGENTS.md`'ye bakın.

## Bu Depo Nedir?

AK-Tulpar Configurator; INAV tabanlı bir yer kontrol istasyonunun (Configurator) AK-Tulpar İHA Takımı tarafından özelleştirilmiş Electron uygulamasıdır. Öne çıkan özelleştirmeler:

- **JavaScript Programlama sekmesi** (`tabs/javascript_programming.js` + `js/transpiler/`): INAV Mantık Koşulları için JavaScript transpiler'ı
- **Harita Oluşturucu sekmesi** (`tabs/map_generator.js`): Uçuş verilerinden harita oluşturma
- Türkçe arayüz ve AK-Tulpar markalaması

## Çalışma Akışı

1. Görevi anla; gerekiyorsa ilgili dosyaları oku (`js/transpiler/`, `tabs/`, `locale/tr/`)
2. Değişikliği en küçük kapsama indir; var olan kalıplara uy
3. Testleri çalıştır: `npm test` veya `node tests/transpiler/run_all_tests.cjs`
4. Transpiler değiştiyse yuvarlak yol testini (JS → CLI → JS) doğrula
5. Değişikliği Türkçe özetle

## Transpiler Özel Notları

- API tanımları (`js/transpiler/api/definitions/*.js`) firmware ile birebir eşleşmelidir; `js/transpiler/API_BUGS_FOUND.md` geçmiş hataları listeler.
- Sabitler (`js/transpiler/transpiler/inav_constants.js`) `js/transpiler/scripts/generate-constants.js` ile üretilir; elle düzenlemeyin.
- Yeni işlem/özellik eklerken 4 bileşeni güncelle: parser gerekmez ama analyzer, codegen, decompiler ve (varsa) diagnostics güncellenir.
- `let` = derleme zamanı sabiti (yerine konur), `var` = gvar yuvası kullanan değişken. Test örnekleri: `tests/transpiler/manual_test_examples.md`.

## Tarayıcı Portu

`BROWSER_PORT_AUDIT.md` (varsa) Electron bağımlılıklarının tarayıcı sürümü için nasıl dönüştürüleceğini anlatır. Seri bağlantı Electron'da `js/main/serial.js` + IPC ile, tarayıcıda Web Serial API ile sağlanır.

## Dil

Kullanıcıyla ve belgelerde **Türkçe yada İngilizce** iletişim kurun. Kod içi yorumlar Türkçe ve İngilizce olabilir.
-