export interface TranslationDict {
  appName: string;
  noCodePlatform: string;
  projectBudget: string;
  adminWhatsApp: string;
  dashboard: string;
  noCodeCreator: string;
  adBuilder: string;
  marketplace: string;
  billing: string;
  reports: string;
  lockPanel: string;
  welcomeToSas: string;
  sasSlogan: string;
  sasDesc: string;
  createProjectNow: string;
  githubPublisher: string;
  githubPublisherDesc: string;
  githubToken: string;
  githubTokenDesc: string;
  clickToCreateToken: string;
  activePlan: string;
  trial: string;
  remainingGames: string;
  remainingWebsites: string;
  remainingApps: string;
  tokenAllowance: string;
  quickPrompts: string;
  quickPromptGame: string;
  quickPromptTrial: string;
  quickPromptPackages: string;
  quickPromptAds: string;
  chatPlaceholder: string;
  copied: string;
  copy: string;
  activeCampaigns: string;
  storeItems: string;
  approvedInvoices: string;
  completedTasks: string;
  recentActivity: string;
  paymentMethods: string;
  searchInvoicePlaceholder: string;
  searchInvoices: string;
  allInvoices: string;
  pendingInvoices: string;
}

export const TRANSLATIONS: Record<"ku" | "ar" | "en", TranslationDict> = {
  ku: {
    appName: "SAS-Platform",
    noCodePlatform: "پلاتفۆرمی بێ کۆد",
    projectBudget: "بوودجەی پڕۆژەکان",
    adminWhatsApp: "واتسئاپی بەڕێوەبەر",
    dashboard: "داشبۆرد",
    noCodeCreator: "دروستکەری بێ کۆد",
    adBuilder: "دروستکردنی ڕیکلام",
    marketplace: "کۆگای فرۆشتن",
    billing: "پاکێجەکان",
    reports: "ڕاپۆرتەکان",
    lockPanel: "قفڵکردنی پانێڵ",
    welcomeToSas: "پلاتفۆرمی نەوەی نوێ (No-Code Generation)",
    sasSlogan: "بیرۆکەکەت بنووسە، پلاتفۆرم بۆت دروست دەکات!",
    sasDesc: "SAS-Platform بزوێنەرێکی زیرەکی بێ وێنەیە بۆ دروستکردنی پڕۆژەی دیجیتاڵی بەبێ کۆد. کەمپینی ڕیکلامی هەرزان دروست بکە، تێکەڵ بە تیکتۆک و فەیسبووکی بکە، و ڕاستەوخۆ لە کۆگای فرۆشتنی SAS دا کڕیاران کۆبکەرەوە.",
    createProjectNow: "ئێستا پڕۆژەیەک دروست بکە",
    githubPublisher: "بڵاوکەرەوەی گیتھەب بە یەک کلیک 🚀 (GitHub One-Click Publisher)",
    githubPublisherDesc: "هاوڕێ و گەورەی هێژام، لێرەدا دەتوانیت بە تەواوی هاوشێوەی Bolt.com تەنها بە یەک دوگمە تەواوی فایلەکان و برانچەکانی پڕۆژەکەت ڕەوانەی گیتھەب بکەیت! هیچ هەنگاوێکی ئاڵۆزی ناوێت.",
    githubToken: "کلیلی دەسەڵاتی گیتھەب (GitHub Token)",
    githubTokenDesc: "کۆدی دەسەڵاتی گیتھەب (Personal Access Token) بە دەسەڵاتی repo بۆ دروستکردن و پاشەکەوتکردن.",
    clickToCreateToken: "لێرە کلیل دروستکە ↗",
    activePlan: "پاکێجی چالاک",
    trial: "تاقیکاری",
    remainingGames: "یارییە ماوەکان",
    remainingWebsites: "ماڵپەڕە ماوەکان",
    remainingApps: "ئەپە ماوەکان",
    tokenAllowance: "ڕێژەی تۆکنەکان",
    quickPrompts: "پرسیارە خێراکان",
    quickPromptGame: "چۆن یاری دروست بکەم؟",
    quickPromptTrial: "مەرجی هەفتەی خۆڕایی چییە؟",
    quickPromptPackages: "پاکێجەکان چۆن کارا دەکرێن؟",
    quickPromptAds: "دروستکردنی ڕیکلامی هەرزان چۆنە؟",
    chatPlaceholder: "پەیامەکەت لێرە بنووسە...",
    copied: "کۆپی کرا!",
    copy: "کۆپیکردن",
    activeCampaigns: "کەمپینە چالاکەکان",
    storeItems: "بەرهەمەکانی کۆگا",
    approvedInvoices: "پسوولە پەسەندکراوەکان",
    completedTasks: "پڕۆژە تەواوبووەکان",
    recentActivity: "دوایین چالاکییەکان",
    paymentMethods: "شێوازەکانی پارەدان",
    searchInvoicePlaceholder: "گەڕان بەپێی ناسنامەی پسوولە (ID) یان ئیمەیڵ... (Search ID or Email)",
    searchInvoices: "گەڕانی پسوولەکان",
    allInvoices: "هەموو پسوولەکان",
    pendingInvoices: "پسوولە چاوەڕوانکراوەکان"
  },
  ar: {
    appName: "SAS-Platform",
    noCodePlatform: "منصة بدون كود",
    projectBudget: "ميزانية المشاريع",
    adminWhatsApp: "واتساب المدير",
    dashboard: "اللوحة الرئيسية",
    noCodeCreator: "صانع بدون كود",
    adBuilder: "صانع الإعلانات",
    marketplace: "المتجر",
    billing: "الاشتراكات والأسعار",
    reports: "التقارير المالية",
    lockPanel: "قفل اللوحة",
    welcomeToSas: "منصة الجيل الجديد (No-Code Generation)",
    sasSlogan: "اكتب فكرتك، المنصة ستصنعها لك!",
    sasDesc: "منصة SAS هي محرك ذكي فريد من نوعه لإنشاء المشاريع الرقمية بدون كود. أنشئ حملات إعلانية رخيصة، واربطها بتيك توك وفيسبوك، واجمع المشترين مباشرة في متجر SAS.",
    createProjectNow: "أنشئ مشروعاً الآن",
    githubPublisher: "ناشر الغيت هاب بنقرة واحدة 🚀 (GitHub One-Click Publisher)",
    githubPublisherDesc: "صديقي العزيز، هنا يمكنك تماماً مثل Bolt.com إرسال جميع ملفات وفروع مشروعك إلى غيت هاب بنقرة زر واحدة! لا يتطلب الأمر خطوات معقدة.",
    githubToken: "رمز وصول غيت هاب (GitHub Token)",
    githubTokenDesc: "رمز الوصول الشخصي (Personal Access Token) مع صلاحية repo لإنشاء وحفظ المشاريع.",
    clickToCreateToken: "أنشئ رمزاً هنا ↗",
    activePlan: "الباقة النشطة",
    trial: "فترة تجريبية",
    remainingGames: "الألعاب المتبقية",
    remainingWebsites: "المواقع المتبقية",
    remainingApps: "التطبيقات المتبقية",
    tokenAllowance: "ميزانية الرموز (Tokens)",
    quickPrompts: "أسئلة سريعة",
    quickPromptGame: "كيف أصنع لعبة؟",
    quickPromptTrial: "ما هي شروط الأسبوع المجاني؟",
    quickPromptPackages: "كيف يتم تفعيل الباقات؟",
    quickPromptAds: "كيف تصنع إعلاناً رخيصاً؟",
    chatPlaceholder: "اكتب رسالتك هنا...",
    copied: "تم النسخ!",
    copy: "نسخ",
    activeCampaigns: "الحملات الإعلانية النشطة",
    storeItems: "منتجات المتجر",
    approvedInvoices: "الفواتير المعتمدة",
    completedTasks: "المشاريع المكتملة",
    recentActivity: "النشاطات الأخيرة",
    paymentMethods: "طرق الدفع",
    searchInvoicePlaceholder: "البحث برقم الفاتورة (ID) أو البريد الإلكتروني...",
    searchInvoices: "البحث في الفواتير",
    allInvoices: "كل الفواتير",
    pendingInvoices: "الفواتير المعلقة"
  },
  en: {
    appName: "SAS-Platform",
    noCodePlatform: "No-Code Platform",
    projectBudget: "Project Budget",
    adminWhatsApp: "Admin WhatsApp",
    dashboard: "Dashboard",
    noCodeCreator: "No-Code Creator",
    adBuilder: "Ad Builder",
    marketplace: "Marketplace Store",
    billing: "Billing & Plans",
    reports: "Financial Reports",
    lockPanel: "Lock Panel",
    welcomeToSas: "Next-Gen Generation (No-Code)",
    sasSlogan: "Type your idea, the platform will build it for you!",
    sasDesc: "SAS-Platform is a unique intelligent engine to create digital projects without code. Create affordable ad campaigns, integrate with TikTok and Facebook, and gather buyers directly in the SAS store.",
    createProjectNow: "Create a Project Now",
    githubPublisher: "GitHub One-Click Publisher 🚀",
    githubPublisherDesc: "My esteemed friend, here you can just like Bolt.com deploy all your project files and branches to GitHub with a single button click! No complex steps required.",
    githubToken: "GitHub Access Token",
    githubTokenDesc: "Personal Access Token with 'repo' scope to create and push repositories.",
    clickToCreateToken: "Create a token here ↗",
    activePlan: "Active Plan",
    trial: "Trial Period",
    remainingGames: "Remaining Games",
    remainingWebsites: "Remaining Websites",
    remainingApps: "Remaining Apps",
    tokenAllowance: "Token Allowance",
    quickPrompts: "Quick Questions",
    quickPromptGame: "How do I create a game?",
    quickPromptTrial: "What are the free trial terms?",
    quickPromptPackages: "How are packages activated?",
    quickPromptAds: "How to build cheap ads?",
    chatPlaceholder: "Type your message here...",
    copied: "Copied!",
    copy: "Copy",
    activeCampaigns: "Active Campaigns",
    storeItems: "Store Products",
    approvedInvoices: "Approved Invoices",
    completedTasks: "Completed Projects",
    recentActivity: "Recent Activities",
    paymentMethods: "Payment Methods",
    searchInvoicePlaceholder: "Search by Invoice ID or Email...",
    searchInvoices: "Search Invoices",
    allInvoices: "All Invoices",
    pendingInvoices: "Pending Invoices"
  }
};
