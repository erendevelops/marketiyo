# Marketiyo

Ürünün için pazarlama içeriği üreten, kendi bilgisayarında çalışan bir araç.

**Türkçe** · [English](README.en.md)

> **Bu proje açık kaynak değil, kaynağı açık.** Kodu okuyabilir, çalıştırabilir
> ve kendin için değiştirebilirsin. Değiştirilmiş kopyaları yayınlamak yasaktır,
> tek istisna bu projeye katkı hazırlamak için açılan fork'lardır. Ayrıntılar:
> [LICENSE](LICENSE).

## İçindekiler

- [Ne yapar](#ne-yapar)
- [Nasıl çalışır](#nasıl-çalışır)
- [Hangi kurulum yolu sana göre?](#hangi-kurulum-yolu-sana-göre)
- [Adım adım kurulum (yazılım bilmeyenler için)](#adım-adım-kurulum-yazılım-bilmeyenler-için)
- [Hızlı kurulum (geliştiriciler için)](#hızlı-kurulum-geliştiriciler-için)
- [Claude Code bağlantısı](#claude-code-bağlantısı)
- [Gemini bağlantısı](#gemini-bağlantısı)
- [Günlük kullanım](#günlük-kullanım)
- [Güncelleme](#güncelleme)
- [Verilerin nerede](#verilerin-nerede)
- [Güvenlik](#güvenlik)
- [Sorun giderme](#sorun-giderme)
- [Geliştirme](#geliştirme)

## Ne yapar

| Bölüm | İşi |
| --- | --- |
| **Marka** | Ürününü, kitleni, üslubunu ve elindeki kanıtları tek yerde toplar. Üretilen her şey buna dayanır. Birkaç cümlelik tanımdan taslak çıkarabilir. |
| **Fikirler** | Ürünü hiç duymamış kişilere yönelik içerik fikirleri üretir. Sakladığın ve nedeniyle elediğin fikirler bir sonraki partiyi değiştirir. |
| **İçerik** | Sakladığın fikri yayına hazır hale getirir. Kısa video için kanca, senaryo, ekran metni ve çekim notları. |
| **Takvim** | Hazır içerikleri günlere yerleştirirsin. Hiçbir şey otomatik paylaşılmaz, paylaşıldı işaretini sen koyarsın. |
| **Reklam** | Meta, Google Arama ve TikTok için kampanya planı, reklam setleri ve metinler. Bütçeyi sen girersin, model yalnızca dağıtır. |
| **Blog** | Arama niyetine göre konu önerileri ve tam makale taslağı. |

Medya türleri: kısa video, görsel gönderi, kısa metin, uzun metin. Arayüz ve
içerik dili Türkçe veya İngilizce. Koyu ve açık tema.

## Nasıl çalışır

```
Tarayıcı  ->  Yerel sunucu (npm run dev)  ->  claude komutu  veya  Gemini API
                     |
                     v
              workspace/ klasörü (düz dosyalar)
```

- Uygulama yalnızca senin bilgisayarında çalışır. Hesap, bulut veya
  veritabanı yok. Bir web sitesi gibi tarayıcıda açılır ama internette değil,
  kendi bilgisayarında durur.
- **Claude Code** seçersen uygulama bilgisayarındaki `claude` komutunu
  çalıştırır ve orada giriş yapılmış aboneliğini kullanır. API anahtarı
  gerekmez, uygulama Anthropic'e kendisi bağlanmaz.
- **Gemini** seçersen yerel sunucu, kendi anahtarınla doğrudan Google'a istek
  atar. Anahtar tarayıcıya hiç gönderilmez.

## Hangi kurulum yolu sana göre?

| Durumun | Git |
| --- | --- |
| Terminal, Git, Node.js gibi kavramlar sana yabancı | [Adım adım kurulum](#adım-adım-kurulum-yazılım-bilmeyenler-için) |
| Bu araçları zaten kullanıyorsun | [Hızlı kurulum](#hızlı-kurulum-geliştiriciler-için) |

Yapay zekâ tarafında en kolayı **Gemini**: bir Google hesabı yeterli, ücretsiz
ve ek program kurmak gerekmez. Claude Pro veya Max aboneliğin varsa
**Claude Code** da kullanabilirsin, bir program daha kurman gerekir.

## Adım adım kurulum (yazılım bilmeyenler için)

Toplam 15 ila 20 dakika sürer. Her adımı sırayla yap, atlama.

### Başlamadan önce

**Gerekenler**

- Windows 10, Windows 11 veya macOS yüklü bir bilgisayar
- İnternet bağlantısı ve yaklaşık 1 GB boş alan
- Bir Google hesabı (Gemini için) **ya da** Claude Pro veya Max aboneliği

**Terminal nedir?** Bilgisayara yazıyla komut verdiğin, siyah veya beyaz bir
pencere. Bu kılavuzda yapman gereken tek şey, verilen komutu kopyalayıp bu
pencereye yapıştırmak ve **Enter**'a basmak.

- **Yapıştırma:** Windows'ta **Ctrl+V** veya pencereye sağ tıkla. macOS'ta **Cmd+V**.
- Komutu yazdıktan sonra her zaman **Enter**'a bas.
- Bir komut çalışırken pencerede yazılar akar. Satır başında yeniden yazı
  yazabileceğin imleç görünene kadar bekle.
- Sarı veya kırmızı `warn` (uyarı) yazıları çoğu zaman sorun değildir. Gerçek
  bir hata olursa [Sorun giderme](#sorun-giderme) bölümüne bak.

### Adım 1: Node.js'i kur

Marketiyo'yu çalıştıran program Node.js'dir.

1. <https://nodejs.org> adresine git.
2. **LTS** yazan sürümün indirme düğmesine bas.
3. İnen dosyayı aç ve kurulumu varsayılan ayarlarla bitir. Her ekranda
   **Next / İleri**, sonunda **Install / Yükle** demen yeterli.
4. Kurulum bittikten sonra bir terminal aç ve kontrol et:
   - **Windows:** Başlat menüsüne `PowerShell` yaz ve aç.
   - **macOS:** **Cmd+Boşluk**'a bas, `Terminal` yaz ve Enter.

   ```bash
   node -v
   ```

   `v22.12.0` gibi bir sürüm numarası görüyorsan tamam. Bu pencereyi kapatabilirsin.

### Adım 2: Marketiyo'yu indir

1. <https://github.com/erendevelops/marketiyo> adresine git.
2. Yeşil **Code** düğmesine bas, açılan menüden **Download ZIP**'i seç.
3. İnen `marketiyo-main.zip` dosyasını bul (genelde **İndirilenler** klasöründe).
4. Dosyayı aç:
   - **Windows:** Dosyaya sağ tıkla, **Tümünü ayıkla**'yı seç.
   - **macOS:** Dosyaya çift tıkla.
5. Çıkan `marketiyo-main` klasörünü kolay bulacağın bir yere taşı, örneğin
   **Belgeler**. Bu klasörü silme, uygulama ve verilerin burada duracak.

### Adım 3: Klasörün içinde terminal aç

Komutların Marketiyo klasöründe çalışması gerekiyor.

**Windows 11**

1. `marketiyo-main` klasörünü aç. İçinde `package.json`, `README.md` gibi
   dosyalar görmelisin.
2. Klasörün boş bir yerine sağ tıkla ve **Terminalde aç**'ı seç.

**Windows 10**

1. `marketiyo-main` klasörünü aç.
2. Üstteki adres çubuğuna tıkla, oradaki yazıyı silip `powershell` yaz ve Enter.

**macOS**

1. **Terminal**'i aç.
2. `cd ` yaz (sonunda bir boşluk olsun), Enter'a **basma**.
3. Finder'dan `marketiyo-main` klasörünü sürükleyip Terminal penceresine bırak.
   Klasörün yolu yazılır.
4. Enter'a bas.

Doğru yerde olup olmadığını anlamak için şunu çalıştır. Listede `package.json`
görmelisin:

```bash
ls
```

### Adım 4: Gerekli dosyaları indir

Bu komutu yalnızca ilk kurulumda bir kez çalıştırırsın. İnternet hızına göre
1 ila 5 dakika sürer:

```bash
npm install
```

Windows'ta **"betiklerin çalıştırılması bu sistemde devre dışı"** gibi kırmızı
bir hata görürsen komutu şöyle yaz, sonraki adımlarda da `npm` yerine
`npm.cmd` kullan:

```bash
npm.cmd install
```

### Adım 5: Uygulamayı başlat

```bash
npm run dev
```

Birkaç saniye sonra `Local: http://localhost:3000` yazısı çıkar. Tarayıcında
<http://localhost:3000> adresini aç. Marketiyo açılır.

**Önemli:** Bu terminal penceresi açık kaldığı sürece uygulama çalışır.
Pencereyi kapatırsan uygulama da kapanır. Kullanırken pencereyi küçültüp
kenarda bırak.

### Adım 6: Yapay zekâyı bağla

İkisinden birini seç.

#### Seçenek A: Gemini (en kolay, ücretsiz)

1. <https://aistudio.google.com/apikey> adresine git ve Google hesabınla giriş yap.
2. Kullanım koşullarını okuyup kabul et.
3. **Create API key / API anahtarı oluştur** düğmesine bas.
4. Oluşan uzun anahtarın yanındaki kopyala simgesine bas.
5. Marketiyo'da **Kurulum** sayfasını aç, **Gemini, kendi API anahtarınla**'yı seç.
6. Anahtarı **API anahtarı** kutusuna yapıştır. Model olarak önerileni bırak.
7. **Kaydet ve bağlantıyı sına**'ya bas. Yeşil **Bağlantı kuruldu** yazısını
   görürsen tamam.

Anahtarını kimseyle paylaşma. Ücretsiz anahtar günde yaklaşık 500 üretime yeter.

#### Seçenek B: Claude aboneliğinle

Claude Pro veya Max aboneliğin varsa bunu kullanabilirsin. Bir program daha
kurman gerekir. [Claude Code bağlantısı](#claude-code-bağlantısı) bölümündeki
adımları izle, sonra buraya dön.

### Adım 7: Marka profilini oluştur

1. Bağlantı kurulunca **Sonraki adım: marka profili** düğmesine bas.
2. En üstteki kutuya ürününü birkaç cümleyle anlat: ne yapıyor, kime yönelik,
   neden farklı.
3. **Taslağı oluştur**'a bas, alanlar senin için doldurulur.
4. Yanlış veya eksik olanları düzelt ve **Marka profilini kaydet**'e bas.

Artık tüm bölümler açık. Ana sayfa her zaman sıradaki adımı gösterir.

### Sonraki açılışlarda

Kurulum bir kez yapılır. Marketiyo'yu her kullanmak istediğinde:

1. [Adım 3](#adım-3-klasörün-içinde-terminal-aç)'teki gibi `marketiyo-main`
   klasöründe terminal aç.
2. `npm run dev` yaz ve Enter.
3. Tarayıcıda <http://localhost:3000> adresini aç.

**Kapatmak için** terminal penceresinde **Ctrl+C**'ye bas ya da pencereyi kapat.
Verilerin kaybolmaz.

## Hızlı kurulum (geliştiriciler için)

Gereksinimler: Node.js 20+, Git, ve Claude Code (Pro veya Max) ya da bir Gemini
API anahtarı.

```bash
git clone https://github.com/erendevelops/marketiyo.git
cd marketiyo
npm install
npm run dev
```

<http://localhost:3000> adresini aç, **Kurulum** sayfasında motoru seç, sonra
marka profilini doldur. 3000 portu doluysa: `npm run dev -- -p 3001`

## Claude Code bağlantısı

Claude Code, Anthropic'in terminalde çalışan programıdır. Marketiyo içerik
üretirken bu programı çalıştırır ve senin aboneliğini kullanır. Claude masaüstü
uygulaması bunun yerine geçmez.

**1. Claude Code'u kur.**

**Windows:** Önce <https://git-scm.com/downloads/win> adresinden **Git for
Windows**'u indirip varsayılan ayarlarla kur, Claude Code buna ihtiyaç duyar.
Sonra PowerShell'i aç ve şunu çalıştır:

```powershell
irm https://claude.ai/install.ps1 | iex
```

**macOS / Linux:** Terminal'i aç ve şunu çalıştır:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**2. Bir kez çalıştır ve giriş yap.** Terminale `claude` yaz. Tarayıcıda bir
sayfa açılır, Pro veya Max hesabınla giriş yap. Terminal birkaç soru sorarsa
varsayılanları seçebilirsin. Giriş bir kez yapılır, sonra hatırlanır. Çıkmak
için `/exit` yaz.

```bash
claude
```

**3. Marketiyo'yu yeni bir terminalden yeniden başlat.** Bu adım atlanırsa
Marketiyo `claude` komutunu bulamaz.

*Neden?* Kurulum, `claude` komutunun yerini sisteme ekler. Bu değişikliği
yalnızca kurulumdan **sonra** açılan terminal pencereleri görür.

1. Marketiyo'nun çalıştığı terminal penceresine geç ve **Ctrl+C** ile durdur.
   Tarayıcıdaki sayfa bağlantıyı kaybeder, bu normal.
2. Açık **bütün** terminal pencerelerini kapat.
   - VS Code, Cursor gibi bir editörün içindeki terminali kullanıyorsan
     editörü **tamamen kapatıp yeniden aç**.
3. [Adım 3](#adım-3-klasörün-içinde-terminal-aç)'teki gibi Marketiyo
   klasöründe yeni bir terminal aç.
4. Kontrol et. Bir sürüm numarası görüyorsan hazır:

   ```bash
   claude --version
   ```

5. Marketiyo'yu başlat ve tarayıcıdaki sayfayı yenile:

   ```bash
   npm run dev
   ```

**4. Marketiyo'da bağlan.** **Kurulum** sayfasında **Claude Code**'u seç ve
**Kaydet ve bağlantıyı sına**'ya bas. Sınama, girişin gerçekten yapıldığını
görmek için Claude'a çok kısa bir istek gönderir. 5 ila 30 saniye sürebilir ve
planından çok küçük bir kullanım düşer.

`claude` hâlâ bulunamıyorsa **Claude komutu** kutusuna tam yolunu yaz. Yolu
bulmak için yeni bir terminalde:

- Windows: `where claude`
- macOS / Linux: `which claude`

## Gemini bağlantısı

1. [Google AI Studio](https://aistudio.google.com/apikey)'da bir API anahtarı oluştur.
2. **Kurulum** sayfasında **Gemini**'yi seç, anahtarı yapıştır ve modeli seç.
3. **Kaydet ve bağlantıyı sına**'ya bas.

Modeller ve ücretsiz sınırlar (Eylül 2026):

| Model | Ücretsiz günlük istek | Not |
| --- | --- | --- |
| `gemini-3.1-flash-lite` | ~500 | Varsayılan, önerilen |
| `gemini-3.5-flash-lite` | ~500 | Daha yeni nesil |
| `gemini-3.5-flash` | ~20 | Daha güçlü, sınır çok düşük |
| `gemini-2.5-flash` | ~20 | |

Her üretim bir istek kullanır. Model hatalı biçimde yanıt verirse bir kez daha
dener, yani en fazla iki. Güncel sınırların
[AI Studio](https://aistudio.google.com/rate-limit)'da görünür.

## Günlük kullanım

1. Marketiyo klasöründe terminal aç, `npm run dev` çalıştır.
2. <http://localhost:3000> adresini aç. Ana sayfa sıradaki adımı gösterir.
3. **Fikirler**: medya türünü seç, fikir üret, beğendiklerini sakla, diğerlerini
   nedeniyle ele.
4. Sakladığın fikri **İçeriğe dönüştür**, gerekirse metni düzelt.
5. **Takvim**'de içeriği bir güne yerleştir, paylaşınca işaretle.
6. İşin bitince terminalde **Ctrl+C**.

## Güncelleme

**ZIP ile indirdiysen**

1. Marketiyo'yu kapat (terminalde Ctrl+C).
2. [Adım 2](#adım-2-marketiyoyu-indir)'deki gibi yeni ZIP'i indirip aç.
3. Eski klasördeki `workspace` klasörünü kopyalayıp yeni klasörün içine yapıştır.
   Bütün verilerin bu klasörde.
4. Yeni klasörde terminal aç, `npm install`, sonra `npm run dev` çalıştır.
5. Her şey yerindeyse eski klasörü silebilirsin.

**Git ile indirdiysen**

```bash
git pull
npm install
npm run dev
```

## Verilerin nerede

Her şey Marketiyo klasörünün içindeki `workspace` klasöründe düz dosya olarak
durur. Bu klasör ilk kullanımda oluşur ve Git'e girmez. Başka bir klasör
kullanmak için `MARKETIYO_WORKSPACE` ortam değişkenini ayarla.

| Dosya | İçerik |
| --- | --- |
| `settings.local.json` | Ayarlar ve Gemini anahtarı |
| `brand.json` | Marka profili |
| `ideas.json`, `expansions/` | Fikirler ve üretilmiş içerikler |
| `calendar.json` | Takvim |
| `campaigns.json`, `campaigns/` | Reklam kampanyaları |
| `articles.json`, `articles/` | Blog konuları ve taslaklar |

**Yedek almak** için `workspace` klasörünü başka bir yere kopyalaman yeterli.
**Kurulum** sayfasındaki **Tümünü sıfırla** bu dosyaları kalıcı olarak siler.

## Güvenlik

- Gemini anahtarın yalnızca `settings.local.json` içinde saklanır ve sadece
  Google'a gider. Tarayıcıya hiç gönderilmez.
- Uygulamanın girişi yok, çünkü yalnızca bu bilgisayardaki kişiye hizmet eder.
  Bu yüzden API başka sitelerden gelen istekleri reddeder. Açık olan başka bir
  web sayfası senin adına içerik üretemez ve kotanı harcayamaz.
- Yalnızca `localhost` ve IP adresleriyle erişilebilir. Uygulamaya yerel ağda
  bir alan adıyla erişmek istersen adı `MARKETIYO_ALLOWED_HOSTS` ortam
  değişkenine ekle, virgülle ayırarak.
- Uygulamayı internete açık bir sunucuda çalıştırma. Bunun için tasarlanmadı.

## Sorun giderme

**Kurulum sırasında**

| Görülen mesaj | Çözüm |
| --- | --- |
| `node` veya `npm` tanınmıyor, "komut bulunamadı" | Node.js'i [Adım 1](#adım-1-nodejsi-kur)'deki gibi kur, terminali kapatıp yeni bir tane aç |
| "betiklerin çalıştırılması bu sistemde devre dışı" (Windows) | `npm` yerine `npm.cmd` yaz: `npm.cmd install`, `npm.cmd run dev` |
| "Could not read package.json" veya "ENOENT" | Terminal yanlış klasörde. [Adım 3](#adım-3-klasörün-içinde-terminal-aç)'e dön, `ls` ile `package.json`'ı görene kadar klasörü kontrol et |
| `npm install` çok uzun sürüyor veya "network" hatası | İnternet bağlantını kontrol et ve komutu tekrar çalıştır |
| Tarayıcıda "Bu siteye ulaşılamıyor" | Terminalde `npm run dev` çalışıyor mu bak. Pencere kapandıysa yeniden başlat |
| "Port 3000 is in use" | Marketiyo zaten başka bir pencerede açık olabilir. Onu kullan ya da `npm run dev -- -p 3001` ile başlatıp <http://localhost:3001> adresini aç |
| Sayfa stilsiz veya bozuk görünüyor | Terminalde Ctrl+C, sonra `npm run dev` ile yeniden başlat |

**Bağlantı sırasında**

| Görülen mesaj | Çözüm |
| --- | --- |
| Claude Code kurulu değil veya görünmüyor | [Yeni terminalden yeniden başlat](#claude-code-bağlantısı), olmazsa **Claude komutu** kutusuna tam yolu yaz |
| Claude Code kurulu ama giriş yapılmamış | Terminalde `claude` çalıştır, giriş yap, tekrar sına |
| Claude bulundu ama yanıt vermedi | Terminalde `claude` çalıştırıp açılış sorularını tamamla, internet bağlantını kontrol et |
| API anahtarı reddedildi | Anahtarı AI Studio'dan yeniden kopyala, başında veya sonunda boşluk kalmasın |
| Kota doldu | Dakikalık sınırsa biraz bekle, günlükse yarın dene veya Flash Lite modeline geç |
| Model bulunamadı | Kurulumdan listedeki bir modeli seç |

## Geliştirme

```bash
npm test          # testler
npm run typecheck # tip kontrolü
npm run verify    # testler, tip kontrolü ve üretim derlemesi
```

`npm run verify` derlemeyi ayrı bir klasöre yapar, çalışan geliştirme sunucusunu
bozmaz. Katkı kuralları: [CONTRIBUTING.md](CONTRIBUTING.md).
