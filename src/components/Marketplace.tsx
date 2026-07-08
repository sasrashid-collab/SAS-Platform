import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Search, Tag, Gamepad2, Globe, Layers, Eye, Check, ChevronLeft, CreditCard } from "lucide-react";
import { DigitalProduct, GeneratedAd } from "../types";

interface MarketplaceProps {
  products: DigitalProduct[];
  ads: GeneratedAd[];
  userEmail: string;
  onBuyProductSimulate: (productId: string) => void;
}

export default function Marketplace({
  products,
  ads,
  userEmail,
  onBuyProductSimulate
}: MarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "app" | "website" | "3d-game">("all");
  const [selectedProduct, setSelectedProduct] = useState<DigitalProduct | null>(null);
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"FIB" | "FastPay">("FIB");
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products that are published OR are created by the current user so they can view their own in-store
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || p.type === filterType;
    // Allow users to see their own creations even if not published, plus any published ones
    const isVisible = p.isPublished || p.creatorEmail === userEmail;
    return matchesSearch && matchesType && isVisible;
  });

  const handleInitiatePurchase = () => {
    setShowPurchaseFlow(true);
    setPurchaseSuccess(false);
  };

  const handleConfirmPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (selectedProduct) {
        onBuyProductSimulate(selectedProduct.id);
        setIsProcessing(false);
        setPurchaseSuccess(true);
      }
    }, 1800);
  };

  return (
    <div className="space-y-6 text-right font-sans animate-fade-in" dir="rtl">
      {/* Intro Header */}
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
          <ShoppingBag className="text-amber-500" size={24} />
          <span>کۆگای فەرمی فرۆشتنی بەرهەمەکان (SAS Store)</span>
        </h2>
        <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-3xl leading-relaxed">
          سەکۆیەکی بازرگانی پێشکەوتوو بۆ کڕین و فرۆشتنی ئەپلیکەیشن، یاری ٣ ڕەهەندی، ماڵپەڕ و کەمپینە ڕیکلامییەکان کە لە لایەن بەشداربووانەوە بە ژیری دەستکرد لە پلاتفۆرمی ساس دروستکراون. هەموو پارەدانێک تەنها لە ڕێگەی FIB و FastPay ئەنجام دەدرێت.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="گەڕان لە نێو کۆگا..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-none rounded-2xl py-3 px-11 text-xs text-slate-100 placeholder-slate-500"
          />
          <Search className="absolute right-4 top-3.5 text-slate-500" size={16} />
        </div>

        {/* Categories togglers */}
        <div className="flex gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterType === "all" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            هەموو جۆرەکان
          </button>
          <button
            onClick={() => setFilterType("app")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === "app" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers size={12} />
            ئەپەکان
          </button>
          <button
            onClick={() => setFilterType("website")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === "website" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Globe size={12} />
            ماڵپەڕەکان
          </button>
          <button
            onClick={() => setFilterType("3d-game")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === "3d-game" ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Gamepad2 size={12} />
            یاری ٣ ڕەهەندی
          </button>
        </div>
      </div>

      {/* Main Grid display of catalog */}
      {filteredProducts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <ShoppingBag size={40} className="text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-white">هیچ بەرهەمێک نەدۆزرایەوە</h3>
          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
            هیچ پڕۆژەیەک بڵاونەکراوەتەوە کە بگونجێت لەگەڵ گەڕانەکەتدا. بەشداربووان دەتوانن بە دروستکردنی پڕۆژە لە بەشی دروستکەر و بڵاوکردنەوەی لە لای خۆیان لێرە زیادی بکەن!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const hasAssociatedAd = ads.some(a => a.productId === p.id && a.isPublishedToStore);
            return (
              <motion.div
                key={p.id}
                layout
                whileHover={{ y: -4 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl hover:border-slate-700/80 transition flex flex-col justify-between"
              >
                {/* Visual Card Header */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: p.accentColor + "15", color: p.accentColor }}>
                      {p.type === "3d-game" ? <Gamepad2 size={20} /> : p.type === "website" ? <Globe size={20} /> : <Layers size={20} />}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${
                        p.type === "3d-game" ? "bg-amber-500/10 text-amber-500" : p.type === "website" ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {p.type === "3d-game" ? "یاری ٣ ڕەهەندی" : p.type === "website" ? "ماڵپەڕ" : "ئەپ"}
                      </span>
                      {hasAssociatedAd && (
                        <span className="bg-purple-500/10 text-purple-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                          لەگەڵ ڕیکلام
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <h3 className="text-md font-extrabold text-white tracking-tight">{p.name}</h3>
                    <p className="text-slate-400 text-xs mt-1.5 leading-normal line-clamp-2 h-8">{p.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {p.features.slice(0, 2).map((feat, idx) => (
                      <span key={idx} className="bg-slate-950 text-slate-500 text-[10px] px-2 py-1 rounded-lg border border-slate-800/80">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer pricing */}
                <div className="bg-slate-950 px-5 py-4 border-t border-slate-800/60 flex justify-between items-center">
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold">نرخی تەملیلی</div>
                    <div className="text-emerald-400 font-extrabold text-xs">{p.price.toLocaleString("ku-IQ")} دینار</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      handleInitiatePurchase();
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-200 px-4 py-2 rounded-xl border border-slate-800 active:scale-95 transition cursor-pointer"
                  >
                    پێشبینی و کڕین
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details & simulated Purchase Modal */}
      {showPurchaseFlow && selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-right"
          >
            {/* Success screen */}
            {purchaseSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-2xl shadow-lg">
                  ✓
                </div>
                <h3 className="text-xl font-black text-white">کڕینەکە بە سەرکەوتوویی ئەنجامدرا!</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  بڕی <span className="text-white font-bold">{selectedProduct.price.toLocaleString("ku-IQ")} دینار</span> بە سەرکەوتوویی لە ڕێگەی <span className="text-emerald-400 font-bold">{paymentMethod}</span> تەرخانکرا. پڕۆژەکە ئێستا ڕاستەوخۆ دەگوازرێتەوە بۆ دیسکتۆپی تەملیلەکەت.
                </p>
                <button
                  onClick={() => setShowPurchaseFlow(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  پاشگەزبوونەوە بۆ کۆگا
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-md font-black text-white">پێشاندانی بەرهەم و کڕین</h3>
                  <button 
                    onClick={() => setShowPurchaseFlow(false)}
                    className="text-slate-500 hover:text-white font-bold text-xs"
                  >
                    داخستن
                  </button>
                </div>

                {/* Product spec summary */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: selectedProduct.accentColor + "15", color: selectedProduct.accentColor }}>
                    {selectedProduct.type === "3d-game" ? <Gamepad2 size={20} /> : selectedProduct.type === "website" ? <Globe size={20} /> : <Layers size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{selectedProduct.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">بەرهەمی {selectedProduct.type} دروستکراو بە ژیری دەستکرد</p>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950/30 p-3 rounded-xl border border-slate-800 text-xs">
                  <div className="text-slate-400 leading-normal">{selectedProduct.description}</div>
                  <div className="text-slate-500 mt-2 font-mono">خاوەن ماڵپەڕ: {selectedProduct.creatorEmail}</div>
                  <div className="text-slate-500 font-mono">ژمارەی فرۆشراو: {selectedProduct.salesCount} دانە</div>
                </div>

                {/* Selector for FIB or FastPay */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-300 mb-2">دەروازەی پارەدان بۆ کڕین:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("FIB")}
                      className={`p-3 rounded-xl border font-bold text-xs flex justify-center items-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === "FIB"
                          ? "bg-amber-500/10 border-amber-500 text-amber-500"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      FIB Bank
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("FastPay")}
                      className={`p-3 rounded-xl border font-bold text-xs flex justify-center items-center gap-2 cursor-pointer transition-all ${
                        paymentMethod === "FastPay"
                          ? "bg-pink-500/10 border-pink-500 text-pink-500"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      FastPay
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-500">کۆی گشتی تێچوو:</div>
                    <div className="text-lg font-black text-emerald-400">{selectedProduct.price.toLocaleString("ku-IQ")} دینار</div>
                  </div>
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-6 py-3 rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg flex items-center gap-1.5 cursor-pointer disabled:bg-slate-800 disabled:text-slate-600"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>پرۆسەیە...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} />
                        <span>ئێستا بکڕە</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
