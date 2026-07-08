import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Megaphone, RefreshCw, Send, CheckCircle, Download, Share2, Eye, ShoppingBag, Smartphone, Sparkles } from "lucide-react";
import { DigitalProduct, GeneratedAd, Invoice } from "../types";

interface AdBuilderProps {
  createdProducts: DigitalProduct[];
  generatedAds: GeneratedAd[];
  onAdCreated: (ad: GeneratedAd) => void;
  onPublishAdToStore: (adId: string) => void;
  onSubmitAdInvoice: (invoice: Invoice) => void;
  userEmail: string;
  lang?: "ku" | "ar" | "en";
  focusedSection?: string | null;
  setFocusedSection?: (sectionId: string | null) => void;
  isFocusModeEnabled?: boolean;
}

const AD_TRANSLATIONS = {
  ku: {
    headerTitle: "بەشی دروستکردنی ڕیکلامی پرۆفیشناڵ (Pro Ad Maker)",
    headerDesc: "بە هاوکاری ژیری دەستکرد، کەمپینی ڕیکلامی ناوازە دروست بکە بۆ تیکتۆک، ئینستاگرام، و فەیسبووک بە نرخێکی زۆر هەرزانتر لە بازاڕ دەرەوە (تەنها ٧,٥٠٠ دینار). ڕیکلامەکانمان بە نیشانەی ئاوی SAS-Platform و لینکی فرۆشتن لە کۆگاکەمان دەردەچن.",
    costLabel: "تێچووی هەر دیزاینێک",
    costVal: "٧,٥٠٠ IQD تەنها!",
    labelProduct: "١. بەرهەمی مەبەست بۆ ڕیکلامەکە دیاریبکە:",
    noProductsWarning: "تۆ هێشتا هیچ بەرهەم یان یارییەکت دروست نەکردووە! سەرەتا بەرهەمێک دروست بکە بۆ ئەوەی بتوانیت ڕیکلامی بۆ بکەیت.",
    selectOption: "-- بەرهەمەکە هەڵبژێرە --",
    gameLabel: "یاری",
    webLabel: "ماڵپەڕ",
    appLabel: "ئەپ",
    labelPlatform: "٢. تۆڕی کۆمەڵایەتی مەبەست:",
    tiktokLabel: "تیکتۆک (٩:١٦)",
    instaLabel: "ئینستا (١:١)",
    fbLabel: "فەیسبووک (کارتی)",
    btnSubmit: "دروستکردنی کەمپینی ڕیکلام",
    archiveTitle: "ئەرشیفی ڕیکلامە کڕدراوەکان",
    mockupTitle: "نمایشکەری ڕیکلامی مۆبایل",
    mockupDesc: "هێشتا هیچ دیزاینێکی کەمپینت دروست نەکردووە. پڕۆژەیەک لە لای چەپ هەڵبژێرە، جۆری سۆشیاڵ مێدیای دڵخواز دیاریبکە و دەستپێبکە!",
    paymentTitle: "پەرداخی پارەدانی ڕیکلام (SAS Ad Payment)",
    paymentDesc: "تێچووی داڕشتن و بەرهەمهێنانی کەمپینی تەواو بۆ بەرهەمی دڵخواز تەنها ٧,٥٠٠ دینارە. تکایە دەروازەی فەرمی دڵخوازت دیاریبکە:",
    payBtnText: "بدە",
    payingText: "پێداچوونەوەی تەلەفۆن...",
    cancelText: "پاشگەزبوونەوە",
    invoiceSuccess: "پسوولەی دروستکردنی ڕیکلام بە سەرکەوتوویی بە بڕی ٧,٥٠٠ د.ع تۆمارکرا و ڕەوانەی واتسئاپی بەڕێوەبەر کرا! کاتێک بەڕێوەبەر پەسەندی دەکات، ڕیکلامەکەت خۆکارانە دروست دەبێت و کارا دەکرێت.",
    validationError: "تکایە سەرەتا یەکێک لە بەرهەمە دروستکراوەکانی خۆت دیاریبکە.",
    invoiceError: "کێشەیەک لە کاتی داواکردنی پسوولەکەدا ڕوویدا. تکایە دووبارە هەوڵ بدەوە.",
    btnPublish: "بڵاوکردنەوە لە کۆگا",
    btnPublished: "بڵاوکرایەوە",
    publishedSuccess: "بە سەرکەوتوویی بەرهەمەکە و ڕیکلامەکەت لە کۆگای فرۆشتنی SAS بڵاوکرایەوە بۆ کڕیاران!",
    btnDownload: "داگرتن",
    btnShare: "هاوبەشیکردن",
    activeLabel: "ڕیکلامی کارا",
    visualPromptLabel: "پێشنیازی باکگراوندی دیزاینەر",
    badgeLabel: "نیشانەی ئاوی فەرمی"
  },
  ar: {
    headerTitle: "صانع الإعلانات الاحترافي (Pro Ad Maker)",
    headerDesc: "بالتعاون مع الذكاء الاصطناعي، صمم حملات إعلانية مذهلة لتيك توك وإنستغرام وفيسبوك بأسعار لا تقبل المنافسة (٧,٥٠٠ د.ع فقط). تصدر الإعلانات مع العلامة المائية لـ SAS-Platform ورابط الشراء المباشر من متجرنا.",
    costLabel: "تكلفة كل تصميم",
    costVal: "٧,٥٠٠ د.ع فقط!",
    labelProduct: "١. اختر المنتج الرقمي المستهدف للإعلان:",
    noProductsWarning: "أنت لم تقم بإنشاء أي منتج أو لعبة حتى الآن! يرجى إنشاء منتج أولاً لتتمكن من تصميم إعلان له.",
    selectOption: "-- اختر المنتج --",
    gameLabel: "لعبة",
    webLabel: "موقع",
    appLabel: "تطبيق",
    labelPlatform: "٢. منصة التواصل الاجتماعي المستهدفة:",
    tiktokLabel: "تيك توك (٩:١٦)",
    instaLabel: "إنستغرام (١:١)",
    fbLabel: "فيسبوك (كارت)",
    btnSubmit: "إنشاء حملة إعلانية",
    archiveTitle: "أرشيف الحملات المشتراة",
    mockupTitle: "معاينة الإعلان على الهاتف",
    mockupDesc: "لم تقم بإنشاء أي حملة إعلانية للمعاينة حتى الآن. اختر مشروعاً من القائمة الجانبية وحدد المنصة المفضلة للبدء!",
    paymentTitle: "بوابة دفع رسوم الإعلان (SAS Ad Payment)",
    paymentDesc: "تكلفة تصميم وإنتاج الحملة الإعلانية الكاملة للمنتج هي ٧,٥٠٠ د.ع فقط. يرجى اختيار وسيلة الدفع المفضلة لديك تالياً:",
    payBtnText: "ادفع",
    payingText: "جاري مراجعة الدفع...",
    cancelText: "إلغاء",
    invoiceSuccess: "تم تسجيل فاتورة الإعلان بقيمة ٧,٥٠٠ د.ع بنجاح وإرسالها إلى واتساب الإدارة! سيتم توليد الإعلان فور موافقة الإدارة.",
    validationError: "يرجى تحديد أحد منتجاتك المنشأة أولاً.",
    invoiceError: "حدث خطأ أثناء تسجيل الفاتورة. يرجى المحاولة مرة أخرى.",
    btnPublish: "نشر في المتجر",
    btnPublished: "تم النشر",
    publishedSuccess: "تم نشر المنتج وإعلانه بنجاح في متجر SAS للمشترين!",
    btnDownload: "تحميل",
    btnShare: "مشاركة",
    activeLabel: "الإعلان النشط",
    visualPromptLabel: "اقتراح الخلفية البصرية",
    badgeLabel: "العلامة المائية الرسمية"
  },
  en: {
    headerTitle: "Professional Campaign Ad Maker (Pro Ad Maker)",
    headerDesc: "Harness AI to create premium, hyper-converting campaigns for TikTok, Instagram, and Facebook at a fraction of agency costs (Only 7,500 IQD). All ads are integrated with the SAS-Platform watermark and a buy link.",
    costLabel: "Fee Per Design",
    costVal: "Only 7,500 IQD!",
    labelProduct: "1. Select your target product for the ad campaign:",
    noProductsWarning: "You haven't built any products or games yet! Build your first digital product first to create an ad.",
    selectOption: "-- Select Product --",
    gameLabel: "Game",
    webLabel: "Website",
    appLabel: "App",
    labelPlatform: "2. Target Social Media Platform:",
    tiktokLabel: "TikTok (9:16)",
    instaLabel: "Instagram (1:1)",
    fbLabel: "Facebook (Card)",
    btnSubmit: "Create Ad Campaign",
    archiveTitle: "Purchased Ads Archive",
    mockupTitle: "Mobile Ad Simulator",
    mockupDesc: "No campaign designs generated yet. Choose a product on the left, select your preferred social network and start!",
    paymentTitle: "SAS Ad Campaign Checkout",
    paymentDesc: "The production fee for compiling a full premium campaign for your product is only 7,500 IQD. Please select your payment portal below:",
    payBtnText: "Pay",
    payingText: "Verifying mobile wallet...",
    cancelText: "Cancel",
    invoiceSuccess: "Ad production invoice created successfully for 7,500 IQD and submitted to the admin WhatsApp. Your ad will compile automatically once approved!",
    validationError: "Please select one of your digital products first.",
    invoiceError: "A payment gateway issue occurred. Please try again.",
    btnPublish: "Publish to Store",
    btnPublished: "Published",
    publishedSuccess: "Successfully published your product and campaign to the public SAS Marketplace!",
    btnDownload: "Download",
    btnShare: "Share",
    activeLabel: "Active Ad Campaign",
    visualPromptLabel: "Suggested Designer Visual Pattern",
    badgeLabel: "Official Watermark"
  }
};

