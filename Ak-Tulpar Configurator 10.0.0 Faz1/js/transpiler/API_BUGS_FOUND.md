# Transpiler API Hataları Raporu

**Tarih:** 2025-12-02
**Durum:** ✅ TÜM KRİTİK HATALAR DÜZELTİLDİ
**Önem derecesi:** KRİTİK / YÜKSEK / ORTA

---

## Özet

INAV firmware kaynak koduyla yapılan sistematik karşılaştırma, transpiler API tanımlarında birden fazla kritik hata ortaya çıkardı. Bu hatalar, üretilen mantık koşullarının yanlış veri okumasına veya tamamen yanlış çalışmasına neden oluyordu.

## Bulunan Hatalar

### 1. waypoint.js - KRİTİK ❌→✅ DÜZELTİLDİ

**Dosya:** `js/transpiler/api/definitions/waypoint.js`

**Hatalar:**
- Yanlış operand türü: `5` (GVAR) yerine `7` (WAYPOINTS) kullanılmalıydı
- Firmware'de var olmayan 6 uydurma özellik: `latitude`, `longitude`, `altitude`, `bearing`, `missionReached`, `missionValid`
- Gerçek waypoint özelliklerinin (14 adet) eksikliği

**Firmware kaynağı:** `logic_condition.h` satır 177-192, `logic_condition.c` satır 575-669

**Düzeltme:** Tamamen yeniden yazıldı; doğru tür (7) ve 14 gerçek özellik eklendi.

---

### 2. gvar.js - YÜKSEK ⚠️→✅ DÜZELTİLDİ

**Dosya:** `js/transpiler/api/definitions/gvar.js`

**Hatalar:**
- Yanlış operand türü: `3` (FLIGHT_MODE) yerine `5` (GVAR) olmalıydı
- Yanlış işlem: `19` (GVAR_INC) yerine `18` (GVAR_SET) olmalıydı

**Firmware kaynağı:** `logic_condition.h` satır 50 ve 98

**Düzeltme:** Tür 3→5, işlem 19→18 olarak değiştirildi.

---

### 3. pid.js - ORTA ⚠️→✅ DÜZELTİLDİ

**Dosya:** `js/transpiler/api/definitions/pid.js`

**Hata:** Firmware'de yalnızca `output` özelliği (operand 0-3) varken 8 uydurma özellik (setpoint, measurement, P/I/D/FF, enabled) tanımlanmıştı.

**Firmware kaynağı:** `logic_condition.c` satır 1078-1082, `pid.h` satır 35

**Düzeltme:** Tamamen yeniden yazıldı; yalnızca `output` özelliği bırakıldı.

---

### 4. flight.js - ORTA ✅ DÜZELTİLDİ

**Dosya:** `js/transpiler/api/definitions/flight.js`

**Eksiklik:** 4 rüzgar parametresi eksikti (46-49: minGroundSpeed, horizontalWindSpeed, windDirection, relativeWindOffset).

**Düzeltme:** 4 parametre eklendi.

---

### 5. inav_constants.js - ORTA ✅ DÜZELTİLDİ

**Dosya:** `js/transpiler/transpiler/inav_constants.js`

**Eksiklik:** 5 sabit eksikti (FLIGHT_PARAM 46-49 ve OPERATION.OVERRIDE_MIN_GROUND_SPEED = 56).

**Düzeltme:** 5 sabit eklendi.

---

### 6. codegen.js - DÜŞÜK ✅ DÜZELTİLDİ

**Dosya:** `js/transpiler/transpiler/codegen.js`

**Hata:** `rc[N].value` sözdizimi desteklenmiyordu.

**Düzeltme:** Regex `^rc\[(\d+)\](?:\.value)?$` olarak güncellendi.

---

## Doğru Doğrulanan Dosyalar ✅

- **override.js** - Tüm 10 işlem firmware ile eşleşiyor
- **rc.js** - codegen.js tarafından doğru şekilde işleniyor

---

## Test Dosyaları

4 kapsamlı test dosyası oluşturuldu:

1. `tests/transpiler/test_rc_channels.js` - RC kanal okuma/yazma işlemleri
2. `tests/transpiler/test_gvar.js` - GVAR okuma/yazma (doğru türler)
3. `tests/transpiler/test_pid.js` - PID çıkış okuma (yalnızca)
4. `tests/transpiler/test_waypoint.js` - Gerçek waypoint özellikleri

Tüm testleri çalıştırmak için:

```bash
node tests/transpiler/run_all_tests.cjs
```

---

## Firmware Kaynak Referansları

Tüm doğrulamalar şu kaynaklara göre yapıldı:

- **Uçuş parametreleri:** `flight.h` (logicFlightOperands_e)
- **Waypoint parametreleri:** `logic_condition.h` satır 177-192 (logicWaypointOperands_e), `logic_condition.c` satır 575-669
- **İşlemler:** `logic_condition.h` satır 31-89 (logicOperation_e)
- **GVAR:** `global_variables.h` satır 29 (MAX_GLOBAL_VARIABLES = 8), `logic_condition.c` satır 1072-1076
- **PID:** `pid.h` satır 35 (MAX_PROGRAMMING_PID_COUNT = 4), `logic_condition.c` satır 1078-1082

---

## Notlar

- Tüm düzeltmeler yalnızca firmware'de kanıtlanmış gerçeklere dayanır
- Uydurma (hallucinated) özellikler kaldırıldı
- Kullanıcılar için kırıcı değişiklikler `FIXES_COMPLETE.md` içinde belgelendi
