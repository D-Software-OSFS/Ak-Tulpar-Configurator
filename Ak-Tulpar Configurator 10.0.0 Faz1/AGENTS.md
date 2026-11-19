# AK-Tulpar Configurator - Ajan Talimatları

Bu depo, INAV Configurator'ın AK-Tulpar İHA Takımı tarafından özelleştirilmiş sürümüdür. Bu dosya, depo üzerinde çalışan yapay zeka ajanları (örn. Cline, Claude Code) için kuralları tanımlar.

## Genel İlkeler

1. **Türkçe yanıt verin.** Kullanıcı Türkçe yazıyor; tüm açıklamalar, açıklamalar (comment) ve belgeler Türkçe olmalıdır. Kod anahtar kelimeleri ve değişken adları İngilizce kalır.
2. **Değişiklikleri küçük ve doğrulanabilir tutun.** Her düzenlemeden sonra ilgili testleri çalıştırın.
3. **Firmware ile tutarlılığı koruyun.** Özellikle `js/transpiler/` altında, API tanımları INAV firmware kaynak koduyla (logic_condition.h/c) birebir eşleşmelidir; var olmayan özellikler eklemeyin.
4. **Var olan kalıplara uyun.** Yeni kod eklerken yakındaki dosyaların stilini (import düzeni, isimlendirme, açıklama dili) izleyin.

## Önemli Dizinler

| Dizin | Açıklama |
|------|----------|
| `js/transpiler/` | JavaScript → INAV Mantık Koşulları transpiler'ı (parser, analyzer, codegen, decompiler) |
| `js/transpiler/api/definitions/` | `inav` nesnesinin API tanımları (flight, gvar, pid, waypoint, override, rc) |
| `js/main/` | Electron ana süreç (seri port, dosya sistemi, IPC) — tarayıcı portunda bu katman kalkar |
| `tabs/` | Configurator sekmeleri (örn. `javascript_programming.js`, `map_generator.js`) |
| `tests/transpiler/` | Transpiler testleri ve el ile test örnekleri |
| `locale/tr/` | Türkçe arayüz metinleri |
| `resources/osd/` | OSD yazı tipleri ve sembol haritası |

## Testleri Çalıştırma

```bash
npm test
node tests/transpiler/run_all_tests.cjs
```

Transpiler değişikliklerinden sonra **yuvarlak yol testini** (JS → CLI → JS) mutlaka çalıştırın; kılavuz: `tests/transpiler/TESTING_GUIDE.md`.

## Sık Yapılan Hatalar ( kaçının )

- Transpiler API tanımlarına firmware'de kanıtlanmamış özellik eklemek (bkz. `js/transpiler/API_BUGS_FOUND.md`)
- Yanlış operand türü veya işlem kodu kullanmak (GVAR=5, WAYPOINTS=7, GVAR_SET=18 vb. — bkz. `js/transpiler/transpiler/inav_constants.js`)
- Yeni işlem ekleyip `decompiler.js`'e ters eşleme eklememek
- `let`/`var` ayrımını karıştırmak: `let` derleme zamanı sabiti, `var` gvar yuvası kullanan çalışma zamanı değişkenidir

## Belgeler

- Proje özeti: `README.md`
- Transpiler kuralları: `js/transpiler/CLAUDE.md`
- Test kılavuzu: `tests/transpiler/TESTING_GUIDE.md`
- OSD yazı tipleri: `resources/osd/digital/README.md`, `resources/osd/analogue/README.md`
- 3D model oluşturma: `3D_model_creation.md`
