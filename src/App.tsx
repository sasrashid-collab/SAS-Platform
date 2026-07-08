import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Layers, Globe, Gamepad2, Megaphone, ShoppingBag, CreditCard, 
  User, Bot, ChevronLeft, LogOut, CheckCircle2, ShieldAlert, Zap, PhoneCall,
  Menu, X, Landmark, RefreshCw, Github, Clipboard, ClipboardCheck,
  Lock, Unlock, Key, Shield, Eye, EyeOff, Plus, TrendingUp, DollarSign,
  Printer, Download, Share2
} from "lucide-react";

import { SubscriptionPlan, ActivePlan, DigitalProduct, GeneratedAd, Invoice } from "./types";
import { SUBSCRIPTION_PLANS } from "./data/plans";
import { TRANSLATIONS } from "./data/translations";
import TermsModal from "./components/TermsModal";
import AICompanion from "./components/AICompanion";
import ProductCreator from "./components/ProductCreator";
import AdBuilder from "./components/AdBuilder";
import Marketplace from "./components/Marketplace";
import Billing from "./components/Billing";
import AdminWhatsApp from "./components/AdminWhatsApp";
import FinancialReports from "./components/FinancialReports";
import AIStudioHub from "./components/AIStudioHub";

// Obfuscation helper functions for LocalStorage data protection ("وە کۆدەکانیش بشارەوە تا کەمتر بتوانن هاکیکەن")
const safeStringify = (obj: any, indent: number = 2): string => {
  const cache = new Set();
  try {
    return JSON.stringify(
      obj,
      (key, value) => {
        if (value instanceof HTMLElement || (value && typeof value === "object" && "nodeType" in value)) {
          return `[HTMLElement: ${(value as HTMLElement).tagName || "element"}]`;
        }
        if (value && typeof value === "object" && (value as any).$$typeof) {
          return "[ReactElement]";
        }
        if (typeof value === "object" && value !== null) {
          if (cache.has(value)) {
            return "[Circular]";
          }
          cache.add(value);
        }
        return value;
      },
      indent
    );
  } catch (err) {
    return `[Serialization Error: ${err instanceof Error ? err.message : String(err)}]`;
  }
};

const encodeSecureData = (data: any): string => {
  try {
    const jsonStr = safeStringify(data);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  } catch (e) {
    console.error("Error securing data:", e);
    return "";
  }
};

const decodeSecureData = (encoded: string | null): any => {
  if (!encoded) return null;
  try {
    // Check if it's base64 obfuscated
    const decodedStr = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(decodedStr);
  } catch (e) {
    // Fallback if the data is saved in plain JSON format
    try {
      return JSON.parse(encoded);
    } catch {
      return null;
    }
  }
};

