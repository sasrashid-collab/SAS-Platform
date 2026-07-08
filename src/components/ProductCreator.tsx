import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Terminal, Code2, Globe, Gamepad2, Layers, Play, CheckCircle, AlertTriangle, Eye, Send, RotateCcw } from "lucide-react";
import { DigitalProduct, ActivePlan } from "../types";

interface ProductCreatorProps {
  activePlan: ActivePlan;
  createdProducts: DigitalProduct[];
  hasAgreedTerms: boolean;
  onProductCreated: (product: DigitalProduct) => void;
  onRequestSubscription: () => void;
  userEmail: string;
  lang?: "ku" | "ar" | "en";
  focusedSection?: string | null;
  setFocusedSection?: (sectionId: string | null) => void;
  isFocusModeEnabled?: boolean;
}

const COMFORTING_MESSAGES = {
  ku: [
    "شیکردنەوەی بیرۆکە و لێکدانەوەی پرۆمپتەکەت...",
    "داڕشتنی پێکهاتەی گشتی بە هاوکاری ژیری دەستکردی SAS...",
    "نووسینی لۆجیک و بەستنەوەی کارلێکەکان بە کارپێکەرەوە...",
    "جوانکاری و بەکارهێنانی نەوەی نوێی Tailwind CSS بۆ ڕوکارەکە...",
    "ئامادەکردنی مۆدێلی یاری یان داتا ستاڕێجی لۆکاڵ...",
    "ئەنجامدانی پڕۆسەی کۆمپایڵکردن و ڕێندەرکردنی کۆتایی..."
  ],
  ar: [
    "تحليل الفكرة وتفسير موجهك الخاص...",
    "تصميم الهيكل العام بالتعاون مع ذكاء SAS الاصطناعي...",
    "كتابة المنطق البرمجي وربط التفاعلات للمستخدم...",
    "تحسين المظهر الخارجي وتطبيق مكتبة Tailwind CSS الرائعة...",
    "إعداد نموذج اللعبة أو تخزين البيانات محلياً...",
    "إجراء عملية التجميع والتفسير البرمجي وعرض النتيجة النهائية..."
  ],
  en: [
    "Analyzing your idea and interpreting your prompt...",
    "Structuring the app with SAS artificial intelligence...",
    "Writing interactive logic and component state bindings...",
    "Beautifying layout using modern Tailwind CSS...",
    "Preparing local database models and simulation state...",
    "Performing final compilations and rendering output..."
  ]
};

