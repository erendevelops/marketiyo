# Arama İçeriği ve Kampanya Takvimi — Tasarım Kaydı

**Tarih:** 2026-09-12
**Durum:** Uygulandı
**İlgili kayıtlar:** `2026-09-11-marketiyo-design.md`, `2026-09-11-ads-design.md`

---

## 1. Arama içeriği bölümü

Reklam bölümüyle aynı desende, kendi alt sistemi. Sosyal akışa ve reklam akışına
dokunmaz, marka profilini onlarla paylaşır.

### Akış

İki adım, sosyal taraftaki desenin aynısı. Önce ucuz kayıtlar üretilir, pahalı
içerik yalnızca saklanan konular için üretilir.

1. **Konu üretimi.** İsteğe bağlı bir konu alanı verilir, model o alanda yazı
   konuları döndürür. Her konu bir başlık, ana arama ifadesi, yan ifadeler, arama
   niyeti, huni aşaması, açı ve en az üç maddelik bir ana hat taşır.
2. **Taslak.** Saklanan bir konu tam yazıya dönüşür. Gövdeyle birlikte meta başlık
   ve meta açıklama da üretilir.

Daha önce üretilmiş başlıklar tekrar önlemek için prompt'a geri beslenir, en fazla
120 başlık.

### Uydurulmayan veri

Model arama hacmi, zorluk puanı veya tıklanma tahmini üretmez. Bu hem kural kartında
hem şablonda açıkça yasaklandı ve şemada böyle bir alan hiç tanımlanmadı.

Gerekçe: bu verilere erişim yok. Uydurulmuş bir hacim rakamı, olmayan bir rakamdan
daha tehlikelidir, çünkü güven verir ve yanlış konuya aylar harcatır. Bunun yerine
arama niyeti ve huni aşaması üretilir. İkisi de metinden çıkarılabilir, dolayısıyla
dürüsttür.

### Sınırlar

Meta başlık 60, meta açıklama 160 karakterle şemada sınırlıdır. Sınırı aşan bir
taslak doğrulamada reddedilir, çünkü arama sonucunda kırpılacak bir meta etiketi
işe yaramaz.

### Veri

`workspace/articles.json` konuları, `workspace/articles/<id>.md` taslakları tutar.

## 2. Kampanyaların takvimde görünmesi

Reklam kampanyası takvime slot olarak girmiyor. Slot günlük bir paylaşımı temsil
eder, reklam ise bir süre boyunca kesintisiz yayındadır. İkisini aynı kutuya
koymak yanlış bir zihinsel model kurardı.

Bunun yerine kampanyaya isteğe bağlı bir başlangıç tarihi eklendi. Tarih girilince
kampanya, takvimin üstünde o hafta yayında olan kampanyaları listeleyen bir şeritte
görünür. Bitiş tarihi başlangıç ve süreden hesaplanır, başlangıç günü birinci gün
sayılır.

Alan isteğe bağlı ve varsayılanı boş olduğu için mevcut kampanya dosyaları
değişiklik gerektirmeden okunmaya devam eder.

Takvim slot şeması hiç değişmedi.

## 3. Kapsam dışı

Anahtar kelime kümeleri hâlâ modelin önerisi, gerçek arama verisi değil. Gerçek
veri istenirse bir arama konsolu veya anahtar kelime aracı entegrasyonu gerekir,
bu da kendi tasarımını hak eder.

Reklam kampanyaları için performans takibi yok. Canlı trend araştırması ve
performans geri beslemesi ilk sürümden beri ertelenmiş durumda.
