# Tarayıcı Portu Bağımlılık Denetimi

Kapsam: dağıtılan uygulama kodu ile Electron derleme/çalışma giriş noktaları. Test yardımcı dosyaları ve geliştirici özel betikler ayrı özetlenir. Bu rapor taşıma öncesi denetimi kaydeder; PoC onayından sonra eklenen Web Serial taşıması aşağıda belgelendirilmiştir.

## Yönetici Özeti

MSP protokol/ileti katmanı zaten taşıma-bağımsızdır: `js/msp/` ve `js/serial_queue.js` içinde Node veya Electron API'si içe aktarılmaz. Masaüstü sınırı `js/connection/connectionSerial.js` → `window.electronAPI` → `js/main/preload.js` → `js/main/serial.js` şeklindedir. Bir Web Serial taşıması, mevcut `ConnectionSerial` kamusal arayüzünü (`connectImplementation`, `disconnectImplementation`, `sendImplementation`, geri çağrı kaydı ve `getDevices`) koruyarak yalnızca IPC/yerel (native) arka ucunu kaldırabilir.

Tarayıcı hedefi güvenli bir bağlamda (HTTPS veya `localhost`) çalışmalıdır. Web Serial ve WebUSB, seçicileri için bir kullanıcı hareketi gerektirir ve Chromium ailesi API'leridir; bu nedenle desteklenmeyen tarayıcılarda net bir yetenek mesajı gösterilmelidir.

## Seri I/O

| Dosya(lar) | Masaüstü bağımlılığı ve amacı | Tarayıcı yerine geçirme / taşıma notu |
| ---------- | ---------------------------- | -------------------------------------- |
| `js/main/serial.js` | `serialport`, `@serialport/stream` ve `@serialport/bindings-cpp` içe aktarır; işletim sistemi cihaz yollarını listeler, bir yol açar, `Buffer` yazar ve veri/olayları Electron IPC'ye iletir. | Daha önce izin verilmiş portlar için `navigator.serial.getPorts()`, bağlan düğmesinden `navigator.serial.requestPort()`. `SerialPort.open({ baudRate })`, `readable.getReader()` ve `writable.getWriter()` yerel akışın yerini alır. Tarayıcı portları nesnedir, kararlı işletim sistemi yol dizgileri değildir. |
| `js/connection/connectionSerial.js` | `electronAPI` seri bağlan/gönder/kapat/liste yöntemlerini çağırır ve IPC veri/hata/kapanma olaylarına abone olur. Bu, işleyici tarafındaki seri taşımasıdır. | Aynı kamusal yöntemler ve geri çağrı davranışıyla bir tarayıcı bağdaştırıcısı uygulayın. `SerialPort`'a, okuma döngüsüne ve bayt teslimine sahip olur. Mevcut MSP çağıranları değişmeden kalır. |
| `js/main/preload.js` | IPC seri yöntemlerini ve olay aboneliklerini açığa çıkarır. | Web paketinden kaldırın; tarayıcı seri bağdaştırıcısı doğrudan Web Serial kullanır. |
| `js/port_handler.js` | Seri cihaz numaralandırmasını yoklar ve port seçiciyi doldurur. | `navigator.serial.getPorts()` ile daha önce verilmiş portları listeleyin; DFU seçeneği için `navigator.usb.getDevices()` kontrolü kalır. |
| `js/sitl.js` | Simülatör portu aracı için yerel seri numaralandırması kullanır. | Yerel SITL tarayıcıda desteklenmez; SITL yalnızca masaüstünde çalışır. |

## Dosya Sistemi, İndirmeler ve Kalıcı Ayarlar

| Dosya(lar) | Masaüstü bağımlılığı ve amacı | Tarayıcı yerine geçirme / taşıma notu |
| ---------- | ---------------------------- | -------------------------------------- |
| `js/main/main.js` | `node:fs` / `node:fs/promises`: `userData/inav-backups` dizininde oku, yaz, ekle, sil, chmod, oluştur/liste işlemleri yapar. | Yedekler için File System Access API veya IndexedDB kullanın. |
| `js/backup_restore.js` | CLI yedeklerini saklar, yerel aç/kaydet diyaloglarını çağırır, işletim sistemi yoluyla geri yükler ve yerel yedek dosyalarını budar. | Tarayıcıda dosya seçici (`<input type=file>`) ve indirme (`URL.createObjectURL`) kullanın. |
| `tabs/mission_control.js` | `.kml`/`.kmz` dosyalarını açar ve görev verisini `dialog`/`electronAPI.readFile` ile kaydeder. | Dosyaları tarayıcıdan okumak için File API kullanın. |
| `js/store.js` | Değerleri `electron-store` üzerinden kalıcı saklar. | `localStorage`/IndexedDB kullanın. |
| `js/main/main.js` | Yolları oluşturmak için Electron `app.getPath('userData')` kullanır. | Tarayıcıda dosya sistemi yolu yoktur; sanal adlandırma kullanın. |