const CREATOR_TRANSLATIONS = {
  ku: {
    headerTitle: "ژیری دەستکردی دروستکەر (AI No-Code Engine)",
    headerDesc: "تەنها بیرۆکەکەت بنووسە بە هەر زمانێک (کوردی، ئینگلیزی، عەرەبی...)؛ پلاتفۆرمی ساس لە چەند چرکەیەکدا نەخشەسازی، دیزاین، کارکردن و کۆدی یارییەکە، ماڵپەڕەکە یان ئەپەکەت بە تەواوی بۆ جێبەجێ دەکات بەبێ ئەوەی یەک دێڕ کۆد بنووسیت!",
    activePlanLabel: "پاکێجە چالاکەکەت",
    prodBudgetLabel: "بوودجەی بەرهەمهێنان",
    labelType: "١. جۆری بەرهەمی مەبەست دیاریبکە:",
    labelPrompt: "٢. بیرۆکەی پڕۆژەکەت بە وردی بنووسە:",
    placeholderApp: "نموونە: ئەپێکی بژاردنی خەرجی ڕۆژانە کە دەتوانیت بڕی پارە و جۆری کڕینەکە بنووسیت...",
    placeholderWeb: "نموونە: ماڵپەڕێکی مۆدێرنی فرۆشتنی گوڵ و دیاری لە کەرکوک کە پێکدێت لە سێ بەشی سەرەکی...",
    placeholderGame: "نموونە: یارییەکی لێدانی بەربەست لە بۆشایی ئاسماندا کە پێویستە لە خشتە گەردوونییەکان لابدەیت...",
    btnGenerate: "دروستکردنی بەرهەم بە ژیری دەستکرد",
    btnGenerating: "دەرهێنانی داهێنان...",
    typeApp: "ئەپی مۆبایل",
    typeWeb: "ماڵپەڕی وێب",
    typeGame: "یاری ٣ ڕەهەندی",
    emptyPromptError: "تکایە سەرەتا کورتە بیرۆکەی پڕۆژەکەت لێرە بنووسە.",
    trialLimitNotice: "* لە ماوەی تاقیکاریدا بوودجەکەت ٣,٠٠٠ د.ع یە کە ڕێگە بە دروستکردنی (١ ئەپ) دەدات. بۆ دروستکردنی ماڵپەڕ یان یاری پێویستە بوودجەی پاکێجە گەورەکان بەکاربهێنیت.",
    trialAppsLimitReason: "تۆ پێشتر یەکەم ئەپی تاقیکاری خۆت بە بڕی ٣,٠٠٠ دینار دروستکردووە. تکایە پاکێجێک بەپێی بودجەی مەبەست چالاک بکە.",
    trialAppOnlyReason: "لە کاتی هەفتەی تاقیکاری خۆڕاییدا تەنها دەتوانیت (ئەپ) دروست بکەیت بە بەهای ٣,٠٠٠ دینار.",
    budgetLimitReason: "ببورە، بوودجەی بەرهەمهێنانی پاکێجەکەت بەش ناکات!",
    activeProjectsTitle: "پرۆژە دروستکراوەکانی تۆ",
    creationError: "هەڵەیەک لە ژیری دەستکرد ڕوویدا لە دروستکردنی کۆدی پڕۆژەکە. تکایە کەمێکی تر هەوڵ بدەرەوە."
  },
  ar: {
    headerTitle: "محرك التطوير بدون كود (AI No-Code Engine)",
    headerDesc: "اكتب فكرتك بأي لغة (الكردية، العربية، الإنجليزية...)؛ ستقوم منصة SAS خلال ثوانٍ بتخطيط وتصميم وكتابة كامل الكود لبرنامجك، موقعك أو لعبتك بالكامل بدون كتابة سطر برمجيات واحد!",
    activePlanLabel: "باقتك النشطة حالياً",
    prodBudgetLabel: "ميزانية الإنتاج الرقمي",
    labelType: "١. اختر نوع المنتج الرقمي المطلوب:",
    labelPrompt: "٢. اكتب فكرة مشروعك بالتفصيل وبوضوح:",
    placeholderApp: "مثال: تطبيق لحساب المصاريف اليومية وتسجيل المشتريات وعرض الإجماليات بشكل منظم مع تخزين البيانات محلياً...",
    placeholderWeb: "مثال: موقع حديث وجذاب لمعرض سيارات أو محل بيع زهور يحتوي على تفاصيل الاتصال والخدمات وفورم تواصل متكامل...",
    placeholderGame: "مثال: لعبة تجنب النيازك والعقبات المتساقطة في الفضاء من خلال تحريك المكوك يميناً ويساراً مع عداد للنقاط والموت...",
    btnGenerate: "إنشاء المنتج بالذكاء الاصطناعي",
    btnGenerating: "جاري ابتكار مشروعك...",
    typeApp: "تطبيق تفاعلي",
    typeWeb: "موقع ويب تجاري",
    typeGame: "لعبة ثلاثية الأبعاد",
    emptyPromptError: "يرجى كتابة فكرة مشروعك بالتفصيل أولاً.",
    trialLimitNotice: "* خلال الفترة التجريبية، ميزانيتك هي ٣,٠٠٠ د.ع والتي تسمح بإنشاء (تطبيق واحد). لإنشاء مواقع أو ألعاب يرجى تفعيل إحدى الباقات الكبرى.",
    trialAppsLimitReason: "لقد قمت بإنشاء تطبيقك التجريبي الأول بالفعل. يرجى الاشتراك وتفعيل باقة مخصصة للاستمرار في التطوير.",
    trialAppOnlyReason: "خلال الفترة التجريبية، يُسمح فقط بإنشاء (تطبيق تفاعلي) بقيمة ٣,٠٠٠ د.ع.",
    budgetLimitReason: "عذراً، ميزانية باقتك الحالية لا تكفي لإتمام هذا العمل!",
    activeProjectsTitle: "مشاريعك الرقمية النشطة",
    creationError: "حدث خطأ غير متوقع في خادم الذكاء الاصطناعي أثناء إنشاء الكود. يرجى المحاولة لاحقاً."
  },
  en: {
    headerTitle: "AI No-Code Compiler Engine",
    headerDesc: "Describe your custom software idea in plain language (Kurdish, Arabic, English...); SAS Platform will structure, design, code, and output a complete working digital product in seconds!",
    activePlanLabel: "Your Active Plan",
    prodBudgetLabel: "Production Budget",
    labelType: "1. Select your target digital product type:",
    labelPrompt: "2. Describe your project idea in detail:",
    placeholderApp: "Example: A daily financial budget tracker where you can add transactions, categories, and dynamically sum items locally...",
    placeholderWeb: "Example: A gorgeous commercial flower delivery website featuring customer contact forms, portfolios and menus...",
    placeholderGame: "Example: A retro space fighter dodging cosmic obstacles, moving left/right with point gains and highscore boards...",
    btnGenerate: "Generate Product with AI",
    btnGenerating: "Compiling your digital system...",
    typeApp: "Interactive App",
    typeWeb: "Business Website",
    typeGame: "3D Game",
    emptyPromptError: "Please describe your project idea first.",
    trialLimitNotice: "* During the free trial, your budget is 3,000 IQD which allows creating (1 App). To create websites or 3D games, please upgrade your plan.",
    trialAppsLimitReason: "You have already created your first trial app. Please subscribe to a plan to unlock more budget.",
    trialAppOnlyReason: "During the free trial, you can only build an (App) valued at 3,000 IQD.",
    budgetLimitReason: "Sorry, your current plan production budget is insufficient!",
    activeProjectsTitle: "Your Active Projects",
    creationError: "An error occurred with the AI model while generating the project code. Please try again."
  }
};

