# INAV HD Yazı Tipleri

Bu yazı tipi karakter görselleri HD FPV sistemleriyle kullanım içindir. Bunlar; düzenleme, yeni semboller ekleme veya alternatif yazı tipleri türetme için kullanılan ana (master) görsellerdir. Bu karakter görsellerini belirli dosyalara derlemek için [HD OSD Font Tool](https://github.com/MrD-RC/hdosd-font-tool) aracını kullanın.

## Kullanım

Bu dizin **yazı tipi kök** dizinidir. `default` alt dizini varsayılan INAV HD yazı tiplerini içerir. Yeni semboller burada eklenmeli ve varsayılan yazı tipi burada tutulmalıdır. `default` içinde üç alt dizin vardır:

- 12x18
- 24x36
- 36x54

Bu alt dizin adları, içlerindeki görsellerin karakter başına piksel boyutunu belirtir. Yeni yazı tiplerinde bu dizin yapısına uyulmalıdır. Varsayılan yazı tipi yeniden adlandırılmamalı ve INAV'ın ana sürümü için gerekli tüm font sembollerini her zaman içermelidir.

- **12x18**, Walksnail tarafından istenmişti; ancak kullanılmıyor görünmektedir.
- **24x36**, Avatar ve HDZero tarafından kullanılır.
- **36x54**, Avatar ve WTF OS tarafından kullanılır.

### Yeni bir yazı tipi oluşturma

Bu `digital` **yazı tipi kök** dizini içinde yeni bir dizin oluşturun ve ona yazı tipinizin adını verin. Yazı tipinizin dizini içinde, yukarıda gösterilen boyutlar için dizin yapısını oluşturun. Hepsini oluşturmanız gerekmez; yalnızca birini oluşturacaksanız `36x54` görsel dizinini öneririz.

Görsellerinizi oluştururken yalnızca değiştirmek istediklerinizi eklemeniz yeterlidir. Eksik görseller varsayılan yazı tipinden alınır. Tüm görseller şeffaflık içeren PNG dosyaları (RGBA) olmalıdır. Avatar ve WTF OS, OSD'de şeffaflık için Alfa kanalını kullanır. HDZero bir RGB(127, 127, 127) gri arka plan kullanır; ancak bu, araç tarafından otomatik olarak eklenir. Bu nedenle yalnızca Alfa şeffaflığı olan karakterler oluşturun — böylece üç sistemde de kullanılabilirler.

Görsellerinizi oluşturduktan sonra, seçtiğiniz firmware tarafından kullanılan görsel dosyalarını üretmek için HD OSD Font Tool'u kullanın.