## USB / DFU Flashlama

| Dosya(lar) | Masaüstü bağımlılığı ve amacı | Tarayıcı yerine geçirme / taşıma notu |
| ---------- | ---------------------------- | -------------------------------------- |
| `js/protocols/stm32usbdfu.js` | DFU için `navigator.usb` ile `open`, arayüz isteme (claim), kontrol aktarımları ve kapatma kullanır. DFU protokolünün kendisi zaten tarayıcı uyumludur. | Değişiklik gerekmez; WebUSB Chromium tabanlı tarayıcılarda çalışır. |
| `js/port_handler.js` | DFU port seçeneğini eklemek için `navigator.usb.getDevices()` kontrol eder. | Aynen kalır. |
| `js/main/main.js` | Önyükleyici cihazlarını otomatik seçmek/izin vermek için `session.select-usb-device` ve `setDevicePermissionHandler` kullanır. | Electron'a özeldir; tarayıcıda `navigator.usb.requestDevice()` kullanıcı hareketiyle çağrılır. |
| `package.json` | Yerel `usb` bağımlılığı paketlenir. Denetlenen ağaçta hiçbir dağıtılan işleyici kaynağı bunu içe aktarmaz. | Web derlemesinden çıkarılabilir. |

## Yerel Diyaloglar ve Kabuk Entegrasyonu

