# Reklam Bölümü — Tasarım Kaydı

**Tarih:** 2026-09-11
**Durum:** Uygulandı
**İlgili spec:** `2026-09-11-marketiyo-design.md`

---

## Karar

Marketiyo yalnızca sosyal medyaya odaklı kalmıyor. Reklam, sosyal akıştan bağımsız
kendi bölümü olarak eklendi. Sosyal akışa hiç dokunulmadı.

Reklam bölümü kendi şemasını, kendi dosyasını ve kendi ekranlarını kullanır. Marka
profilini sosyal tarafla paylaşır. Marka sesi, kanıtlar ve yasaklı ifadeler tek bir
yerde tanımlanır ve her iki bölüm de aynı bilgiyi okur.

## Üretim modeli

Tek çağrı, tam plan. Kullanıcı formu doldurur, model tek seferde konumlandırmayı ve
tüm reklam setlerini döndürür.

Alternatif, önce iskelet sonra metin üretmekti. Uzun tek yanıtın bozuk çıkma riski
daha yüksek olduğu için bu seçenek önerilmişti. Kullanıcı tek çağrıyı seçti, risk
şu iki önlemle karşılandı:

- Zarf doğrulanır, sonra her reklam seti tek tek doğrulanır. Bozuk set atılır,
  kalanı kaydedilir ve arayüz kaç setin atıldığını söyler.
- Reklam seti sayısı üç ile beş arasında sınırlıdır, çıktı sınırı 16 bin jetona,
  zaman aşımı beş dakikaya çekilmiştir.

## Bütçe kuralı

Toplam bütçeyi kullanıcı girer. Model tutar yazmaz, yalnızca yüzde ve gerekçe verir.

Yüzdeler nadiren tam 100 eder, bu yüzden uygulama onları normalize eder ve tutarı
kendisi hesaplar. Bozuk bir set atıldığında kalan setler yeniden ölçeklenir. Sonuç
olarak setlerin toplamı her zaman kullanıcının girdiği rakama eşittir.

Modelin kendi başına bütçe önermesi bilinçli olarak engellendi. Sektörü, maliyetleri
ve rekabeti bilmiyor. Uydurulmuş bir rakam, güven veren ama yanlış bir sayıdır.

## Karakter sınırları

Sınırlar şemaya gömüldü, yalnızca prompt'a bırakılmadı. Sınırı aşan bir varyant
doğrulamada elenir. Reklam yöneticisine yapıştırıldığında kırpılacak metin
çalışma alanına hiç girmez.

| Ağ | Sınırlar |
| --- | --- |
| Meta | Birincil metin 125, başlık 40, açıklama 30 |
| Google Arama | 3-15 başlık 30 karakter, 2-4 açıklama 90 karakter |
| TikTok | Reklam metni 100 karakter |

## Veri

`workspace/campaigns.json` kampanya kayıtlarını tutar. Her kampanya için okunabilir
bir kopya `workspace/campaigns/<id>.md` olarak yazılır.

## Kapsam dışı

SEO ve blog bölümü ayrı bir alt sistem olarak kararlaştırıldı, bu sürümde
yapılmadı. Kendi spec ve plan döngüsünü hak ediyor.

Reklam planları takvime girmiyor. Takvim organik paylaşım içindir, reklam yayın
takvimi farklı bir problemdir.
