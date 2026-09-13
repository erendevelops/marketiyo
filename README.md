# Marketiyo

Ürünün için pazarlama içeriği üreten, kendi bilgisayarında çalışan bir araç.

A local-first marketing content tool for your product. [English below](#english).

> **Bu proje açık kaynak değil, kaynağı açık.** Kodu okuyabilir, çalıştırabilir
> ve kendin için değiştirebilirsin. Değiştirilmiş kopyaları yayınlamak yasaktır,
> tek istisna bu projeye katkı hazırlamak için açılan fork'lardır. Ayrıntılar:
> [LICENSE](LICENSE).
>
> **This is source-available, not open source.** Modified copies may not be
> redistributed, except as forks prepared for contribution back to this project.

## Ne yapar

- **Fikir bankası.** Marka profilinden, ürünü hiç duymamış kişilere yönelik
  içerik fikirleri üretir. Sakladığın ve elediğin fikirler bir sonraki partiyi
  besler.
- **İçeriğe dönüştürme.** Sakladığın fikri yayına hazır içeriğe çevirir. Kısa
  video için kanca, senaryo, ekran metni ve çekim notları.
- **Takvim.** Hazır içerikleri günlere yerleştirirsin. Hiçbir şey otomatik
  paylaşılmaz.
- **Reklam.** Meta, Google Arama ve TikTok için kampanya planı, reklam setleri
  ve metinler. Bütçeyi sen girersin, model yalnızca dağıtır.
- **Blog.** Arama niyetine göre konu önerileri ve tam makale taslağı.

Medya türleri: kısa video, görsel gönderi, kısa metin, uzun metin. Arayüz ve
içerik dili Türkçe, İngilizce de desteklenir.

## Gereksinimler

- [Node.js](https://nodejs.org) 20 veya üzeri
- İçeriği yazacak bir model, ikisinden biri:
  - **Claude Code** ve bir Claude Pro veya Max aboneliği. API anahtarı gerekmez.
  - **Gemini API anahtarı.** [Google AI Studio](https://aistudio.google.com/apikey)'dan ücretsiz alınır.

## Kurulum

### 1. Uygulamayı indir ve çalıştır

```bash
git clone https://github.com/erendevelops/marketiyo.git
cd marketiyo
npm install
npm run dev
```

Tarayıcıda <http://localhost:3000> adresini aç.

### 2a. Claude Code ile

Uygulama Anthropic'e kendisi bağlanmaz. Bilgisayarındaki `claude` komutunu
çalıştırır ve orada giriş yapılmış hesabı kullanır.

1. Claude Code'u kur.

   Windows (PowerShell):

   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```

   macOS / Linux:

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

2. Bir kez çalıştır ve Pro veya Max hesabınla giriş yap:

   ```bash
   claude
   ```

3. **Yeni bir terminal aç** ve `npm run dev` komutunu oradan çalıştır. Eski
   terminal yeni kurulan `claude` komutunu göremez.
4. Uygulamada **Kurulum** sayfasında Claude Code'u seç ve kaydet. Sınama,
   girişin gerçekten yapıldığını görmek için Claude'a çok kısa bir istek
   gönderir, 10 ila 30 saniye sürebilir.

`claude` bulunamıyorsa kurulum sayfasındaki **Claude komutu** alanına tam yolu
yaz. Yolu `where claude` (Windows) veya `which claude` (macOS, Linux) gösterir.

Claude masaüstü uygulaması gerekmez, yalnızca Claude Code.

### 2b. Gemini ile

1. [Google AI Studio](https://aistudio.google.com/apikey)'dan bir API anahtarı al.
2. **Kurulum** sayfasında Gemini'yi seç, anahtarı yapıştır, modeli seç ve kaydet.

Ücretsiz anahtarda Flash Lite modelleri günde yaklaşık 500, Flash modelleri 20
istek hakkı verir. Varsayılan `gemini-3.1-flash-lite`. Her işlem bir istek
kullanır, çıktı hatalı gelirse bir kez daha dener. Güncel sınırların
[AI Studio](https://aistudio.google.com/rate-limit)'da görünür.

### 3. Marka profili

Kurulum bitince **Marka** sayfası açılır. Ürününü birkaç cümleyle anlatırsan
alanları senin için doldurur. Bu iki adım bitmeden diğer bölümler kilitli kalır.

## Verilerin nerede

Her şey `workspace` klasöründe düz dosya olarak durur ve sürüm kontrolüne
girmez. Başka bir klasör için `MARKETIYO_WORKSPACE` ortam değişkenini kullan.

| Dosya | İçerik |
| --- | --- |
| `settings.local.json` | Ayarlar ve Gemini anahtarı |
| `brand.json` | Marka profili |
| `ideas.json`, `expansions/` | Fikirler ve üretilmiş içerikler |
| `calendar.json` | Takvim |
| `campaigns.json`, `campaigns/` | Reklam kampanyaları |
| `articles.json`, `articles/` | Blog konuları ve taslaklar |

Gemini anahtarın yalnızca bu bilgisayarda saklanır ve sadece Google'a gider.
Tarayıcıya hiçbir anahtar gönderilmez, model çağrıları yerel sunucuda yapılır.

## Sorun giderme

| Mesaj | Çözüm |
| --- | --- |
| Claude Code kurulu değil veya görünmüyor | Yeni terminal aç, uygulamayı yeniden başlat ya da tam yolu gir |
| Claude Code kurulu ama giriş yapılmamış | Terminalde `claude` çalıştır, giriş yap, tekrar sına |
| Kota doldu | Dakikalık sınırsa bekle, günlükse yarın dene ya da başka model seç |
| Model bulunamadı | Kurulumdan listedeki bir modeli seç |

## Katkı

Bakınız: [CONTRIBUTING.md](CONTRIBUTING.md).

---

## English

Marketiyo generates social media ideas, ready-to-post content, ad campaign plans
and blog articles from a brand profile. It runs on your machine and stores
everything as plain files in `workspace/`.

**Requirements:** Node.js 20+, and either Claude Code with a Pro or Max plan, or
a Gemini API key.

```bash
git clone https://github.com/erendevelops/marketiyo.git
cd marketiyo
npm install
npm run dev
```

Open <http://localhost:3000>, then:

- **Claude Code:** install it (`irm https://claude.ai/install.ps1 | iex` on
  Windows, `curl -fsSL https://claude.ai/install.sh | bash` on macOS/Linux), run
  `claude` once and log in, then **start the app from a new terminal**. In
  Setup, choose Claude Code. The test sends a tiny prompt to confirm the login.
  If `claude` is not found, enter its full path (`where claude` / `which claude`).
- **Gemini:** get a free key at [AI Studio](https://aistudio.google.com/apikey),
  paste it in Setup and pick a model. The default `gemini-3.1-flash-lite`
  allows about 500 free requests a day; each action uses one, two on a retry.

Then fill in the brand profile. The other sections unlock after both steps.
