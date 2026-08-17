'use strict';
/* ============================================================
   BIKFAYA RACE — Arabic / English translation system
   Usage: window.i18n.setLang('ar') / window.i18n.setLang('en')
============================================================ */
const TRANSLATIONS = {
  en: {}, // English — page HTML is the source of truth
  ar: {
    /* NAV */
    'nav.about':    'عن السباق',
    'nav.schedule': 'الجدول',
    'nav.prizes':   'الجوائز',
    'nav.gallery':  'العام الماضي',
    'nav.faq':      'أسئلة شائعة',
    'nav.contact':  'تواصل معنا',
    'nav.register': 'سجّل الآن',

    /* HERO */
    'hero.eyebrow':   'بكفيا · لبنان · معتمد من الاتحاد اللبناني ✓ · سباق بيئي ♻️',
    'hero.title':     'سباق بكفيا 5K<br /><span class="highlight">الإيكو 2026</span>',
    'hero.subtitle':  'الأحد، 20 سبتمبر 2026 · محلّ ألفا بكفيا',
    'hero.badge1':    '5K تنافسي',
    'hero.badge2':    '2K مرح',
    'hero.cta1':      'سجّل الآن',
    'hero.cta2':      'جدول السباق',
    'hero.note':      '📋 يفتح التسجيل في <strong>20 أغسطس</strong> — يغلق في <strong>15 سبتمبر</strong>',
    'cd.days':  'أيام',
    'cd.hours': 'ساعات',
    'cd.mins':  'دقائق',
    'cd.secs':  'ثواني',

    /* INFO BAR */
    'info.raceday':  'يوم السباق',
    'info.racedate': 'الأحد، 20 سبتمبر 2026',
    'info.location': 'الموقع',
    'info.locval':   'محلّ ألفا، بكفيا',
    'info.dist':     'المسافات',
    'info.distval':  '5K تنافسي · 2K مرح',
    'info.cert':     'معتمد',
    'info.certval':  'معتمد من الاتحاد اللبناني',

    /* ABOUT */
    'about.label':  'عن السباق',
    'about.title':  'أكثر من مجرّد سباق',
    'about.body1':  'سباق بكفيا 5K الإيكو هو فعالية جري بيئية معتمدة من الاتحاد اللبناني، تُقام في أجمل المناطق الجبلية في بكفيا. سواء كنت عداءً محترفاً تسعى لتحقيق رقم قياسي أو عائلة تبحث عن متعة الصباح — هناك سباق للجميع.',
    'about.body2':  'ينطلق السباق ويصل إلى محلّ ألفا بكفيا، ويمرّ بشوارع هذه المدينة الجبلية الرائعة، بينما يشجّع المتفرجون كل خطوة.',
    'about.feat1':  'معتمد ومعترف به من الاتحاد اللبناني',
    'about.feat2':  'فعالية صديقة للبيئة ♻️',
    'about.feat3':  'مرحباً بمشاركي Blind with Vision',
    'about.feat4':  'جوائز نقدية وكؤوس وميداليات',
    'about.feat5':  'فطور ما بعد السباق لجميع المكمّلين',

    /* SCHEDULE */
    'sched.label':    'يوم السباق',
    'sched.title':    'الأحد، 20 سبتمبر 2026',
    'sched.subtitle': 'جميع الفعاليات تنطلق وتنتهي في محلّ ألفا بكفيا. المواعيد تقريبية.',
    'sched.t1':  '7:00 ص',
    'sched.h1':  'التجمّع',
    'sched.p1':  'الحضور إلى محلّ ألفا بكفيا، استلام حقيبة السباق، الإحماء والاستعداد.',
    'sched.t2':  '8:00 ص',
    'sched.h2':  'سباق 5K التنافسي 🏁',
    'sched.p2':  'سباق 5K الرسمي المعتمد من الاتحاد اللبناني. قياس توقيت إلكتروني مع تصنيفات للفئات العمرية.',
    'sched.t3':  '9:00 ص',
    'sched.h3':  'سباق 2K المرح 🎉',
    'sched.p3':  'مفتوح للجميع — جميع الأعمار، العائلات، المبتدئين، ومشاركي Blind with Vision.',
    'sched.t4':  '10:00 ص',
    'sched.h4':  'إغلاق السباق',
    'sched.p4':  'يجب أن يكون جميع المشاركين قد أكملوا السباق. فرق الدعم الطبي في الخدمة طوال الوقت.',
    'sched.t5':  '11:00 ص',
    'sched.h5':  'حفل التتويج والفطور 🥐',
    'sched.p5':  'توزيع الجوائز على الفائزين، تليها مناقيش وفواكه طازجة ومشروبات ساخنة وباردة.',

    /* REGISTER */
    'reg.label':  'التسجيل',
    'reg.title':  'اختر سباقك',
    'reg.body':   'يفتح التسجيل في <strong>20 أغسطس 2026</strong> ويغلق في 15 سبتمبر. أقصى عدد 500 مشارك. الدفع عبر OMT.',
    'reg.comp':   'تنافسي',
    'reg.fun':    'مرح',
    'reg.feat1a': 'توقيت إلكتروني ونتائج رسمية',
    'reg.feat2a': 'رقم المشارك والميدالية',
    'reg.feat3a': 'تصنيف فئات عمرية (ذكور وإناث)',
    'reg.feat4a': 'جوائز نقدية للفائزين العامين',
    'reg.feat5a': 'فطور ما بعد السباق',
    'reg.feat1b': 'رقم المشارك والميدالية',
    'reg.feat2b': 'مفتوح لجميع الأعمار',
    'reg.feat3b': 'مرحباً بالعائلات والمبتدئين',
    'reg.feat4b': 'مرحباً بمشاركي Blind with Vision 🤝',
    'reg.feat5b': 'فطور ما بعد السباق',
    'reg.btn5k':  'سجّل في 5K — 25$',
    'reg.btn2k':  'سجّل في 2K — 10$',
    'reg.closes': 'يغلق 15 سبتمبر 2026',
    'how.label':  'كيف يعمل',
    'how.s1t':    'اختر سباقك',
    'how.s1b':    'اختر سباق 5K التنافسي أو سباق 2K المرح.',
    'how.s2t':    'أكمل النموذج',
    'how.s2b':    'أدخل بياناتك. يستغرق أقل من 3 دقائق.',
    'how.s3t':    'ادفع عبر OMT',
    'how.s3b':    'أكمل الدفع إلكترونياً أو توجّه لأقرب فرع OMT.',
    'how.s4t':    'استلم تذكرتك',
    'how.s4b':    'ستصلك رسالة تأكيد بالبريد الإلكتروني مع رقم التذكرة.',

    /* PRIZES */
    'prizes.label':   'الجوائز',
    'prizes.title':   'جوائز السباق',
    'prizes.body':    'يُكافَأ أفضل المتسابقين في سباق 5K التنافسي. يحصل الفائزون في الفئات على كؤوس وميداليات.',
    'prizes.block1':  'الفائزون العامون — ذكور وإناث',
    'prizes.1st':     'المركز الأول',
    'prizes.2nd':     'المركز الثاني',
    'prizes.3rd':     'المركز الثالث',
    'prizes.coupon':  '+ قسائم تسوّق من الرعاة 🎁',
    'prizes.block2':  'الفائزون حسب الفئة',
    'prizes.cat1t':   'كؤوس',
    'prizes.cat1b':   'المركز الأول في كل فئة عمرية',
    'prizes.cat2t':   'ميداليات',
    'prizes.cat2b':   'أفضل 3 في كل فئة عمرية',
    'prizes.cat3t':   'قسائم الرعاة',
    'prizes.cat3b':   'الفائزون العامون',
    'prizes.cat4t':   'ميدالية الإتمام',
    'prizes.cat4b':   'لكل مكمّل في كلا السباقين',
    'prizes.post':    '🥐 فطور ما بعد السباق للجميع',
    'prizes.postd':   'مناقيش · فواكه طازجة · مشروبات ساخنة وباردة — تُقدَّم من الساعة 9:00 ص',

    /* GALLERY */
    'gallery.label': 'العام الماضي',
    'gallery.title': 'أبرز لحظات 2025',
    'gallery.body':  'لمحة من مشهد العام الماضي في شوارع بكفيا.',
    'gallery.cap1':  'خط الانطلاق — محلّ ألفا بكفيا',
    'gallery.cap2':  'عبور خط النهاية',
    'gallery.cap3':  'حفل الجوائز',
    'gallery.cap4':  'سباق 2K المرح — للجميع',
    'gallery.cap5':  'فطور مناقيش ما بعد السباق',
    'gallery.note':  '📸 صور وتصوير جوّي من 2025 قريباً. تغطية جوّية جديدة مخطّطة لعام 2026! 🎥',

    /* SPONSORS */
    'sponsors.label': 'الشركاء',
    'sponsors.title': 'رعاة السباق',
    'sponsors.body':  'يتحقّق سباق بكفيا بفضل الدعم الكريم من رعاتنا. انضم إلينا شريكاً لعام 2026.',
    'sponsors.tier1': 'الراعي الذهبي الكبير',
    'sponsors.tier2': 'ذهبي',
    'sponsors.tier3': 'فضّي',
    'sponsors.cta':   'هل أنت مهتم برعاية سباق بكفيا 2026؟',
    'sponsors.ctabtn':'احصل على ملف الرعاية',

    /* FAQ */
    'faq.label': 'أسئلة شائعة',
    'faq.title': 'أسئلة شائعة',
    'faq.q1': 'متى يفتح التسجيل؟',
    'faq.a1': 'يفتح التسجيل في <strong>20 أغسطس 2026</strong> ويغلق في <strong>15 سبتمبر 2026</strong>. الأماكن محدودة لذا سجّل مبكراً.',
    'faq.q2': 'كيف أدفع رسوم التسجيل؟',
    'faq.a2': 'يتم الدفع عبر <strong>OMT</strong>. يمكنك الدفع إلكترونياً عبر ePay أو زيارة أقرب فرع OMT برقم التسجيل.',
    'faq.q3': 'ما الفرق بين 5K و2K؟',
    'faq.a3': '<strong>5K</strong> سباق تنافسي معتمد مع توقيت إلكتروني ونتائج رسمية وجوائز. <strong>2K</strong> سباق مرح غير تنافسي مفتوح لجميع الأعمار.',
    'faq.q4': 'ماذا أحضر يوم السباق؟',
    'faq.a4': 'أحضر بريد التأكيد أو رقم التذكرة (رقمياً أو مطبوعاً)، هوية سارية، وملابس رياضية مريحة.',
    'faq.q5': 'هل هناك حدّ للسن؟',
    'faq.a5': 'سباق 2K مفتوح لجميع الأعمار (القاصرون برفقة وليّ أمر). يشترط سباق 5K أن يكون عمر المشارك 16 عاماً فأكثر.',
    'faq.q6': 'هل تتوفر مواقف سيارات؟',
    'faq.a6': 'نعم، تتوفر مواقف سيارات في منطقة بكفيا بالقرب من نقطة الانطلاق. لا تتوفر حالياً وسائل نقل منظّمة.',
    'faq.q7': 'هل الفعالية صديقة للبيئة؟',
    'faq.a7': 'نعم! سباق بكفيا ملتزم بأن يكون فعالية صديقة للبيئة ♻️. نحدّ من استخدام البلاستيك ونشجّع السلوك المسؤول.',
    'faq.q8': 'هل يمكن لمشاركي Blind with Vision الانضمام؟',
    'faq.a8': 'بالتأكيد. نرحّب بحرارة بمشاركي Blind with Vision في سباق 2K. يُرجى الإشارة لذلك أثناء التسجيل.',

    /* CTA */
    'cta.title': 'هل أنت مستعد للجري؟',
    'cta.body':  '20 سبتمبر 2026 — محلّ ألفا، بكفيا. سجّل قبل 15 سبتمبر.',
    'cta.btn':   'احجز مكانك',

    /* FOOTER */
    'footer.about':    'فعالية جري سنوية معتمدة من الاتحاد اللبناني في مدينة بكفيا الجبلية الجميلة. مفتوحة للجميع.',
    'footer.links':    'روابط سريعة',
    'footer.contact':  'تواصل معنا',

    /* CONTACT PAGE */
    'contact.label':    'تواصل معنا',
    'contact.title':    'التواصل',
    'contact.email':    'البريد الإلكتروني',
    'contact.emailp':   'للاستفسارات حول التسجيل والرعاية:',
    'contact.dir':      'مدير السباق',
    'contact.dirp':     'للإعلام والشراكات والاستفسارات الرسمية:',
    'contact.loc':      'موقع السباق',
    'contact.locp':     'الانطلاق والوصول:',
    'contact.date':     'تاريخ السباق',
    'contact.datev':    'الأحد، 20 سبتمبر 2026',
    'contact.follow':   'تابعنا',
    'contact.followp':  'ابقَ على اطّلاع بآخر الأخبار والنتائج والصور:',
    'contact.sponsor':  '🏆 مهتم برعاية سباق 2026؟',
    'contact.sponsora': 'راسلنا للحصول على ملف الرعاية.',
  },
};

window.i18n = (function () {
  let current = localStorage.getItem('bikfaya_lang') || 'en';
  const enCache = new Map(); // stores original English HTML per element key

  function cacheEnglish() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!enCache.has(key)) enCache.set(key, el.innerHTML);
    });
  }

  function applyLang(lang) {
    current = lang;
    localStorage.setItem('bikfaya_lang', lang);
    const isAr = lang === 'ar';

    // Cache English values before first swap
    if (enCache.size === 0) cacheEnglish();

    // Set document direction and lang
    document.documentElement.lang = lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isAr);

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (lang === 'en') {
        // Restore cached English
        if (enCache.has(key)) el.innerHTML = enCache.get(key);
      } else {
        const t = TRANSLATIONS[lang]?.[key];
        if (t) el.innerHTML = t;
      }
    });

    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function setLang(lang) { applyLang(lang); }
  function getLang()      { return current; }
  function init()         { applyLang(current); }

  // Auto-init after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { setLang, getLang, init };
})();
