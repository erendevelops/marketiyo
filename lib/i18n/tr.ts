export const tr = {
  appName: 'Marketiyo',

  navIdeas: 'Fikirler',
  navCalendar: 'Takvim',
  navBrand: 'Marka',
  navSetup: 'Kurulum',

  setupTitle: 'Kurulum',
  setupEngine: 'İçeriği hangi model üretsin?',
  setupClaudeCode: 'Claude Code, mevcut aboneliğinle',
  setupClaudeCodeHint:
    'Bilgisayarında Claude Code kurulu ve giriş yapılmış olmalı. API anahtarı gerekmez.',
  setupGemini: 'Gemini, kendi API anahtarınla',
  setupGeminiHint:
    'Anahtar yalnızca bu bilgisayarda saklanır ve sadece Google sunucularına gönderilir.',
  setupSave: 'Kaydet ve bağlantıyı sına',
  setupAvailable: 'Bağlantı kuruldu',
  setupUnavailable: 'Bağlantı kurulamadı',

  brandTitle: 'Marka profili',
  brandIntro:
    'Üretilen her fikir bu sayfadaki bilgilere dayanır. Ne kadar somut yazarsan, fikirler o kadar sana özel olur.',

  brandDraftLabel: 'Ürününü anlat',
  brandDraftHint:
    'Ürününü tarif eden bir metni buraya yapıştır, aşağıdaki alanları senin için dolduralım. Sonra düzeltirsin.',
  brandDraftAction: 'Taslağı oluştur',

  brandBasics: 'Temel bilgiler',
  brandProductName: 'Ürün adı',
  brandOneLiner: 'Ürün tek cümleyle ne yapıyor?',
  brandCategory: 'Hangi kategoride? Örneğin geliştirici aracı, kafe, ajans',

  brandAudiences: 'Kime sesleniyorsun?',
  brandAudiencesHint: 'Her kitle için ayrı bir satır ekle.',
  brandAudienceLabel: 'Kitleyi tek kelimeyle tanımla',
  brandAudiencePain: 'Şu an yaşadığı sıkıntı',
  brandAudienceDesire: 'Ulaşmak istediği sonuç',
  brandAudienceWhere: 'Vaktini nerede geçiriyor?',

  brandVoiceDo: 'Üslubunda olmasını istediklerin',
  brandVoiceDoHint: 'Örnek: sade konuş, ekrandan göster, rakam ver.',
  brandVoiceDont: 'Üslubunda asla istemediklerin',
  brandVoiceDontHint: 'Örnek: abartılı vaat verme, klişe motivasyon cümlesi kurma.',

  brandProof: 'Elindeki somut kanıtlar',
  brandProofHint:
    'Gerçekten söyleyebileceğin rakamlar, sonuçlar veya gösterebileceğin şeyler. Model burada olmayan bir sayıyı uydurmaz.',

  brandBannedClaims: 'Asla kullanılmayacak ifadeler',
  brandBannedClaimsHint: 'Yasal ya da marka açısından söylemek istemediğin iddialar.',

  brandOutputLanguage: 'İçerikler hangi dilde üretilsin?',
  brandPlatforms: 'Hangi platformlar için üretilsin?',
  brandSave: 'Marka profilini kaydet',
  brandSaved: 'Kaydedildi.',

  ideasTitle: 'Fikir bankası',
  ideasIntro: 'Beğendiklerini sakla, beğenmediklerini nedeniyle ele. Bir sonraki parti buna göre değişir.',
  ideasPlatform: 'Platform',
  ideasCount: 'Kaç fikir?',
  ideasGenerate: 'Fikirleri üret',
  ideasGenerating: 'Üretiliyor, yaklaşık yarım dakika sürer',
  ideasGenerated: 'fikir eklendi',
  ideasDiscarded: 'fikir hatalı geldiği için atlandı',
  ideasKeep: 'Sakla',
  ideasReject: 'Ele',
  ideasRejectWhy: 'Neden elendi?',
  ideasExpand: 'İçeriğe dönüştür',
  ideasEmpty: 'Burada gösterilecek fikir yok.',
  ideasFilterPlatform: 'Platform',
  ideasFilterStatus: 'Durum',
  ideasFilterAll: 'Tümü',

  statusNew: 'Yeni',
  statusKept: 'Saklandı',
  statusRejected: 'Elendi',
  statusExpanded: 'İçeriği hazır',
  statusScheduled: 'Takvimde',

  reasonOffBrand: 'Markaya uymuyor',
  reasonTooGeneric: 'Fazla genel',
  reasonAlreadyDone: 'Bunu zaten yaptım',
  reasonWrongAudience: 'Yanlış kitleye sesleniyor',
  reasonWeakHook: 'Kancası zayıf',
  reasonOther: 'Başka bir nedenle',

  expansionTitle: 'İçerik',
  expansionGenerate: 'İçeriği üret',
  expansionRegenerate: 'Yeniden üret',
  expansionSave: 'Değişiklikleri kaydet',
  expansionEmpty: 'Bu fikir henüz içeriğe dönüştürülmedi.',

  calendarTitle: 'Paylaşım takvimi',
  calendarIntro: 'Hiçbir şey otomatik paylaşılmaz. Paylaştığında slota kendin işaretlersin.',
  calendarAddSlot: 'Bu güne slot ekle',
  calendarPropose: 'Boş slotları doldur',
  calendarFilled: 'slot dolduruldu',
  calendarNothingToFill: 'Doldurulacak uygun içerik yok.',
  calendarClear: 'Slotu boşalt',
  calendarEmptySlot: 'Boş slot',
  calendarPrevWeek: 'Önceki hafta',
  calendarNextWeek: 'Sonraki hafta',

  slotPlanned: 'Planlandı',
  slotReady: 'Hazır',
  slotPosted: 'Paylaşıldı',
  slotSkipped: 'Atlandı',

  platformShortVideo: 'Kısa video',
  platformX: 'X',
  platformLinkedin: 'LinkedIn',
  platformInstagram: 'Instagram',

  addRow: 'Satır ekle',
  removeRow: 'Kaldır',
  errorGeneric: 'Bir şeyler ters gitti.',
  backToIdeas: 'Fikirlere dön',
};

export type Dictionary = typeof tr;
