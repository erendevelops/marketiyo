# Katki rehberi / Contributing

## Turkce

Katkilar kabul edilir. Lisans, degistirilmis kopyalarin yayinlanmasini yasaklar,
ancak bu projeye katki hazirlamak amaciyla acilan fork'lar acikca serbesttir.
Ayrintilar icin lisans dosyasindaki dorduncu maddeye bak.

Katkilar ayni lisans altinda kabul edilir.

### Gelistirme

```bash
npm install
npm run dev
```

### Dogrulama

```bash
npm test
npm run typecheck
npm run build
```

Uc komut da temiz gecmeden bir pull request acma.

### Kurallar

- Her yeni davranis icin once test yaz.
- Prompt dosyalarinin Turkce surumu zorunludur, Ingilizce surumu tercih edilir.
- Model yanitlari her zaman bir sema ile dogrulanir. Dogrulanmamis veri
  uygulama durumuna girmez.
- Hicbir API anahtari tarayiciya gonderilmez.

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
- Model responses are always validated against a schema. Unvalidated data never
  reaches application state.
- No API key is ever sent to the browser.