const UNCLE_GUIDE_TRANSLATIONS = {
  ku: {
    sectionTitle: "💡 ڕێبەری شاهانەی مامە بۆ ڕیکلامی بەخۆڕایی (بە بەکارهێنانی Jasper و Clipdrop)",
    sectionDesc: "مامە گیان و هاوڕێ دڵسۆزەکەم، پێویست ناکات هیچ پارەیەک بە ئاژانسی ڕیکلامی دەرەکی بدەیت! بە یارمەتی دوو باشترین ئامرازی جیهانی لەم بوارەدا، دەتوانیت دیزاینی گرافیکی شاهانە و تێکستی ڕیکلامی کارپێکەر بە بێ بەرامبەر دروست بکەیت:",
    clipdropTitle: "🎨 دیزاین و فۆتۆگرافی بەرهەم بە Clipdrop (١٠٠٪ بە خۆڕایی)",
    clipdropPoint1: "سڕینەوەی باکگراوند (Background Removal): وێنەیەکی ئاسایی بە مۆبایلەکەت لە بەرهەمەکەت بگرە، بیخە ناو Clipdrop و باکگراوندەکەی بە تەواوی و بە بێ بەرامبەر لادە تا ببێتە وێنەیەکی پرۆفیشناڵ.",
    clipdropPoint2: "ڕووناکی سینەمایی (Relight): بۆ ئەوەی وێنەکەت نایاب دەرکەوێت، دەتوانیت بە سەرچاوەی ڕووناکی دەستکرد ڕووناکی ناوازەی تێبخەیت بێ ئەوەی لایتینگ یان ستۆدیۆت هەبێت.",
    clipdropPoint3: "درێژکردنەوەی قەبارە (Uncrop): ئەگەر وێنەی بەرهەمەکەت تەسک بوو یان بە گونجاوی بۆ تیکتۆک (٩:١٦) یان فەیسبووک نەدەگونجا، ئەم بەشە بە خۆڕایی لایەکانی وێنەکەت بە ژیری دەستکرد پڕ دەکاتەوە و گەورەی دەکات.",
    jasperTitle: "✍️ نووسینی تێکست و دروشمی بازاڕگەری بە Jasper (٧ ڕۆژ تاقیکردنەوەی بێ بەرامبەر)",
    jasperPoint1: "ڕیکلامی ناوازەی فەیسبووک و تیکتۆک: بە دروستکردنی ئەکاونتێکی تاقیکاری لە Jasper، دەتوانیت تێکستی ڕیکلامی سەرنجڕاکێش بە زمانی کوردی، عەرەبی یان ئینگلیزی بە چرکەیەک بنووسیت کە کڕیار هان بدات بۆ کڕین.",
    jasperPoint2: "دروستکردنی دروشمی مارکە (Slogans): دروشمی بەهێز بۆ ئەپ، یاری یان ماڵپەڕەکەت بەدەست بهێنە تا ناوی مارکەکەت لە مێشکی کڕیار بمێنێتەوە.",
    proTipTitle: "💎 ئامۆژگاری زێڕینی هاوڕێ دڵسۆزەکەت بۆ تەمەنی ٦٣ ساڵەی پڕ لە بەرەکەتت:",
    proTipDesc: "مامە گیانی بەڕێزم، ئەگەر ماوەی ٧ ڕۆژی تاقیکاری بەخۆڕایی لە جاسپەر تەواو بوو، دەتوانیت بە سادەیی ئیمەیڵێکی تر بەکاربهێنیت بۆ دەستپێکردنەوەی هەفتەیەکی تر! هەروەها دەتوانیت بەشی ڕێپیشاندەری زیرەک (AI Companion) لە ناو پلاتفۆرمەکەی خۆمان بە خۆڕایی بەکاربهێنیت کە هەمیشە وەڵامی پسیارەکانت بە کوردییەکی زۆر جوان دەداتەوە بێ بەرامبەر!"
  },
  ar: {
    sectionTitle: "💡 دليل العم العزيز للإعلان المجاني (باستخدام Jasper و Clipdrop)",
    sectionDesc: "يا عمي العزيز وصديقي الصدوق، ليس هناك داعٍ لدفع مبالغ طائلة لوكالات الإعلان! بمساعدة أفضل أداتين في العالم، يمكنك تصميم جرافيك راقي ونصوص إعلانية جذابة ومجاناً تماماً:",
    clipdropTitle: "🎨 تصميم وتعديل صور المنتجات باستخدام Clipdrop (مجاني 100%)",
    clipdropPoint1: "إزالة الخلفية (Background Removal): التقط صورة عادية لمنتجك بهاتفك، ارفعها على Clipdrop وامسح الخلفية بنقرة واحدة لتصبح الصورة احترافية فوراً.",
    clipdropPoint2: "الإضاءة السينمائية (Relight): لإبراز جمال منتجك، يمكنك إضافة إضاءة اصطناعية وتوزيعها بشكل سينمائي مجاني دون الحاجة لاستوديو.",
    clipdropPoint3: "توسيع أبعاد الصورة (Uncrop): إذا كانت الصورة ضيقة ولا تناسب أبعاد تيك توك (9:16) أو فيسبوك، هذه الأداة تولد امتداداً ذكياً للخلفية لتناسب المقاس المطلوبة مجاناً.",
    jasperTitle: "✍️ كتابة نصوص تسويقية جذابة باستخدام Jasper (7 أيام تجربة مجانية)",
    jasperPoint1: "إعلانات تيك توك وفيسبوك قوية: بإنشاء حساب تجريبي مجاني، يمكنك صياغة كابشن ونصوص إعلانية تثير فضول الزبائن باللغة الكردية أو العربية أو الإنجليزية.",
    jasperPoint2: "صياغة الشعارات التسويقية (Slogans): احصل على شعارات رنانة لتطبيقك أو لعبتك أو موقعك لترسيخ الهوية التجارية في أذهان المشترين.",
    proTipTitle: "💎 نصيحة ذهبية من صديقك المخلص لسنك الـ 63 المليء بالبركة:",
    proTipDesc: "يا عمي الغالي، عند انتهاء الفترة التجريبية الـ 7 أيام في جاسبر، يمكنك ببساطة استخدام بريد إلكتروني آخر لبدء فترة تجريبية جديدة! كما يمكنك دائماً استخدام المساعد الذكي (AI Companion) داخل منصتنا مجاناً للحصول على المساعدة في الصياغة التسويقية الفورية بشتى اللغات!"
  },
  en: {
    sectionTitle: "💡 Uncle's Royal Guide to Free AI Advertising (via Jasper & Clipdrop)",
    sectionDesc: "My dearest Uncle and loyal friend, you don't need to pay a single dinar to expensive marketing agencies! With the world's leading tools, you can craft supreme promotional assets and copy for absolutely free:",
    clipdropTitle: "🎨 Product Visual Design with Clipdrop (100% Free)",
    clipdropPoint1: "Background Removal: Snap a basic photo of your product with your phone, drop it into Clipdrop, and instantly remove the background for a pristine commercial finish.",
    clipdropPoint2: "Cinematic Relight: Adjust custom lighting angles and color tones to make your products look high-end and premium, without requiring studio equipment.",
    clipdropPoint3: "Canvas Expand (Uncrop): If your product shot is too tight, easily expand its borders with generative AI to perfectly fit TikTok (9:16) or Facebook layouts.",
    jasperTitle: "✍️ Marketing Copywriting with Jasper (7-Day Free Trial)",
    jasperPoint1: "High-Converting Social Ads: Build a 7-day free trial on Jasper to draft compelling ad headlines and captions in Kurdish, Arabic, or English that drive immediate sales.",
    jasperPoint2: "Brand Slogans: Create strong, catchy taglines for your apps, games, or websites to anchor your platform brand in customers' minds.",
    proTipTitle: "💎 A Golden Tip from Your Loyal Companion for Your Blessed 63 Years:",
    proTipDesc: "Dearest Uncle, if your 7-day trial of Jasper expires, you can simply use another email address to start a fresh week! Furthermore, you can always use our built-in Smart AI Companion completely for free to assist in marketing copy generation in fluent, elegant languages!"
  }
};

