# Transpiler - Proje Talimatları

Bu dosya, INAV JavaScript transpiler'ı üzerinde çalışırken izlenmesi gereken kuralları ve kalıpları içerir.

## Mimari Genel Bakış

Transpiler 4 ana bileşenden oluşur:

| Bileşen | Dosya | Görevi |
|---------|-------|--------|
| Ayrıştırıcı | `js/transpiler/transpiler/parser.js` | JS kodunu AST'ye dönüştürür |
| Analizör | `js/transpiler/transpiler/analyzer.js` | Sözdizimini doğrular, hataları raporlar |
| Kod üretici | `js/transpiler/transpiler/codegen.js` | AST'den INAV `logic` CLI komutları üretir |
| Ters derleyici | `js/transpiler/transpiler/decompiler.js` | CLI komutlarını tekrar JS'ye çevirir |

API tanımları `js/transpiler/api/definitions/` altında bulunur (flight, gvar, pid, waypoint, override, rc). Sabitler `js/transpiler/transpiler/inav_constants.js` içindedir.

## Önemli Kurallar

### 1. API tanımları firmware ile birebir eşleşmeli

Her API tanımı, INAV firmware kaynak koduyla (logic_condition.h/c) doğrulanmalıdır. **Asla firmware'de kanıtlanmamış özellik eklemeyin.**

- Operand türleri: `OPERAND_TYPE` sabitlerine bakın (GVAR=5, WAYPOINTS=7, RC_CHANNEL=1 vb.)
- İşlemler: `OPERATION` sabitlerine bakın (GVAR_SET=18, GVAR_INC=19 vb.)
- Uçuş parametreleri: `FLIGHT_PARAM` ve `FLIGHT_PARAM_NAMES` ile eşleşmeli

### 2. Yeni özellik eklerken 4 bileşeni de güncelleyin

1. **Analizör:** Yeni sözdizimi için doğrulama ekle
2. **Codegen:** Yeni AST düğümleri için üretim ekle
3. **Ters derleyici:** İşlem kodunun ters eşlemesini ekle
4. **Tanılama (opsiyonel):** Yardımcı uyarılar ekle

Ayrıca yuvarlak yol testini (JS → CLI → JS) her zaman çalıştırın.

### 3. Testleri çalıştırın

```bash
# Tüm transpiler testleri
node tests/transpiler/run_all_tests.cjs

# Tek bir test
node tests/transpiler/test_gvar.js
```

Test kılavuzu: `tests/transpiler/TESTING_GUIDE.md`
Manuel test örnekleri: `tests/transpiler/manual_test_examples.md`

### 4. Sabitleri elle düzenlemeyin

`inav_constants.js` içindeki sabitler `js/transpiler/scripts/generate-constants.js` tarafından firmware'den üretilir. Yeni sabitler önce bu betiğe eklenmeli, sonra üretilmelidir.

## Sık Yapılan Hatalar

- **Yanlış operand türü:** Örn. waypoint için GVAR (5) kullanmak yerine WAYPOINTS (7) kullanılmalı
- **Yanlış işlem kodu:** Örn. atama için GVAR_INC (19) yerine GVAR_SET (18) kullanılmalı
- **Uydurma özellikler:** Firmware'de olmayan özellikler (örn. pid.setpoint) eklemeyin
- **Eksik ters eşleme:** Yeni işlem eklerken decompiler'a case eklemeyi unutmayın

## Faydalı Dosyalar

- Hata raporları: `js/transpiler/API_BUGS_FOUND.md`, `VERIFICATION_SUMMARY.md`, `FIXES_COMPLETE.md`
- Testler: `tests/transpiler/`
- API tanımları: `js/transpiler/api/definitions/`
