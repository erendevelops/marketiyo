# Katkı rehberi / Contributing

## Türkçe

Katkılar kabul edilir. Lisans, değiştirilmiş kopyaların yayınlanmasını yasaklar,
ancak bu projeye katkı hazırlamak amacıyla açılan fork'lar açıkça serbesttir.
Ayrıntılar için lisans dosyasındaki dördüncü maddeye bak.

Katkılar aynı lisans altında kabul edilir.

### Geliştirme

```bash
npm install
npm run dev
```

### Doğrulama

```bash
npm run verify
```

Testleri, tip kontrolünü ve derlemeyi sırayla çalıştırır. Temiz geçmeden bir
pull request açma.

Bu komut derlemeyi `.next-verify` klasörüne yazar. Sebebi şu: `next build`
varsayılan olarak geliştirme sunucusuyla aynı klasörü kullanır ve sunucu
ayaktayken çalıştırırsan onun altındaki dosyaları değiştirir. Çalışan uygulama
o anda `__webpack_modules__[moduleId] is not a function` gibi hatalarla ölür.
Ayrı klasör bunu imkânsız kılar.

### Kurallar

- Her yeni davranış için önce test yaz.
- Prompt dosyalarının Türkçe sürümü zorunludur, İngilizce sürümü tercih edilir.
- Türkçe metinlerde Türkçe karakterleri eksiksiz kullan.
- Model yanıtları her zaman bir şema ile doğrulanır. Doğrulanmamış veri
  uygulama durumuna girmez.
- Hiçbir API anahtarı tarayıcıya gönderilmez.

## English

Contributions are welcome. The licence forbids publishing modified copies, but
forks created to prepare a contribution to this project are explicitly
permitted. See section 4 of the licence file.

Contributions are accepted under the same licence.

### Development

```bash
npm install
npm run dev
```

### Verification

```bash
npm run verify
```

Runs the tests, the type check and the build in order. Do not open a pull
request until it passes cleanly.

It writes the build to `.next-verify`. By default `next build` shares an
output directory with the dev server, so building while the server is up
rewrites the chunks underneath it and the running app dies with errors such as
`__webpack_modules__[moduleId] is not a function`. A separate directory makes
that impossible.

### Rules

- Write the test before the behaviour.
- A Turkish version of every prompt file is required, English is preferred.
- Turkish text must use full Turkish characters.
- Model responses are always validated against a schema. Unvalidated data never
  reaches application state.
- No API key is ever sent to the browser.
