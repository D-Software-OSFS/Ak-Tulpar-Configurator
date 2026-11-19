# Harita Oluşturucu (Map Generator) - Teknik Notlar

Bu belge, Configurator içindeki **Harita Oluşturucu** sekmesinin (`tabs/map_generator.js`) teknik işleyişini, veri kaynaklarını ve yapılandırma seçeneklerini açıklar.

## Genel Bakış

Harita Oluşturucu sekmesi, INAV kara kutu (Blackbox) kayıtlarından veya canlı telemetri verisinden rota, yükseklik profili ve harita görselleştirmesi üretir. Yerleşik harita sağlayıcıları (map provider) üzerinden döşeme (tile) çeker ve rota üzerine bindirme (overlay) çizer.

## Harita Sağlayıcıları (Map Providers)

| Sağlayıcı | Açıklama | Not |
|-----------|----------|-----|
| OpenStreetMap | Varsayılan, ücretsiz | Online gerektirir |
| Yerel/çevrimdışı döşemeler | `resources/` içinden veya kullanıcı dizininden | Çevrimdışı kullanım için |

Harita sağlayıcısı seçimi ve anahtar (API key) gerektiren servisler için ayarlar `js/store.js` üzerinden kalıcı saklanır.

## Veri Kaynakları

- **Blackbox (.bbl/.csv) kayıtları:** Rota (GPS), yükseklik, hız, batarya vb.
- **Canlı bağlantı (MSP):** Anlık konum ve telemetri
- **GPX/KML içe aktarma:** `tabs/mission_control.js` üzerinden misión dosyaları

## Çizim (Overlay) Katmanları

- Rota çizgisi (GPS track)
- Yükseklik profili (ayrı grafik ekseninde)
- Hız ve ivme vektörleri
- Olay işaretleri (event markers: arm/disarm, failsafe vb.)

## Yapılandırma

- Birim sistemi (metrik/emperyal): `options_unit_type` ayarı
- Harita merkezi ve yakınlaştırma düzeyi kullanıcı tercihine göre saklanır
- Dışa aktarma: PNG/SVG harita görüntüsü, GPX/KML rota dosyası

## Geliştirici Notları

- Harita motoru 2D tuval (canvas) üzerinde çalışır; 3D görünüm için `js/groundstation.js` içindeki glTF modeliyle entegre çalışır.
- Büyük kayıt dosyalarında (binlerce nokta) performans için nokta seyreltme (decimation) uygulanır.
- Ağ erişiminin olmadığı ortamlarda çevrimdışı döşeme desteği zorunludur; eksik döşeme karoları için yer tutucu (placeholder) gösterilir.

## İlgili Dosyalar

- `tabs/map_generator.js` - sekme arayüzü ve olaylar
- `js/groundstation.js` - harita/yer istasyonu görselleştirme çekirdeği
- `tabs/mission_control.js` - GPX/KML içe-dışa aktarma
- `js/store.js` - kalıcı ayarlar
