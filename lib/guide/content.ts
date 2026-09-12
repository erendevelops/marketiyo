import type { Language } from '@/lib/schema';

export type GuideBlock =
  | { kind: 'text'; body: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'steps'; items: string[] }
  | { kind: 'note'; body: string };

export type GuideSection = {
  id: string;
  title: string;
  blocks: GuideBlock[];
};

const tr: GuideSection[] = [
  {
    id: 'amac',
    title: 'Bu araç ne için var',
    blocks: [
      {
        kind: 'text',
        body: 'Marketiyo, ürünü olan ama pazarlamaya ayıracak vakti olmayan insanlar için yapıldı. Amaç, senin yerine paylaşım yapmak değil. Amaç, boş ekrana bakmayı ortadan kaldırmak. Karşına üzerinde çalışabileceğin somut malzeme koyar, sen onu seçer, düzeltir ve yayınlarsın.',
      },
      {
        kind: 'text',
        body: 'Ürettiği hiçbir şey otomatik olarak yayına gitmez. Son karar her zaman sende. Bu bilinçli bir tercih, çünkü markanın adına konuşan cümleyi görmeden onaylamak, kazandırdığı zamandan çok daha pahalıya mal olur.',
      },
    ],
  },
  {
    id: 'neden-sosyal',
    title: 'Neden ağırlıklı olarak sosyal medya',
    blocks: [
      {
        kind: 'text',
        body: 'Bugün insanların uyanık geçirdiği saatlerin büyük bölümü bu mecralarda geçiyor. Bir ürünü duyurmanın en hızlı, en ucuz ve en doğrudan yolu orada. Reklam bütçesi olmayan biri bile düzenli ve iyi içerikle kitle kurabiliyor.',
      },
      {
        kind: 'text',
        body: 'Sosyal medyanın diğer kanallardan farkı, işleyişinin tekrar etmesi. Kanca, format ve ritim öğrenilebilir kalıplar. Bu da bir aracın gerçekten yardımcı olabileceği bir alan olduğu anlamına geliyor.',
      },
      {
        kind: 'text',
        body: 'Yine de araç yalnızca sosyalle sınırlı değil. Reklam metni ve arama içeriği de üretiyor, çünkü bir ürünün büyümesi tek kanala bağlı kalmıyor.',
      },
    ],
  },
  {
    id: 'yontem',
    title: 'Yöntem: neden önce marka profili',
    blocks: [
      {
        kind: 'text',
        body: 'Bir modele "bana içerik fikri ver" dersen, herkese verdiği cevabı verir. Jenerik çıktının sebebi modelin yeteneksizliği değil, ona verilen bilginin boş olması.',
      },
      {
        kind: 'text',
        body: 'Marka profili bu boşluğu dolduruyor. Ürünün ne olduğu, kime seslendiği, o kişinin tam olarak neyden şikâyetçi olduğu, senin elinde hangi kanıtın bulunduğu ve hangi cümleleri asla kurmak istemediğin. Her üretim isteği bu bilgiyle birlikte gidiyor.',
      },
      {
        kind: 'note',
        body: 'Kanıt alanı özellikle önemli. Model oraya yazılmamış hiçbir rakamı veya sonucu kullanmıyor. Bu, uydurma istatistik üretmesini engelleyen en somut önlem.',
      },
    ],
  },
  {
    id: 'akis',
    title: 'Günlük akış',
    blocks: [
      {
        kind: 'steps',
        items: [
          'Marka profilini bir kez doldur. En çok emeği bu hak ediyor.',
          'Fikir üret. Bir partide onlarca fikir çıkar, hepsi iyi olmak zorunda değil.',
          'Beğendiğini sakla, beğenmediğini nedeniyle ele. Eleme nedeni bir sonraki partiyi değiştiriyor.',
          'Sakladığın fikri içeriğe dönüştür. Kısa video için kanca, senaryo, ekran metni ve çekim notları çıkar.',
          'Takvime yerleştir ve yayınla. Paylaştığını kendin işaretle.',
        ],
      },
      {
        kind: 'text',
        body: 'Eleme adımını atlamak cazip gelir ama sistemin öğrenen kısmı orası. Reddettiğin kancalar bir sonraki isteğe "bunları üretme" listesi olarak gidiyor.',
      },
    ],
  },
  {
    id: 'baglanti',
    title: 'Yapay zekâ bağlantısı nasıl kuruluyor',
    blocks: [
      {
        kind: 'text',
        body: 'Uygulamanın kendi yapay zekâsı yok. Metni üreten kısım dışarıda, senin seçtiğin bir motor. Uygulamanın yaptığı iş, doğru bağlamı hazırlamak, isteği göndermek ve gelen cevabı denetlemek.',
      },
      {
        kind: 'text',
        body: 'İki motor destekleniyor ve ikisi de çok farklı çalışıyor.',
      },
      {
        kind: 'list',
        items: [
          'Claude Code: bilgisayarında kurulu olan komut satırı programı çalıştırılır. Mevcut Claude aboneliğinle giriş yapmışsındır, dolayısıyla ayrı bir API anahtarı gerekmez ve istek başına ek ücret çıkmaz.',
          'Gemini: Google sunucularına doğrudan bir ağ isteği gönderilir. Bunun için kendi API anahtarını girmen gerekir ve kullanım Google tarafından ücretlendirilir.',
        ],
      },
      {
        kind: 'note',
        body: 'Anahtarın tarayıcıya hiç gönderilmiyor. Model çağrıları yalnızca kendi bilgisayarında çalışan sunucu tarafında yapılıyor, anahtar da orada kalıyor.',
      },
    ],
  },
  {
    id: 'claude-code',
    title: 'Claude Code ile bağlantı tam olarak nasıl çalışıyor',
    blocks: [
      {
        kind: 'text',
        body: 'Burada anlaşılması en zor kısım şu: Claude aboneliğinin bir API adresi yoktur. Abonelikle bir sunucuya istek atamazsın. Ama bilgisayarına kurduğun Claude Code programı zaten o abonelikle giriş yapmış durumdadır. Uygulama da tam olarak bunu kullanıyor.',
      },
      {
        kind: 'steps',
        items: [
          'Uygulama marka profilinden, platform kurallarından ve istediğin şeyden tek bir metin hazırlar.',
          'Bilgisayarında Claude Code programını, ekranı olmayan yazdırma kipinde başlatır.',
          'Hazırladığı metni bu programa standart girdi üzerinden verir. Yani klavyeden yazılmış gibi.',
          'Program abonelik girişini kullanarak cevabı üretir ve standart çıktıya yazar.',
          'Uygulama bu çıktıyı okur, içindeki JSON nesnesini ayıklar ve şemayla doğrular.',
        ],
      },
      {
        kind: 'text',
        body: 'Yani arada bir API anahtarı, bir sunucu hesabı veya bir ağ servisi yok. İki program aynı bilgisayarda konuşuyor. Uygulamanın açısından Claude Code, metin verip metin aldığı bir alt süreçten ibaret.',
      },
      {
        kind: 'text',
        body: 'Bu yüzden barındırılan bir sürüm bu yolu kullanamaz. Uzak bir sunucuda senin bilgisayarındaki program yoktur. Barındırılan bir sürümde herkesin kendi API anahtarını girmesi gerekirdi, bu da aracın en sevdiğim özelliğini ortadan kaldırırdı.',
      },
    ],
  },
  {
    id: 'dogrulama',
    title: 'Gelen cevap neden doğrudan kabul edilmiyor',
    blocks: [
      {
        kind: 'text',
        body: 'Model bazen istenen biçimin dışına çıkar. Fazladan açıklama yazar, bir alanı atlar veya karakter sınırını aşar. Bu yüzden hiçbir cevap doğrudan kaydedilmiyor.',
      },
      {
        kind: 'list',
        items: [
          'Cevabın içinden JSON nesnesi ayıklanır, etrafındaki metin atılır.',
          'Şemayla doğrulanır. Biçim bozuksa bir kez daha denenir ve modele tam olarak neyin yanlış olduğu söylenir.',
          'Liste üreten isteklerde her öğe tek tek doğrulanır. Bozuk bir öğe yalnızca kendisini götürür, partinin tamamını değil.',
          'Reklam metinlerinde karakter sınırları şemaya gömülüdür. Reklam yöneticisinde kırpılacak bir metin hiç kaydedilmez.',
        ],
      },
    ],
  },
  {
    id: 'veri',
    title: 'Verilerin nerede duruyor',
    blocks: [
      {
        kind: 'text',
        body: 'Her şey bilgisayarındaki çalışma klasöründe düz dosya olarak duruyor. Hesap yok, bulut yok, kayıt tutan bir sunucu yok. İstersen dosyaları elle açıp düzenleyebilir, yedekleyebilir veya silebilirsin.',
      },
      {
        kind: 'list',
        items: [
          'Marka profili, fikirler, üretilmiş içerikler, kampanyalar, blog konuları ve takvim ayrı dosyalarda.',
          'Ayarlar ve varsa Gemini anahtarın sürüm kontrolüne girmeyen ayrı bir dosyada.',
          'İkinci bir ürün için klasörün tamamını kopyalaman yeterli.',
        ],
      },
    ],
  },
  {
    id: 'sinirlar',
    title: 'Neyi yapmıyor',
    blocks: [
      {
        kind: 'text',
        body: 'Bir aracın ne yapmadığını bilmek, ne yaptığını bilmek kadar önemli.',
      },
      {
        kind: 'list',
        items: [
          'Hiçbir platforma paylaşım yapmaz. Metni sen kopyalayıp yayınlarsın.',
          'Arama hacmi, zorluk puanı veya tıklanma tahmini üretmez. Bu verilere erişimi yok, uydurulmuş bir sayı ise yanlış karar verdirir.',
          'Reklam bütçesi önermez. Toplamı sen girersin, model yalnızca dağıtır ve gerekçesini yazar.',
          'Performans ölçmez. Neyin tuttuğunu şimdilik sen biliyorsun.',
        ],
      },
    ],
  },
];

