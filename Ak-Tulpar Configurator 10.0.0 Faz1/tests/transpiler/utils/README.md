# Test Yardımcı Araçları

Bu dizin, transpiler'ı analiz etmek ve test etmek için yardımcı araçlar içerir.

## Araçlar

### compare_original_vs_roundtrip.mjs

Orijinal mantık koşulları (LC) ile yuvarlak yol (round-trip) derlemesinden sonra yeniden derlenen LC'ler arasında ayrıntılı karşılaştırma yapar (decompile → yeniden derleme).

**Kullanım:**

```bash
node tests/transpiler/utils/compare_original_vs_roundtrip.mjs
```

**Ne yapar:**

- LC sayısını karşılaştırır
- Eksik/fazla işlemleri bulur
- Tüm LC'lerin yan yana karşılaştırmasını gösterir
- Optimizasyonların nerede gerçekleştiğini belirlemek için kullanışlıdır

**Not:** Bu betik `tests/transpiler/test-data/vtol-transistion-lcs.txt` test dosyasını kullanır. Farklı LC kümelerini analiz etmek için bu dosyayı değiştirin veya betikteki yolu güncelleyin.

### functional_comparison.mjs

Orijinal ve yeniden derlenen LC'ler arasında, gerçek çıktıları (RC override'ları) karşılaştırarak işlevsel eşdeğerliği kontrol eder.

**Kullanım:**

```bash
node tests/transpiler/utils/functional_comparison.mjs
```

**Ne yapar:**

- RC_OVERRIDE işlemlerini (gerçek çıktılar) karşılaştırır
- Tüm override değerlerinin eşleştiğini doğrular
- Elimine uğramış optimizasyonları belirler
- İşlevsel olarak eşdeğerse çıkış kodu 0 döndürür

**Kullanım amacı:** Optimizasyonların davranışı değiştirmediğinden emin olmak için regresyon testi.

### find_unhoist_duplicates.mjs

Optimizasyon fırsatlarını bulmak için orijinal LC'lerdeki yinelenen kalıpları analiz eder.

**Kullanım:**

```bash
node tests/transpiler/utils/find_unhoist_duplicates.mjs
```

**Ne yapar:**

- Yinelenen işlem kalıplarını bulur (aktivatörleri yok sayarak)
- Hangi LC'lerin aynı işlem+operand kombinasyonunu paylaştığını gösterir
- Derlenmiş koddaki const değişkenlerini listeler
- Neyin "hoist" edilmesi (öne çıkarılması) gerektiğini belirlemeye yardımcı olur

### analyze_remaining_gap.mjs

Orijinal ile yeniden derlenen arasındaki kalan LC farkını analiz ederek optimizasyon fırsatlarını belirler.

**Kullanım:**

```bash
node tests/transpiler/utils/analyze_remaining_gap.mjs
```

**Ne yapar:**

- İşlem türlerini sayar ve karşılaştırır
- Hangi işlemlerin yinelendiğini belirler
- Farka hangi LC'lerin katkıda bulunduğunu gösterir
- Bir sonraki optimizasyon hedefini bulmak için kullanışlıdır

## Kendi Test LC'lerinizi Ekleme

Farklı LC kümleriyle test yapmak için:

1. `tests/transpiler/test-data/vtol-transistion-lcs.txt` dosyasını kendi test verilerinizle değiştirin
2. Veya betiklerdeki dosya yolunu güncelleyin:

```javascript
const originalText = readFileSync(new URL('../test-data/sizin-lcs.txt', import.meta.url), 'utf-8');
```

LC dosya formatı standart INAV mantık koşulu çıktısıdır:

```
logic 0 1 -1 1 2 31 0 1 0
logic 1 1 0 14 2 11 0 0 0
...
```

## CI/CD ile Entegrasyon

Bu araçlar otomatik testlere entegre edilebilir:

```bash
# İşlevsel karşılaştırmayı çalıştırın; eşdeğer değilse başarısız olsun
node tests/transpiler/utils/functional_comparison.mjs || exit 1
```
