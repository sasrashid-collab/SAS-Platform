import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Image as ImageIcon, Video as VideoIcon, Brain, Search, 
  Download, Copy, Check, AlertCircle, RefreshCw, Compass, Sliders, Play, Square 
} from "lucide-react";

interface AIStudioHubProps {
  lang: "ku" | "ar" | "en";
  isOwner: boolean;
  userEmail: string;
}

export default function AIStudioHub({ lang, isOwner, userEmail }: AIStudioHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<"image" | "video" | "intelligence">("image");
  
  // State for Image Generator
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgSize, setImgSize] = useState<"1K" | "2K" | "4K">("1K");
  const [imgRatio, setImgRatio] = useState<"1:1" | "3:4" | "4:3" | "9:16" | "16:9">("1:1");
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [generatedImgBase64, setGeneratedImgBase64] = useState<string | null>(null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgCopied, setImgCopied] = useState(false);

  // State for Video Generator
  const [vidPrompt, setVidPrompt] = useState("");
  const [vidRatio, setVidRatio] = useState<"16:9" | "9:16">("16:9");
  const [vidResolution, setVidResolution] = useState<"720p" | "1080p">("1080p");
  const [isGeneratingVid, setIsGeneratingVid] = useState(false);
  const [vidOperationName, setVidOperationName] = useState<string | null>(null);
  const [vidProgressMsg, setVidProgressMsg] = useState("");
  const [vidError, setVidError] = useState<string | null>(null);
  const [generatedVidUrl, setGeneratedVidUrl] = useState<string | null>(null);
  const [vidStatusTimer, setVidStatusTimer] = useState<NodeJS.Timeout | null>(null);

  // State for Intelligence Suite
  const [intelPrompt, setIntelPrompt] = useState("");
  const [intelEngine, setIntelEngine] = useState<"fast" | "general" | "pro">("general");
  const [useSearchGrounding, setUseSearchGrounding] = useState(true);
  const [isProcessingIntel, setIsProcessingIntel] = useState(false);
  const [intelResponse, setIntelResponse] = useState<string | null>(null);
  const [intelSources, setIntelSources] = useState<any[]>([]);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [intelCopied, setIntelCopied] = useState(false);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (vidStatusTimer) clearInterval(vidStatusTimer);
    };
  }, [vidStatusTimer]);

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!imgPrompt.trim()) return;
    setIsGeneratingImg(true);
    setImgError(null);
    setGeneratedImgBase64(null);

    try {
      const res = await fetch("/api/gemini/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imgPrompt,
          imageSize: imgSize,
          aspectRatio: imgRatio,
          lang: lang
        })
      });
      const data = await res.json();
      if (res.ok && data.imageBase64) {
        setGeneratedImgBase64(data.imageBase64);
      } else {
        setImgError(data.error || "Failed to generate image.");
      }
    } catch (err: any) {
      setImgError(err.message || "An error occurred during generation.");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Start video generation
  const handleStartVideo = async () => {
    if (!vidPrompt.trim()) return;
    setIsGeneratingVid(true);
    setVidError(null);
    setGeneratedVidUrl(null);
    setVidOperationName(null);
    setVidProgressMsg(
      lang === "en" ? "Sending prompt to Veo 3.1 fast engine..." : 
      (lang === "ar" ? "جاري إرسال الوصف إلى محرك Veo 3.1 السريع..." : "ناردنی داواکاری بۆ بزوێنەری خێرای Veo 3.1...")
    );

    try {
      const res = await fetch("/api/gemini/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: vidPrompt,
          aspectRatio: vidRatio,
          resolution: vidResolution,
          lang: lang
        })
      });
      const data = await res.json();
      if (res.ok && data.operationName) {
        setVidOperationName(data.operationName);
        startPollingVideoStatus(data.operationName);
      } else {
        setVidError(data.error || "Failed to initiate video generation.");
        setIsGeneratingVid(false);
      }
    } catch (err: any) {
      setVidError(err.message || "An error occurred starting video generation.");
      setIsGeneratingVid(false);
    }
  };

  // Poll video status
  const startPollingVideoStatus = (opName: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      setVidProgressMsg(
        lang === "en" ? `Generating video (Veo 3.1) - Attempt ${attempts}...` : 
        (lang === "ar" ? `جاري توليد الفيديو (Veo 3.1) - محاولة ${attempts}...` : `دروستکردنی ڤیدیۆ (Veo 3.1) - هەوڵی ژمارە ${attempts}...`)
      );

      try {
        const res = await fetch("/api/gemini/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName: opName })
        });
        const data = await res.json();
        
        if (data.done) {
          clearInterval(interval);
          setVidStatusTimer(null);
          setVidProgressMsg(
            lang === "en" ? "Streaming your video..." : 
            (lang === "ar" ? "جاري جلب ملف الفيديو..." : "گواستنەوەی ڤیدیۆکەت...")
          );
          
          // Trigger file download stream
          downloadVideo(opName);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    setVidStatusTimer(interval);
  };

  // Download video into visual URL
  const downloadVideo = async (opName: string) => {
    try {
      const res = await fetch("/api/gemini/video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: opName })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedVidUrl(url);
      } else {
        const data = await res.json();
        setVidError(data.error || "Failed to download generated video.");
      }
    } catch (err: any) {
      setVidError(err.message || "Failed to proxy stream video.");
    } finally {
      setIsGeneratingVid(false);
    }
  };

  // Handle Intelligence task
  const handleRunIntelligence = async () => {
    if (!intelPrompt.trim()) return;
    setIsProcessingIntel(true);
    setIntelError(null);
    setIntelResponse(null);
    setIntelSources([]);

    try {
      const res = await fetch("/api/gemini/custom-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskPrompt: intelPrompt,
          modelType: intelEngine,
          useSearch: useSearchGrounding,
          lang: lang
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIntelResponse(data.text);
        if (data.groundingMetadata?.groundingChunks) {
          setIntelSources(data.groundingMetadata.groundingChunks);
        }
      } else {
        setIntelError(data.error || "An error occurred executing your request.");
      }
    } catch (err: any) {
      setIntelError(err.message || "Failed to execute request.");
    } finally {
      setIsProcessingIntel(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 md:p-8 space-y-6 text-right" dir="rtl">
      {/* Visual Title Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 justify-end">
            <h2 className="text-xl md:text-2xl font-black text-white">
              {lang === "en" ? "SAS AI Studio Creator Suite" : (lang === "ar" ? "جناح أستوديو الذكاء الاصطناعي SAS" : "ستۆدیۆی بەرهەمهێنەری زیرەکی SAS")}
            </h2>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="animate-pulse" size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {lang === "en" ? "Direct access to high fidelity generative design, realistic video, and contextual deep reasoning engines." : 
            (lang === "ar" ? "وصول مباشر لمحركات التصميم التوليدي عالي الجودة، الفيديو الحقيقي، والتفكير العميق." : "دەستگەیشتنی ڕاستەوخۆ بە بزوێنەرەکانی نەخشاندنی گرافیک، ڤیدیۆ و شیکردنەوەی قووڵی مۆدێلەکانی Gemini.")}
          </p>
        </div>

        {/* Sub-navigation buttons */}
        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveSubTab("image")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "image" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon size={14} />
            <span>{lang === "en" ? "Images (3.0 Pro)" : (lang === "ar" ? "الصور (3.0 Pro)" : "وێنەکان")}</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("video")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "video" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <VideoIcon size={14} />
            <span>{lang === "en" ? "Veo 3 Videos" : (lang === "ar" ? "فيديو (Veo 3)" : "ڤیدیۆی Veo 3")}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("intelligence")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "intelligence" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Brain size={14} />
            <span>{lang === "en" ? "AI Engines" : (lang === "ar" ? "محركات التحليل" : "بزوێنەرەکانی ژیری")}</span>
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="pt-2">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: IMAGE GENERATOR */}
          {activeSubTab === "image" && (
            <motion.div
              key="image"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Control inputs */}
                <div className="lg:col-span-5 space-y-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center gap-1.5 justify-end text-sm font-black text-amber-400 mb-2">
                    <Sliders size={16} />
                    <span>{lang === "en" ? "Image Settings" : (lang === "ar" ? "إعدادات الصورة" : "ڕێکخستنی وێنە")}</span>
                  </div>

                  {/* Size select */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block font-bold">
                      {lang === "en" ? "Resolution / Size" : (lang === "ar" ? "الدقة والحجم" : "ڕوونی و قەبارە")}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["1K", "2K", "4K"] as const).map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setImgSize(sz)}
                          className={`py-2 rounded-xl text-xs font-black border transition ${
                            imgSize === sz 
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          {sz} {sz === "1K" ? " (1024px)" : sz === "2K" ? " (1440px)" : " (2160px)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aspect Ratio Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block font-bold">
                      {lang === "en" ? "Aspect Ratio" : (lang === "ar" ? "نسبة الأبعاد" : "ڕێژەی لایەکان")}
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(["1:1", "3:4", "4:3", "9:16", "16:9"] as const).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setImgRatio(ratio)}
                          className={`py-2 rounded-lg text-[10px] font-black border transition ${
                            imgRatio === ratio 
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Text Input */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-slate-300 block font-black">
                      {lang === "en" ? "What do you want to generate?" : (lang === "ar" ? "ماذا تريد أن تصمم؟" : "دەتەوێت چی بەرهەم بهێنیت؟")}
                    </label>
                    <textarea
                      value={imgPrompt}
                      onChange={(e) => setImgPrompt(e.target.value)}
                      placeholder={
                        lang === "en" ? "A futuristic neon storefront in Sulaymaniyah, 3d render..." : 
                        (lang === "ar" ? "واجهة متجر نيون مستقبلية في السليمانية، تصميم ثلاثي الأبعاد..." : "شاشەیەکی فرۆشگای نیۆن لە سلێمانی بە ستایلی مۆدێرن، ٣ ڕەهەندی...")
                      }
                      className="w-full h-24 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-right resize-none"
                    />
                  </div>

                  <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImg || !imgPrompt.trim()}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                      isGeneratingImg || !imgPrompt.trim()
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50"
                        : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/10 active:scale-95"
                    }`}
                  >
                    {isGeneratingImg ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        <span>{lang === "en" ? "Generating using Gemini 3 Pro..." : (lang === "ar" ? "جاري التصميم عبر Gemini 3..." : "بەرهەمهێنان لە ڕێگەی Gemini 3...")}</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={16} />
                        <span>{lang === "en" ? "Generate Premium Image" : (lang === "ar" ? "توليد صورة احترافية" : "دروستکردنی وێنەی ناوازە")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preview Frame */}
                <div className="lg:col-span-7 h-full min-h-[320px] bg-slate-950 rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isGeneratingImg ? (
                      <motion.div
                        key="loading-img"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-4"
                      >
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center animate-spin mx-auto">
                          <RefreshCw size={24} />
                        </div>
                        <p className="text-xs text-slate-400">
                          {lang === "en" ? "Applying complex mathematical diffusion on 3.0 Pro neural net..." : 
                          (lang === "ar" ? "جاري تطبيق العمليات العصبية المعقدة في محرك Pro..." : "ڕێکخستنی دەرئەنجامەکان لەسەر مێشکی دەستکردی Pro...")}
                        </p>
                      </motion.div>
                    ) : generatedImgBase64 ? (
                      <motion.div
                        key="ready-img"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col items-center justify-between gap-4"
                      >
                        <img
                          src={`data:image/png;base64,${generatedImgBase64}`}
                          alt="AI generated"
                          className="rounded-2xl border border-slate-800 shadow-2xl max-h-[340px] object-contain w-auto mx-auto"
                        />
                        <div className="flex gap-2 w-full justify-center">
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = `data:image/png;base64,${generatedImgBase64}`;
                              link.download = `sas-studio-${Date.now()}.png`;
                              link.click();
                            }}
                            className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                          >
                            <Download size={14} />
                            <span>{lang === "en" ? "Download" : (lang === "ar" ? "تحميل" : "داگرتن")}</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`data:image/png;base64,${generatedImgBase64}`);
                              setImgCopied(true);
                              setTimeout(() => setImgCopied(false), 3000);
                            }}
                            className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                          >
                            {imgCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            <span>{imgCopied ? (lang === "en" ? "Copied Base64!" : "تم النسخ!") : (lang === "en" ? "Copy Base64" : "کۆپیکردن")}</span>
                          </button>
                        </div>
                      </motion.div>
                    ) : imgError ? (
                      <motion.div
                        key="err-img"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-3 p-6 text-rose-400"
                      >
                        <AlertCircle size={32} className="mx-auto text-rose-500 animate-bounce" />
                        <h4 className="text-sm font-black">{lang === "en" ? "Generation Stopped" : (lang === "ar" ? "توقف التوليد" : "بەرهەمهێنان ڕاوەستا")}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">{imgError}</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty-img"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-3"
                      >
                        <div className="w-12 h-12 bg-slate-900 text-slate-600 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                          <Compass size={24} className="animate-spin" style={{ animationDuration: "12s" }} />
                        </div>
                        <h4 className="text-sm font-black text-slate-400">{lang === "en" ? "Your Canvas is Empty" : (lang === "ar" ? "شاشتك فارغة" : "تابلۆکەت خاڵییە")}</h4>
                        <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                          {lang === "en" ? "Configure your settings and write a descriptive prompt on the left, then trigger Gemini 3.0 Pro to create." : 
                          (lang === "ar" ? "اضبط الإعدادات واكتب الوصف على اليسار، ثم انقر لتصميم تحفتك الفنية." : "ڕێکخستنەکان بە ئارەزووی خۆت دیاری بکە و تێکستێک بنووسە بۆ بەرهەمهێنان.")}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: VEO VIDEO GENERATOR */}
          {activeSubTab === "video" && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Control inputs */}
                <div className="lg:col-span-5 space-y-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center gap-1.5 justify-end text-sm font-black text-amber-400 mb-2">
                    <Sliders size={16} />
                    <span>{lang === "en" ? "Video Settings (Veo 3.1)" : (lang === "ar" ? "إعدادات الفيديو" : "ڕێکخستنی ڤیدیۆی Veo")}</span>
                  </div>

                  {/* Aspect Ratio Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block font-bold">
                      {lang === "en" ? "Aspect Ratio (Must be 16:9 or 9:16)" : (lang === "ar" ? "نسبة الأبعاد (16:9 أو 9:16)" : "ڕێژەی لایەکان (دەبێت ١٦:٩ یان ٩:١٦ بێت)")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setVidRatio("16:9")}
                        className={`py-2.5 rounded-xl text-xs font-black border transition ${
                          vidRatio === "16:9" 
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        16:9 (Landscape 🖥️)
                      </button>
                      <button
                        onClick={() => setVidRatio("9:16")}
                        className={`py-2.5 rounded-xl text-xs font-black border transition ${
                          vidRatio === "9:16" 
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        9:16 (Portrait 📱)
                      </button>
                    </div>
                  </div>

                  {/* Resolution select */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block font-bold">
                      {lang === "en" ? "Resolution" : (lang === "ar" ? "دقة العرض" : "ڕوونی ڤیدیۆ")}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setVidResolution("720p")}
                        className={`py-2 rounded-xl text-xs font-black border transition ${
                          vidResolution === "720p" 
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        720p HD
                      </button>
                      <button
                        onClick={() => setVidResolution("1080p")}
                        className={`py-2 rounded-xl text-xs font-black border transition ${
                          vidResolution === "1080p" 
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        1080p Full HD
                      </button>
                    </div>
                  </div>

                  {/* Prompt Text Input */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-slate-300 block font-black">
                      {lang === "en" ? "Describe your video scene" : (lang === "ar" ? "صف مشهد الفيديو الخاص بك" : "پێناسەی دیمەنی ڤیدیۆکەت بنووسە")}
                    </label>
                    <textarea
                      value={vidPrompt}
                      onChange={(e) => setVidPrompt(e.target.value)}
                      placeholder={
                        lang === "en" ? "Cinematic shot of a 3d rendering engine loading assets, slow camera spin..." : 
                        (lang === "ar" ? "لقطة سينمائية لمحرك تصميم ثلاثي الأبعاد وهو يحمل الملفات..." : "دیمەنێکی سینەمایی سێ ڕەهەندی لە کۆمپانیایەک لە کاتی دروستکردنی کارێکدا...")
                      }
                      className="w-full h-24 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-right resize-none"
                    />
                  </div>

                  <button
                    onClick={handleStartVideo}
                    disabled={isGeneratingVid || !vidPrompt.trim()}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                      isGeneratingVid || !vidPrompt.trim()
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50"
                        : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/10 active:scale-95"
                    }`}
                  >
                    {isGeneratingVid ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        <span>{lang === "en" ? "Processing on Veo 3.1..." : (lang === "ar" ? "جاري المعالجة عبر Veo..." : "کارپێکردن لەسەر Veo 3.1...")}</span>
                      </>
                    ) : (
                      <>
                        <VideoIcon size={16} />
                        <span>{lang === "en" ? "Generate Realistic Video" : (lang === "ar" ? "توليد فيديو واقعي" : "دروستکردنی ڤیدیۆی مۆدێرن")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preview Frame */}
                <div className="lg:col-span-7 min-h-[340px] bg-slate-950 rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isGeneratingVid ? (
                      <motion.div
                        key="loading-vid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-4"
                      >
                        <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center animate-bounce mx-auto">
                          <VideoIcon className="animate-pulse" size={28} />
                        </div>
                        <h4 className="text-sm font-black text-amber-400">
                          {lang === "en" ? "Veo 3.1 Generation Engine active" : (lang === "ar" ? "محرك Veo 3.1 قيد العمل الآن" : "بزوێنەری ڤیدیۆیی Veo 3.1 چالاک بوو")}
                        </h4>
                        <div className="max-w-xs mx-auto space-y-1.5">
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 animate-[pulse_1.5s_infinite] w-[75%]" />
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">{vidProgressMsg}</p>
                        </div>
                      </motion.div>
                    ) : generatedVidUrl ? (
                      <motion.div
                        key="ready-vid"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full flex flex-col items-center gap-4"
                      >
                        <video
                          src={generatedVidUrl}
                          controls
                          autoPlay
                          className="rounded-2xl border border-slate-800 shadow-2xl max-h-[320px] object-contain bg-black w-full"
                        />
                        <a
                          href={generatedVidUrl}
                          download={`sas-veo-video-${Date.now()}.mp4`}
                          className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                        >
                          <Download size={14} />
                          <span>{lang === "en" ? "Download Video" : (lang === "ar" ? "تحميل ملف الفيديو" : "داگرتنی ڤیدیۆ")}</span>
                        </a>
                      </motion.div>
                    ) : vidError ? (
                      <motion.div
                        key="err-vid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-3 p-6 text-rose-400"
                      >
                        <AlertCircle size={32} className="mx-auto text-rose-500" />
                        <h4 className="text-sm font-black">{lang === "en" ? "Generation Stopped" : (lang === "ar" ? "فشل التوليد" : "بەرهەمهێنان سەرکەوتوو نەبوو")}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">{vidError}</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty-vid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center space-y-3"
                      >
                        <div className="w-12 h-12 bg-slate-900 text-slate-600 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                          <Play size={20} className="text-slate-500 shrink-0 ml-0.5" />
                        </div>
                        <h4 className="text-sm font-black text-slate-400">{lang === "en" ? "No Active Video" : (lang === "ar" ? "لا يوجد فيديو حالي" : "هیچ ڤیدیۆیەکی چالاک نییە")}</h4>
                        <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                          {lang === "en" ? "Specify your timeline settings, and prompt Veo 3.1 to construct beautiful 3D landscapes or visual motion." : 
                          (lang === "ar" ? "حدد التفضيلات واكتب موضوع الفيديو، ثم اسمح لـ Veo 3.1 ببناء دیمەنگەکەت." : "تکایە تێکستێکی ڕوون و جوان بنووسە لە چەپدا بۆ ئەوەی بزوێنەری زیرەکی مۆدێلەکە دروستی بکات.")}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: INTELLIGENCE SUITE */}
          {activeSubTab === "intelligence" && (
            <motion.div
              key="intelligence"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Control inputs */}
                <div className="lg:col-span-5 space-y-4 bg-slate-950 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center gap-1.5 justify-end text-sm font-black text-amber-400 mb-2">
                    <Brain size={16} />
                    <span>{lang === "en" ? "AI Engine Hub" : (lang === "ar" ? "لوحة محركات التحليل" : "ڕێکخستنی بزوێنەری مێشکی دەستکرد")}</span>
                  </div>

                  {/* Engine select */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 block font-bold">
                      {lang === "en" ? "Select AI Engine Model" : (lang === "ar" ? "اختر مۆدێل الذكاء" : "دیاریکردنی مۆدێلی زیرەکی")}
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setIntelEngine("fast")}
                        className={`w-full p-3 rounded-2xl border transition text-right ${
                          intelEngine === "fast" 
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <div className="font-black text-xs">🚀 Fast Flash Lite (3.1-flash-lite)</div>
                        <div className="text-[9px] text-slate-500 mt-1">
                          {lang === "en" ? "Ultra-fast responses for proofreading, quick translation or formatting." : 
                          (lang === "ar" ? "استجابة سريعة جداً للمراجعة، الترجمة السريعة والتنسيق." : "وەڵامی زۆر خێرا بۆ پێداچوونەوەی ڕێنووس، وەرگێڕان یان ڕێکخستنی کورت.")}
                        </div>
                      </button>

                      <button
                        onClick={() => setIntelEngine("general")}
                        className={`w-full p-3 rounded-2xl border transition text-right ${
                          intelEngine === "general" 
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <div className="font-black text-xs">⚡ General Flash (3.5-flash)</div>
                        <div className="text-[9px] text-slate-500 mt-1">
                          {lang === "en" ? "Default balanced engine for marketing ad copy, brainstorming and chat." : 
                          (lang === "ar" ? "محرك متوازن لكتابة الإعلانات، العصف الذهني والمحادثة." : "بزوێنەرێکی هاوسەنگ بۆ نوسینی تێکستی ڕیکلام، دروستکردنی بیرۆکە و گفتوگۆ.")}
                        </div>
                      </button>

                      <button
                        onClick={() => setIntelEngine("pro")}
                        className={`w-full p-3 rounded-2xl border transition text-right ${
                          intelEngine === "pro" 
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <div className="font-black text-xs">🧠 Deep Reasoning Pro (3.1-pro-preview)</div>
                        <div className="text-[9px] text-slate-500 mt-1">
                          {lang === "en" ? "Maximum intelligence for complex tasks, architectural reviews or debugging." : 
                          (lang === "ar" ? "ذكاء خارق للمهام المعقدة، مراجعة البنية وتصحيح الكود." : "ژیرییەکی قووڵ بۆ کارە قورسەکان، پشکنینی پڕۆژە و دۆزینەوەی هەڵەی کۆد.")}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Toggle Google Search Grounding */}
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setUseSearchGrounding(!useSearchGrounding)}
                      className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                        useSearchGrounding ? "bg-amber-500" : "bg-slate-850"
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-slate-950 rounded-full transition-all ${
                        useSearchGrounding ? "left-1" : "left-5"
                      }`} />
                    </button>
                    
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-300 flex items-center gap-1 justify-end">
                        <Search size={12} className="text-cyan-400" />
                        <span>{lang === "en" ? "Google Search Grounding" : (lang === "ar" ? "ربط البحث بجوجل" : "بەستنەوە بە گەڕانی گووگڵ")}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        {lang === "en" ? "Get live accurate data and sources using Google search tool." : 
                        (lang === "ar" ? "للحصول على معلومات موثوقة ومحدثة مع روابط المصادر." : "بۆ دەستکەوتنی زانیاری ڕاست و نوێ بە بەکارهێنانی ئامرازی گووگڵ.")}
                      </p>
                    </div>
                  </div>

                  {/* Prompt Text Input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs text-slate-300 block font-black">
                      {lang === "en" ? "Describe your task or inquiry" : (lang === "ar" ? "اكتب تفاصيل مهمتك" : "تێکستی داواکارییەکەت بنووسە")}
                    </label>
                    <textarea
                      value={intelPrompt}
                      onChange={(e) => setIntelPrompt(e.target.value)}
                      placeholder={
                        lang === "en" ? "Analyze the subscription market in Sulaymaniyah, what are local pricing expectations? Include sources." : 
                        (lang === "ar" ? "حلل سوق الاشتراكات في السليمانية، ما هي الأسعار المتوقعة محلياً؟" : "بازاڕی بەشداربوون لە سلێمانی شیکار بکە، نرخە گونجاوەکان چین؟ سەرچاوەکان پیشان بدە.")
                      }
                      className="w-full h-24 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition text-right resize-none"
                    />
                  </div>

                  <button
                    onClick={handleRunIntelligence}
                    disabled={isProcessingIntel || !intelPrompt.trim()}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                      isProcessingIntel || !intelPrompt.trim()
                        ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50"
                        : "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/10 active:scale-95"
                    }`}
                  >
                    {isProcessingIntel ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        <span>{lang === "en" ? "Processing with AI..." : (lang === "ar" ? "جاري التحليل والبحث..." : "شیکردنەوەی زیرەک...")}</span>
                      </>
                    ) : (
                      <>
                        <Brain size={16} />
                        <span>{lang === "en" ? "Execute Intelligent Request" : (lang === "ar" ? "تنفيذ طلب الذكاء" : "شیکردنەوەی داواکاری")}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preview Frame */}
                <div className="lg:col-span-7 min-h-[340px] bg-slate-950 rounded-3xl border border-slate-800 flex flex-col p-6 relative overflow-hidden text-right leading-relaxed">
                  <AnimatePresence mode="wait">
                    {isProcessingIntel ? (
                      <motion.div
                        key="loading-intel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="my-auto text-center space-y-4"
                      >
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center animate-spin mx-auto">
                          <RefreshCw size={24} />
                        </div>
                        <h4 className="text-sm font-black text-white">
                          {lang === "en" ? "AI thinking engine in progress..." : (lang === "ar" ? "جاري التفكير والتنقيب عن المصادر..." : "ژیری مۆدێلەکە لە کاتی کۆکردنەوەی زانیارییەکاندایە...")}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto">
                          {useSearchGrounding 
                            ? (lang === "en" ? "Conducting live web searches to ground responses with accurate data." : "گەڕانی ڕاستەوخۆ بە دوای سەرچاوە پشتڕاستکراوەکاندا.")
                            : (lang === "en" ? "Synthesizing response through core neural model architecture." : "ئامادەکردنی وەڵامی دروستکراو بە تەواوی.")}
                        </p>
                      </motion.div>
                    ) : intelResponse ? (
                      <motion.div
                        key="ready-intel"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
                          {/* Rich Response markdown body wrapper */}
                          <div className="text-slate-200 text-xs md:text-sm whitespace-pre-wrap leading-relaxed font-sans text-right" dir="rtl">
                            {intelResponse}
                          </div>

                          {/* Grounding Metadata display (Search Grounding Sources) */}
                          {intelSources.length > 0 && (
                            <div className="border-t border-slate-800/80 pt-4 mt-2">
                              <h5 className="text-[11px] font-black text-cyan-400 mb-2 flex items-center gap-1 justify-end">
                                <Search size={10} />
                                <span>{lang === "en" ? "Verified Web Sources" : (lang === "ar" ? "مصادر التحقق من الويب" : "سەرچاوە باوەڕپێکراوەکانی گەڕانی گووگڵ")}</span>
                              </h5>
                              <div className="flex flex-wrap gap-2 justify-end">
                                {intelSources.map((source: any, idx: number) => {
                                  const title = source.web?.title || source.title || (lang === "en" ? `Source [${idx + 1}]` : `سەرچاوە [${idx + 1}]`);
                                  const url = source.web?.uri || source.uri || "#";
                                  return (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/25 px-2.5 py-1 rounded-lg text-[9px] font-black transition flex items-center gap-1 cursor-pointer max-w-xs truncate"
                                    >
                                      <span>{title}</span>
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 w-full justify-center border-t border-slate-900 pt-4">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(intelResponse);
                              setIntelCopied(true);
                              setTimeout(() => setIntelCopied(false), 3000);
                            }}
                            className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                          >
                            {intelCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            <span>{intelCopied ? (lang === "en" ? "Copied Response!" : "کۆپی کرا!") : (lang === "en" ? "Copy Response" : "کۆپیکردنی وەڵام")}</span>
                          </button>
                        </div>
                      </motion.div>
                    ) : intelError ? (
                      <motion.div
                        key="err-intel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="my-auto text-center space-y-3 p-6 text-rose-400"
                      >
                        <AlertCircle size={32} className="mx-auto text-rose-500" />
                        <h4 className="text-sm font-black">{lang === "en" ? "Execution Failure" : (lang === "ar" ? "فشل التنفيذ" : "کێشەیەک ڕوویدا")}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">{intelError}</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty-intel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="my-auto text-center space-y-3"
                      >
                        <div className="w-12 h-12 bg-slate-900 text-slate-600 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                          <Brain size={24} className="text-slate-500" />
                        </div>
                        <h4 className="text-sm font-black text-slate-400">{lang === "en" ? "Intelligence Output Terminal" : (lang === "ar" ? "لوحة مخرجات التحلیل" : "دەرئەنجامی شیکارییە زیرەکەکان")}</h4>
                        <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed mx-auto text-center">
                          {lang === "en" ? "Choose your speed and intelligence tier, write a request, and activate search grounding to fetch up-to-date sources." : 
                          (lang === "ar" ? "اختر السرعة ومستوی التحلیل، اكتب موضوعك، ودع مۆدێل الذكاء یقوم بالبحث." : "بزوێنەری گونجاو دیاری بکە و پرسیارەکەت بنووسە بۆ شیکردنەوەی تەواو.")}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