const en: GuideSection[] = [
  {
    id: 'purpose',
    title: 'What this tool is for',
    blocks: [
      {
        kind: 'text',
        body: 'Marketiyo is built for people who have a product but no time for marketing. The goal is not to post for you. The goal is to remove the blank page. It puts concrete material in front of you, and you pick, correct and publish.',
      },
      {
        kind: 'text',
        body: 'Nothing it produces goes out automatically. The last call is always yours. That is deliberate: approving a sentence that speaks for your brand without reading it costs far more than the time it saves.',
      },
    ],
  },
  {
    id: 'why-social',
    title: 'Why it leans on social media',
    blocks: [
      {
        kind: 'text',
        body: 'Most of the waking hours people spend on screens are spent there. It is the fastest, cheapest and most direct way to put a product in front of someone. Even with no ad budget, consistent good content builds an audience.',
      },
      {
        kind: 'text',
        body: 'What separates social from other channels is that it repeats. Hooks, formats and rhythm are learnable patterns, which is exactly the kind of thing a tool can genuinely help with.',
      },
      {
        kind: 'text',
        body: 'It is not limited to social, though. It also writes ad copy and search content, because a product rarely grows on one channel alone.',
      },
    ],
  },
  {
    id: 'method',
    title: 'The method: why the brand profile comes first',
    blocks: [
      {
        kind: 'text',
        body: 'Ask a model for content ideas and it gives you the answer it gives everyone. Generic output is not a failure of the model, it is the absence of information.',
      },
      {
        kind: 'text',
        body: 'The brand profile fills that gap: what the product is, who it speaks to, what exactly that person struggles with, what proof you hold, and which sentences you never want written. Every request carries all of it.',
      },
      {
        kind: 'note',
        body: 'The proof field matters most. The model never uses a number or result that is not written there. It is the most concrete guard against invented statistics.',
      },
    ],
  },
  {
    id: 'flow',
    title: 'The daily loop',
    blocks: [
      {
        kind: 'steps',
        items: [
          'Fill in the brand profile once. It deserves the most effort.',
          'Generate ideas. A batch produces many, and they do not all have to be good.',
          'Keep what you like, reject the rest with a reason. The reason changes the next batch.',
          'Turn a kept idea into content: hook, script, on-screen text and shot notes for short video.',
          'Put it on the calendar and publish. You mark what went out.',
        ],
      },
      {
        kind: 'text',
        body: 'Skipping the rejection step is tempting, but that is the part that learns. Rejected hooks travel into the next request as a do-not-repeat list.',
      },
    ],
  },
  {
    id: 'connection',
    title: 'How the AI connection is made',
    blocks: [
      {
        kind: 'text',
        body: 'The app has no AI of its own. The part that writes lives outside it, in an engine you choose. What the app does is assemble the right context, send the request and check what comes back.',
      },
      { kind: 'text', body: 'Two engines are supported, and they work very differently.' },
      {
        kind: 'list',
        items: [
          'Claude Code: the command line program installed on your machine is run. You are already logged in with your Claude subscription, so no separate API key is needed and there is no per-request charge.',
          'Gemini: a network request goes straight to Google. You supply your own API key and Google bills the usage.',
        ],
      },
      {
        kind: 'note',
        body: 'Your key is never sent to the browser. Model calls happen only on the server running on your own machine, and the key stays there.',
      },
    ],
  },
  {
    id: 'claude-code',
    title: 'Exactly how the Claude Code connection works',
    blocks: [
      {
        kind: 'text',
        body: 'Here is the part that trips people up: a Claude subscription has no API address. You cannot call a server with it. But the Claude Code program on your machine is already logged in with that subscription, and that is precisely what the app uses.',
      },
      {
        kind: 'steps',
        items: [
          'The app builds one piece of text from the brand profile, the platform rules and what you asked for.',
          'It starts the Claude Code program on your machine in headless print mode.',
          'It hands that text to the program on standard input, as if typed.',
          'The program answers using your subscription login and writes to standard output.',
          'The app reads that output, extracts the JSON object inside it and validates it against a schema.',
        ],
      },
      {
        kind: 'text',
        body: 'So there is no API key, no server account and no network service in between. Two programs talk on one machine. From the app, Claude Code is simply a subprocess it gives text to and gets text from.',
      },
      {
        kind: 'text',
        body: 'This is also why a hosted version cannot use this path. A remote server does not have the program installed on your machine. Hosting would force everyone to bring an API key, which removes the best property of the tool.',
      },
    ],
  },
  {
    id: 'validation',
    title: 'Why the answer is not trusted as it arrives',
    blocks: [
      {
        kind: 'text',
        body: 'Models sometimes stray from the requested shape. They add commentary, skip a field, or exceed a character limit. So no answer is stored as it arrives.',
      },
      {
        kind: 'list',
        items: [
          'The JSON object is extracted from the answer and the surrounding text is thrown away.',
          'It is validated against a schema. If the shape is wrong it is tried once more, with the exact errors handed back to the model.',
          'For list requests each item is validated on its own. One broken item costs one item, not the batch.',
          'Ad copy character limits live in the schema, so copy an ad manager would truncate is never stored.',
        ],
      },
    ],
  },
  {
    id: 'data',
    title: 'Where your data lives',
    blocks: [
      {
        kind: 'text',
        body: 'Everything sits as plain files in a workspace folder on your machine. No account, no cloud, no server keeping records. You can open, edit, back up or delete the files by hand.',
      },
      {
        kind: 'list',
        items: [
          'Brand profile, ideas, generated content, campaigns, article topics and the calendar each have their own file.',
          'Settings and your Gemini key, if any, live in a separate file that is kept out of version control.',
          'For a second product, copy the whole folder.',
        ],
      },
    ],
  },
  {
    id: 'limits',
    title: 'What it does not do',
    blocks: [
      {
        kind: 'text',
        body: 'Knowing what a tool refuses to do matters as much as knowing what it does.',
      },
      {
        kind: 'list',
        items: [
          'It never posts anywhere. You copy the text and publish it.',
          'It never produces a search volume, difficulty score or click estimate. It has no access to that data, and an invented number drives a bad decision.',
          'It never proposes an ad budget. You enter the total and the model only splits it, with a reason.',
          'It does not measure performance. For now, you are the one who knows what worked.',
        ],
      },
    ],
  },
];

export function guideSections(language: Language): GuideSection[] {
  return language === 'en' ? en : tr;
}
