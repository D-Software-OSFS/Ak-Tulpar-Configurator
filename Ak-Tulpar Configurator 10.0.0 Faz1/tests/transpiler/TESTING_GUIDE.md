# Transpiler Test Kılavuzu

Bu kılavuz, AK-Tulpar Configurator'daki INAV JavaScript transpiler'ında yapılan değişikliklerin tüm bileşenlerin birlikte doğru çalıştığını doğrulamak için nasıl test edileceğini açıklar.

## Genel Bakış

Transpiler'ın senkron kalması gereken 4 ana bileşeni vardır:

1. **Ayrıştırıcı (Parser)** (`js/transpiler/transpiler/parser.js`) - JavaScript kodunu AST'ye ayrıştırır
2. **Analizör (Analyzer)** (`js/transpiler/transpiler/analyzer.js`) - sözdizimini doğrular ve hataları kontrol eder
3. **Kod Üretici (Codegen)** (`js/transpiler/transpiler/codegen.js`) - AST'den INAV CLI komutları üretir
4. **Ters Derleyici (Decompiler)** (`js/transpiler/transpiler/decompiler.js`) - CLI komutlarını tekrar JavaScript'e dönüştürür

## Yeni Bir Özellik Eklerken

Yeni bir işlem, fonksiyon veya sözdizimi özelliği uygularken şunları güncellemeniz gerekir:

### 1. Analizör (js/transpiler/transpiler/analyzer.js)

- Yeni sözdizimi kalıpları için doğrulama ekleyin
- Gerekirse özellik erişim doğrulamasını güncelleyin
- Desteklenmeyen varyasyonlar için uyarılar ekleyin

Örnek: RC kanal durumları için `rc[1-18]` ve `.low/.mid/.high` özelliklerine sahip sözdizimi doğrulaması eklendi

### 2. Kod Üretici (js/transpiler/transpiler/codegen.js)

- Yeni özellik için kod üretimi ekleyin
- Yeni AST düğüm türlerini ele alın
- Doğru INAV işlem kodlarını üretin

Örnek: RC kanal durumları için `generateCondition()` içinde `rc[n].low` algılayan ve LOW işlemi (4) üreten işleyici eklendi

### 3. Ters Derleyici (js/transpiler/transpiler/decompiler.js)

- İşlem kodlarından JavaScript'e ters eşleme ekleyin
- Üretilen kodun beklenen sözdizimiyle eşleştiğinden emin olun

Örnek: RC kanal durumları için işlem 4/5/6, `.low/.mid/.high` özelliklerine eşlendi

### 4. Tanılama (opsiyonel, js/transpiler/editor/diagnostics.js)

- Yaygın hatalar için yardımcı uyarılar ekleyin
- Doğru sözdizimi alternatifleri önerin

## Yuvarlak Yol (Round-Trip) Testi

Transpiler değişikliklerini test etmenin en güvenilir yolu yuvarlak yol testidir:
JavaScript → CLI komutları → JavaScript

### Temel Test Şablonu

```javascript
import { Transpiler } from '../../js/transpiler/index.js';
import { Decompiler } from '../../js/transpiler/transpiler/decompiler.js';

const testCode = `
const { flight, gvar } = inav;

// Test kodunuz buraya
if (flight.altitude > 100) {
  gvar[0] = 1;
}
`;

console.log('=== Orijinal JavaScript ===\n');
console.log(testCode);

// Derle
const transpiler = new Transpiler();
const transpileResult = transpiler.transpile(testCode);

console.log('\n=== Üretilen CLI Komutları ===\n');
transpileResult.commands.forEach(cmd => console.log(cmd));

// Komutları ters derleyici için LC formatına dönüştür
const logicConditions = transpileResult.commands.map((cmd) => {
  const parts = cmd.split(/\s+/);
  return {
    index: parseInt(parts[1]),
    enabled: parseInt(parts[2]),
    activatorId: parseInt(parts[3]),
    operation: parseInt(parts[4]),
    operandAType: parseInt(parts[5]),
    operandAValue: parseInt(parts[6]),
    operandBType: parseInt(parts[7]),
    operandBValue: parseInt(parts[8]),
    flags: parseInt(parts[9])
  };
});

// Ters derle
const decompiler = new Decompiler();
const decompileResult = decompiler.decompile(logicConditions);

console.log('\n=== Ters Derlenmiş JavaScript ===\n');
console.log(decompileResult.code);

if (decompileResult.success) {
  console.log('\n✅ Yuvarlak yol başarılı!');
} else {
  console.error('\n❌ Ters derleme başarısız:', decompileResult.error);
}
```

### Testleri Çalıştırma

```bash
# Depo kökünden tüm testleri çalıştırın
npm test

# Yalnızca transpiler test paketi
node tests/transpiler/run_all_tests.cjs
```

Test dosyalarınız `tests/transpiler/` altında bulunur; betiği depo kökünden `node tests/transpiler/xxx.test.cjs` olarak da çalıştırabilirsiniz.

## Test Senaryoları