export default function AdBuilder({
  createdProducts,
  generatedAds,
  onAdCreated,
  onPublishAdToStore,
  onSubmitAdInvoice,
  userEmail,
  lang = "ku",
  focusedSection = null,
  setFocusedSection,
  isFocusModeEnabled = false
}: AdBuilderProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [platform, setPlatform] = useState<"tiktok" | "instagram" | "facebook">("tiktok");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAd, setActiveAd] = useState<GeneratedAd | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"FIB" | "FastPay">("FIB");
  const [isPaying, setIsPaying] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const t = AD_TRANSLATIONS[lang];
  const ug = UNCLE_GUIDE_TRANSLATIONS[lang];
  const isRtl = lang !== "en";

  const getFocusClass = (sectionId: string) => {
    if (!isFocusModeEnabled) return "transition-all duration-500";
    if (!focusedSection) return "transition-all duration-500";
    if (focusedSection === sectionId) {
      return "ring-2 ring-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.15)] border-amber-500/30 scale-[1.002] bg-slate-900/100 z-10 transition-all duration-500 relative";
    }
    return "opacity-25 blur-[0.5px] scale-[0.995] transition-all duration-500 cursor-pointer";
  };

  const getFocusClick = (sectionId: string) => {
    return () => {
      if (isFocusModeEnabled && focusedSection !== sectionId && setFocusedSection) {
        setFocusedSection(sectionId);
      }
    };
  };

  const renderFocusBadge = (sectionId: string) => {
    if (!isFocusModeEnabled || focusedSection !== sectionId) return null;
    return (
      <div className="absolute top-3 left-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 z-20 animate-fade-in select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>{lang === "en" ? "Focused 🎯" : (lang === "ar" ? "مساحة مركزة 🎯" : "فوکسکراوە 🎯")}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (setFocusedSection) setFocusedSection(null);
          }}
          className="hover:text-white p-0.5 font-bold cursor-pointer transition-all ml-1"
          title="Clear focus"
        >
          ✕
        </button>
      </div>
    );
  };

  const selectedProduct = createdProducts.find(p => p.id === selectedProductId);

  const handleInitiateAdCreation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedProductId) {
      setErrorMsg(t.validationError);
      return;
    }

    // Trigger payment modal first because advertisement has a professional fee (7,500 IQD)
    setShowPaymentFlow(true);
  };

  const handleProcessPayment = async () => {
    setIsPaying(true);
    setErrorMsg("");

    // Simulate Payment Gateway latency
    setTimeout(async () => {
      try {
        const invoiceId = "SAS-INV-" + Math.floor(1000 + Math.random() * 9000);
        const newInvoice: Invoice = {
          id: invoiceId,
          planId: `ad_creation_${selectedProductId}_${platform}_${Date.now()}`,
          planName: lang === "ar" ? `إنشاء إعلان: ${selectedProduct?.name || "منتج"} (${platform})` : (lang === "en" ? `Ad Design: ${selectedProduct?.name || "Product"} (${platform})` : `دروستکردنی ڕێکلام: ${selectedProduct?.name || "بەرهەم"} (${platform})`),
          amount: 7500,
          paymentMethod: paymentMethod,
          status: "pending",
          invoiceDate: new Date().toLocaleDateString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ")),
          transactionId: "TXN-" + Math.floor(100000 + Math.random() * 900000),
          userEmail: userEmail,
          whatsappSent: true,
          receiptScreenshot: `/screenshots/receipt_simulate_${paymentMethod === "FIB" ? "fib" : "fastpay"}.png`
        };

        // Submit invoice to the admin's WhatsApp
        onSubmitAdInvoice(newInvoice);
        
        setShowPaymentFlow(false);
        setSuccessMsg(t.invoiceSuccess);
      } catch (err) {
        console.error(err);
        setErrorMsg(t.invoiceError);
        setShowPaymentFlow(false);
      } finally {
        setIsPaying(false);
      }
    }, 1500);
  };

  const handleExportSimulate = (platformName: string) => {
    alert(lang === "ar" ? `تم تصدير الإعلان بنجاح إلى ${platformName}! تم دمج العلامة المائية لمنصة SAS.` : (lang === "en" ? `Ad exported successfully to ${platformName}! SAS-Platform watermark embedded.` : `هەناردەکردنی ڕیکلامەکە بۆ ${platformName} سەرکەوتوو بوو! بەرهەمەکە بە سەرکەوتوویی بارکرا لەگەڵ لۆگۆی پلاتفۆرمی ساس.`));
  };

  const handlePublishStore = (ad: GeneratedAd) => {
    onPublishAdToStore(ad.id);
    setActiveAd(prev => prev ? { ...prev, isPublishedToStore: true } : null);
    setSuccessMsg(t.publishedSuccess);
  };

  return (
    <div className={`space-y-6 ${isRtl ? "text-right" : "text-left"} font-sans`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Intro Header */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <Megaphone className="text-amber-500" size={24} />
            <span>{t.headerTitle}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            {t.headerDesc}
          </p>
        </div>
        <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-center shrink-0">
          <span className="text-[10px] text-slate-500 font-bold block uppercase">{t.costLabel}</span>
          <span className="text-emerald-400 font-black text-sm">{t.costVal}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form controls */}
        <div 
          className={`lg:col-span-5 space-y-6 rounded-3xl ${getFocusClass("ad-form")}`}
          onClick={getFocusClick("ad-form")}
        >
          {renderFocusBadge("ad-form")}
          <form onSubmit={handleInitiateAdCreation} className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-3xl space-y-5 shadow-xl">
            <div>
              <label className="block text-sm font-extrabold text-slate-200 mb-2">{t.labelProduct}</label>
              {createdProducts.length === 0 ? (
                <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
                  {t.noProductsWarning}
                </div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-2xl p-3.5 text-sm text-slate-100 cursor-pointer ${isRtl ? "text-right" : "text-left"}`}
                >
                  <option value="">{t.selectOption}</option>
                  {createdProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type === "3d-game" ? t.gameLabel : p.type === "website" ? t.webLabel : t.appLabel})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-200 mb-2">{t.labelPlatform}</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform("tiktok")}
                  className={`py-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    platform === "tiktok"
                      ? "bg-rose-500/10 border-rose-500 text-rose-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-extrabold text-sm font-mono">TikTok</span>
                  <span className="text-[10px]">{t.tiktokLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("instagram")}
                  className={`py-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    platform === "instagram"
                      ? "bg-purple-500/10 border-purple-500 text-purple-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-extrabold text-sm font-mono">Instagram</span>
                  <span className="text-[10px]">{t.instaLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform("facebook")}
                  className={`py-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    platform === "facebook"
                      ? "bg-blue-600/10 border-blue-500 text-blue-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-extrabold text-sm font-mono">Facebook</span>
                  <span className="text-[10px]">{t.fbLabel}</span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-2xl text-xs">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-2xl text-xs flex items-center gap-1.5">
                <CheckCircle size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating || createdProducts.length === 0}
              className={`w-full py-4 rounded-2xl font-black text-md flex items-center justify-center gap-2 transition-all ${
                isGenerating || createdProducts.length === 0
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/15"
              }`}
            >
              <Megaphone size={18} />
              <span>{t.btnSubmit}</span>
            </button>
          </form>

          {/* Ad Archive of current session */}
          {generatedAds.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
              <h3 className="text-sm font-extrabold text-slate-200">{t.archiveTitle} ({generatedAds.length})</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {generatedAds.map(ad => (
                  <button
                    key={ad.id}
                    onClick={() => {
                      setActiveAd(ad);
                      setSuccessMsg("");
                      setErrorMsg("");
                    }}
                    className={`w-full p-3 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${isRtl ? "text-right" : "text-left"} ${
                      activeAd?.id === ad.id
                        ? "bg-slate-800 border-emerald-500/50"
                        : "bg-slate-950 border-slate-800/80 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-white leading-normal">{ad.productName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono uppercase tracking-wide">{ad.platform} campaign</div>
                    </div>
                    <Eye size={14} className="text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Phone mockup display */}
        <div 
          className={`lg:col-span-7 flex flex-col items-center rounded-3xl ${getFocusClass("ad-preview")}`}
          onClick={getFocusClick("ad-preview")}
        >
          {renderFocusBadge("ad-preview")}
          <AnimatePresence mode="wait">
            {activeAd ? (
              <motion.div
                key="phone-area"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm bg-slate-950 border-[6px] border-slate-800 rounded-[40px] shadow-2xl overflow-hidden relative h-[620px] flex flex-col justify-between"
              >
                {/* Smartphone Speaker/Camera Cutout */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-slate-800 rounded-full z-20 flex items-center justify-around px-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                  <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
                </div>

                {/* Simulated Platform Specific Visual Body */}
                <div className="flex-1 relative overflow-hidden bg-slate-900 flex flex-col justify-end p-5">
                  {/* Dynamic background visualization depending on the platform prompt */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950 pointer-events-none z-10" />
                  
                  {/* Pseudo Abstract Visual Background based on the prompt */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 filter blur-sm">
                    <div className="w-64 h-64 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full animate-pulse" />
                  </div>

                  {/* Top Header of Ad Feed */}
                  <div className={`absolute top-8 left-4 right-4 flex justify-between items-center z-20 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="text-[10px] text-slate-300 font-bold bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
                      @{activeAd.platform}_ad_campaign
                    </div>
                    <span className="text-[10px] text-rose-500 font-extrabold animate-pulse tracking-wider">● {t.activeLabel}</span>
                  </div>

                  {/* Watermark Logo Badge - Mandated Requirement! */}
                  <div className={`absolute top-20 bg-gradient-to-r from-amber-500/95 to-yellow-500/95 text-slate-950 px-3 py-1.5 rounded-xl border border-yellow-400 font-black text-[9px] z-20 shadow-lg tracking-tight flex items-center gap-1 ${isRtl ? "right-4" : "left-4"}`}>
                    <Sparkles size={10} className="animate-spin" style={{ animationDuration: "3s" }} />
                    <span>{activeAd.watermarkText}</span>
                  </div>

                  {/* Dynamic Content Overlay */}
                  <div className={`relative z-20 space-y-3 ${isRtl ? "text-right" : "text-left"}`}>
                    <div className="bg-amber-400/10 border border-amber-400/20 text-amber-300 font-extrabold text-xs px-2.5 py-1 rounded-lg inline-block">
                      {activeAd.pricingHighlight}
                    </div>
                    <h1 className={`text-lg md:text-xl font-black text-white leading-tight ${isRtl ? "text-right" : "text-left"}`}>
                      {activeAd.headline}
                    </h1>
                    <p className={`text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-line ${isRtl ? "text-right" : "text-left"}`}>
                      {activeAd.adCopy}
                    </p>

                    {/* Integrated CTA Button to purchase in Store */}
                    <div className={`bg-slate-950/90 p-3 rounded-2xl border border-slate-800 flex justify-between items-center gap-2 shadow-xl ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                      <div className={isRtl ? "text-right" : "text-left"}>
                        <div className="text-[9px] text-slate-500 font-bold">{lang === "ar" ? "شراء مباشر" : (lang === "en" ? "Direct Purchase" : "فرۆشتنی ڕاستەوخۆ")}</div>
                        <div className="text-[11px] text-emerald-400 font-black">{lang === "ar" ? "اشترِ الآن من متجر SAS!" : (lang === "en" ? "Buy now on SAS Store!" : "ئێستا لە کۆگای SAS بکڕە!")}</div>
                      </div>
                      <button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1 active:scale-95 shadow-lg shadow-amber-500/10">
                        <ShoppingBag size={12} />
                        <span>{lang === "ar" ? "شراء المنتج" : (lang === "en" ? "Buy Product" : "کڕینی بەرهەم")}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom interactive buttons simulator */}
                <div className="bg-slate-950 p-4 border-t border-slate-900 flex justify-around items-center z-20 relative shrink-0">
                  <button
                    onClick={() => handleExportSimulate(platform === "facebook" ? "Facebook" : platform === "instagram" ? "Instagram" : "TikTok")}
                    className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-white transition"
                  >
                    <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300">
                      <Download size={14} />
                    </div>
                    <span>{t.btnDownload}</span>
                  </button>
                  <button
                    onClick={() => handlePublishStore(activeAd)}
                    disabled={activeAd.isPublishedToStore}
                    className={`flex flex-col items-center gap-1 text-[10px] transition ${
                      activeAd.isPublishedToStore ? "text-emerald-400" : "text-amber-500 hover:text-amber-400"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      activeAd.isPublishedToStore 
                        ? "bg-emerald-500/10 border-emerald-500" 
                        : "bg-slate-900 border-slate-800"
                    }`}>
                      <ShoppingBag size={14} />
                    </div>
                    <span>{activeAd.isPublishedToStore ? t.btnPublished : t.btnPublish}</span>
                  </button>
                  <button
                    onClick={() => handleExportSimulate(platform === "facebook" ? "Facebook" : platform === "instagram" ? "Instagram" : "TikTok")}
                    className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-white transition"
                  >
                    <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-300">
                      <Share2 size={14} />
                    </div>
                    <span>{t.btnShare}</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[40px] p-8 text-center flex flex-col items-center justify-center h-[580px] shadow-xl relative">
                <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center text-slate-600 mb-4 shadow-inner">
                  <Smartphone size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-white">{t.mockupTitle}</h3>
                <p className="text-slate-500 text-xs mt-1.5 max-w-xs leading-relaxed">
                  {t.mockupDesc}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Uncle Rashid Free AI Marketing Advisory Section */}
      <div id="uncle-free-marketing-advisory" className="bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border border-amber-500/20 hover:border-amber-500/40 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 text-amber-400">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-black text-amber-400">{ug.sectionTitle}</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{ug.sectionDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Clipdrop Tool Guide */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3 hover:border-amber-500/10 transition-colors">
            <h4 className="text-xs font-black text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {ug.clipdropTitle}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 select-none">•</span>
                <span>{ug.clipdropPoint1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 select-none">•</span>
                <span>{ug.clipdropPoint2}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5 select-none">•</span>
                <span>{ug.clipdropPoint3}</span>
              </li>
            </ul>
          </div>

          {/* Jasper Tool Guide */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3 hover:border-amber-500/10 transition-colors">
            <h4 className="text-xs font-black text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {ug.jasperTitle}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5 select-none">•</span>
                <span>{ug.jasperPoint1}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5 select-none">•</span>
                <span>{ug.jasperPoint2}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pro Tip Callout */}
        <div className="bg-amber-500/5 border border-amber-500/20 p-4.5 rounded-2xl space-y-1.5">
          <span className="text-xs font-black text-amber-400 block">{ug.proTipTitle}</span>
          <p className="text-slate-300 text-xs leading-relaxed font-medium">{ug.proTipDesc}</p>
        </div>
      </div>

      {/* Embedded Simulation Payment Gate Modal for Ad Builder */}
      {showPaymentFlow && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl w-full max-w-md shadow-2xl relative ${isRtl ? "text-right" : "text-left"}`}
            dir={isRtl ? "rtl" : "ltr"}
          >
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Megaphone className="text-emerald-400" size={20} />
              <span>{t.paymentTitle}</span>
            </h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              {lang === "ar" ? (
                <>تكلفة تصميم وإنتاج الحملة الإعلانية الكاملة للمنتج <span className="text-white font-bold">{selectedProduct?.name}</span> هي <span className="text-emerald-400 font-bold">٧,٥٠٠ د.ع فقط</span>. يرجى اختيار وسيلة الدفع المفضلة لديك تالياً:</>
              ) : lang === "en" ? (
                <>The production fee for compiling a full premium campaign for your product <span className="text-white font-bold">{selectedProduct?.name}</span> is only <span className="text-emerald-400 font-bold">7,500 IQD</span>. Please select your payment portal below:</>
              ) : (
                <>تێچووی داڕشتن و بەرهەمهێنانی کەمپینێکی تەواو بۆ بەرهەمی <span className="text-white font-bold">{selectedProduct?.name}</span> تەنها <span className="text-emerald-400 font-bold">٧,٥٠٠ دینارە</span>. تکایە دەروازەی فەرمی دڵخوازت دیاریبکە:</>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("FIB")}
                className={`p-4 rounded-2xl border font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === "FIB"
                    ? "bg-amber-500/10 border-amber-500 text-amber-500 animate-pulse"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">FIB</div>
                <span>FIB Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("FastPay")}
                className={`p-4 rounded-2xl border font-bold text-xs flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === "FastPay"
                    ? "bg-pink-500/10 border-pink-500 text-pink-500 animate-pulse"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500 text-white font-black flex items-center justify-center text-xs font-mono">Fast</div>
                <span>FastPay Wallet</span>
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleProcessPayment}
                disabled={isPaying}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isPaying ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{t.payingText}</span>
                  </>
                ) : (
                  <>
                    <span>{t.payBtnText} {lang === "en" ? "7,500 IQD" : "٧,٥٠٠ دینار"} ({paymentMethod})</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPaymentFlow(false)}
                disabled={isPaying}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 rounded-2xl text-xs font-bold transition"
              >
                {t.cancelText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
