import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, MessageCircle, Bot } from "lucide-react";
import { ChatMessage } from "../types";

const WELCOME_MESSAGES = {
  ku: "سڵاو! من ڕێپیشاندەری زیرەکی SAS-Platform-م. 🌟 دەتوانم یارمەتیت بدەم لە دروستکردنی ئەپ، ماڵپەڕ، یاری ٣ ڕەهەندی، یان ڕێساکانی بەشداری کردن و پارەدان. چ جۆرە پرسیارێکت هەیە؟",
  ar: "مرحباً! أنا مساعد SAS-Platform الذكي. 🌟 يمكنني مساعدتك في إنشاء التطبيقات، المواقع الإلكترونية، الألعاب ثلاثية الأبعاد، أو توضيح شروط الاشتراك والدفع. ما هو سؤالك؟",
  en: "Hello! I am the SAS-Platform intelligent assistant. 🌟 I can help you build apps, websites, 3D games, or guide you through subscription and payment rules. What is your question?"
};

const QUICK_PROMPTS = {
  ku: [
    "چۆن یاری دروست بکەم؟",
    "مەرجی هەفتەی خۆڕایی چییە؟",
    "پاکێجەکان چۆن کارا دەکرێن؟",
    "دروستکردنی ڕیکلامی هەرزان چۆنە؟"
  ],
  ar: [
    "كيف أنشئ لعبة؟",
    "ما هي شروط الفترة التجريبية؟",
    "كيف يتم تفعيل الباقات؟",
    "كيفية إنشاء إعلانات منخفضة التكلفة؟"
  ],
  en: [
    "How to create a game?",
    "What are the free trial rules?",
    "How to activate plans?",
    "How to build cheap ads?"
  ]
};

const UI_TEXTS = {
  ku: {
    heading: "ڕێپیشاندەری زیرەک",
    activeStatus: "چالاکە (ژیری دەستکرد)",
    quickTitle: "پرسیارە خێراکان:",
    placeholder: "پرسیارەکەت بنووسە...",
    userLabel: "من",
    fallbackText: "ببوورە، وەڵامەکە بەردەست نییە لە ئێستادا.",
    errorText: "ببوورە، هەڵەیەک لە تۆڕەکەدا هەیە. تکایە دووبارە هەوڵ بدەرەوە."
  },
  ar: {
    heading: "المساعد الذكي",
    activeStatus: "نشط (الذكاء الاصطناعي)",
    quickTitle: "الأسئلة السريعة:",
    placeholder: "اكتب سؤالك هنا...",
    userLabel: "أنا",
    fallbackText: "عذراً، الإجابة غير متوفرة حالياً.",
    errorText: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى."
  },
  en: {
    heading: "Smart Assistant",
    activeStatus: "Active (AI)",
    quickTitle: "Quick Prompts:",
    placeholder: "Type your question...",
    userLabel: "Me",
    fallbackText: "Sorry, the answer is currently unavailable.",
    errorText: "Sorry, a network error occurred. Please try again."
  }
};

export default function AICompanion({ lang = "ku" }: { lang?: "ku" | "ar" | "en" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize/reset welcome message on language change
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        text: WELCOME_MESSAGES[lang],
        timestamp: new Date().toLocaleTimeString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ"), { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  }, [lang]);

  const quickPrompts = QUICK_PROMPTS[lang];
  const ui = UI_TEXTS[lang];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString() + "-user",
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ"), { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Map history format expected by Express server
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history: chatHistory, lang })
      });

      const data = await res.json();
      
      const modelMsg: ChatMessage = {
        id: Date.now().toString() + "-model",
        role: "model",
        text: data.text || ui.fallbackText,
        timestamp: new Date().toLocaleTimeString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ"), { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Date.now().toString() + "-error",
        role: "model",
        text: ui.errorText,
        timestamp: new Date().toLocaleTimeString(lang === "en" ? "en-US" : (lang === "ar" ? "ar-IQ" : "ku-IQ"), { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const isRtl = lang !== "en";

  return (
    <div 
      className={`fixed bottom-6 ${isRtl ? "left-6" : "right-6"} z-40 font-sans ${isRtl ? "text-right" : "text-left"}`} 
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Floating Chat Head Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 cursor-pointer relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircle size={24} />
              <span className={`absolute -top-1 ${isRtl ? "-right-1" : "-left-1"} flex h-3 w-3`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`absolute bottom-16 ${isRtl ? "left-0" : "right-0"} w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-500">
                  <Bot size={20} />
                </div>
                <div className={isRtl ? "text-right" : "text-left"}>
                  <h3 className="text-sm font-extrabold text-white">{ui.heading}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-medium">{ui.activeStatus}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white" 
                      : "bg-amber-500 text-slate-950 font-bold"
                  }`}>
                    {msg.role === "user" ? ui.userLabel : "SAS"}
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/50"
                  }`}>
                    <div className={`whitespace-pre-line ${isRtl ? "text-right" : "text-left"}`}>{msg.text}</div>
                    <span className={`block text-[9px] text-slate-400/80 mt-1.5 ${isRtl ? "text-left" : "text-right"}`}>{msg.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">SAS</div>
                  <div className="bg-slate-800 text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 text-sm border border-slate-700/50">
                    <div className="flex gap-1 items-center py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts removed as per user request to keep the chat clean and directly input-based */}

            {/* Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={ui.placeholder}
                className={`flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500 ${isRtl ? "text-right" : "text-left"}`}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-2xl flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <Send size={16} className={isRtl ? "-rotate-90" : "rotate-90"} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
