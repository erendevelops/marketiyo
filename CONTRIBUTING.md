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
npm test
npm run typecheck
npm run build
```

Üç komut da temiz geçmeden bir pull request açma.

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
npm test
npm run typecheck
npm run build
```

Do not open a pull request until all three pass cleanly.

### Rules

- Write the test before the behaviour.
- A Turkish version of every prompt file is required, English is preferred.
- Turkish text must use full Turkish characters.
- Model responses are always validated against a schema. Unvalidated data never
  reaches application state.
- No API key is ever sent to the browser.