### 1. Temel İşlevsellik

```javascript
if (flight.altitude > 100) {
  gvar[0] = 1;
}
```

Beklenen: Doğru koşul ve atama ile LC üretir

### 2. Geçersiz Özellik

```javascript
if (flight.invalidProperty > 100) {
  gvar[0] = 1;
}
```

Beklenen: Doğru özellik önerisiyle hata

### 3. Uç Durumlar

```javascript
// Sınır değerlerini test edin (1 tabanlı indeksleme)
if (rc[1].low) {  // Kanal 1 (ilk)
  gvar[0] = 1;
}

if (rc[18].high) {  // Kanal 18 (son geçerli)
  gvar[1] = 1;
}
```

Beklenen: Her ikisi için de geçerli üretim

### 4. Karmaşık Kombinasyonlar

```javascript
// Birden fazla işlemi birlikte test edin
if (xor(rc[1].low, flight.armed)) {
  gvar[0] = Math.max(100, flight.altitude);
}
```

Beklenen: İşlemlerin düzgün iç içe geçmesi

## Yaygın Sorunlar

### Analizör Geçerli Sözdizimini Reddediyor

**Sorun:** Analizör doğrulaması çok katı
**Çözüm:** `checkPropertyAccess()` veya ilgili doğrulama yöntemini güncelleyin
**Örnek:** RC kanalları için `rc[n]` dizi sözdizimi özel işlem gerektirdi

### Codegen Yanlış İşlem Kodu Üretiyor

**Sorun:** İşlem sabiti adı yanlış veya içe aktarılmamış
**Çözüm:** `OPERATION.*` sabitlerinin `inav_constants.js` ile eşleştiğini kontrol edin
**Örnek:** MODULUS yanlışlıkla `OPERATION.MOD` yerine `OPERATION.MODULUS` olmalıydı

### Ters Derleyici Çıktısı Girişle Eşleşmiyor

**Sorun:** Ters derleyicinin ters eşlemesi eksik
**Çözüm:** Ters derleyicide yeni işlem için durum (case) ekleyin
**Örnek:** LOW/MID/HIGH işlemlerinin `.low/.mid/.high` özelliklerine eşlenmesi gerekti

### Hatalarda Satır Numaraları Yanlış

**Sorun:** Otomatik içe aktarma, ayrıştırmadan önce satır ekliyor
**Çözüm:** lineOffset izleyin ve tüm hata/uyarı satır numaralarını ayarlayın
**Düzeltildi:** 2025-11-25 oturumu

## Doğrulama Listesi

Değişiklikleri commit etmeden önce:

- [ ] Analizör yeni sözdizimini yanlış pozitif olmadan doğruluyor
- [ ] Codegen doğru işlem kodları üretiyor
- [ ] Ters derleyici işlemi doğru tersine çeviriyor
- [ ] Yuvarlak yol testi geçiyor (JS → CLI → JS)
- [ ] Hata mesajları yardımcı ve doğru
- [ ] Uç durumlar ele alınıyor (sınır değerler, boş girdiler)
- [ ] Belgeler güncellendi (API tanımları ve js/transpiler belgeleri)

## Örnek: Yeni Bir İşlem Ekleme

Diyelim ki yeni bir INAV işlemi `FOOBAR (işlem 99)` için destek eklemek istiyorsunuz:

**1. İşlemin firmware'de var olup olmadığını kontrol edin**

```javascript
// js/transpiler/transpiler/inav_constants.js içinde arayın
const OPERATION = {
  // ...
  FOOBAR: 99,  // Bunun var olduğunu kontrol edin
  // ...
};
```

**2. Codegen'i güncelleyin**

```javascript
// js/transpiler/transpiler/codegen.js içinde
case 'CallExpression': {
  const funcName = condition.callee?.name;

  if (funcName === 'foobar') {
    // FOOBAR işlemi üret
    const resultIndex = this.lcIndex;
    this.commands.push(
      `logic ${this.lcIndex} 1 ${activatorId} ${OPERATION.FOOBAR} ...`
    );
    this.lcIndex++;
    return resultIndex;
  }
}
```

**3. Ters derleyiciyi güncelleyin**

```javascript
// js/transpiler/transpiler/decompiler.js içinde
case OPERATION.FOOBAR:
  return 'foobar()';
```

**4. Analizörü güncelleyin (gerekirse)**

```javascript
// js/transpiler/transpiler/analyzer.js içinde
// foobar() kullanımına doğrulama ekleyin
```

**5. Yuvarlak yol testini yapın**

```javascript
const testCode = `
const { flight } = inav;

if (foobar()) {
  gvar[0] = 1;
}
`;
// Yuvarlak yol testini çalıştırın...
```

**6. Belgeleri güncelleyin**

- Kullanım örnekleri ekleyin
- Gerekirse API tanımlarını güncelleyin

## Son Güncelleme

2025-11-25 - RC kanal durumu algılama ve tüm INAV işlemlerinin tamamlanmasının ardından oluşturuldu