export default function ProductCreator({
  activePlan,
  createdProducts,
  hasAgreedTerms,
  onProductCreated,
  onRequestSubscription,
  userEmail,
  lang = "ku",
  focusedSection = null,
  setFocusedSection,
  isFocusModeEnabled = false
}: ProductCreatorProps) {
  const [prompt, setPrompt] = useState("");
  const [productType, setProductType] = useState<"app" | "website" | "3d-game">("app");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const t = CREATOR_TRANSLATIONS[lang];
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

  // Rotate comforting loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      let step = 0;
      const messages = COMFORTING_MESSAGES[lang];
      setLoaderMessage(messages[0]);
      interval = setInterval(() => {
        step = (step + 1) % messages.length;
        setLoaderMessage(messages[step]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating, lang]);

  // Set default view to latest product if exists
  useEffect(() => {
    if (createdProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(createdProducts[createdProducts.length - 1]);
    }
  }, [createdProducts, selectedProduct]);

  // Product cost and plan budget calculation helpers
  const getProductCost = (type: "app" | "website" | "3d-game"): number => {
    if (type === "app") return 3000;
    if (type === "website") return 15000;
    return 30000;
  };

  const getPlanBudget = (planId: string, isTrial: boolean): number => {
    if (isTrial) return 3000; // Free trial budget (Allows 1 App worth 3,000 IQD)
    if (planId === "plan_a") return 30000; // Plan A budget (30,000 IQD)
    if (planId === "plan_b") return 100000; // Plan B budget (100,000 IQD)
    return 3000;
  };

  const totalSpent = createdProducts
    .filter(p => p.creatorEmail === userEmail)
    .reduce((sum, p) => sum + getProductCost(p.type), 0);

  const currentBudget = getPlanBudget(activePlan.planId, activePlan.isTrial);
  const remainingBudget = Math.max(0, currentBudget - totalSpent);
  const costOfNewProduct = getProductCost(productType);

  const isOwner = userEmail.toLowerCase() === "sas.rashid@gmail.com";

  // Validation function for active plan limits based on payment amount / budget
  const checkLimitsAndAllow = (): { allowed: boolean; reason: string } => {
    if (isOwner) {
      return { allowed: true, reason: "" };
    }
    if (!hasAgreedTerms) {
      return { allowed: false, reason: lang === "ar" ? "يرجى الموافقة على شروط الاستخدام أولاً في الصفحة الرئيسية." : (lang === "en" ? "Please agree to the subscription terms first on the main page." : "تکایە سەرەتا لە بەشی سەرەکی ڕازیبە بە مەرجەکانی بەشداریکردن.") };
    }

    if (activePlan.isTrial) {
      const trialAppsCount = createdProducts.filter(p => p.type === "app" && p.creatorEmail === userEmail).length;
      if (productType !== "app") {
        return { 
          allowed: false, 
          reason: t.trialAppOnlyReason
        };
      }
      if (trialAppsCount >= 1) {
        return { 
          allowed: false, 
          reason: t.trialAppsLimitReason
        };
      }
      return { allowed: true, reason: "" };
    }

    if (totalSpent + costOfNewProduct > currentBudget) {
      return {
        allowed: false,
        reason: `${t.budgetLimitReason} • ` + (lang === "ar" ? `تكلفة المشروع: ${costOfNewProduct.toLocaleString("ar-IQ")} د.ع • ميزانيتك: ${remainingBudget.toLocaleString("ar-IQ")} د.ع` : (lang === "en" ? `Project cost: ${costOfNewProduct.toLocaleString("en-US")} IQD • Your budget: ${remainingBudget.toLocaleString("en-US")} IQD` : `تێچووی پڕۆژە: ${costOfNewProduct.toLocaleString("ku-IQ")} د.ع • بوودجەی تۆ: ${remainingBudget.toLocaleString("ku-IQ")} د.ع`))
      };
    }

    return { allowed: true, reason: "" };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!prompt.trim()) {
      setErrorMsg(t.emptyPromptError);
      return;
    }

    const check = checkLimitsAndAllow();
    if (!check.allowed) {
      setErrorMsg(check.reason);
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch("/api/gemini/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: productType, lang })
      });

      if (!res.ok) {
        throw new Error("تۆڕەکە وەڵامی نەدایەوە بە دروستی.");
      }

      const generatedData = await res.json();

      const newProduct: DigitalProduct = {
        id: "prod-" + Date.now(),
        name: generatedData.name || (lang === "en" ? `New Project (${productType})` : `پڕۆژەی نوێی ${productType}`),
        description: generatedData.description || (lang === "en" ? `Advanced ${productType} product` : `بەرهەمێکی پێشکەوتوو لە جۆری ${productType}`),
        type: productType,
        html: generatedData.html,
        features: generatedData.features || (lang === "en" ? ["Modern Design", "Fast Interaction"] : ["دیزاینی مۆدێرن", "کارلێکی خێرا"]),
        accentColor: generatedData.accentColor || "#10b981",
        prompt: prompt,
        creatorEmail: userEmail,
        createdAt: new Date().toLocaleDateString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ")),
        price: productType === "3d-game" ? 15000 : productType === "website" ? 25000 : 8000,
        isPublished: false,
        salesCount: 0
      };

      onProductCreated(newProduct);
      setSelectedProduct(newProduct);
      setPrompt("");
    } catch (err) {
      console.error(err);
      setErrorMsg(t.creationError);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-6 ${isRtl ? "text-right" : "text-left"} font-sans`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <Sparkles className="text-amber-500 animate-pulse" size={24} />
            <span>{t.headerTitle}</span>
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            {t.headerDesc}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shrink-0 text-center">
            <div className="text-[10px] text-slate-500 font-bold">{t.activePlanLabel}</div>
            <div className="text-amber-400 font-black text-sm">{activePlan.name}</div>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shrink-0 text-center">
            <div className="text-[10px] text-slate-500 font-bold">{t.prodBudgetLabel}</div>
            <div className="text-emerald-400 font-black text-sm font-mono">
              {isOwner 
                ? (lang === "en" ? "Unlimited 👑" : (lang === "ar" ? "غير محدود 👑" : "بێکۆتا 👑"))
                : `${remainingBudget.toLocaleString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ"))} / ${currentBudget.toLocaleString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ"))} ${lang === "en" ? "IQD" : "د.ع"}`
              }
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Creator Input Form Column */}
        <div 
          className={`lg:col-span-5 space-y-6 rounded-3xl ${getFocusClass("creator-form")}`}
          onClick={getFocusClick("creator-form")}
        >
          {renderFocusBadge("creator-form")}
          <form onSubmit={handleGenerate} className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-3xl space-y-5 shadow-xl relative">
            <div>
              <label className="block text-sm font-extrabold text-slate-200 mb-2">{t.labelType}</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setProductType("app")}
                  className={`py-3.5 px-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    productType === "app"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Layers size={18} />
                  <span>{t.typeApp}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProductType("website")}
                  className={`py-3.5 px-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    productType === "website"
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Globe size={18} />
                  <span>{t.typeWeb}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProductType("3d-game")}
                  className={`py-3.5 px-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    productType === "3d-game"
                      ? "bg-amber-500/10 border-amber-500 text-amber-500"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Gamepad2 size={18} />
                  <span>{t.typeGame}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-200 mb-2">{t.labelPrompt}</label>
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setErrorMsg("");
                }}
                rows={4}
                placeholder={
                  productType === "3d-game"
                    ? t.placeholderGame
                    : productType === "website"
                    ? t.placeholderWeb
                    : t.placeholderApp
                }
                className={`w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-600 leading-relaxed resize-none ${isRtl ? "text-right" : "text-left"}`}
              />
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-2xl text-xs flex items-start gap-2 leading-relaxed">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Generate Trigger Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-4 rounded-2xl font-black text-md flex items-center justify-center gap-2 transition-all ${
                isGenerating
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/15"
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>{t.btnGenerating}</span>
                </div>
              ) : (
                <>
                  <Code2 size={20} />
                  <span>{t.btnGenerate}</span>
                </>
              )}
            </button>

            {/* Trial Notice inside creator */}
            {activePlan.isTrial && (
              <div className="text-[11px] text-slate-500 text-center leading-relaxed">
                {t.trialLimitNotice}
              </div>
            )}
          </form>

          {/* History of creations */}
          {createdProducts.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
              <h3 className="text-sm font-extrabold text-slate-200">کۆمەڵەی بەرهەمە دروستکراوەکانی تۆ ({createdProducts.length})</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {createdProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`w-full p-3.5 rounded-xl border text-right transition-all flex justify-between items-center cursor-pointer ${
                      selectedProduct?.id === p.id
                        ? "bg-slate-800 border-amber-500/50"
                        : "bg-slate-950 border-slate-800/80 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white" style={{ backgroundColor: p.accentColor + "20", color: p.accentColor }}>
                        {p.type === "3d-game" ? <Gamepad2 size={16} /> : p.type === "website" ? <Globe size={16} /> : <Layers size={16} />}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-white leading-normal">{p.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide font-mono">{p.type}</div>
                      </div>
                    </div>
                    <Eye size={14} className="text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Preview / Sandbox Sandbox Column */}
        <div 
          className={`lg:col-span-7 h-full flex flex-col rounded-3xl ${getFocusClass("creator-preview")}`}
          onClick={getFocusClick("creator-preview")}
        >
          {renderFocusBadge("creator-preview")}
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center justify-center h-[520px] shadow-2xl relative"
              >
                {/* Simulated compiling grid pattern */}
                <div className="absolute inset-0 bg-slate-950 opacity-20 pointer-events-none rounded-3xl bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
                
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                    <Sparkles size={28} className="animate-pulse" />
                  </div>
                </div>
                
                <h3 className="text-xl font-extrabold text-white relative z-10">ژیری دەستکرد سەرقاڵی کۆدکردنە...</h3>
                <p className="text-slate-400 text-xs md:text-sm mt-3 max-w-sm relative z-10 h-10">
                  {loaderMessage}
                </p>

                <div className="mt-8 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left font-mono text-[10px] text-emerald-400 w-full max-w-sm h-28 overflow-hidden relative shadow-inner">
                  <div className="animate-typing whitespace-nowrap overflow-hidden border-r-2 border-emerald-400">
                    &gt; sas-compile --platform-native --optimize
                  </div>
                  <div className="text-slate-500 mt-1">&gt; loading packages: @tailwindcss, lucide-icons</div>
                  <div className="text-slate-400">&gt; compiling layout DOM, generating responsive structure</div>
                  <div className="text-slate-300 animate-pulse">&gt; mapping touch inputs for game overlay controls...</div>
                </div>
              </motion.div>
            ) : selectedProduct ? (
              <motion.div
                key="preview-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px]"
              >
                {/* Sandbox Header */}
                <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    </span>
                    <div className="h-4 w-[1px] bg-slate-800"></div>
                    <div className="text-slate-300 text-xs md:text-sm font-extrabold tracking-tight max-w-[200px] truncate">{selectedProduct.name}</div>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">{selectedProduct.type} sandbox</span>
                  </div>
                </div>

                {/* Split Sandbox Display */}
                <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
                  {/* Details Sidebar in Split */}
                  <div className="w-full md:w-56 bg-slate-900 border-b md:border-b-0 md:border-l border-slate-800 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">زانیاری بەرهەم</h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">{selectedProduct.description}</p>
                      </div>

                      <div>
                        <h4 className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">خزمەتگوزارییە نەخشێنراوەکان</h4>
                        <ul className="space-y-1">
                          {selectedProduct.features.map((f, idx) => (
                            <li key={idx} className="text-xs text-slate-400 flex items-center gap-1.5">
                              <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {selectedProduct.creatorEmail === userEmail && activePlan.isTrial && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-[10px] text-amber-400 leading-relaxed">
                          ⚠️ ئەمە ئەپی بێبەرامبەرە. ئەگەر بەشدار نەبیت، بۆ ماڵپەڕ دەمێنێتەوە بۆ فرۆشتن. بەڵام دوای بەشداریکردن ئەژمار ناکرێت و بۆت دەگەڕێتەوە بە تەواوی!
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60">
                      <div className="text-[10px] text-slate-500 font-bold mb-1">خاوەندارێتی</div>
                      <div className="text-[11px] text-slate-300 font-mono truncate">{selectedProduct.creatorEmail}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">بەرواری دروستکردن: {selectedProduct.createdAt}</div>
                    </div>
                  </div>

                  {/* HTML IFrame Player Sandbox */}
                  <div className="flex-1 bg-slate-950 relative h-full">
                    <iframe
                      title={selectedProduct.name}
                      srcDoc={selectedProduct.html}
                      sandbox="allow-scripts"
                      className="w-full h-full border-none bg-slate-950"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center h-[520px] shadow-xl">
                <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mb-4 shadow-inner">
                  <Terminal size={28} />
                </div>
                <h3 className="text-lg font-extrabold text-white">تەختەی پێشاندانی پڕۆژە</h3>
                <p className="text-slate-500 text-xs mt-1.5 max-w-sm leading-relaxed">
                  هێشتا هیچ پڕۆژەیەکت دروست نەکردووە، یان پڕۆژەیەک دیاری نەکراوە. پرۆمپتەکە لە لای ڕاست بنووسە و دوگمەی دروستکردن دابگرە تا یەکەم بەرهەمت لێرە کارا ببێت.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