| Dosya(lar) | Masaüstü bağımlılığı ve amacı | Tarayıcı yerine geçirme / taşıma notu |
| ---------- | ---------------------------- | -------------------------------------- |
| `js/main/main.js` | `dialog.showOpenDialog`, `dialog.showSaveDialog`, senkron uyarı ve onay kullanır. | File System Access API (`showOpenFilePicker`/`showSaveFilePicker`) veya `<input type=file>` / indirme bağlantısı kullanın. |
| `js/main/preload.js`, `js/dialog.js` | Electron diyaloglarını açığa çıkarır ve sarar; tüm arayüz çağıranları bu sarıcıya bağımlıdır. | Sarıcıyı tarayıcıda aynı arayüzle yeniden uygulayın (File API'ye düşerek). |
| `js/main/main.js` | `shell.openExternal` ve `shell.openPath` kullanır. | `window.open(url, '_blank')` kullanın; yerel dosya açma desteklenmez. |

## Alt Süreçler ve Yerel SITL

| Dosya(lar) | Masaüstü bağımlılığı ve amacı | Tarayıcı yerine geçirme / taşıma notu |
| ---------- | ---------------------------- | -------------------------------------- |
| `js/sitl.js`, `js/web/SITL-Webassembly.js` | Yerel SITL ikilisi `child_process` ile başlatılır; WebAssembly sürümü tarayıcıda çalışır. | Masaüstünde yerel ikili, tarayıcıda WASM sürümü (`js/web/SITL-Webassembly.js`) kullanılır. |
| `js/main/main.js` | SITL ikililerini `process.resourcesPath` altından başlatır. | Tarayıcıda statik varlık URL'si (`new URL(..., import.meta.url)`) kullanın. |

## TCP ve UDP Bağlantıları

| Dosya(lar) | Masaüstü bağımlılığı ve amacı | Tarayıcı yerine geçirme / taşıma notu |
| ---------- | ---------------------------- | -------------------------------------- |
| `js/main/tcp.js`, `js/connection/connectionTcp.js` | Node `net` keyfi TCP yuvaları açar ve akış verisini IPC üzerinden aktarır. | Tarayıcılar keyfi TCP açamaz; WebSocket sunucusu gerekir (ayrı bir köprü sunucusu gerekir). |
| `js/main/udp.js`, `js/connection/connectionUdp.js` | Node `dgram` ham UDP açar/bağlar/gönderir ve veri gramlarını IPC üzerinden aktarır. | Tarayıcılar ham UDP açamaz. |
| `js/main/preload.js` | TCP/UDP IPC yöntemlerini ve geri çağrılarını açığa çıkarır. | Web paketinden silinir. |

## Electron Çalışma Zamanı, IPC, Pencereleme ve İzinler

| Dosya(lar) | Masaüstü bağımlılığı ve amacı | Tarayıcı yerine geçirme / taşıma notu |
| ---------- | ---------------------------- | -------------------------------------- |
| `js/main/main.js` | Pencere oluşturma, yaşam döngüsü, IPC işleyicileri, `session` API'leri. | Web derlemesinden tamamen çıkarılır. |
| `js/main/preload.js` | `contextBridge` ile `window.electronAPI` oluşturur. | Web paketinden kaldırılır; bağdaştırıcılar doğrudan Web API'lerini çağırır. |
| `js/libraries/bluetooth-device-chooser/bt-device-chooser-preload.js`, `...-renderer.js` | Electron tabanlı Bluetooth cihaz seçici. | Tarayıcıda Web Bluetooth (`navigator.bluetooth.requestDevice`) kullanın. |
| `js/main/main.js` | `electron-window-state` ve `electron-store` ile pencere geometrisi ve tercihler. | Tarayıcı pencere geometrisi ayarlanamaz; tercihleri `localStorage`/IndexedDB ile saklayın. |
| `js/configurator_main.js`, `js/localization.js`, `js/appUpdater.js` | Electron uygulama sürümü ve yerel ayar sorguları. | Derleme zamanı web sürümü (veya derleme bildirimi) ve `navigator.language`/`navigator.languages` kullanın. Masaüstü otomatik güncelleme web dağıtımına dönüşür. |

## Yerel Yol Çözümleme ve Paketlenen Kaynaklar

| Dosya(lar) | Masaüstü bağımlılığı ve amacı | Tarayıcı yerine geçirme / taşıma notu |
| ---------- | ---------------------------- | -------------------------------------- |
| `js/main/main.js` | Önyükleme dosyalarını, işleyici çıktısını, simgeleri ve SITL ikililerini bulmak için `path`, `fileURLToPath`, `__dirname`, `app.getAppPath()`, `process.resourcesPath`, `path.join()` kullanır. | Vite tarafından üretilen statik URL'ler/kaynak içe aktarmaları ve URL gerekirse `new URL(relativePath, import.meta.url)` kullanın. Dosya sistemi yollarını işleyiciye açığa çıkarmayın. |
| `js/groundstation.js` | Uçak simgesi URL'si için bildirilmemiş Node tarzı `path.join(__dirname, ...)` kullanır. | Paketlenen varlık URL'si (`new URL(..., import.meta.url).href` veya Vite varlık içe aktarma) ile değiştirin. Bu, Electron ana süreci dışında doğrudan tarayıcı engelidir. |
| `forge.config.js`, `vite.base.config.js`, `vite.bt-dc-renderer.config.js` | Node `path`, `fs`, `url`, `module` ve Electron/Vite ile masaüstü paketleme. | Yalnızca masaüstü derleme olarak tutun. Electron ana/önyükleme/yerel eklenti girdileri olmayan statik HTML girişli ayrı bir tarayıcı Vite yapılandırması ekleyin (`vite.web.config.js`). |

## Derleme Zamanı / Geliştirici Özel Node Kullanımları (web çalışma zamanı engeli değil)

| Konum | Amaç | Tarayıcı notu |
| ----- | ---- | ------------- |
| `tests/**/*.test.*`, `tests/transpiler/**` | Node test çalıştırıcısı, doğrulamalar, dosya sistemi, yollar ve bazı alt süreç test düzenekleri. | CI'da kalır, web pakete girmez. |
| `js/transpiler/scripts/generate-constants.js` | Node dosya sistemi/yol/CLI kod üreticisi. | Geliştirici aracı olarak kalır. |
| `support/glb_set_roughtness_1.js` | Node CLI varlık işleme aracı. | Geliştirici aracı olarak kalır. |
| `forge.config.js` ve Electron Forge bağımlılıkları | Dağıtım paketleyicileri ve yerel modüller. | Yalnızca masaüstü için. |

## PoC Onayından Sonra Güvenli Uygulama Sınırı

1. **Seri taşıma:** `js/connection/connectionSerial.js` arayüzünü koruyun; Electron IPC katmanını (`js/main/serial.js`, `js/main/preload.js` seri bölümleri) çıkarıp yerine Web Serial bağdaştırıcısı koyun.
2. **MSP katmanı değişmez:** `js/msp/`, `js/serial_queue.js` ve tüm çağıranlar taşıma bağımsızdır.
3. **Dosya işlemleri:** `js/dialog.js` sarıcısını aynı arayüzle File System Access API'ye düşürün; yedekleri tarayıcıya indirin.
4. **Ayarlar:** `js/store.js` yerine `localStorage`/IndexedDB.
5. **SITL:** tarayıcıda `js/web/SITL-Webassembly.js` (WASM), masaüstünde yerel ikili.
6. **Derleme:** masaüstü için mevcut `forge.config.js` + Vite; web için `vite.web.config.js` ile saf statik HTML girişi.

## Seri Taşıma Durumu

### Web Serial Üzerinden CLI

- Web Serial taşıması eklendi: `navigator.serial.requestPort()` kullanıcı hareketiyle çağrılır, `SerialPort.open({ baudRate })` ile açılır.
- Okuma döngüsü `readable.getReader()` ile yapılır; baytlar MSP kuyruğuna (`js/serial_queue.js`) beslenir.
- `ConnectionSerial` kamusal arayüzü (`connectImplementation`, `disconnectImplementation`, `sendImplementation`, geri çağrı kaydı, `getDevices`) korunur; bu sayede tüm MSP çağıranları değişmeden çalışır.
- Gereksinimler: güvenli bağlam (HTTPS/`localhost`), Chromium tabanlı tarayıcı ve kullanıcı hareketi. Aksi halde arayüzde net bir "desteklenmiyor" mesajı gösterilir.
