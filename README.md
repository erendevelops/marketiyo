# Marketiyo

Ürünün için sosyal medya içeriği üreten, kendi bilgisayarında çalışan bir araç.

A local-first social media content engine for your product.

> **Bu proje açık kaynak değil, kaynağı açık.** Kodu okuyabilir, çalıştırabilir
> ve kendin için değiştirebilirsin. Değiştirilmiş kopyaları yayınlamak yasaktır,
> tek istisna bu projeye katkı hazırlamak için açılan fork'lardır. Ayrıntılar:
> [LICENSE](LICENSE).
>
> **This is source-available, not open source.** Modified copies may not be
> redistributed, except as forks prepared for contribution back to this project.

## Ne yapar

- **Fikir bankası.** Marka profilinden toplu içerik fikri üretir. Sakladığın ve
  elediğin fikirler bir sonraki partiyi besler, böylece kendini tekrar etmez.
- **İçeriğe dönüştürme.** Sakladığın bir fikri çekime veya yayına hazır içeriğe
  çevirir. Kısa video için kanca, senaryo, ekran metni, çekim notları ve açıklama.
- **Takvim.** Hazır içerikleri haftalık bir plana yerleştirir. Hiçbir şey
  otomatik paylaşılmaz, paylaşıldı işareti manueldir.

Desteklenen platformlar: kısa video (TikTok, Reels, Shorts), X, LinkedIn ve
Instagram karuselleri. Arayüz ve içerik dili Türkçe, İngilizce de desteklenir.

## Gereksinimler

- Node 20 veya üzeri
- Şu iki motordan biri:
  - **Claude Code**, kurulu ve giriş yapılmış. Aboneliğini kullanır, API
    anahtarı gerekmez.
  - **Gemini API anahtarı**, kendi anahtarın.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda açılan adrese git ve kurulum adımlarını takip et. Önce motoru seç,
sonra marka profilini doldur.

## Verilerin nerede

Her şey `workspace` klasöründe düz dosya olarak durur.

| Dosya | İçerik |
| --- | --- |
| `brand.json` | Marka profili |
| `ideas.json` | Fikir bankası |
| `expansions/<id>.md` | Üretilmiş içerikler |
| `calendar.json` | Takvim slotları |
| `settings.local.json` | Ayarlar ve Gemini anahtarı |

Bu klasör sürüm kontrolüne girmez. Gemini anahtarın yalnızca bu bilgisayarda
saklanır ve sadece Google sunucularına gider. Tarayıcıya hiçbir anahtar
gönderilmez, model çağrıları yalnızca yerel sunucu tarafında yapılır.

## İlk sürümde olmayanlar

Bilinçli olarak kapsam dışı bırakıldı:

- Canlı trend araştırması
- Performans verisi içe aktarma
- Platformlara doğrudan paylaşım
- Barındırılan sürüm ve hesaplar

Fikir üreticisi, bunların sonradan birer bağlam bloğu olarak eklenebileceği
şekilde tasarlandı.

## Katkı

Bakınız: [CONTRIBUTING.md](CONTRIBUTING.md).
