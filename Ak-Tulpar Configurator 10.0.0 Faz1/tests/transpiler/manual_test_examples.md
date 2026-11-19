# JavaScript Değişkenleri İçin Manuel Test Örnekleri

Bu dosya, AK-Tulpar Configurator arayüzünde manuel test için test durumları içerir.

## Test 1: Temel Let Değişkeni (Sabit Yerine Koyma)

```javascript
const { flight } = inav;

let maxAltitude = 500;

if (flight.altitude > maxAltitude) {
  gvar[0] = 1;
}
```

**Beklenen davranış:**
- Başarıyla derlenir (transpile edilir)
- `flight.altitude > 500` içeren bir mantık koşulu üretir
- `maxAltitude` için gvar yuvası kullanılmaz

## Test 2: Birden Fazla Let Değişkeni

```javascript
const { flight } = inav;

let minAlt = 100;
let maxAlt = 500;
let midpoint = 300;

if (flight.altitude < minAlt) {
  gvar[0] = 1;
} else if (flight.altitude > maxAlt) {
  gvar[0] = 3;
} else {
  gvar[0] = 2;
}
```

**Beklenen davranış:**
- Tüm let değişkenleri satır içine (inline) yerleştirilir
- Değişkenler için gvar yuvası kullanılmaz
- Mantık koşulları sabit (literal) değerler kullanır

## Test 3: Temel Var Değişkeni (Gvar Tahsisi)

```javascript
const { flight } = inav;

var altitude_threshold = 500;

on.arm(() => {
  altitude_threshold = flight.altitude;
});

if (flight.altitude > altitude_threshold) {
  gvar[0] = 1;
}
```

**Beklenen davranış:**
- `altitude_threshold` gvar[7]'ye tahsis edilir (mevcut en yüksek yuva)
- Başlatma: `gvar[7] = 500`
- Atama: `gvar[7] = flight.altitude`
- Koşul: `flight.altitude > gvar[7]`

## Test 4: Karışık Let ve Var

```javascript
const { flight } = inav;

let dangerAltitude = 1000;
var currentMode = 0;

on.arm(() => {
  currentMode = 1;
});

if (flight.altitude > dangerAltitude) {
  currentMode = 2;
}

gvar[0] = currentMode;
```

**Beklenen davranış:**
- `dangerAltitude` 1000 olarak yerleştirilir
- `currentMode` gvar[7]'ye tahsis edilir
- Mantık koşulları currentMode için gvar[7] kullanır

## Test 5: İfadeli Let

```javascript
const { flight } = inav;

let baseAlt = 100;
let offset = 50;
let threshold = baseAlt + offset;

if (flight.altitude > threshold) {
  gvar[0] = 1;
}
```

**Beklenen davranış:**
- Tüm değerler derleme zamanında hesaplanır
- Koşul sabit 150 değerini kullanır

## Test 6: Çalışma Zamanı İfadeli Var

```javascript
const { flight } = inav;

var adjustedAlt = 0;

on.always(() => {
  adjustedAlt = flight.altitude - 100;
});

if (adjustedAlt > 500) {
  gvar[0] = 1;
}
```

**Beklenen davranış:**
- `adjustedAlt` gvar[7]'ye tahsis edilir
- Atama aritmetik işlem üretir
- Koşul gvar[7] kullanır

## Test 7: Birden Fazla Var (Gvar Yuva Kullanımı)

```javascript
const { flight } = inav;

var var1 = 1;
var var2 = 2;
var var3 = 3;

gvar[0] = var1 + var2 + var3;
```

**Beklenen davranış:**
- gvar[7], gvar[6], gvar[5] tahsis edilir
- "8 gvar yuvasından 3'ü kullanılıyor" gösterir (gelecekteki geliştirme)

## Test 8: Hata - Let Yeniden Ataması

```javascript
let altitude = 100;
altitude = 200;  // Hata vermeli
```

**Beklenen hata:**
- `Cannot reassign 'let' variable 'altitude'. Use 'var' for mutable variables.` (let değişkeni 'altitude' yeniden atanamaz. Değiştirilebilir değişkenler için 'var' kullanın.)

## Test 9: Hata - Değişken Yeniden Tanımlama

```javascript
let altitude = 100;
let altitude = 200;  // Hata vermeli
```

**Beklenen hata:**
- `Variable 'altitude' is already declared` (Değişken 'altitude' zaten tanımlı)

## Test 10: Hata - Gvar Yuva Tükenmesi

```javascript
var v1 = 1;
var v2 = 2;
var v3 = 3;
var v4 = 4;
var v5 = 5;
var v6 = 6;
var v7 = 7;
var v8 = 8;
var v9 = 9;  // Hata vermeli - yalnızca 8 yuva var
```

**Beklenen hata:**
- `No available gvar slots for variable 'v9'. All 8 gvar slots are in use.` ('v9' değişkeni için boş gvar yuvası yok. 8 gvar yuvasının tamamı kullanımda.)

## Test 11: Var'larla Birlikte Açık Gvar Kullanımı

```javascript
const { flight } = inav;

gvar[0] = 100;  // Açık kullanım
gvar[1] = 200;  // Açık kullanım

var myVar = 42;  // gvar[7]'ye tahsis edilmeli (0 veya 1'e değil)

gvar[2] = myVar;
```

**Beklenen davranış:**
- `myVar` gvar[7]'ye tahsis edilir
- gvar[0] ve gvar[1]'den kaçınır

## Test 12: Birden Fazla Derleme Çağrısı (Durum Sıfırlama)

Bu testi arka arkaya iki kez çalıştırın:

```javascript
let time = flight.armTimer;
if (time > 1000) {
  gvar[1] = time;
}
```

**Beklenen davranış:**
- İlk derleme: Başarılı
- İkinci derleme: Başarılı ("zaten tanımlı" hatası yok)
- Her ikisi de özdeş çıktı üretir

## Test 13: Karmaşık Gerçek Dünya Örneği

```javascript
const { flight, rc, override } = inav;

// Yapılandırma
let minSafeAltitude = 50;
let maxSafeAltitude = 500;
let emergencyThrottle = 1500;

// Durum takibi
var isEmergency = 0;
var throttleOverride = 1000;

on.arm(() => {
  isEmergency = 0;
  throttleOverride = rc.throttle;
});

on.always(() => {
  if (flight.altitude < minSafeAltitude || flight.altitude > maxSafeAltitude) {
    isEmergency = 1;
    throttleOverride = emergencyThrottle;
  } else {
    isEmergency = 0;
  }
});

if (isEmergency) {
  override.throttle = throttleOverride;
}

gvar[0] = isEmergency;
```

**Beklenen davranış:**
- Let değişkenleri satır içine yerleştirilir
- Var değişkenleri gvar[7] ve gvar[6]'ya tahsis edilir
- Tüm mantık koşulları doğru şekilde üretilir
- Çıktı geçerli INAV CLI komutlarıdır

---

## Manuel Testler Nasıl Çalıştırılır

1. AK-Tulpar Configurator'ı açın
2. JavaScript Programlama sekmesine gidin
3. Her test durumunu JavaScript düzenleyicisine yapıştırın
4. "INAV'a Derle" düğmesine tıklayın
5. Beklenen davranışı doğrulayın
6. Kaydetme testleri için "FC'ye Kaydet" düğmesine tıklayın (FC'ye bağlıysanız) veya ikinci bir derleme denemesini doğrulayın
