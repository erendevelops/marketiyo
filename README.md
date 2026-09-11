# Marketiyo

Urunun icin sosyal medya icerigi ureten, kendi bilgisayarinda calisan bir arac.

A local-first social media content engine for your product.

> **Bu proje acik kaynak degildir, kaynagi aciktir.** Kodu okuyabilir,
> calistirabilir ve kendin icin degistirebilirsin. Degistirilmis kopyalari
> yayinlamak yasaktir, tek istisna bu projeye katki hazirlamak icin acilan
> fork'lardir. Ayrintilar: [LICENSE](LICENSE).
>
> **This is source-available, not open source.** Modified copies may not be
> redistributed, except as forks prepared for contribution back to this project.

## Ne yapar

- **Fikir bankasi.** Marka profilinden toplu icerik fikri uretir. Tuttugun ve
  eledigin fikirler bir sonraki partiyi besler, boylece kendini tekrar etmez.
- **Genisletme.** Tuttugun bir fikri cekime veya yayina hazir icerige cevirir.
  Kisa video icin kanca, senaryo, ekran metni, cekim notlari ve aciklama.
- **Takvim.** Hazir icerikleri haftalik bir plana yerlestirir. Hicbir sey
  otomatik paylasilmaz, paylasildi isareti manuel.

Desteklenen platformlar: kisa video (TikTok, Reels, Shorts), X, LinkedIn ve
Instagram karuselleri. Arayuz ve icerik dili Turkce, Ingilizce de desteklenir.

## Gereksinimler

- Node 20 veya uzeri
- Su iki motordan biri:
  - **Claude Code**, kurulu ve giris yapilmis. Aboneligini kullanir, API
    anahtari gerekmez.
  - **Gemini API anahtari**, kendi anahtarin.

## Kurulum

```bash
npm install
npm run dev
```

Tarayicida acilan adrese git ve kurulum adimlarini takip et. Once motoru sec,
sonra marka profilini doldur.

## Verilerin nerede

Her sey `workspace` klasorunde duz dosya olarak durur.

| Dosya | Icerik |
| --- | --- |
| `brand.json` | Marka profili |
| `ideas.json` | Fikir bankasi |
| `expansions/<id>.md` | Genisletilmis icerikler |
| `calendar.json` | Takvim slotlari |
| `settings.local.json` | Ayarlar ve Gemini anahtari |

Bu klasor surum kontrolune girmez. Gemini anahtarin yalnizca bu bilgisayarda
saklanir ve sadece Google sunucularina gider. Tarayiciya hicbir anahtar
gonderilmez, model cagrilari yalnizca yerel sunucu tarafinda yapilir.

## Ilk surumde olmayanlar

Bilincli olarak kapsam disi birakildi:

- Canli trend arastirmasi
- Performans verisi ice aktarma
- Platformlara dogrudan paylasim
- Barindirilan surum ve hesaplar

Fikir ureticisi, bunlarin sonradan birer baglam blogu olarak eklenebilecegi
sekilde tasarlandi.

## Katki

Bak: [CONTRIBUTING.md](CONTRIBUTING.md).
