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
- [Gereksinimler](#gereksinimler)
- [Kurulum](#kurulum)
  - [1. Uygulamayı indir ve başlat](#1-uygulamayı-indir-ve-başlat)
  - [2a. Claude Code ile bağlan](#2a-claude-code-ile-bağlan)
  - [2b. Gemini ile bağlan](#2b-gemini-ile-bağlan)
  - [3. Marka profilini oluştur](#3-marka-profilini-oluştur)
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
  veritabanı yok.
- **Claude Code** seçersen uygulama bilgisayarındaki `claude` komutunu
  çalıştırır ve orada giriş yapılmış aboneliğini kullanır. API anahtarı
  gerekmez, uygulama Anthropic'e kendisi bağlanmaz.
- **Gemini** seçersen yerel sunucu, kendi anahtarınla doğrudan Google'a istek
  atar. Anahtar tarayıcıya hiç gönderilmez.

## Gereksinimler

- **Node.js 20 veya üzeri.** [nodejs.org](https://nodejs.org)'dan LTS sürümünü
  kur. Kontrol etmek için: `node -v`
- **Git.** [git-scm.com](https://git-scm.com). İstersen repoyu zip olarak da
  indirebilirsin.
- İçeriği yazacak bir model, ikisinden biri:
  - **Claude Code** ve bir Claude **Pro veya Max** aboneliği
  - **Gemini API anahtarı**, [Google AI Studio](https://aistudio.google.com/apikey)'dan ücretsiz

## Kurulum

### 1. Uygulamayı indir ve başlat

Bir terminal aç (Windows'ta PowerShell, macOS'ta Terminal) ve sırayla çalıştır:

```bash
git clone https://github.com/erendevelops/marketiyo.git
cd marketiyo
npm install
npm run dev
```

Terminalde `Local: http://localhost:3000` yazısını görünce tarayıcıda
<http://localhost:3000> adresini aç. Bu terminal açık kaldığı sürece uygulama
çalışır. Kapatmak için terminalde **Ctrl+C**.

3000 portu doluysa: `npm run dev -- -p 3001`

### 2a. Claude Code ile bağlan

**1. Claude Code'u kur.**

Windows (PowerShell):

```powershell
irm https://claude.ai/install.ps1 | iex
```

macOS / Linux:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**2. Bir kez çalıştır ve giriş yap.** Terminale `claude` yaz, açılan tarayıcı
sayfasında Pro veya Max hesabınla giriş yap. Giriş bir kez yapılır, sonra
hatırlanır. Çıkmak için `/exit`.

```bash
claude
```

**3. Uygulamayı yeni bir terminalden yeniden başlat.** Bu adım atlanırsa
uygulama `claude` komutunu bulamaz.

*Neden?* Kurulum, `claude` komutunun yerini sistemin arama yoluna (PATH)
ekler. Bu değişikliği yalnızca kurulumdan **sonra** açılan terminaller görür.
Uygulama kurulumdan önce açılmış bir terminalde çalışıyorsa `claude`
komutunu göremez.

Nasıl yapılır:

1. Uygulamanın çalıştığı terminale geç ve **Ctrl+C** ile durdur. Tarayıcıdaki
   sayfa bağlantıyı kaybeder, bu normal.
2. O terminali kapat ve **yeni bir terminal** aç.
   - VS Code, Cursor gibi bir editörün içindeki terminali kullanıyorsan
     editörü **tamamen kapatıp yeniden aç**. İçindeki terminaller eski ayarları
     taşımaya devam eder.
3. Yeni terminalde `claude --version` yaz. Bir sürüm numarası görüyorsan hazır.
4. Proje klasörüne gir. Klasörü nereye indirdiysen o yolu yaz, boşluk varsa
   tırnak içine al:

   ```bash
   cd "C:\Users\adın\Projects\marketiyo"
   ```

   Kurulum sayfası bu komutu senin gerçek klasör yolunla gösterir.
5. Uygulamayı başlat:

   ```bash
   npm run dev
   ```

6. Tarayıcıda sayfayı yenile.

**4. Uygulamada bağlan.** **Kurulum** sayfasında **Claude Code**'u seç ve
**Kaydet ve bağlantıyı sına** düğmesine bas. Sınama, girişin gerçekten
yapıldığını görmek için Claude'a çok kısa bir istek gönderir. 5 ila 30 saniye
sürebilir ve planından çok küçük bir kullanım düşer.

`claude` hâlâ bulunamıyorsa **Claude komutu** alanına tam yolunu yaz. Yolu
şu komut gösterir:

- Windows: `where claude`
- macOS / Linux: `which claude`

Claude masaüstü uygulaması gerekmez, yalnızca Claude Code.

### 2b. Gemini ile bağlan

1. [Google AI Studio](https://aistudio.google.com/apikey)'da bir API anahtarı oluştur.
2. **Kurulum** sayfasında **Gemini**'yi seç, anahtarı yapıştır ve modeli seç.
3. **Kaydet ve bağlantıyı sına** düğmesine bas.

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

### 3. Marka profilini oluştur

Bağlantı kurulunca **Marka** sayfası açılır. Ürününü birkaç cümleyle anlatıp
**Taslağı oluştur**'a basarsan alanları senin için doldurur, sonra düzeltirsin.
Kaydedince uygulamanın geri kalanı açılır. Bu iki adım bitmeden diğer bölümler
kilitli kalır.

## Günlük kullanım

1. Terminalde proje klasörüne gir ve `npm run dev` çalıştır.
2. <http://localhost:3000> adresini aç. Ana sayfa sıradaki adımı gösterir.
3. **Fikirler**: medya türünü seç, fikir üret, beğendiklerini sakla, diğerlerini
   nedeniyle ele.
4. Sakladığın fikri **İçeriğe dönüştür**, gerekirse metni düzelt.
5. **Takvim**'de içeriği bir güne yerleştir, paylaşınca işaretle.
6. İşin bitince terminalde **Ctrl+C**.

## Güncelleme

```bash
git pull
npm install
npm run dev
```

Verilerin `workspace/` klasöründe durur ve güncellemeden etkilenmez.

## Verilerin nerede

Her şey proje içindeki `workspace/` klasöründe düz dosya olarak durur ve Git'e
girmez. Başka bir klasör kullanmak için `MARKETIYO_WORKSPACE` ortam değişkenini
ayarla.

| Dosya | İçerik |
| --- | --- |
| `settings.local.json` | Ayarlar ve Gemini anahtarı |
| `brand.json` | Marka profili |
| `ideas.json`, `expansions/` | Fikirler ve üretilmiş içerikler |
| `calendar.json` | Takvim |
| `campaigns.json`, `campaigns/` | Reklam kampanyaları |
| `articles.json`, `articles/` | Blog konuları ve taslaklar |

Yedek almak için bu klasörü kopyalaman yeterli. **Kurulum** sayfasındaki
**Tümünü sıfırla** bu dosyaları kalıcı olarak siler.

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

| Görülen mesaj | Çözüm |
| --- | --- |
| Claude Code kurulu değil veya görünmüyor | [Yeni terminalden yeniden başlat](#2a-claude-code-ile-bağlan), olmazsa **Claude komutu** alanına tam yolu yaz |
| Claude Code kurulu ama giriş yapılmamış | Terminalde `claude` çalıştır, giriş yap, tekrar sına |
| Claude bulundu ama yanıt vermedi | Terminalde `claude` çalıştırıp açılış sorularını tamamla, internet bağlantını kontrol et |
| API anahtarı reddedildi | Anahtarı AI Studio'dan yeniden kopyala |
| Kota doldu | Dakikalık sınırsa biraz bekle, günlükse yarın dene veya Flash Lite modeline geç |
| Model bulunamadı | Kurulumdan listedeki bir modeli seç |
| `npm` tanınmıyor | Node.js'i kur ve yeni bir terminal aç |
| Port 3000 kullanımda | `npm run dev -- -p 3001` |
| Sayfa stilsiz veya bozuk görünüyor | Terminalde Ctrl+C, sonra `npm run dev` ile yeniden başlat |

## Geliştirme

```bash
npm test          # testler
npm run typecheck # tip kontrolü
npm run verify    # testler, tip kontrolü ve üretim derlemesi
```

`npm run verify` derlemeyi ayrı bir klasöre yapar, çalışan geliştirme sunucusunu
bozmaz. Katkı kuralları: [CONTRIBUTING.md](CONTRIBUTING.md).
