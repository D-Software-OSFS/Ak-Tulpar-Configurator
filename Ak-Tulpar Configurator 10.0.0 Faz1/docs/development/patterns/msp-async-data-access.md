# Desen: MSP Asenkron Veri Erişimi

## Sorun

MSP ile yüklenen verilere, yanıt alınmadan ve işlenmeden önce erişildiğinde yarışı koşulları (race condition) oluşur.

## Temel İlke

- **YAPIN:** MSP isteklerini erken gönderin (algılanan performansı artırır)
- **YAPMAYIN:** Döönen değerlere, yanıt geri çağrısı (callback) tetiklenmeden erişmeyin

## Kötü Desen

```javascript
// Sekme başlatma
mspHelper.loadSomeData();  // Asenkron istek gönderir

// Aynı senkron çalıştırmada, daha sonra...
doSomethingWith(FC.SOME_DATA);  // HATA: Veri henüz yüklenmedi!
```

## İyi Desen

```javascript
// Sekme başlatma - isteği erken gönder
mspHelper.loadSomeData(function() {
    // Veriye yalnızca geri çağrı içinde erişin
    doSomethingWith(FC.SOME_DATA);
});
```

## Alternatif: Merkezileştirilmiş Güncelleme Fonksiyonu

Birden fazla veri parçasının yüklenmesi gerekiyorsa, arayüz güncellenmeden önce:

```javascript
// İstekleri erken gönderin, arayüzü koordineli geri çağrı zincirinde güncelleyin
OSD.reload(function() {
    // OSD.reload tüm MSP yüklemelerini kendi içinde halleder
    // Yalnızca TÜM veriler hazır olduğunda çağrılır
    OSD.GUI.updateAll();  // Burada tüm OSD verisine erişmek güvenlidir
});
```

## Gerçek Örnek (`tabs/osd.js`)

`OSD.GUI.update()` tam olarak bu desendir: `OSD.reload(function() { OSD.GUI.updateAll(); })`.
OSD/özel öğe/mantık koşulu verilerinin yüklenmesini bekleyen her şey, sekmenin senkron başlatma yolunda değil, o geri çağrının veya `OSD.reload()`'un kendi içsel promise zincirinin içinde çalışır:

- `updatePilotAndCraftNames()`, `OSD.GUI.updateAll()` içinden çalıştığı için yalnızca `OSD.reload()` zinciri tamamlandıktan sonra çalışır. Sekme yüklendiğinde `OSD.reload()` zaten yalnızca asenkron OSD font yükü çözüldükten sonra çağrılır (font seçicinin `import(...).then(...)` geri çağrısı `OSD.GUI.update()` çağırır, o da `OSD.reload()` çağırır) — bu yüzden `updatePilotAndCraftNames()` doğrudan sekme başlatmadan değil, hem font yükü hem de `OSD.reload()` zinciri tamamlandıktan sonra çalışır.
- `OSD.reload()` içinde, özel OSD öğeleri ve Mantık Koşulları "yapılandırılmış" maskesi (`FC.LOGIC_CONDITIONS_CONFIGURED_MASK`, `MSP2_INAV_LOGIC_CONDITIONS_CONFIGURED` ile alınır) sıralı olarak yüklenir ve `createCustomElements()` yalnızca her iki adım da çözüldükten sonra çalışır (LC maskesi alınırken `.catch()` geri dönüşü vardır; bu sayede oradaki bir hata özel öğelerin render edilmesini engellemez). `getLCoptions()` aynı maskeyi LC açılır listelerini doldururken okur ve henüz yüklenmemişse `if (!mask) return result;` koruması vardır.

Ders: Birden fazla bağımsız MSP yüklemesi aynı arayüz güncellemesine besleniyorsa, bunları zincirleyin (veya son adımı hepsine bağlı kılın); bunları ayrı ayrı gönderip başka bir şeyin sonucu okumasını ummayın.

## Benzer Sorunları Nasıl Tespit Ederiz

1. **Hata imzası:** `Cannot read properties of undefined (reading 'xxx')`
2. **Konum:** Genellikle `FC.*` veri yapılarına erişen bir fonksiyonda
3. **Zamanlama:** Özellikle eski/yavaş firmware ile sekme yüklenirken oluşur
4. **Desen:** Geri çağrısız `mspHelper.load*()` çağrılarının ardından o veriye erişen kodu arayın

## Diğer Sekmeler İçin Denetim Listesi

```bash
# Sıfır argümanlı, geri çağrısız MSP yüklerini bulur (yalnızca bu dar durumu yakalar)
grep -n "mspHelper\.load.*();" tabs/*.js

# Belirli bir FC.* özelliğinin nerede okunup yazıldığını, tek sekme özelinde bulur
grep -n "FC\.PROPERTY_NAME" tabs/bazi_sekme.js
```

İlk grep yalnızca hiç geri çağrısı olmayan yükleri yakalar — bu kod tabanında daha yaygın olan, geri çağrısı verilip iki bağımsız asenkron zincirin aynı veriye dokunduğu durumu kaçıracaktır (yukarıdaki `createCustomElements()` örneğinde olduğu gibi: hata eksik geri çağrı değildi, iki yük yolunun birbiriyle yarışıydı). Bu şekil için güvenilir bir grep yoktur; sekmenin init fonksiyonunun ve çağırdığı `OSD.reload()`/benzeri toplayıcının manuel okunması gerekir.

Sorulacak sorular:

1. Bu MSP verisine, yükleme geri çağrısı tetiklenmeden erişiliyor mu?
2. Aynı veriye erişen birden fazla asenkron zincir arasında bir yarışı var mı?
3. Bu fonksiyon geri çağrı zincirine mi, yoksa zaten bu verinin bağlı olduğu diğer yükleri sıralayan toplayıcıya mı taşınmalı?

## İlgili

- MSP yanıtları asenkrondur — geri çağrı yanıt geldiğinde tetiklenir
- JavaScript tek iş parçacıklıdır ama asenkron işlemler kesişir
- Eski firmware daha yavaş yanıt verebilir; bu da yarışların ortaya çıkma olasılığını artırır
