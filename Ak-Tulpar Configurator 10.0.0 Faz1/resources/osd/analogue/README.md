# OSD Yazı Tipi Dosyaları

Bu dizin her yazı tipi için bir dizin içerir. Her dizinde, her karakter `%d%d%d.png` olarak adlandırılır; buradaki rakamlar uzantısız dosya adındaki ondalık karakter numarasını ifade eder. Tüm karakterler `default` yazı tipi dizininde bulunmalıdır. Alternatif yazı tipi dizinlerinde eksik karakterler varsa, o karakterin varsayılan sürümü kullanılır.

`.mcm` dosyalarını doğrudan değiştirmeyin; bu dosyalar yalnızca karşılık gelen yazı tipi dizinindeki `.png` dosyaları düzenlenerek değiştirilmelidir.

Karakter haritası dosyaları (`.mcm`), her yazı tipini temsil eden dizindeki `.png` dosyalarından [max7456tool](https://github.com/fiam/max7456tool) ile oluşturulur.

Kaynak `.png` dosyalarında herhangi bir değişiklik yaptıktan sonra `.mcm` dosyalarını güncellemek için şunu çalıştırın:

```sh
max7456tool -f generate fonts.yaml
```

Unutmayın: `.mcm` dosyaları manuel olarak yeniden üretilmeli, repo'ya eklenmeli (commit edilmeli)dir; önizleme `.png` dosyaları (bu dizinde doğrudan bulunanlar, kaynak alt dizinlerindekiler değil) önbelleğe alınmaz — yalnızca yazı tiplerini hızlıca gözden geçirmek için üretilirler (bunu önlemek için `.gitignore` ayarlanmıştır).

Yeni bir yazı tipi eklemek için kaynak `.png` dosyalarıyla birlikte dizinini oluşturun, `fonts.yaml` içindeki listeye ekleyin ve `.mcm`'i yeniden üretmek için `max7456tool` komutunu tekrar çalıştırın.
