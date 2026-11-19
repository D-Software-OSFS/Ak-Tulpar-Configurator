# Configurator için 3D model oluşturma

AK-Tulpar Configurator 3D modeller için [glTF](https://en.wikipedia.org/wiki/GlTF) formatını kullanır; bu formatta dışa aktarım yapabilen herhangi bir yazılım uygundur.

Bu eğitimde Blender'dan glTF dışa aktarımını görüyoruz.

## Ön Gereksinimler

- [Blender](https://www.blender.org/) — bu eğitimi yazdığımda 3.1 sürümünü kullanıyordum, sonraki sürümler de sorun çıkarmaz.

## Model oluşturma

Modeli tercih ettiğiniz 3D paketinde oluşturun. Ben Fusion 360 kullandım ve Oldukça büyük modeller oluşturdum. Boyutun bir önemi yok, Blender içinde yeniden boyutlandırılabilir. Modeli oluşturup çoğu parçayı birleştirdim ve istediğim yerlere renk ekledim. Can sıkıcı olan şey, Materyallerin Blender'a aktarılmaması. Ama alıştığınız paketle her şeyi ayarlamak daha kolay. Ayrıca modeldeki her nesneye isim vermenizi de şiddetle öneririm; bu ileride işleri kolaylaştırır. Materyallere de isim veriyorum, çünkü Blender malzeme isimlerini anlıyor gibi görünüyor. modelle memnun kaldığınızda, `.obj` dosyası olarak dışa aktarın.

## Blender'da temel düzenleme

Blender'ı açın ve `.obj` dosyanızı içe aktarın. Bu işlem oldukça sorunsuz gerçekleşmelidir.

### Ölçeklendirme

Ama modeliniz büyükse, kameranın önü kapanmış (engellenmiş) görünebilir. Bu durumda düz bir görünüme geçin (Üst, Alt, Sol, Sağ, Ön veya Arka); buna ekranın sol alt köşesinde, 3D küpün yanındaki Görünüm menüsünden erişilir. Orada, modelinizi yakınlaştırmak/uzaklaştırmak için sayı tuş takımı üzerindeki + ve - tuşlarını kullanabilmelisiniz. Tüm modelinizi görene kadar uzaklaşın. Sonra __Ölçekle__ (Scale) düğmesine tıklayın ve modeli yeniden boyutlandırmak için fareyi hareket ettirin. En geniş boyutunun etrafında yaklaşık 2.75 boş kare ızgara görene kadar küçültmek istersiniz.

![image](https://user-images.githubusercontent.com/17590174/120713107-6193c480-c4b9-11eb-80f0-9e95cf0cae4b.png)

### Döndürme

Bu noktada modelinizin doğru boyutta olması gerekir. Ancak henüz doğru yöne bakmıyor olabilir. __Üst__ görünümden modelinizin üstüne tepeden bakıyor olmalısınız. Ancak __Ön__ görünümde, modelin arkasına bakmanın Configurator için doğru yön olduğunu gördüm. Modelinizi döndürmek için __Döndür__ (Rotate) düğmesine tıklayın ve fareyi hareket ettirin. Fareyi hareket ettirirken __shift__ tuşunu basılı tutarsanız daha ince kontrol sağlarsınız.

### Materyaller

Sonra, tasarım sırasında seçtiğiniz materyalleri yeniden oluşturmak isteyeceksiniz. Ayrıntıya girmeyeceğim, ancak ekranın sağ üst köşesindeki listeden düzenlemek istediğiniz parçayı seçin. Altında, değiştirebileceğiniz bir düğme menüsü var. 3D küreyi bulun ve ona tıklayın. Orada renkleri vb. değiştirebileceğiniz malzeme düzenleyicisini bulacaksınız.

![image](https://user-images.githubusercontent.com/17590174/120714284-e59a7c00-c4ba-11eb-83d6-cff07a8fb476.png)

### Birleştirme (Joining)

Dışa aktarmadan önceki son aşama, tüm tek tek parçaları birleştirmektir. Daha sonra hâlâ düzenleyebilirsiniz. Ama bunu yapmazsanız, yalnızca son seçilen parçayı dışa aktarırsınız. Önce Configurator'da görünmesini istediğiniz 3D modelin tüm parçalarını seçin. Ekranın sağ üst köşesindeki nesne listesinde nesne adının solundaki üçgene tıklayın. Birden fazlasını seçmek için __shift__ tuşunu basılı tutun. Hepsi seçildikten sonra __Ctrl__ tuşunu basılı tutun ve __J__ tuşuna basın. Parçalar artık birleşmiş olmalı ve listede yalnızca bir nesne görmelisiniz (birleştirilmek için seçilmeyen nesneler elbette orada kalır). Çalışmadıysa __Ctrl__ + __J__ komutunu tekrar deneyin; bazen iki kez vermek zorunda kaldığım olmuştur.

## Modeli glTF olarak dışa aktarma

Birleşmiş nesnenizi seçin ve üst menüden __Dosya__ > __Dışa Aktar__ > **glTF 2.0 (.glb/.gltf)** yolunu izleyin. **glTF Yerleşik (.gltf)** formatını seçin, dışa aktarma klasörünü seçin ve bir ad verin — bu oldukça kolay olmalı. Bu dışa aktarma ayarları benim için sorunsuz çalıştı.

![Immagine 2022-03-28 115931](https://user-images.githubusercontent.com/40276199/160375086-ef0eb587-9574-4f4e-b101-ce24e27e0e12.png)

Ardından `.gltf` modelini Configurator'ın __/resources/models/__ klasörüne koyabilir ve modeli görüntüleyen kodu düzenleyebilirsiniz.

Eski `.json` dosyaları bu [araç](https://gist.github.com/donmccurdy/c090dc53c7bfb704ef9de654ecc07632) ile `.glTF`ye dönüştürülmüştür.
