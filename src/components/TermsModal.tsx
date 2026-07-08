import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, BookOpen, Check, HelpCircle } from "lucide-react";
import { TERMS_AND_CONDITIONS } from "../data/plans";

interface TermsModalProps {
  onAgree: () => void;
}

export default function TermsModal({ onAgree }: TermsModalProps) {
  const [hasRead, setHasRead] = useState(false);
  const [acceptedCheckbox, setAcceptedCheckbox] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAgreeClick = () => {
    if (!acceptedCheckbox) {
      setErrorMsg("تکایە سەرەتا نیشانەی ڕەزامەندی دابنێ لەسەر مەرجەکان.");
      return;
    }
    onAgree();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    // Check if user scrolled near the bottom of the terms box
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 40) {
      setHasRead(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans text-right" dir="rtl">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Glow border decorative line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-amber-500 to-emerald-500" />
        
        {/* Logo/Icon Area */}
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <span className="text-slate-950 font-black text-2xl tracking-wider">SAS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">بەخێربێیت بۆ SAS-Platform</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-md">
            یەکەمین پلاتفۆرمی کوردی بۆ دروستکردنی ئەپ، ماڵپەڕ، و یاری ٣ ڕەهەندی بەبێ کۆدکردن لە ڕێگەی ژیری دەستکردەوە.
          </p>
        </div>

        {/* Info badges */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-amber-500 font-black text-lg">١ هەفتە بێبەرامبەر</div>
            <div className="text-slate-400 text-xs mt-0.5">تاقیکردنەوە لەگەڵ دروستکردنی ١ ئەپ</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-center">
            <div className="text-emerald-400 font-black text-lg">بوودجەی پڕۆژەکان</div>
            <div className="text-slate-400 text-xs mt-0.5">بەپێی پاکێجی بەشداریکردنەکەت</div>
          </div>
        </div>

        {/* Scroll Box Notice */}
        <div className="flex items-center gap-2 mb-2 text-amber-400 text-sm font-bold">
          <BookOpen size={16} />
          <span>تکایە یاسا و ڕێساکانی بەشداری بخوێنەوە تا کۆتایی:</span>
        </div>

        {/* Terms Box */}
        <div 
          onScroll={handleScroll}
          className="bg-slate-950 border border-slate-800 rounded-2xl p-4 md:p-5 h-64 overflow-y-auto text-slate-300 text-sm leading-relaxed text-right font-mono whitespace-pre-line custom-scrollbar"
        >
          {TERMS_AND_CONDITIONS}
          <div className="mt-4 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-3">
            -- کۆتایی یاساکان --
          </div>
        </div>

        {/* Scroll helper indicator */}
        {!hasRead && (
          <div className="text-center text-xs text-amber-500/80 mt-2 animate-pulse font-medium">
            ▼ تکایە بۆ خوارەوەی لیستەکە بڕۆ بۆ تەواوکردنی خوێندنەوە
          </div>
        )}

        {/* Checkbox and action area */}
        <div className="mt-6 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group text-right">
            <div className="relative mt-0.5">
              <input 
                type="checkbox" 
                checked={acceptedCheckbox}
                onChange={(e) => {
                  setAcceptedCheckbox(e.target.checked);
                  setErrorMsg("");
                }}
                className="sr-only"
              />
              <div className={`w-5  h-5 rounded-md border transition-all ${
                acceptedCheckbox 
                  ? "bg-amber-500 border-amber-500" 
                  : "bg-slate-950 border-slate-700 group-hover:border-slate-500"
              } flex items-center justify-center`}>
                {acceptedCheckbox && <Check size={14} className="text-slate-950 stroke-[3]" />}
              </div>
            </div>
            <div className="text-slate-300 text-xs md:text-sm select-none leading-normal">
              من بە تەواوی خوێندمەوە و <span className="text-amber-400 font-bold">ڕازیم</span> بە هەموو مەرج و ڕێساکانی بەشداریکردن و دروستکردنی بەرهەم لەم پلاتفۆرمەدا.
            </div>
          </label>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-400 text-xs font-bold"
            >
              {errorMsg}
            </motion.div>
          )}

          {/* Accept Button */}
          <button
            onClick={handleAgreeClick}
            disabled={!acceptedCheckbox}
            className={`w-full py-4 rounded-2xl font-extrabold text-md tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
              acceptedCheckbox
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 cursor-pointer hover:shadow-amber-500/20 active:scale-[0.99]"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <ShieldCheck size={20} />
            <span>بەڵێ، ڕازیبم و پلاتفۆرمەکە بکەوە</span>
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-500 mt-4 flex items-center justify-center gap-1">
          <HelpCircle size={10} />
          <span>هەموو مافەکان پارێزراون بۆ خاوەنی پلاتفۆرم و خاوەنی بەرهەمەکان © ٢٠٢٦ SAS</span>
        </div>
      </motion.div>
    </div>
  );
}