export default function App() {
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem("sas_user_email") || "sas.rashid@gmail.com";
  });
  const isOwner = userEmail.toLowerCase() === "sas.rashid@gmail.com";

  // --- Core Persistent States ---
  const [hasAgreedTerms, setHasAgreedTerms] = useState<boolean>(() => {
    return localStorage.getItem("sas_agreed") === "true";
  });

  const [activePlan, setActivePlan] = useState<ActivePlan>(() => {
    const saved = localStorage.getItem("sas_active_plan");
    if (saved) {
      const decoded = decodeSecureData(saved);
      if (decoded) return decoded;
    }
    return {
      planId: "free_trial",
      name: "هەفتەی تاقیکاری خۆڕایی",
      remainingGames: 0,
      remainingWebsites: 0,
      remainingApps: 1, // 1 App allowed during free trial
      tokenCount: 1000000, // Bolt.com 1 Million tokens gift!
      isTrial: true,
      trialStart: new Date().toLocaleDateString("ku-IQ"),
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ku-IQ"),
      expirationDate: null
    };
  });

  const [lang, setLang] = useState<"ku" | "ar" | "en">(() => {
    return (localStorage.getItem("sas_lang") as "ku" | "ar" | "en") || "ku";
  });

  const t = TRANSLATIONS[lang];
  const isRtl = lang !== "en";
  const dirAttr = isRtl ? "rtl" : "ltr";
  const textAlignClass = isRtl ? "text-right" : "text-left";

  const [createdProducts, setCreatedProducts] = useState<DigitalProduct[]>(() => {
    const saved = localStorage.getItem("sas_products");
    if (saved) {
      const decoded = decodeSecureData(saved);
      if (decoded) return decoded;
    }
    return [];
  });

  const [generatedAds, setGeneratedAds] = useState<GeneratedAd[]>(() => {
    const saved = localStorage.getItem("sas_ads");
    if (saved) {
      const decoded = decodeSecureData(saved);
      if (decoded) return decoded;
    }
    return [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem("sas_invoices");
    let initialInvoices: Invoice[] = [];
    if (saved) {
      const decoded = decodeSecureData(saved);
      if (decoded && Array.isArray(decoded)) {
        initialInvoices = decoded;
      }
    }
    // Ensure SAS-INV-001 is always pre-seeded so the user can test the QR scanner and visual/sound complete features
    if (!initialInvoices.some(inv => inv.id === "SAS-INV-001")) {
      initialInvoices.unshift({
        id: "SAS-INV-001",
        planId: "plan_a",
        planName: "بەشداریکردنی پاکێجی ئاسایی (Plan A)",
        amount: 30000,
        paymentMethod: "FIB",
        status: "pending",
        invoiceDate: new Date().toLocaleDateString("ku-IQ"),
        transactionId: "TXN-777123",
        userEmail: "sas.rashid@gmail.com",
        whatsappSent: true,
        receiptScreenshot: "/screenshots/receipt_simulate_fib.png"
      });
    }
    return initialInvoices;
  });

  // --- Secure Protection States ---
  const [masterPin, setMasterPin] = useState<string>(() => {
    return localStorage.getItem("sas_secure_master_pin") || "";
  });
  
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem("sas_secure_api_key") || "";
  });

  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem("sas_secure_github_token") || "";
  });
  const [githubRepo, setGithubRepo] = useState<string>(() => {
    return localStorage.getItem("sas_secure_github_repo") || "sasrashid-collab/SAS-Platform";
  });
  const [githubAutoSync, setGithubAutoSync] = useState<boolean>(() => {
    return localStorage.getItem("sas_secure_github_autosync") === "true";
  });

  const [editMasterPin, setEditMasterPin] = useState<string>(() => {
    return localStorage.getItem("sas_secure_master_pin") || "";
  });
  const [editGeminiKey, setEditGeminiKey] = useState<string>(() => {
    return localStorage.getItem("sas_secure_api_key") || "";
  });
  const [editGithubToken, setEditGithubToken] = useState<string>(() => {
    return localStorage.getItem("sas_secure_github_token") || "";
  });
  const [editGithubRepo, setEditGithubRepo] = useState<string>(() => {
    return localStorage.getItem("sas_secure_github_repo") || "sasrashid-collab/SAS-Platform";
  });
  const [editGithubAutoSync, setEditGithubAutoSync] = useState<boolean>(() => {
    return localStorage.getItem("sas_secure_github_autosync") === "true";
  });

  const [showSettingsPin, setShowSettingsPin] = useState<boolean>(false);
  const [showSettingsKey, setShowSettingsKey] = useState<boolean>(false);
  const [showSettingsGithubToken, setShowSettingsGithubToken] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSyncingAllFiles, setIsSyncingAllFiles] = useState<boolean>(false);
  const [highlightTokenInput, setHighlightTokenInput] = useState<boolean>(false);
  const [lastPushedUrl, setLastPushedUrl] = useState<string>(() => {
    return localStorage.getItem("sas_last_pushed_url") || "";
  });

  const handleGithubTokenChangeImmediate = (val: string) => {
    const cleanVal = val.trim();
    if (cleanVal === "") {
      localStorage.removeItem("sas_secure_github_token");
    } else {
      localStorage.setItem("sas_secure_github_token", cleanVal);
    }
    setGithubToken(cleanVal);
    setEditGithubToken(cleanVal);
  };

  const handleGithubRepoChangeImmediate = (val: string) => {
    const cleanVal = val.trim();
    if (cleanVal === "") {
      localStorage.removeItem("sas_secure_github_repo");
    } else {
      localStorage.setItem("sas_secure_github_repo", cleanVal);
    }
    setGithubRepo(cleanVal);
    setEditGithubRepo(cleanVal);
  };

  const handleSaveSecuritySettings = () => {
    if (editMasterPin.trim().length > 0 && editMasterPin.trim().length < 4) {
      triggerNotification("تکایە شفرەی تێپەڕبوون (PIN) بەلایەنی کەمەوە لە ٤ پیت یان ژمارە پێکبێت.");
      return;
    }
    
    if (editMasterPin.trim() === "") {
      localStorage.removeItem("sas_secure_master_pin");
      setMasterPin("");
    } else {
      localStorage.setItem("sas_secure_master_pin", editMasterPin.trim());
      setMasterPin(editMasterPin.trim());
    }

    if (editGeminiKey.trim() === "") {
      localStorage.removeItem("sas_secure_api_key");
      setGeminiApiKey("");
    } else {
      localStorage.setItem("sas_secure_api_key", editGeminiKey.trim());
      setGeminiApiKey(editGeminiKey.trim());
    }

    if (editGithubToken.trim() === "") {
      localStorage.removeItem("sas_secure_github_token");
      setGithubToken("");
    } else {
      localStorage.setItem("sas_secure_github_token", editGithubToken.trim());
      setGithubToken(editGithubToken.trim());
    }

    if (editGithubRepo.trim() === "") {
      localStorage.removeItem("sas_secure_github_repo");
      setGithubRepo("");
    } else {
      localStorage.setItem("sas_secure_github_repo", editGithubRepo.trim());
      setGithubRepo(editGithubRepo.trim());
    }

    localStorage.setItem("sas_secure_github_autosync", editGithubAutoSync ? "true" : "false");
    setGithubAutoSync(editGithubAutoSync);

    triggerNotification("ڕێکخستنەکانی ئەمنی و کلیلەکان بە سەرکەوتوویی پاشەکەوت کران!");
  };

  const syncToGitHub = async (latestProducts?: DigitalProduct[], latestAds?: GeneratedAd[], latestActivePlan?: ActivePlan) => {
    if (!githubToken || !githubRepo) {
      triggerNotification("تکایە سەرەتا کلیلی گیتھەب و ناوی کۆگاکەت لە بەشی ڕێکخستنی ئەمنی دابنێ.");
      return;
    }

    setIsSyncing(true);
    const isAuto = latestProducts !== undefined || latestAds !== undefined || latestActivePlan !== undefined;
    triggerNotification(isAuto ? "هاوکاتکردنی خۆکارانە لەگەڵ گیتھەبدا دەستی پێکرد..." : "دەستکرا بە هاوکاتکردن و ناردنی داتاکان بۆ کۆگای گیتھەب...");

    try {
      const dataToSync = {
        exportedAt: new Date().toISOString(),
        user: userEmail,
        createdProducts: latestProducts || createdProducts,
        generatedAds: latestAds || generatedAds,
        activePlan: latestActivePlan || activePlan
      };

      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: githubToken,
          repo: githubRepo,
          filePath: "sas-data.json",
          content: safeStringify(dataToSync, 2),
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        triggerNotification(isAuto ? "بە سەرکەوتوویی داتاکان بە خۆکاری هاوکات کران لەگەڵ گیتھەبدا!" : "بە سەرکەوتوویی داتاکان هاوکات (Sync) کران لەگەڵ گیتھەبدا!");
      } else {
        triggerNotification(resData.error || "کێشەیەک لە کاتی هاوکاتکردندا ڕوویدا.");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("کێشەیەک لە پەیوەندیکردندا ڕوویدا. تکایە هێڵی ئینتەرنێتەکەت بپشکنە.");
    } finally {
      setIsSyncing(false);
    }
  };

  const triggerAutoSyncIfEnabled = (latestProducts?: DigitalProduct[], latestAds?: GeneratedAd[], latestActivePlan?: ActivePlan) => {
    const hasGitHubConfig = localStorage.getItem("sas_secure_github_token") && localStorage.getItem("sas_secure_github_repo");
    if (localStorage.getItem("sas_secure_github_autosync") === "true" && hasGitHubConfig) {
      syncToGitHub(latestProducts, latestAds, latestActivePlan);
    }
  };

  const syncAllFilesToGitHub = async () => {
    if (!githubToken) {
      setHighlightTokenInput(true);
      triggerNotification("هاوڕێی گەورەم، پێش ناردنی پڕۆژەکە پێویستە کلیلی گیتھەب (GitHub Token) بنووسیت. کلیلەکەت لێرە دابنێ! 🔑");
      setTimeout(() => setHighlightTokenInput(false), 5000);
      return;
    }

    setIsSyncingAllFiles(true);
    triggerNotification(`دەستکرا بە ئامادەکردن و دروستکردنی مانیفێستی داتاکان و ناردنی هەموو فایلەکانی پڕۆژەکە بۆ کۆگای ${githubRepo || "SAS-Platform"}...`);

    // Iterate through all local storage keys containing project data and create a standardized JSON manifest
    const manifestData: any = {
      manifestName: "SAS-Platform Project Backup Manifest",
      generatedAt: new Date().toISOString(),
      userEmail: userEmail || "unknown",
      projectKeys: {}
    };

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sas_")) {
          // Do not backup sensitive security tokens
          if (key === "sas_secure_github_token" || key === "sas_secure_master_pin") {
            continue;
          }
          const rawValue = localStorage.getItem(key);
          const decoded = decodeSecureData(rawValue);
          manifestData.projectKeys[key] = {
            raw: rawValue,
            decoded: decoded || rawValue
          };
        }
      }
    } catch (err) {
      console.error("Error generating manifest:", err);
    }

    try {
      const res = await fetch("/api/github/push-all-workspace-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: githubToken,
          repo: githubRepo,
          manifestData: manifestData,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        triggerNotification(`بۆلت؟ نا، ئێمە زۆر باشترین! مانیفێستی داتاکانی لۆکاڵ بە سەرکەوتوویی دروستکرا و تەواوی پڕۆژەکە ڕەوانەی کۆگای ${githubRepo || "SAS-Platform"} کرا! 🚀`);
        if (resData.repoUrl) {
          localStorage.setItem("sas_last_pushed_url", resData.repoUrl);
          setLastPushedUrl(resData.repoUrl);
        }
        if (!githubRepo) {
          const urlParts = resData.repoUrl.split("/");
          const calculatedRepo = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
          localStorage.setItem("sas_secure_github_repo", calculatedRepo);
          setGithubRepo(calculatedRepo);
          setEditGithubRepo(calculatedRepo);
        }
      } else {
        triggerNotification(resData.error || "کێشەیەک لە کاتی ناردنی فایلەکاندا ڕوویدا.");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("کێشەیەک لە پەیوەندیکردندا ڕوویدا لە کاتی ناردنی فایلەکان.");
    } finally {
      setIsSyncingAllFiles(false);
    }
  };

  const [sharedInvoiceId, setSharedInvoiceId] = useState<string | null>(() => {
    return new URLSearchParams(window.location.search).get("shareInvoice");
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const savedPin = localStorage.getItem("sas_secure_master_pin");
    return !savedPin; // Unlocked if no PIN configured yet, else locked
  });

  const [pinInput, setPinInput] = useState<string>("");
  const [showPinInput, setShowPinInput] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string>("");

  const handleUnlockAttempt = () => {
    const savedPin = localStorage.getItem("sas_secure_master_pin");
    const savedKey = localStorage.getItem("sas_secure_api_key");
    
    if (pinInput === savedPin || (savedKey && pinInput === savedKey)) {
      setIsUnlocked(true);
      setUnlockError("");
      setPinInput("");
      triggerNotification("بە سەرکەوتوویی چوویتە ژوورەوە! داشبۆردەکەت کارا کرا.");
    } else {
      setUnlockError("شفرەی تێپەڕبوون (PIN) یان کلیلەکە هەڵەیە. تکایە دووبارە تاقیکەرەوە.");
      setPinInput("");
    }
  };

  const handleLockDashboard = () => {
    setIsUnlocked(false);
    setPinInput("");
    triggerNotification("داشبۆردەکە بە سەرکەوتوویی قفڵ کرا بۆ پاراستنی زانیارییەکانت.");
  };

  // --- UI Layout States ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "creator" | "ads" | "store" | "billing" | "reports" | "ai-hub">("dashboard");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [newEmailInput, setNewEmailInput] = useState<string>(userEmail);
  const [focusedSection, setFocusedSection] = useState<string | null>(null);
  const [isFocusModeEnabled, setIsFocusModeEnabled] = useState<boolean>(true);
  const [isAdminMobileOpen, setIsAdminMobileOpen] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string>("");
  const [showUpgradeConfetti, setShowUpgradeConfetti] = useState<boolean>(false);
  const [justUpgradedPlanName, setJustUpgradedPlanName] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isPlatformUrlCopied, setIsPlatformUrlCopied] = useState<boolean>(false);

  // Reset focus when tab changes
  useEffect(() => {
    setFocusedSection(null);
  }, [activeTab]);

  // Sync Active Plan dynamically based on Owner status
  useEffect(() => {
    if (isOwner) {
      const ownerPlan: ActivePlan = {
        planId: "owner_unlimited",
        name: lang === "en" ? "Owner Lifetime Account (Free Unlimited)" : (lang === "ar" ? "حساب المالك الدائم (مجاني وغير محدود)" : "هەژماری هەمیشەیی خاوەن (بێبەرامبەر و بێکۆتا) 👑"),
        remainingGames: 999999,
        remainingWebsites: 999999,
        remainingApps: 999999,
        tokenCount: 999999999,
        isTrial: false,
        trialStart: "",
        trialEnd: "",
        expirationDate: lang === "en" ? "Permanent Lifetime" : (lang === "ar" ? "دائم مدى الحياة" : "هەمیشەیی بۆ هەمیشە")
      };
      setActivePlan(ownerPlan);
    } else {
      const saved = localStorage.getItem("sas_active_plan");
      if (saved) {
        try {
          const decoded = decodeSecureData(saved);
          if (decoded && decoded.planId !== "owner_unlimited") {
            setActivePlan(decoded);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setActivePlan({
        planId: "free_trial",
        name: lang === "en" ? "Free 7-Day Trial" : (lang === "ar" ? "فترة تجريبية مجانية 7 أيام" : "هەفتەی تاقیکاری خۆڕایی"),
        remainingGames: 0,
        remainingWebsites: 0,
        remainingApps: 1,
        tokenCount: 1000000,
        isTrial: true,
        trialStart: new Date().toLocaleDateString("ku-IQ"),
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("ku-IQ"),
        expirationDate: null
      });
    }
  }, [userEmail, lang]);

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
      if (isFocusModeEnabled && focusedSection !== sectionId) {
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
            setFocusedSection(null);
          }}
          className="hover:text-white p-0.5 font-bold cursor-pointer transition-all ml-1"
          title="Clear focus"
        >
          ✕
        </button>
      </div>
    );
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("sas_agreed", hasAgreedTerms ? "true" : "false");
  }, [hasAgreedTerms]);

  useEffect(() => {
    localStorage.setItem("sas_active_plan", encodeSecureData(activePlan));
  }, [activePlan]);

  useEffect(() => {
    localStorage.setItem("sas_products", encodeSecureData(createdProducts));
  }, [createdProducts]);

  useEffect(() => {
    localStorage.setItem("sas_ads", encodeSecureData(generatedAds));
  }, [generatedAds]);

  useEffect(() => {
    localStorage.setItem("sas_invoices", encodeSecureData(invoices));
  }, [invoices]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sas_invoices") {
        const decoded = decodeSecureData(e.newValue);
        if (decoded && Array.isArray(decoded)) {
          setInvoices(decoded);
        }
      }
      if (e.key === "sas_active_plan") {
        const decoded = decodeSecureData(e.newValue);
        if (decoded) {
          setActivePlan(decoded);
        }
      }
      if (e.key === "sas_products") {
        const decoded = decodeSecureData(e.newValue);
        if (decoded && Array.isArray(decoded)) {
          setCreatedProducts(decoded);
        }
      }
      if (e.key === "sas_ads") {
        const decoded = decodeSecureData(e.newValue);
        if (decoded && Array.isArray(decoded)) {
          setGeneratedAds(decoded);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Alert handler
  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(""), 4500);
  };

  const handleAgreeTerms = () => {
    setHasAgreedTerms(true);
    triggerNotification("تۆ بە سەرکەوتوویی بە مەرجەکان ڕازی بوویت! بەخێربێیت.");
  };

  const exportToGitHub = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      user: userEmail,
      createdProducts,
      generatedAds
    };
    const jsonString = safeStringify(dataToExport, 2);
    
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        setIsCopied(true);
        triggerNotification("داتاکان بە سەرکەوتوویی لە شێوەی JSON کۆپی کران بۆ تەختەی نووسین (Clipboard)!");
        setTimeout(() => setIsCopied(false), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy!", err);
        triggerNotification("کێشەیەک ڕوویدا لە کاتی کۆپیکردنی داتاکاندا.");
      });
  };

  // --- Event Handlers ---
  const handleProductCreated = (product: DigitalProduct) => {
    const nextProducts = [...createdProducts, product];
    setCreatedProducts(nextProducts);
    
    // Decrease remaining quota based on product type
    const nextPlan = { ...activePlan };
    // Decrease 25,000 tokens per AI generation
    nextPlan.tokenCount = Math.max(0, activePlan.tokenCount - 25000);

    if (activePlan.isTrial) {
      if (product.type === "app") {
        nextPlan.remainingApps = Math.max(0, activePlan.remainingApps - 1);
      }
    } else {
      if (product.type === "3d-game") {
        nextPlan.remainingGames = Math.max(0, activePlan.remainingGames - 1);
      } else if (product.type === "website") {
        nextPlan.remainingWebsites = Math.max(0, activePlan.remainingWebsites - 1);
      } else if (product.type === "app") {
        nextPlan.remainingApps = Math.max(0, activePlan.remainingApps - 1);
      }
    }
    setActivePlan(nextPlan);

    triggerNotification(`پڕۆژەی "${product.name}" بە هاوکاری ژیری دەستکرد بە سەرکەوتوویی دروستکرا!`);
    triggerAutoSyncIfEnabled(nextProducts, generatedAds, nextPlan);
  };

  const handleAdCreated = (ad: GeneratedAd) => {
    const nextAds = [...generatedAds, ad];
    setGeneratedAds(nextAds);
    
    // Deduct 15,000 tokens for ad copy generation
    const nextPlan = {
      ...activePlan,
      tokenCount: Math.max(0, activePlan.tokenCount - 15000)
    };
    setActivePlan(nextPlan);

    triggerNotification(`ڕیکلامی نوێ دروستکرا بۆ بەهەمی "${ad.productName}".`);
    triggerAutoSyncIfEnabled(createdProducts, nextAds, nextPlan);
  };

  const handlePublishAdToStore = (adId: string) => {
    const nextAds = generatedAds.map(a => a.id === adId ? { ...a, isPublishedToStore: true } : a);
    setGeneratedAds(nextAds);
    
    // Also publish the associated product in the catalog
    const targetAd = generatedAds.find(a => a.id === adId);
    let nextProducts = createdProducts;
    if (targetAd) {
      nextProducts = createdProducts.map(p => p.id === targetAd.productId ? { ...p, isPublished: true } : p);
      setCreatedProducts(nextProducts);
    }
    triggerNotification("ڕیکلامەکە بە سەرکەوتوویی بڵاوکرایەوە لە فرۆشگادا!");
    triggerAutoSyncIfEnabled(nextProducts, nextAds, activePlan);
  };

  const handleSendInvoiceToWhatsApp = (invoice: Invoice) => {
    setInvoices(prev => {
      const filtered = prev.filter(inv => inv.id !== invoice.id);
      return [...filtered, invoice];
    });
    triggerNotification(`فاتورەی ${invoice.id} ڕەوانەی مۆبایلی واتسئاپی بەڕێوەبەر کرا.`);
    setIsAdminMobileOpen(true); // Auto-open simulator to guide the user!
  };

  const handleApproveInvoice = async (invoiceId: string) => {
    const targetInv = invoices.find(inv => inv.id === invoiceId);
    if (!targetInv) return;

    // 1. Update invoice status
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { 
      ...inv, 
      status: "approved",
      verifiedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    } : inv));

    // 2. Handle ad creation invoice
    if (targetInv.planId.startsWith("ad_creation_")) {
      const parts = targetInv.planId.split("_");
      const productId = parts[2];
      const platform = parts[3];

      const prod = createdProducts.find(p => p.id === productId);
      if (prod) {
        try {
          const res = await fetch("/api/gemini/generate-ad", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productName: prod.name,
              productDesc: prod.description,
              targetPlatform: platform,
              lang: lang
            })
          });

          if (!res.ok) throw new Error();
          const data = await res.json();

          const newAd: GeneratedAd = {
            id: "ad-" + Date.now(),
            productId: prod.id,
            productName: prod.name,
            platform: platform as any,
            headline: data.headline,
            adCopy: data.kurdishAdCopy,
            visualPrompt: data.suggestedVisualPrompt,
            pricingHighlight: data.pricingHighlight || "نرخێکی زۆر نایاب",
            watermarkText: data.badgeText || "Created on SAS-Platform",
            isPublishedToStore: false,
            createdAt: new Date().toLocaleDateString("ku-IQ")
          };

          setGeneratedAds(prev => {
            const nextAds = [...prev, newAd];
            triggerAutoSyncIfEnabled(createdProducts, nextAds, activePlan);
            return nextAds;
          });
          triggerNotification(`ڕیکلامی نوێ بە سەرکەوتوویی بۆ بەرهەمی "${prod.name}" دروستکرا و بڵاوکرایەوە.`);
        } catch (err) {
          const fallbackAd: GeneratedAd = {
            id: "ad-" + Date.now(),
            productId: prod.id,
            productName: prod.name,
            platform: platform as any,
            headline: `🚀 کەمپینی ڕیکلامی فەرمی بۆ ${prod.name}!`,
            adCopy: `بەرهەمی داهێنەرانەی ${prod.name} بە کوالیتییەکی بەرز و بێوێنە ئامادەکراوە بە هاوکاری پلاتفۆرمی SAS.\n\n✨ ئێستا بەردەستە لە کۆگای فرۆشتنی SAS بۆ کڕینی ڕاستەوخۆ بە باشترین نرخ!\n\n#SAS_Platform #KurdishNoCode`,
            visualPrompt: "Neon high tech glowing corporate branding design.",
            pricingHighlight: "٧,٥٠٠ دینار بۆ هەر ڕیکلامێک",
            watermarkText: "Created on SAS-Platform",
            isPublishedToStore: false,
            createdAt: new Date().toLocaleDateString("ku-IQ")
          };
          setGeneratedAds(prev => {
            const nextAds = [...prev, fallbackAd];
            triggerAutoSyncIfEnabled(createdProducts, nextAds, activePlan);
            return nextAds;
          });
          triggerNotification(`کاراکردنی کەمپین: ڕیکلام بۆ بەرهەمی "${prod.name}" بە سەرکەوتوویی دروستکرا.`);
        }
      }
    } else {
      // 3. Set Active Plan parameters based on subscription type
      const isPlanA = targetInv.planId === "plan_a";
      
      // Ownership Return Logic (Requirement 8):
      const nextPlan = {
        planId: targetInv.planId,
        name: isPlanA ? "پاکێجی ئاسایی (Plan A)" : "پاکێجی پێشکەوتوو (Plan B)",
        remainingGames: isPlanA ? 1 : 2,
        remainingWebsites: isPlanA ? 1 : 2,
        remainingApps: 10, // Gives full 10 apps. Trial app does not subtract from this!
        tokenCount: 1000000, // Replenish monthly tokens gift
        isTrial: false,
        trialStart: activePlan.trialStart,
        trialEnd: activePlan.trialEnd,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("ku-IQ")
      };
      setActivePlan(nextPlan);

      setJustUpgradedPlanName(isPlanA ? "پاکێجی ئاسایی (Plan A)" : "پاکێجی پێشکەوتوو (Plan B)");
      setShowUpgradeConfetti(true);
      triggerNotification("خزمەتگوزاریەکەت بە سەرکەوتوویی لە لایەن بەڕێوەبەرەوە کارا کرا! پیرۆزە.");
      triggerAutoSyncIfEnabled(createdProducts, generatedAds, nextPlan);
    }
  };

  const handleRejectInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: "rejected" } : inv));
    triggerNotification("فاتورەکە ڕەتکرایەوە لە لایەن بەڕێوەبەرەوە.");
  };

  const handleBuyProductSimulate = (productId: string) => {
    setCreatedProducts(prev => prev.map(p => p.id === productId ? { ...p, salesCount: p.salesCount + 1 } : p));
  };

  const handleRefreshTokens = () => {
    const nextPlan = {
      ...activePlan,
      tokenCount: 1000000
    };
    setActivePlan(nextPlan);
    triggerNotification("تۆکنە دیارییە مانگانەکەت نوێکرایەوە بۆ ١,٠٠٠,٠٠٠ تۆکن!");
    triggerAutoSyncIfEnabled(createdProducts, generatedAds, nextPlan);
  };

  const handleAddOneMillionTokens = () => {
    const nextPlan = {
      ...activePlan,
      tokenCount: (activePlan.tokenCount || 0) + 1000000
    };
    setActivePlan(nextPlan);
    triggerNotification("١,٠٠٠,٠٠٠ تۆکنی نوێ بە سەرکەوتوویی بۆ هەژمارەکەت زیادکرا! ئێستا دەتوانیت بۆ بەشداربوان بەکاری بهێنیت.");
    triggerAutoSyncIfEnabled(createdProducts, generatedAds, nextPlan);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative pb-12 overflow-x-hidden">
      {/* Background radial elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Shared Public Invoice Viewer - bypasses security lock */}
      {sharedInvoiceId ? (
        <div className="flex-1 flex items-center justify-center p-4 relative z-50 min-h-[calc(100vh-100px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl text-right space-y-6 relative overflow-hidden"
            dir="rtl"
          >
            {/* Cybersecurity grid lines overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

            {(() => {
              const sharedInvoice = invoices.find(inv => inv.id === sharedInvoiceId);
              if (!sharedInvoice) {
                return (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                      <ShieldAlert size={32} />
                    </div>
                    <h2 className="text-lg font-black text-white">پسوولەی داواکراو نەدۆزرایەوە</h2>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      ببورە، ئەم پسوولەیە بوونی نییە یان لەوانەیە سڕابێتەوە. تکایە دڵنیابەرەوە لە دروستی بەستەرەکە (Link).
                    </p>
                    <button
                      onClick={() => {
                        setSharedInvoiceId(null);
                        window.history.pushState({}, "", window.location.origin + window.location.pathname);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      بگەڕێوە بۆ لاپەڕەی سەرەکی
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {/* Top Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <h2 className="text-xl font-black text-white">پشکنینی فەرمی پسوولەی SAS</h2>
                      </div>
                      <p className="text-[10px] text-slate-400">سیستەمی فەرمی دڵنیایی و باری پارەدان و کاراکردنی پاکێجەکان</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSharedInvoiceId(null);
                          window.history.pushState({}, "", window.location.origin + window.location.pathname);
                        }}
                        className="text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 px-4 py-2 rounded-xl transition cursor-pointer font-bold"
                      >
                        بچۆ سەر داشبۆرد ↗
                      </button>
                    </div>
                  </div>

                  {/* Main Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Invoice Info Card */}
                    <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
                      <h3 className="text-xs font-black text-amber-400 pb-2 border-b border-slate-900">زانیارییە سەرەکییەکانی پسوولە</h3>
                      
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold">ژمارەی پسوولە:</span>
                          <span className="font-mono font-black text-slate-200">{sharedInvoice.id}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold">خاوەن هەژمار:</span>
                          <span className="text-slate-300 font-semibold">{sharedInvoice.userEmail}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold">پاکێجی بەشداریکردن:</span>
                          <span className="text-amber-400 font-extrabold">{sharedInvoice.planName}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold">بڕی پارەی دراو:</span>
                          <span className="text-emerald-400 font-black font-mono">{sharedInvoice.amount.toLocaleString("ku-IQ")} دینار</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold">ڕێگای پارەدان:</span>
                          <span className="text-slate-300 font-bold">{sharedInvoice.paymentMethod}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold">ناسنامەی گواستنەوە:</span>
                          <span className="font-mono text-[11px] text-slate-400 truncate max-w-[150px]" title={sharedInvoice.transactionId}>
                            {sharedInvoice.transactionId}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-bold">ڕێکەوتی تۆمارکردن:</span>
                          <span className="font-mono text-slate-400 text-[11px]">{sharedInvoice.invoiceDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code and Status Box */}
                    <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 p-5 flex flex-col items-center justify-between gap-4">
                      <div className="text-center w-full">
                        <span className="text-[10px] text-slate-500 block font-bold mb-2">کۆدی فەرمی QR بۆ پشکنین</span>
                        <div className="bg-white p-2 rounded-xl inline-block shadow-lg">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "?shareInvoice=" + sharedInvoice.id)}`}
                            alt={`Verification QR for ${sharedInvoice.id}`}
                            className="w-[110px] h-[110px] rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>

                      {/* Verification Status Badge */}
                      <div className="w-full text-center">
                        <div className={`px-4 py-2.5 rounded-xl border text-center transition-all ${
                          sharedInvoice.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : sharedInvoice.status === "rejected"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          <div className="flex items-center justify-center gap-1.5 font-black text-xs">
                            <span className={`w-2 h-2 rounded-full ${
                              sharedInvoice.status === "approved" ? "bg-emerald-400" :
                              sharedInvoice.status === "rejected" ? "bg-rose-400" : "bg-amber-400"
                            } animate-pulse`} />
                            <span>
                              {sharedInvoice.status === "approved" ? "پەسەندکراو و کارایە" :
                               sharedInvoice.status === "rejected" ? "فاتورەکە ڕەتکراوەتەوە" : "لەژێر پێداچوونەوەدایە"}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 block">
                            {sharedInvoice.status === "approved" 
                              ? `پشتڕاستکراوەتەوە: ${sharedInvoice.verifiedAt || sharedInvoice.invoiceDate}`
                              : sharedInvoice.status === "rejected"
                              ? "داواکارییەکە مەرجەکانی پارەدانی تێدا نییە"
                              : "چاوەڕێی پەسەندکردنی کارگێڕ بکە"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Step Timeline */}
                  <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl space-y-3">
                    <h4 className="text-[11px] font-black text-slate-300">قۆناغەکانی کاراکردن:</h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="space-y-1">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30 font-bold">✓</div>
                        <p className="font-bold text-slate-300">١. ناردنی داواکاری</p>
                        <p className="text-[8px] text-slate-500 leading-tight">تۆمارکردنی کۆدی پارەدان</p>
                      </div>

                      <div className="space-y-1">
                        <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center font-bold ${
                          sharedInvoice.status === "approved" || sharedInvoice.status === "rejected"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
                        }`}>
                          {sharedInvoice.status === "approved" || sharedInvoice.status === "rejected" ? "✓" : "٢"}
                        </div>
                        <p className="font-bold text-slate-300">٢. پشکنینی کارگێڕ</p>
                        <p className="text-[8px] text-slate-500 leading-tight">سەیرکردنی وردەکارییەکان</p>
                      </div>

                      <div className="space-y-1">
                        <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center font-bold ${
                          sharedInvoice.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : sharedInvoice.status === "rejected"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-slate-800 text-slate-500 border border-slate-700/50"
                        }`}>
                          {sharedInvoice.status === "approved" ? "✓" : "٣"}
                        </div>
                        <p className="font-bold text-slate-300">٣. ئەنجامی کۆتایی</p>
                        <p className="text-[8px] text-slate-500 leading-tight">پەسەندکردن و کاراکردن</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Download / Print) */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 gap-3">
                    <p className="text-[9px] text-slate-500 text-right leading-relaxed max-w-sm">
                      ئەم پەڕەیە پارێزراوە و گواستنەوەی زانیارییەکان بە سیستەمی فەرمی SAS بەڕێوەدەچێت. دەتوانیت ئەم لاپەڕەیە چاپ بکەیت وەک بەڵگە.
                    </p>

                    <button
                      onClick={() => window.print()}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/10 shrink-0"
                    >
                      <Printer size={13} />
                      <span>چاپکردنی پسوولە</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>
      ) : !isUnlocked ? (
        <div className="flex-1 flex items-center justify-center p-4 relative z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl rounded-[32px] p-6 md:p-8 shadow-2xl text-right space-y-6 relative overflow-hidden"
            dir="rtl"
          >
            {/* Cybersecurity grid lines overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="flex flex-col items-center justify-center text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 mb-4 relative">
                <Lock size={28} className="animate-pulse" />
                <div className="absolute -inset-1 rounded-2xl border border-amber-400/30 animate-ping opacity-25 pointer-events-none" />
              </div>
              <h2 className="text-xl font-black text-white tracking-wide">دەروازەی ئەمنی SAS</h2>
              <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                ئەم داشبۆردە بە تەواوی کۆدکراوە و تەنها بۆ بەکارهێنانی تایبەتی خۆتە. تکایە شفرەی تێپەڕبوون (PIN) بنووسە بۆ چالاککردنی پانێڵەکە.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 tracking-wider block">شفرەی تێپەڕبوون یان کلیل (Master PIN / Key)</label>
                <div className="relative">
                  <input
                    type={showPinInput ? "text" : "password"}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUnlockAttempt();
                    }}
                    placeholder="••••"
                    className="w-full bg-slate-950/90 border border-slate-800/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-2xl py-3.5 px-4 pl-12 text-center text-lg font-mono font-bold tracking-widest text-amber-400 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinInput(!showPinInput)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPinInput ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {unlockError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2"
                >
                  <ShieldAlert size={14} className="shrink-0 text-rose-500" />
                  <span>{unlockError}</span>
                </motion.div>
              )}

              <button
                onClick={handleUnlockAttempt}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs py-3.5 rounded-2xl transition active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Unlock size={14} />
                <span>پەسەندکردن و چوونەژوورەوە</span>
              </button>
            </div>

            {/* Simulated numeric keypad for easy entry */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 font-mono relative z-10">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => setPinInput(prev => prev + num.toString())}
                  className="bg-slate-950/40 hover:bg-slate-950/80 active:bg-slate-950 text-slate-300 py-2.5 rounded-xl font-bold transition text-sm cursor-pointer border border-slate-800/30"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setPinInput("")}
                className="bg-slate-950/40 hover:bg-slate-950/80 text-rose-400 py-2.5 rounded-xl font-bold transition text-xs cursor-pointer border border-slate-800/30"
              >
                سڕینەوە
              </button>
              <button
                onClick={() => setPinInput(prev => prev + "0")}
                className="bg-slate-950/40 hover:bg-slate-950/80 text-slate-300 py-2.5 rounded-xl font-bold transition text-sm cursor-pointer border border-slate-800/30"
              >
                0
              </button>
              <button
                onClick={() => {
                  if (pinInput.length > 0) {
                    setPinInput(prev => prev.slice(0, -1));
                  }
                }}
                className="bg-slate-950/40 hover:bg-slate-950/80 text-slate-400 py-2.5 rounded-xl font-bold transition text-xs cursor-pointer border border-slate-800/30"
              >
                ⌫
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-2 text-center relative z-10">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("sas_secure_master_pin");
                  setMasterPin("");
                  setEditMasterPin("");
                  setIsUnlocked(true);
                  setUnlockError("");
                  triggerNotification("شفرەی تێپەڕبوون بە سەرکەوتوویی لادرا و دەروازەکە کرایەوە!");
                }}
                className="text-[10px] text-amber-500/80 hover:text-amber-400 font-black underline cursor-pointer transition-all"
              >
                دۆخی تاقیکاری: سڕینەوەی شفرەی تێپەڕبوون و چوونەژوورەوەی ڕاستەوخۆ (Reset PIN)
              </button>

              <div className="text-center text-[10px] text-slate-500 font-bold">
                پارێزراوە بە سیستەمی کۆدکردنی ئەندازیاری SAS
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* Floating AI Companion bottom-left */}
          <AICompanion lang={lang} />

          {/* Terms Modals blocking gate */}
          {!hasAgreedTerms && (
            <TermsModal onAgree={handleAgreeTerms} />
          )}

          {/* Account/Email Switcher Modal */}
          {isEmailModalOpen && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[32px] max-w-md w-full relative overflow-hidden shadow-2xl"
                dir={dirAttr}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <User className="text-amber-500" size={20} />
                    <h3 className="text-lg font-black text-white">
                      {lang === "en" ? "Change Account Email" : (lang === "ar" ? "تغيير البريد الإلكتروني للحساب" : "گۆڕینی ئیمەیڵی ئەژمار")}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEmailModalOpen(false)}
                    className="text-slate-500 hover:text-slate-300 font-bold transition p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed text-right">
                    {lang === "en" 
                      ? "Enter any email to create a custom user session, or switch to the owner's email to unlock full owner/admin privileges with unlimited free budget." 
                      : (lang === "ar" 
                        ? "أدخل أي بريد إلكتروني لإنشاء جلسة مستخدم مخصصة، أو قم بالتبديل إلى بريد المالك لتفعيل صلاحيات المالك الكاملة مع ميزانية مجانية غير محدودة." 
                        : "ئیمەیڵێکی نوێ بنووسە بۆ تاقیکردنەوەی پلاتفۆرمەکە وەک بەشداربوو، یان ئیمەیڵی خاوەن بنووسە بۆ بەدەستهێنانی دەسەڵاتی تەواوی بەڕێوەبەر و کاراکردنی هەموو بەرهەمەکان بە بێبەرامبەر و بێکۆتا.")}
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-300 block text-right">
                      {lang === "en" ? "Account Email Address" : "ناونیشانی ئیمەیڵی چالاک"}
                    </label>
                    <input
                      type="email"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="e.g. user@example.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 px-4 text-sm text-slate-200 transition outline-none text-left"
                    />
                  </div>

                  {/* Fast Selector Presets */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-500 font-extrabold block mb-2 uppercase tracking-wider text-right">
                      {lang === "en" ? "Quick Presets" : "دیاریکردنی خێرا (Presets)"}
                    </span>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setNewEmailInput("sas.rashid@gmail.com")}
                        className={`w-full p-3 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                          newEmailInput.toLowerCase() === "sas.rashid@gmail.com"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                            : "bg-slate-950 border-slate-800/80 hover:bg-slate-850 text-slate-300"
                        }`}
                        dir="rtl"
                      >
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-amber-500" />
                          <span>sas.rashid@gmail.com</span>
                        </div>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black uppercase">
                          {lang === "en" ? "Owner (Free)" : "خاوەن پلاتفۆرم"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewEmailInput("customer@example.com")}
                        className={`w-full p-3 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${
                          newEmailInput.toLowerCase() === "customer@example.com"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400 font-bold"
                            : "bg-slate-950 border-slate-800/80 hover:bg-slate-850 text-slate-300"
                        }`}
                        dir="rtl"
                      >
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-blue-400" />
                          <span>customer@example.com</span>
                        </div>
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-black uppercase">
                          {lang === "en" ? "Standard Client" : "کڕیاری ئاسایی"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 border-t border-slate-800 pt-4">
                  <button
                    onClick={() => {
                      if (!newEmailInput.trim() || !newEmailInput.includes("@")) {
                        triggerNotification(lang === "en" ? "Please enter a valid email address!" : "تکایە ناونیشانی ئیمەیڵێکی دروست بنووسە!");
                        return;
                      }
                      const emailToSave = newEmailInput.trim().toLowerCase();
                      setUserEmail(emailToSave);
                      localStorage.setItem("sas_user_email", emailToSave);
                      setIsEmailModalOpen(false);
                      triggerNotification(
                        emailToSave === "sas.rashid@gmail.com"
                          ? (lang === "en" ? "Switched to Owner Mode! All constraints bypassed." : "بە سەرکەوتوویی چوویە دۆخی خاوەن! هەموو تایبەتمەندییەکان کرانەوە بە خۆڕایی.")
                          : (lang === "en" ? `Switched to ${emailToSave} session.` : `بە سەرکەوتوویی ئیمەیڵ گۆڕدرا بۆ ${emailToSave}.`)
                      );
                    }}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 py-3 rounded-xl font-black text-xs md:text-sm shadow-lg hover:shadow-amber-500/20 transition cursor-pointer text-center"
                  >
                    {lang === "en" ? "Save & Apply" : "پاشەکەوتکردن و کاراکردن"}
                  </button>
                  <button
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-5 bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-800 py-3 rounded-xl font-bold text-xs md:text-sm transition cursor-pointer text-center"
                  >
                    {lang === "en" ? "Cancel" : "پاشگەزبوونەوە"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-emerald-500/40 text-slate-100 px-6 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-3 max-w-md text-right text-xs md:text-sm font-bold"
            dir="rtl"
          >
            <div className="w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">✓</div>
            <span>{showNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confetti Upgrade Congratulations Overlay */}
      <AnimatePresence>
        {showUpgradeConfetti && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/30 p-8 rounded-[32px] text-center max-w-md w-full relative overflow-hidden shadow-2xl text-right"
              dir="rtl"
            >
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full filter blur-xl" />
              
              <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-lg shadow-amber-500/20 mb-4 animate-bounce">
                🎉
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white text-center">پاکێجەکەت بە سەرکەوتوویی کارا کرا!</h3>
              <p className="text-slate-400 text-xs md:text-sm mt-3 leading-relaxed text-center">
                بەڕێوەبەری SAS فاتورەکەی پەسەند کرد! ئێستا تۆ لەسەر پاکێجی <span className="text-amber-400 font-extrabold">{justUpgradedPlanName}</span> چالاکیت. هەموو تایبەتمەندییە نەخشێنراوەکانت بۆ کەرەتان کرایەوە!
              </p>

              {/* Ownership return benefit highlight (Requirement 8) */}
              {createdProducts.some(p => p.creatorEmail === userEmail) && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mt-4 text-xs text-right text-emerald-400 leading-normal">
                  💡 **مژدە**: ئەپی تاقیکاری پێشووت بە تەواوی گەڕایەوە بۆ تەملیلی کۆنتڕۆڵی خۆت، و بێبەرامبەرە و ناچێتە نێو ئەژماری لیمیتەکانی پاکێجەکەتەوە!
                </div>
              )}

              <button
                onClick={() => {
                  setShowUpgradeConfetti(false);
                  setActiveTab("creator"); // Redirect to creator immediately!
                }}
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 py-3.5 rounded-2xl font-black text-xs md:text-sm transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer text-center"
              >
                بڕۆ بۆ دروستکردنی پڕۆژەی نوێ
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Header Navigation Bar --- */}
      <header className="bg-slate-950 border-b border-slate-900/80 sticky top-0 z-30 px-4 md:px-8 py-3.5 flex justify-between items-center" dir={dirAttr}>
        <div className={`flex items-center gap-6 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
          {/* Logo brand */}
          <div className={`flex items-center gap-3 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center font-black text-slate-950 text-lg shadow shadow-amber-500/10">
              SAS
            </div>
            <div className={textAlignClass}>
              <h1 className="text-sm font-black text-white tracking-wide leading-none">SAS-Platform</h1>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 block">{t.noCodePlatform}</span>
            </div>
          </div>

          {/* Desktop tabs menu */}
          <nav className={`hidden lg:flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800/80 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "dashboard" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => setActiveTab("creator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "creator" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.noCodeCreator}
            </button>
            <button
              onClick={() => setActiveTab("ads")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "ads" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.adBuilder}
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "store" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.marketplace}
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "billing" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.billing}
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "reports" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.reports}
            </button>
            <button
              onClick={() => setActiveTab("ai-hub")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "ai-hub" ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-amber-400/90 hover:text-amber-300"
              }`}
            >
              <Sparkles size={13} className={activeTab === "ai-hub" ? "animate-spin" : ""} />
              <span>{lang === "en" ? "AI Studio" : (lang === "ar" ? "أستوديو الذكاء" : "ستۆدیۆی زیرەکی")}</span>
            </button>
          </nav>
        </div>

        {/* Production Budget Header Badge */}
        <div className={`flex items-center gap-4 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
          <div className={`flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
            <Zap className="text-emerald-400 animate-pulse fill-emerald-400" size={14} />
            <div className={textAlignClass}>
              <span className="text-[10px] text-slate-500 block leading-none font-bold">{t.projectBudget}</span>
              <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block">
                {(() => {
                  if (isOwner) {
                    return lang === "en" ? "Unlimited (Owner) 👑" : (lang === "ar" ? "غير محدود (المالك) 👑" : "بێکۆتا (خاوەنی پلاتفۆرم) 👑");
                  }
                  const getProductCost = (type: "app" | "website" | "3d-game"): number => {
                    if (type === "app") return 3000;
                    if (type === "website") return 15000;
                    return 30000;
                  };
                  const totalSpent = createdProducts
                    .filter(p => p.creatorEmail === userEmail)
                    .reduce((sum, p) => sum + getProductCost(p.type), 0);
                  const currentBudget = activePlan.isTrial ? 3000 : (activePlan.planId === "plan_a" ? 30000 : 100000);
                  const formattedValue = (currentBudget - totalSpent).toLocaleString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ"));
                  const currencySymbol = lang === "en" ? "IQD" : "د.ع";
                  return `${formattedValue} ${currencySymbol}`;
                })()}
              </span>
            </div>
          </div>

          {/* Focus Mode Interactive Controller */}
          <button
            onClick={() => {
              const newVal = !isFocusModeEnabled;
              setIsFocusModeEnabled(newVal);
              if (!newVal) {
                setFocusedSection(null);
              }
              triggerNotification(
                newVal
                  ? (lang === "en" ? "Focus Mode enabled! Click any card to dim distractions." : (lang === "ar" ? "تم تفعيل وضع التركيز! انقر على أي قسم لتقليل التشتيت." : "باری فوکس چالاک کرا! کلیک لە هەر بەشێک بکە بۆ نەهێشتنی ژاوەژاو."))
                  : (lang === "en" ? "Focus Mode disabled. Showing all panels." : (lang === "ar" ? "تم إيقاف وضع التركيز. عرض جميع الأقسام بنشاط كامل." : "باری فوکس ناچالاک کرا. هەموو بەشەکان ئاسایی پیشان دەدرێنەوە."))
              );
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all duration-300 select-none ${
              isFocusModeEnabled 
                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/5" 
                : "bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isFocusModeEnabled ? "bg-amber-400 animate-ping" : "bg-slate-600"}`} />
            <span>
              {lang === "en" ? "Focus" : (lang === "ar" ? "التركيز" : "فوکس 🎯")}
            </span>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => {
                const selectedLang = e.target.value as "ku" | "ar" | "en";
                setLang(selectedLang);
                localStorage.setItem("sas_lang", selectedLang);
              }}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition outline-none cursor-pointer appearance-none pl-8 pr-3"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundPosition: "left 0.5rem center",
                backgroundSize: "0.9em",
                backgroundRepeat: "no-repeat"
              }}
            >
              <option value="ku">کوردی</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Secure Lock Quick Trigger button if PIN is configured */}
          {masterPin && (
            <button
              onClick={handleLockDashboard}
              title={t.lockPanel}
              className="w-10 h-10 bg-slate-900 border border-rose-500/10 hover:border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-300 transition cursor-pointer active:scale-95"
            >
              <Lock size={15} />
            </button>
          )}

          {/* Interactive Profile Switcher */}
          <button
            onClick={() => {
              setNewEmailInput(userEmail);
              setIsEmailModalOpen(true);
            }}
            title={lang === "en" ? "Switch Account Email" : "گۆڕینی ناونیشانی ئیمەیڵ"}
            className={`hidden md:flex items-center gap-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800/60 p-1.5 pl-3.5 rounded-2xl transition cursor-pointer active:scale-95 text-right ${isRtl ? "flex-row" : "flex-row-reverse"}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isOwner ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-850 border border-slate-700/60 text-slate-300"}`}>
              {isOwner ? <Shield size={16} /> : <User size={16} />}
            </div>
            <div className={textAlignClass}>
              <span className="text-xs font-bold text-white block leading-none flex items-center gap-1">
                {userEmail.split("@")[0]}
                {isOwner && <span className="text-[9px] bg-amber-500 text-slate-950 px-1 py-0.5 rounded font-black uppercase">Owner</span>}
              </span>
              <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{userEmail}</span>
            </div>
          </button>

          {/* Simulate Admin Mobile Whatsapp Open Trigger Button (ONLY for Owner) */}
          {isOwner && (
            <button
              onClick={() => setIsAdminMobileOpen(!isAdminMobileOpen)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
            >
              <PhoneCall size={12} className="animate-pulse" />
              <span className="hidden sm:inline">{t.adminWhatsApp}</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Sticky Tab bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-900 p-2 flex justify-around items-center z-30 backdrop-blur`} dir={dirAttr}>
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === "dashboard" ? "text-amber-400" : "text-slate-500"}`}
        >
          <Landmark size={16} />
          <span>{t.dashboard}</span>
        </button>
        <button 
          onClick={() => setActiveTab("creator")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === "creator" ? "text-amber-400" : "text-slate-500"}`}
        >
          <Sparkles size={16} />
          <span>{t.noCodeCreator}</span>
        </button>
        <button 
          onClick={() => setActiveTab("ads")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === "ads" ? "text-amber-400" : "text-slate-500"}`}
        >
          <Megaphone size={16} />
          <span>{t.adBuilder}</span>
        </button>
        <button 
          onClick={() => setActiveTab("store")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === "store" ? "text-amber-400" : "text-slate-500"}`}
        >
          <ShoppingBag size={16} />
          <span>{t.marketplace}</span>
        </button>
        <button 
          onClick={() => setActiveTab("billing")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === "billing" ? "text-amber-400" : "text-slate-500"}`}
        >
          <CreditCard size={16} />
          <span>{t.billing}</span>
        </button>
        <button 
          onClick={() => setActiveTab("reports")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === "reports" ? "text-amber-400" : "text-slate-500"}`}
        >
          <TrendingUp size={16} />
          <span>{t.reports}</span>
        </button>
        <button 
          onClick={() => setActiveTab("ai-hub")}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === "ai-hub" ? "text-amber-400" : "text-amber-500/80"}`}
        >
          <Sparkles size={16} />
          <span>{lang === "en" ? "AI Studio" : (lang === "ar" ? "الذكاء" : "ژیری")}</span>
        </button>
      </div>

      {/* --- Main Application Frame Grid --- */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-1 w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Primary View Area */}
          <div className={`lg:transition-all ${isAdminMobileOpen ? "lg:col-span-8" : "lg:col-span-12"}`}>
            {activeTab === "dashboard" && (
              <div className={`space-y-6 ${textAlignClass} animate-fade-in`} dir={dirAttr}>
                {/* Visual Banner */}
                <div className={`bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRtl ? "" : "md:flex-row-reverse"}`}>
                  <div className="space-y-2 relative z-10">
                    <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/20 uppercase">
                      {t.welcomeToSas}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white">{t.sasSlogan}</h2>
                    <p className="text-slate-400 text-xs md:text-sm max-w-xl leading-relaxed">
                      {t.sasDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("creator")}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-6 py-3.5 rounded-2xl font-black text-xs md:text-sm shadow-lg shadow-amber-500/15 cursor-pointer active:scale-95 transition whitespace-nowrap"
                  >
                    {t.createProjectNow}
                  </button>
                </div>

                {/* 🚀 DEDICATED GITHUB ONE-CLICK PUBLISHER CARD 🚀 */}
                <div 
                  className={`bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/20 p-6 md:p-8 rounded-[32px] space-y-6 relative overflow-hidden shadow-2xl ${getFocusClass("github")}`}
                  onClick={getFocusClick("github")}
                >
                  {renderFocusBadge("github")}
                  {/* Decorative glowing background item */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className={`space-y-1.5 ${textAlignClass} w-full`}>
                      <div className={`flex items-center gap-2 ${isRtl ? "justify-start" : "justify-start flex-row-reverse"}`}>
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                          <Github size={18} />
                        </div>
                        <h3 className="text-lg font-black text-white">{t.githubPublisher}</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {t.githubPublisherDesc}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* GitHub Personal Access Token Input */}
                    <div className={`space-y-2 ${textAlignClass}`}>
                      <label className={`text-xs font-black text-slate-300 flex items-center gap-1 ${isRtl ? "justify-end" : "justify-start"}`}>
                        <span>{t.githubToken}</span>
                        <Key size={12} className="text-indigo-400" />
                      </label>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {t.githubTokenDesc} <a href="https://github.com/settings/tokens/new?scopes=repo&description=SAS-Platform-Token" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-bold">{t.clickToCreateToken}</a>
                      </p>
                      <div className="relative">
                        <input
                          type={showSettingsGithubToken ? "text" : "password"}
                          value={githubToken}
                          onChange={(e) => handleGithubTokenChangeImmediate(e.target.value)}
                          placeholder="ghp_..."
                          className={`w-full bg-slate-950 border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 pl-12 text-xs text-slate-300 font-mono text-left transition outline-none ${
                            highlightTokenInput 
                              ? "border-amber-500 ring-2 ring-amber-500/50 animate-bounce" 
                              : "border-slate-800"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSettingsGithubToken(!showSettingsGithubToken)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                        >
                          {showSettingsGithubToken ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* GitHub Repository Name Input */}
                    <div className={`space-y-2 ${textAlignClass}`}>
                      <label className={`text-xs font-black text-slate-300 flex items-center gap-1 ${isRtl ? "justify-end" : "justify-start"}`}>
                        <span>{lang === "ar" ? "اسم المستودع على غيت هاب (GitHub Repository)" : (lang === "en" ? "GitHub Repository Name" : "ناوی کۆگا لە گیتھەب (GitHub Repository)")}</span>
                        <Layers size={12} className="text-indigo-400" />
                      </label>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {lang === "ar" ? "المستودع المحدد بصيغة owner/repo." : (lang === "en" ? "The target repository in owner/repo format." : "کۆگای دەستنیشانکراو بە شێوازی owner/repo.")}{" "}({lang === "en" ? "Default:" : "ئێمە بە ناوی"} <span className="text-indigo-400 font-bold">sasrashid-collab/SAS-Platform</span> {lang === "en" ? "used" : "دەستمان پێکردووە"})
                      </p>
                      <input
                        type="text"
                        value={githubRepo}
                        onChange={(e) => handleGithubRepoChangeImmediate(e.target.value)}
                        placeholder="sasrashid-collab/SAS-Platform"
                        className={`w-full bg-slate-950 border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-300 font-mono text-left transition outline-none ${
                          highlightTokenInput 
                            ? "border-amber-500 ring-2 ring-amber-500/50" 
                            : "border-slate-800"
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/60 ${isRtl ? "" : "sm:flex-row-reverse"}`}>
                    <div className={textAlignClass}>
                      {githubToken ? (
                        <div className={`flex items-center gap-1.5 text-emerald-400 text-xs font-bold ${isRtl ? "justify-start" : "justify-start flex-row-reverse"}`}>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>{lang === "ar" ? "تم حفظ رمز الوصول بنجاح وتلقائياً!" : (lang === "en" ? "Token successfully saved and persistent!" : "کلیلەکە نووسراوە و بە سەرکەوتوویی بە خۆکار پاشەکەوت بووە!")}</span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1.5 text-amber-400 text-xs font-bold animate-pulse ${isRtl ? "justify-start" : "justify-start flex-row-reverse"}`}>
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span>{lang === "ar" ? "يرجى إدخال رمز الوصول واسم المستودع أولاً ثم النقر على الزر." : (lang === "en" ? "Please enter your token and repository name first, then click the button." : "تکایە سەرەتا لێرە کلیل و ناوی کۆگا بنووسە پاشان لەسەر دوگمەکە کلیک بکە.")}</span>
                        </div>
                      )}
                      {lastPushedUrl && (
                        <div className="mt-1 text-slate-400 text-[11px] leading-relaxed">
                          {lang === "ar" ? "آخر نشر ناجح:" : (lang === "en" ? "Last successful deploy:" : "دوایین بڵاوکردنەوەی سەرکەوتوو:")}{" "}
                          <a href={lastPushedUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline font-bold">
                            {lang === "ar" ? "عرض المستودع على غيت هاب ↗" : (lang === "en" ? "View repository on GitHub ↗" : "بینینی کۆگاکە لە گیتھەب ↗")}
                          </a>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={syncAllFilesToGitHub}
                      disabled={isSyncingAllFiles}
                      className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-xs md:text-sm active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                        isSyncingAllFiles
                          ? "bg-indigo-600/20 text-indigo-400/60 border border-indigo-500/20 animate-pulse cursor-not-allowed"
                          : !githubToken
                          ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-600/25"
                          : "bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-indigo-600/25"
                      }`}
                    >
                      {isSyncingAllFiles ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>{lang === "ar" ? "جاري إرسال الملفات إلى غيت هاب... يرجى الانتظار" : (lang === "en" ? "Pushing files to GitHub... Please wait" : "خەریکە فایلەکان ڕەوانەی گیتهەب دەکرێن... تکایە چاوەڕوان بە")}</span>
                        </>
                      ) : (
                        <>
                          <Github size={16} />
                          <span>{lang === "ar" ? "إرسال المشروع بالكامل إلى غيت هاب بنقرة واحدة 🚀" : (lang === "en" ? "Deploy entire project to GitHub with One-click 🚀" : "ڕەوانەکردنی تەواوی پڕۆژەکە بۆ گیتھەب بە یەک کلیک 🚀")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 🌐 DEPLOY & SHARE THE SAS PLATFORM ON NETLIFY, VERCEL & GITHUB 🌐 */}
                <div 
                  className={`bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800/80 p-6 md:p-8 rounded-[32px] space-y-6 relative overflow-hidden shadow-xl ${getFocusClass("share")}`}
                  onClick={getFocusClick("share")}
                  dir="rtl"
                >
                  {renderFocusBadge("share")}
                  {/* Glowing ambient light overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-2xl pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <Share2 size={16} />
                        </div>
                        <h3 className="text-lg font-black text-white">دامەزراندن و هاوبەشکردنی خودی پلاتفۆرمەکە (SAS Platform Share & Deploy Hub)</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        ئایا دەتەوێت خودی ئەم سەکۆیە (SAS-Platform) ببەیتە سەر هۆست و سێرڤەری تایبەتی خۆت یان لەگەڵ هاوڕێکانتدا هاوبەشی بکەیت؟ لێرەدا دەتوانیت بە یەک کلیل پڕۆژەکە ببەیتە سەر <span className="text-amber-400 font-bold">Netlify</span> و <span className="text-indigo-400 font-bold">Vercel</span> یان بەستەری ڕاستەوخۆ بنێریت!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* One-Click Deploy Actions */}
                    <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5 justify-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          <span>دامەزراندنی ئاسان بە یەک کلیک (One-Click Deploy Platforms)</span>
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          دوای ئەوەی پڕۆژەکەت نارد بۆ کۆگای گیتھەبی خۆت لە بەشی سەرەوە، دەتوانیت بە یەک کلیک بەستەرەکە ببەستیتەوە بەم خزمەتگوزارییانەوە تا بۆت هاست بکەن:
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Netlify Deploy Button */}
                        <a
                          href={`https://app.netlify.com/start/deploy?repository=${encodeURIComponent(lastPushedUrl || 'https://github.com/sasrashid-collab/SAS-Platform')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center text-center p-3.5 bg-teal-950/30 hover:bg-teal-950/60 border border-teal-500/20 hover:border-teal-500/40 rounded-xl transition cursor-pointer group active:scale-95 gap-2"
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Globe size={18} />
                          </div>
                          <span className="text-xs font-black text-teal-400">Netlify Deploy</span>
                          <span className="text-[9px] text-slate-500">دامەزراندن لە نێتلیفی</span>
                        </a>

                        {/* Vercel Deploy Button */}
                        <a
                          href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(lastPushedUrl || 'https://github.com/sasrashid-collab/SAS-Platform')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center text-center p-3.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 rounded-xl transition cursor-pointer group active:scale-95 gap-2"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12 2L2 22h20L12 2z" />
                            </svg>
                          </div>
                          <span className="text-xs font-black text-slate-200">Vercel Deploy</span>
                          <span className="text-[9px] text-slate-500">دامەزراندن لە ڤێرسێل</span>
                        </a>

                        {/* GitHub Clone/Fork */}
                        <a
                          href={`https://github.com/new/import?repository=${encodeURIComponent(lastPushedUrl || 'https://github.com/sasrashid-collab/SAS-Platform')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center text-center p-3.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer group active:scale-95 gap-2"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-800/80 text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Github size={18} />
                          </div>
                          <span className="text-xs font-black text-slate-300">GitHub Fork</span>
                          <span className="text-[9px] text-slate-500">دروستکردنی کۆپی</span>
                        </a>
                      </div>

                      {/* Info disclaimer */}
                      <p className="text-[9px] text-slate-500 leading-normal">
                        ℹ️ ئەگەر کۆگای گیتھەبی تایبەت بە خۆت هێشتا دروست نەکردووە، ئەوا بەستەرەکان بە خۆکاری پشت بە کۆگای سەرەکی و فەرمی <span className="text-indigo-400 font-bold">SAS-Platform</span> دەبەستن بۆ هۆستکردن.
                      </p>
                    </div>

                    {/* Social Share & QR Code */}
                    <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5 flex flex-col md:flex-row lg:flex-col justify-between gap-4">
                      {/* QR code and scan info */}
                      <div className="flex items-center gap-4 text-right">
                        <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-lg border border-slate-800">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin)}`}
                            alt="Platform URL QR Code"
                            className="w-[70px] h-[70px] rounded"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-amber-400 font-black tracking-wide uppercase">کۆدی QR بۆ پلاتفۆرمەکە</span>
                          <h5 className="text-xs font-bold text-white">سکان بکە بۆ چوونەژوورەوە</h5>
                          <p className="text-[9px] text-slate-500 leading-tight">مۆبایلەکەت نزیک بکەرەوە تا ڕاستەوخۆ لەناو مۆبایلەکەتەوە لاپەڕەکە بکرێتەوە!</p>
                        </div>
                      </div>

                      {/* Copy link & Social icons */}
                      <div className="space-y-3 pt-2 lg:pt-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin);
                            setIsPlatformUrlCopied(true);
                            triggerNotification("بەستەری فەرمی پلاتفۆرمەکە بە سەرکەوتوویی کۆپی کرا!");
                            setTimeout(() => setIsPlatformUrlCopied(false), 3000);
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer ${
                            isPlatformUrlCopied
                              ? "bg-emerald-500 text-slate-950"
                              : "bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-700/60"
                          }`}
                        >
                          {isPlatformUrlCopied ? <ClipboardCheck size={13} /> : <Clipboard size={13} />}
                          <span>{isPlatformUrlCopied ? "کۆپی کرا!" : "کۆپیکردنی بەستەری پلاتفۆرمەکە"}</span>
                        </button>

                        <div className="flex items-center justify-center gap-2 pt-1">
                          {/* WhatsApp */}
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent('سەیربکە! من ئەم پلاتفۆرمی دروستکردنی ئەپی بێ کۆدەم گەشەپێداوە و بڵاوکردووەتەوە: ' + window.location.origin)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 hover:text-slate-950 text-emerald-400 flex items-center justify-center transition active:scale-90"
                            title="WhatsApp"
                          >
                            <PhoneCall size={14} />
                          </a>
                          {/* Telegram */}
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent('سەیربکە! من ئەم پلاتفۆرمی دروستکردنی ئەپی بێ کۆدەم گەشەپێداوە و بڵاوکردووەتەوە')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-sky-600/10 hover:bg-sky-600 hover:text-slate-950 text-sky-400 flex items-center justify-center transition active:scale-90"
                            title="Telegram"
                          >
                            <Share2 size={14} />
                          </a>
                          {/* Facebook */}
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-blue-600/10 hover:bg-blue-600 hover:text-slate-950 text-blue-400 flex items-center justify-center transition active:scale-90"
                            title="Facebook"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                            </svg>
                          </a>
                          {/* LinkedIn */}
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-300 flex items-center justify-center transition active:scale-90"
                            title="LinkedIn"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Grid dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow">
                    <div className="text-right">
                      <span className="text-slate-500 text-xs font-bold block">پڕۆژە بەشداربووەکان</span>
                      <span className="text-2xl font-black text-white font-mono mt-1 block">{createdProducts.length}</span>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                      <Layers size={22} />
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow">
                    <div className="text-right">
                      <span className="text-slate-500 text-xs font-bold block">کەمپینی ڕیکلامەکان</span>
                      <span className="text-2xl font-black text-white font-mono mt-1 block">{generatedAds.length}</span>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center">
                      <Megaphone size={22} />
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow">
                    <div className="text-right">
                      <span className="text-slate-500 text-xs font-bold block">بوودجەی پڕۆژەکان</span>
                      <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                        {(() => {
                          const getProductCost = (type: "app" | "website" | "3d-game"): number => {
                            if (type === "app") return 3000;
                            if (type === "website") return 15000;
                            return 30000;
                          };
                          const totalSpent = createdProducts
                            .filter(p => p.creatorEmail === userEmail)
                            .reduce((sum, p) => sum + getProductCost(p.type), 0);
                          const currentBudget = activePlan.isTrial ? 3000 : (activePlan.planId === "plan_a" ? 30000 : 100000);
                          return `${(currentBudget - totalSpent).toLocaleString("ku-IQ")} / ${currentBudget.toLocaleString("ku-IQ")} د.ع`;
                        })()}
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
                      <Zap size={22} />
                    </div>
                  </div>
                </div>

                {/* User Products Revenue & Sales Dashboard (New!) */}
                <div 
                  className={`bg-slate-900 border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden ${getFocusClass("revenue")}`}
                  onClick={getFocusClick("revenue")}
                >
                  {renderFocusBadge("revenue")}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none" />
                  
                  {(() => {
                    const myProducts = createdProducts.filter(p => p.creatorEmail === userEmail);
                    const totalMySales = myProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0);
                    const totalMyRevenue = myProducts.reduce((sum, p) => sum + ((p.salesCount || 0) * (p.price || 0)), 0);

                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="text-emerald-400" size={20} />
                              <h3 className="text-lg font-black text-white">داشبۆردی داهات و فرۆشی بەرهەمەکانت</h3>
                            </div>
                            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                              ڕاپۆرتی گشتی فرۆشتن و داهاتی کۆکراوە لە فرۆشتنی ئەو بەرهەم و ئەپانەی کە بە ناوی خۆتەوە لە کۆگا (Marketplace) بڵاوت کردوونەتەوە.
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl text-right">
                              <span className="text-[10px] text-slate-500 block leading-none font-bold">کۆی گشتی داهات</span>
                              <span className="text-sm font-black text-emerald-400 font-mono mt-1 block">
                                {totalMyRevenue.toLocaleString("ku-IQ")} <span className="text-[10px] font-sans">دینار</span>
                              </span>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-2xl text-right">
                              <span className="text-[10px] text-slate-500 block leading-none font-bold">کۆی گشتی فرۆشراو</span>
                              <span className="text-sm font-black text-blue-400 font-mono mt-1 block">
                                {totalMySales.toLocaleString("ku-IQ")} <span className="text-[10px] font-sans">جار</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {myProducts.length === 0 ? (
                          <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-8 text-center space-y-3">
                            <p className="text-slate-400 text-xs">تۆ هێشتا هیچ بەرهەمێکی دیجیتاڵیت دروست نەکردووە یان بڵاونەکردووەتەوە.</p>
                            <button
                              onClick={() => setActiveTab("creator")}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold px-4 py-2 rounded-xl transition active:scale-95 cursor-pointer"
                            >
                              دروستکردنی یەکەم بەرهەم بە ژیری دەستکرد
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950/40">
                            <table className="w-full text-right border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold">
                                  <th className="p-4">ناوی بەرهەم</th>
                                  <th className="p-4 text-center">جۆری بەرهەم</th>
                                  <th className="p-4 text-center">نرخی یەکە (دینار)</th>
                                  <th className="p-4 text-center">ژمارەی فرۆشراو</th>
                                  <th className="p-4 text-center">داهاتی گشتی (دینار)</th>
                                  <th className="p-4 text-center">بڵاوکردنەوە</th>
                                  <th className="p-4 text-left">کردارەکان</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {myProducts.map((product) => {
                                  const productRevenue = (product.salesCount || 0) * (product.price || 0);
                                  return (
                                    <tr key={product.id} className="hover:bg-slate-900/40 transition">
                                      <td className="p-4 font-black text-white">{product.name}</td>
                                      <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold inline-block ${
                                          product.type === "app" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                          product.type === "website" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                          "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                        }`}>
                                          {product.type === "app" ? "ئەپ" :
                                           product.type === "website" ? "ماڵپەڕ" : "یاری ٣دوری"}
                                        </span>
                                      </td>
                                      <td className="p-4 text-center font-mono font-bold text-slate-300">
                                        {(product.price || 0).toLocaleString("ku-IQ")}
                                      </td>
                                      <td className="p-4 text-center font-mono font-extrabold text-blue-400">
                                        {product.salesCount || 0} جار
                                      </td>
                                      <td className="p-4 text-center font-mono font-black text-emerald-400">
                                        {productRevenue.toLocaleString("ku-IQ")}
                                      </td>
                                      <td className="p-4 text-center">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                                          product.isPublished ? "text-emerald-400" : "text-amber-500"
                                        }`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${
                                            product.isPublished ? "bg-emerald-400 animate-pulse" : "bg-amber-500"
                                          }`} />
                                          {product.isPublished ? "چالاک لە کۆگا" : "ڕەشنووس"}
                                        </span>
                                      </td>
                                      <td className="p-4 text-left">
                                        <button
                                          onClick={() => setActiveTab("ads")}
                                          className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-800 transition active:scale-95 cursor-pointer"
                                        >
                                          دروستکردنی کەمپینی ڕیکلام
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Explanations steps */}
                <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6">
                  <h3 className="text-lg font-black text-white">پڕۆسەی دەستپێکردنی کار بە کورتی:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 font-black text-sm flex items-center justify-center">١</div>
                      <h4 className="text-xs font-extrabold text-white">ڕازیبوون بە مەرجەکان</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">تۆماربوونی مەرجە فەرمییەکان بۆ پاراستنی مافی بەکارهێنەر و پلاتفۆرم پێش هەر دروستکردنێک.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-black text-sm flex items-center justify-center">٢</div>
                      <h4 className="text-xs font-extrabold text-white">تاقیکردنەوەی بێ بەرامبەر</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">بۆ ماوەی ١ هەفتە دەتوانیت ١ ئەپی تەواو بێ بەرامبەر دروست بکەیت و تاقی بکەیتەوە.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 font-black text-sm flex items-center justify-center">٣</div>
                      <h4 className="text-xs font-extrabold text-white">کاراکردنی پاکێجی چالاک</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">ناردنی فاتورەی FIB یان FastPay بۆ واتسئاپ و پەسەندکردنی تاوەکو کارایی بێ سنوورت پێببەخشێت.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 font-black text-sm flex items-center justify-center">٤</div>
                      <h4 className="text-xs font-extrabold text-white">دروستکردنی کەمپینی ڕیکلام</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">دروستکردنی کەمپینی ڕیکلامی تایبەت بۆ بەرهەمەکانت بە نرخی ٧,٥٠٠ دینار لەگەڵ لۆگۆی فەرمی SAS-Platform.</p>
                    </div>
                  </div>
                </div>

                {/* Secure Security & API Keys Dashboard Gating Settings */}
                {isOwner && (
                  <div 
                    className={`bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 relative overflow-hidden ${getFocusClass("security")}`}
                    onClick={getFocusClick("security")}
                  >
                  {renderFocusBadge("security")}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="text-amber-500" size={20} />
                        <h3 className="text-lg font-black text-white">ڕێکخستنی ئەمنی و کلیلی API (Security & Keys)</h3>
                      </div>
                      <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                        داشبۆردەکەت لە دەستی نامۆ بپارێزە! شفرەی تایبەت (PIN) دابنێ بۆ ئەوەی تەنها خۆت بتوانیت بیبینیت، و لێرەدا کلیلی Gemini API یان کلیلەکانی تر پاشەکەوت بکە.
                      </p>
                    </div>

                    <button
                      onClick={handleLockDashboard}
                      className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer self-start sm:self-center"
                    >
                      <Lock size={12} />
                      <span>ئێستا قفڵی بکە</span>
                    </button>

                    {githubToken && (
                      <button
                        onClick={syncToGitHub}
                        disabled={isSyncing}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer self-start sm:self-center ${
                          isSyncing
                            ? "bg-amber-500/10 text-amber-500/60 border border-amber-500/10 animate-pulse"
                            : "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/15"
                        }`}
                      >
                        <Github size={14} className={isSyncing ? "animate-spin" : ""} />
                        <span>{isSyncing ? "هاوکات دەکرێت..." : "هاوکاتکردنی گیتھەب (Sync)"}</span>
                      </button>
                    )}

                    {githubToken && (
                      <button
                        onClick={syncAllFilesToGitHub}
                        disabled={isSyncingAllFiles}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition cursor-pointer self-start sm:self-center ${
                          isSyncingAllFiles
                            ? "bg-blue-500/10 text-blue-500/60 border border-blue-500/10 animate-pulse"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/15"
                        }`}
                      >
                        <Github size={14} className={isSyncingAllFiles ? "animate-spin" : ""} />
                        <span>{isSyncingAllFiles ? "ناردنی کۆد دەکرێت..." : "ناردنی هەموو فایلەکان بۆ SAS-Platform"}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Dashboard PIN configuration */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-300 block">شفرەی تێپەڕبوون (Master PIN)</label>
                      <p className="text-[10px] text-slate-500">کۆدێکی ٤ ژمارەیی دابنێ بۆ ئەوەی کاتێک لاپەڕەکە دەکەیتەوە داوای بکات (بەتاڵی بکەرەوە بۆ لابردنی قفڵ).</p>
                      <div className="relative">
                        <input
                          type={showSettingsPin ? "text" : "password"}
                          value={editMasterPin}
                          onChange={(e) => setEditMasterPin(e.target.value)}
                          placeholder="بۆ نموونە: 4321"
                          maxLength={8}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 px-4 pl-12 text-sm text-amber-400 font-mono font-bold tracking-widest text-right transition outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSettingsPin(!showSettingsPin)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                        >
                          {showSettingsPin ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Gemini API Key configuration */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-300 block">کلیلی تایبەتی Gemini API Key</label>
                      <p className="text-[10px] text-slate-500">تایبەت بە بەستنەوەی زیرەکی دەستکرد بۆ پڕۆژە و نووسینی ڕیکلامەکانت بەبێ وەستان.</p>
                      <div className="relative">
                        <input
                          type={showSettingsKey ? "text" : "password"}
                          value={editGeminiKey}
                          onChange={(e) => setEditGeminiKey(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 px-4 pl-12 text-sm text-slate-300 font-mono text-left transition outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSettingsKey(!showSettingsKey)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                        >
                          {showSettingsKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* GitHub OAuth Token configuration */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-300 block">کۆدی دەسەڵاتی گیتھەب (GitHub OAuth Token)</label>
                      <p className="text-[10px] text-slate-500">کلیل یان تۆکنی گیتھەب (Personal Access Token) بە دەسەڵاتی repo بۆ پاشەکەوتکردن.</p>
                      <div className="relative">
                        <input
                          type={showSettingsGithubToken ? "text" : "password"}
                          value={editGithubToken}
                          onChange={(e) => setEditGithubToken(e.target.value)}
                          placeholder="ghp_..."
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 px-4 pl-12 text-sm text-slate-300 font-mono text-left transition outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSettingsGithubToken(!showSettingsGithubToken)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                        >
                          {showSettingsGithubToken ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* GitHub Repository configuration */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-300 block">ناوی کۆگای گیتھەب (GitHub Repository)</label>
                      <p className="text-[10px] text-slate-500">کۆگای دەستنیشانکراو بە شێوازی owner/repo (بۆ نموونە: user/my-sas-repo).</p>
                      <div className="relative">
                        <input
                          type="text"
                          value={editGithubRepo}
                          onChange={(e) => setEditGithubRepo(e.target.value)}
                          placeholder="username/repository"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 px-4 text-sm text-slate-300 font-mono text-left transition outline-none"
                        />
                      </div>
                    </div>

                    {/* GitHub Auto-Sync configuration */}
                    <div className="md:col-span-2 bg-slate-950/40 border border-slate-800/40 p-4 rounded-2xl flex items-center justify-between gap-4" dir="rtl">
                      <div className="space-y-1 text-right">
                        <label className="text-xs font-extrabold text-slate-200 block">هاوکاتکردنی خۆکارانەی گیتھەب (GitHub Auto-Sync)</label>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          هاوکاتکردنی خۆکار و دەستبەجێی گۆڕانکارییەکان (بەرهەمی نوێ، ڕیکلام، یان پاکێج) لەگەڵ کۆگای گیتھەب بەبێ پێویستی بە داگرتنی دوگمەی دەستی.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditGithubAutoSync(!editGithubAutoSync)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 outline-none relative shrink-0 ${
                          editGithubAutoSync ? "bg-amber-500" : "bg-slate-800"
                        }`}
                      >
                        <div
                          className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transition-all duration-300 absolute ${
                            editGithubAutoSync ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/60">
                    <button
                      onClick={handleSaveSecuritySettings}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-xl font-black text-xs active:scale-95 transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
                    >
                      <CheckCircle2 size={14} />
                      <span>پاشەکەوتکردنی کلیلەکان</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Export to GitHub Gist / JSON Section */}
                <div 
                  className={`bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-4 relative ${getFocusClass("export")}`}
                  onClick={getFocusClick("export")}
                >
                  {renderFocusBadge("export")}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Github className="text-amber-500" size={20} />
                        <h3 className="text-lg font-black text-white">هەناردەکردنی پڕۆژەکان بۆ گیتھەب (Export to GitHub)</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                        داتاکانی تایبەت بە پڕۆژە دروستکراوەکان و کەمپینە ڕیکلامییەکانت بە شێوازی JSON کۆپی بکە تا بە ئاسانی بیانگوێزیتەوە بۆ گیتھەب (GitHub Gist) یان فایلێکی تایبەت بەخۆت.
                      </p>
                    </div>
                    <button
                      onClick={exportToGitHub}
                      className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 active:scale-95 transition cursor-pointer self-start sm:self-center shrink-0 ${
                        isCopied 
                          ? "bg-emerald-500 text-slate-950 font-bold" 
                          : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700/60"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <ClipboardCheck size={14} />
                          <span>داتاکان کۆپیکران!</span>
                        </>
                      ) : (
                        <>
                          <Clipboard size={14} />
                          <span>کۆپیکردنی داتا بۆ گیتھەب</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Tiny preview block of the JSON output */}
                  <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl text-left" dir="ltr">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-500 font-mono">
                      <span>sas_export_data.json</span>
                      <span>JSON format</span>
                    </div>
                    <pre className="text-[11px] text-slate-400 font-mono overflow-x-auto max-h-36 custom-scrollbar leading-relaxed">
                      {safeStringify({
                        exportedAt: new Date().toISOString(),
                        user: userEmail,
                        createdProductsCount: createdProducts.length,
                        generatedAdsCount: generatedAds.length,
                        data: {
                          createdProducts: createdProducts.slice(0, 1),
                          generatedAds: generatedAds.slice(0, 1)
                        }
                      }, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "creator" && (
              <ProductCreator
                activePlan={activePlan}
                createdProducts={createdProducts}
                hasAgreedTerms={hasAgreedTerms}
                onProductCreated={handleProductCreated}
                onRequestSubscription={() => setActiveTab("billing")}
                userEmail={userEmail}
                lang={lang}
                focusedSection={focusedSection}
                setFocusedSection={setFocusedSection}
                isFocusModeEnabled={isFocusModeEnabled}
              />
            )}

            {activeTab === "ads" && (
              <AdBuilder
                createdProducts={createdProducts.filter(p => p.creatorEmail === userEmail)}
                generatedAds={generatedAds}
                onAdCreated={handleAdCreated}
                onPublishAdToStore={handlePublishAdToStore}
                onSubmitAdInvoice={handleSendInvoiceToWhatsApp}
                userEmail={userEmail}
                lang={lang}
                focusedSection={focusedSection}
                setFocusedSection={setFocusedSection}
                isFocusModeEnabled={isFocusModeEnabled}
              />
            )}

            {activeTab === "store" && (
              <Marketplace
                products={createdProducts}
                ads={generatedAds}
                userEmail={userEmail}
                onBuyProductSimulate={handleBuyProductSimulate}
              />
            )}

            {activeTab === "billing" && (
              <Billing
                activePlan={activePlan}
                invoices={invoices}
                createdProducts={createdProducts}
                userEmail={userEmail}
                onSendInvoiceToWhatsApp={handleSendInvoiceToWhatsApp}
              />
            )}

            {activeTab === "reports" && (
              <FinancialReports
                invoices={invoices}
                createdProducts={createdProducts}
                userEmail={userEmail}
              />
            )}

            {activeTab === "ai-hub" && (
              <AIStudioHub
                lang={lang}
                isOwner={isOwner}
                userEmail={userEmail}
              />
            )}
          </div>

          {/* Admin WhatsApp Simulator Panel Side-Drawer */}
          {isAdminMobileOpen && (
            <div className="col-span-12 lg:col-span-4 h-full">
              <div className="lg:sticky lg:top-24 h-[580px]">
                <AdminWhatsApp
                  invoices={invoices}
                  onApproveInvoice={handleApproveInvoice}
                  onRejectInvoice={handleRejectInvoice}
                  lang={lang}
                  onSendInvoiceToWhatsApp={handleSendInvoiceToWhatsApp}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer credit bar */}
      <footer className="text-center text-slate-600 text-xs mt-12 pt-6 border-t border-slate-900 px-4">
        <p>© ٢٠٢٦ SAS-Platform. هەموو مافەکان پارێزراون بۆ خاوەنی پلاتفۆرمەکە و خاوەنی بەرهەمە دروستکراوەکان.</p>
        <p className="text-[10px] text-slate-700 mt-1">گەشەپێدراوە بە بەرزترین تەکنەلۆژیا و نەخشەسازی بەبێ کۆد</p>
      </footer>
        </>
      )}
    </div>
  );
}
