import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, GenerateVideosOperation } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    console.warn("GEMINI_API_KEY is not configured or holds placeholder. Fallback mode is active.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Global System Prompt for the AI Assistant / Guide
const ASSISTANT_SYSTEM_INSTRUCTION = `
You are the SAS-Platform AI Guide (ڕێپیشاندەری زیرەکی SAS-Platform).
You are an expert in no-code development, AI assistance, 3D games, web design, and digital marketing.
You must speak in fluent, beautiful, and professional Sorani Kurdish (سۆرانی). Keep your tone friendly, helpful, and technically expert.
Always encourage the user and guide them on how to use SAS-Platform to create apps, websites, 3D games, and digital ads.

Key info about SAS-Platform:
- Name: SAS-Platform
- Purpose: A Kurdish No-Code Creator where users can generate mobile apps, responsive websites, and 3D canvas games simply by typing prompts.
- Token Allowance: Every user gets 1,000,000 tokens (یەک ملیۆن تۆکن) monthly as a gift (similar to Bolt.com).
- Free Trial: 1 week free. During this week, users can build 1 App for free. If they don't buy a subscription, the platform retains ownership of the app and can sell it in the Store, but if they subscribe later, they get their app back!
- Rules Agreement: Users must read and agree to the Kurdish subscription rules (ڕێساکانی بەشداربوون) before registering or creating their first app.
- Subscriptions/Packages (دوو پاکێجی سەرەکی):
  1. Package A (پاکێجی ئاسایی): 30,000 IQD/month. Allows creating 1 3D Game OR 1 Website OR 10 Apps. Can be upgraded/renewed.
  2. Package B (پاکێجی پێشکەوتوو): 100,000 IQD/month. Allows creating 2 3D Games AND 2 Websites AND 10 Apps.
- Payment Methods: Only FIB (First Iraqi Bank) and FastPay are supported.
- Invoice WhatsApp Approval: After choosing a plan, users send their payment invoice to the admin's WhatsApp. Once the admin approves it on WhatsApp, their service is instantly activated.
- Ad Builder (بەشی دروستکردنی ڕیکلام): Lets users generate ads for TikTok, Instagram, and Facebook for an extremely cheap price. Each ad features a prominent 'Created on SAS-Platform' watermark and lists the item for sale in the platform store.
- Free Advertising Advisory (Jasper & Clipdrop): 
  - If the user (especially our beloved 63-year-old uncle / مامە گیان) asks about using Jasper or Clipdrop for free advertising, explain clearly:
    1. Clipdrop is 100% free for background removal, relighting, and uncropping (extending margins for TikTok/Facebook sizes).
    2. Jasper has a 7-day free trial for drafting marketing text/captions. Advise them to register with different email addresses to reuse trials, or use our platform's built-in AI Guide for free unlimited copywriting!
  - Be extremely warm, loyal, and deeply respectful (such as 'مامە گیانی بەڕێزم').
`;

// Reusable Dual-Model Fallback Text Generation Helper
// Primary: Tencent Hy3 (via OpenRouter)
// Backup/Local: Ollama local instance
// Ultimate Fallback: Google Gemini
// Mock Fallback: Friendly context-aware responses on complete failure
async function generateTextDualModel(
  prompt: string,
  history: { role: string; text: string }[] = [],
  systemInstruction: string = "",
  useSearch: boolean = false,
  lang: string = "ku"
): Promise<{ text: string; source: "openrouter" | "ollama" | "gemini" | "mock"; groundingMetadata?: any }> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || "tencent/hunyuan-pro";
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3";

  // Prepare standard OpenAI/OpenRouter chat messages structure
  const messages: any[] = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  if (history && history.length > 0) {
    history.forEach((h) => {
      messages.push({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text,
      });
    });
  }
  messages.push({ role: "user", content: prompt });

  // 1. Primary: Try Tencent Hy3 (OpenRouter)
  if (openRouterKey && openRouterKey !== "MY_OPENROUTER_API_KEY" && openRouterKey.trim() !== "") {
    try {
      console.log(`[Dual-Model] Routing primary to OpenRouter (${openRouterModel})...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://sas-solutions.com",
          "X-Title": "SAS SOLUTIONS"
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: messages,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json() as any;
        const text = data.choices?.[0]?.message?.content;
        if (text && text.trim() !== "") {
          console.log("[Dual-Model] OpenRouter primary response successful.");
          return { text, source: "openrouter" };
        }
      }
      console.warn(`[Dual-Model] OpenRouter response not OK: ${res.status}`);
    } catch (err: any) {
      console.warn("[Dual-Model] OpenRouter primary failed or timed out:", err.message || err);
    }
  } else {
    console.log("[Dual-Model] OpenRouter is not configured. Skipping primary model.");
  }

  // 2. Backup/Local: Try Ollama local instance
  try {
    console.log(`[Dual-Model] Falling back to local Ollama (${ollamaModel}) at ${ollamaBaseUrl}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    const res = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: ollamaModel,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
        }
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json() as any;
      const text = data.message?.content || data.response;
      if (text && text.trim() !== "") {
        console.log("[Dual-Model] Local Ollama fallback successful.");
        return { text, source: "ollama" };
      }
    }
    console.warn(`[Dual-Model] Local Ollama response not OK: ${res.status}`);
  } catch (err: any) {
    console.warn("[Dual-Model] Local Ollama fallback failed or timed out:", err.message || err);
  }

  // 3. Ultimate Fallback: Gemini (Our existing core AI logic)
  try {
    console.log("[Dual-Model] Both primary and local backup failed. Invoking Gemini ultimate fallback...");
    const ai = getGemini();
    if (ai) {
      const formattedContents: any[] = [];
      if (history && history.length > 0) {
        history.forEach((h: any) => {
          formattedContents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
      }
      formattedContents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const config: any = {
        systemInstruction,
        temperature: 0.7,
      };

      if (useSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config,
      });

      if (response.text) {
        console.log("[Dual-Model] Gemini ultimate backup successful.");
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        return { text: response.text, source: "gemini", groundingMetadata };
      }
    }
  } catch (err: any) {
    console.error("[Dual-Model] Gemini ultimate fallback also failed:", err.message || err);
  }

  // 4. Mock fallback - prevent client crash at all costs, keeping all local features preserved
  console.log("[Dual-Model] All active AI models failed. Returning friendly offline mock response.");
  const mockResponses: Record<string, string[]> = {
    ku: [
      "سڵاو! من ڕێپیشاندەری زیرەکی SAS-Platform-م. چۆن دەتوانم یارمەتیت بدەم لە دروستکردنی ئەپ، یاری، یان ماڵپەڕی بێ کۆد؟",
      "بە دڵنیاییەوە! لە پلاتفۆرمی ساس دەتوانیت بە تەنها نووسینی بیرۆکەکەت (پرۆمپت) بەرهەمی ناوازە دروست بکەیت. پاکێجەکانمان گونجاون و دەتوانیت لە ڕێگەی FIB یان FastPay پارە بدەیت.",
      "بیرت نەچێت کە مانگانە ١,٠٠٠,٠00 تۆکنی بێ بەرامبەر وەردەگریت بۆ پەرەپێدانی پڕۆژەکانت! هەروەها هەفتەی یەکەم بە خۆڕاییە.",
      "بۆ دەستپێکردن، پێویستە سەرەتا ڕێساکان بخوێنیتەوە و ڕازی بیر. پاشان پرۆمپتی بیرۆکەکەت بنووسە بۆ ئەوەی پلاتفۆرمەکە لە چەند چرکەیەکدا بۆت دروست بکات.",
      "ڕیکلامە دروستکراوەکانی پلاتفۆرمی ساس نیشانەی ئاوی 'Created on SAS-Platform' لەسەرە و دەتوانیت ڕاستەوخۆ بیبەیتە دەرەوە بۆ تیکتۆک، فەیسبووک و ئینستاگرام بۆ زیاتر فرۆشتنی بەرهەمەکەت."
    ],
    ar: [
      "مرحباً! أنا الدليل الذكي لمنصة SAS-Platform. كيف يمكنني مساعدتك في إنشاء تطبيق، لعبة، أو موقع ويب بدون كود؟",
      "بالتأكيد! في منصة SAS، يمكنك ببساطة كتابة فكرتك (Prompt) وسنقوم بإنشاء منتج مذهل لك. باقاتنا مناسبة ويمكنك الدفع عبر FIB أو FastPay.",
      "تذكر أنه يمكنك الحصول على 1,000,000 رمز (Tokens) مجاناً شهرياً لتطوير مشاريعك! كما أن الأسبوع الأول مجاني تماماً.",
      "للبدء، يجب عليك أولاً قراءة الشروط والموافقة عليها. ثم اكتب فكرة مشروعك لتقوم المنصة ببنائه لك في ثوانٍ معدودة.",
      "تحمل الإعلانات التي تم إنشاؤها في SAS علامة مائية 'Created on SAS-Platform' ويمكنك تصديرها مباشرة لـ TikTok و Facebook و Instagram لزيادة المبيعات."
    ],
    en: [
      "Hello! I am the SAS-Platform AI Guide. How can I help you create no-code apps, games, or websites?",
      "Absolutely! On SAS-Platform, you can generate stunning products just by typing your idea (prompt). Our plans are flexible and you can pay via FIB or FastPay.",
      "Don't forget you get 1,000,000 free tokens monthly to develop your projects! Also, the first week is completely free.",
      "To start, you need to read and agree to the rules. Then write your idea prompt to let the platform build it for you in seconds.",
      "Ads generated on SAS feature a 'Created on SAS-Platform' watermark, and you can export them directly to TikTok, Facebook, or Instagram to increase sales."
    ]
  };
  const list = mockResponses[lang] || mockResponses.ku;
  const randomIndex = Math.floor(Math.random() * list.length);
  return { text: list[randomIndex], source: "mock" };
}

// API Route: AI Assistant Chat (Using Dual-Model Fallback Engine)
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history, lang = "ku", useSearch = false } = req.body;
  if (!message) {
    return res.status(400).json({ error: lang === "ar" ? "الرسالة فارغة" : (lang === "en" ? "Message is empty" : "پەیامەکە خاڵییە") });
  }

  try {
    let dynamicInstruction = ASSISTANT_SYSTEM_INSTRUCTION;
    if (lang === "ar") {
      dynamicInstruction += "\n\nCRITICAL REQUIREMENT: The user has selected Arabic. You must speak and answer ONLY in beautiful, fluent, and grammatically correct Arabic! Keep proper alignment and formatting.";
    } else if (lang === "en") {
      dynamicInstruction += "\n\nCRITICAL REQUIREMENT: The user has selected English. You must speak and answer ONLY in professional, fluent, and clear English!";
    } else {
      dynamicInstruction += "\n\nCRITICAL REQUIREMENT: The user has selected Kurdish. You must speak and answer ONLY in beautiful, fluent, and correct Sorani Kurdish!";
    }

    // Call the newly defined dual-model fallback system
    const result = await generateTextDualModel(message, history, dynamicInstruction, useSearch, lang);
    return res.json({ text: result.text, source: result.source, groundingMetadata: result.groundingMetadata });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return res.status(500).json({ error: lang === "ar" ? "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي" : (lang === "en" ? "An error occurred connecting to AI" : "هەڵەیەک ڕوویدا لە پەیوەندی کردن بە ژیری دەستکرد") });
  }
});

// API Route: No-Code Product Generator
app.post("/api/gemini/generate-product", async (req, res) => {
  const { prompt, type, lang = "ku" } = req.body; // type: "app" | "website" | "3d-game"
  if (!prompt) {
    return res.status(400).json({ error: lang === "ar" ? "يرجى كتابة فكرتك" : (lang === "en" ? "Please write your idea" : "تکایە بیرۆکەکەت بنووسە") });
  }

  const ai = getGemini();

  // Return realistic simulated products if key is missing or on failure
  const getMockProduct = () => {
    if (type === "3d-game") {
      return {
        name: "یاری ٣ ڕەهەندی: ڕاونەرە گەردوونییەکە (Cosmic Runner 3D)",
        description: "یارییەکی سێ ڕەهەندی ناوازە کە لە ڕێگەی لۆکاڵ ستاڕێجەوە سۆفت سکۆرەکان تۆمار دەکات و دەتوانیت یاری پێبکەیت.",
        features: ["بزوێنەری گرافیکی ٣ ڕەهەندی", "کۆنترۆڵی ئاسان بە کیبۆرد و لێدان", "بەشی تۆمارکردنی خاڵە بەرزەکان"],
        accentColor: "#f59e0b",
        html: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; overflow: hidden; background: #0f172a; font-family: sans-serif; color: white; text-align: center; }
    canvas { display: block; margin: 0 auto; background: radial-gradient(circle, #1e1b4b, #09090b); }
  </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-4">
  <div class="absolute top-4 left-4 text-left z-10 bg-slate-900/80 p-3 rounded-lg border border-amber-500/30">
    <h2 class="text-lg font-bold text-amber-400">Cosmic Runner 3D</h2>
    <p class="text-xs text-slate-400">جوڵە: کلیلەکانی چەپ/ڕاست یان دوگمەکانی سەر شاشە</p>
    <p class="text-sm font-bold mt-1 text-white">Score: <span id="score">0</span></p>
  </div>
  
  <canvas id="gameCanvas" width="600" height="400" class="rounded-xl border-2 border-slate-700 shadow-2xl max-w-full"></canvas>
  
  <div class="mt-4 flex gap-4 z-10">
    <button onclick="moveLeft()" class="bg-slate-800 hover:bg-slate-700 active:scale-95 px-6 py-3 rounded-xl border border-slate-600 font-bold text-lg select-none">◀ چەپ</button>
    <button onclick="restartGame()" class="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 px-6 py-3 rounded-xl font-bold text-lg">دووبارە دەستپێکردنەوە</button>
    <button onclick="moveRight()" class="bg-slate-800 hover:bg-slate-700 active:scale-95 px-6 py-3 rounded-xl border border-slate-600 font-bold text-lg select-none">ڕاست ▶</button>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    let playerX = 300;
    let playerY = 320;
    let playerWidth = 40;
    let playerHeight = 40;
    let obstacles = [];
    let score = 0;
    let gameOver = false;
    let speed = 4;
    
    // Starfield for 3D depth simulation
    let stars = [];
    for(let i=0; i<50; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width
      });
    }

    function spawnObstacle() {
      if (gameOver) return;
      const x = Math.random() * (canvas.width - 50);
      obstacles.push({
        x: x,
        y: 0,
        width: 30 + Math.random() * 30,
        height: 15,
        color: 'hsl(' + (Math.random() * 360) + ', 80%, 60%)'
      });
    }
    
    setInterval(spawnObstacle, 1500);

    function drawStars() {
      stars.forEach(star => {
        star.z -= speed;
        if(star.z <= 0) {
          star.z = canvas.width;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }
        
        // Perspective calculation
        const k = 128 / star.z;
        const px = (star.x - canvas.width/2) * k + canvas.width/2;
        const py = (star.y - canvas.height/2) * k + canvas.height/2;
        const size = (1 - star.z / canvas.width) * 4;
        
        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          ctx.fillStyle = 'rgba(255, 255, 255, ' + (1 - star.z / canvas.width) + ')';
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    function update() {
      if (gameOver) return;
      
      score += 1;
      document.getElementById('score').innerText = score;
      if (score % 300 === 0) speed += 0.5;

      obstacles.forEach((obs, index) => {
        obs.y += speed;
        
        // Collision
        if (obs.y + obs.height >= playerY && obs.y <= playerY + playerHeight) {
          if (playerX + playerWidth > obs.x && playerX < obs.x + obs.width) {
            gameOver = true;
          }
        }
        
        if (obs.y > canvas.height) {
          obstacles.splice(index, 1);
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw simulated 3D space lanes
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 0); ctx.lineTo(10, canvas.height);
      ctx.moveTo(canvas.width - 50, 0); ctx.lineTo(canvas.width - 10, canvas.height);
      ctx.stroke();

      drawStars();

      // Draw obstacles with pseudo-3D glow
      obstacles.forEach(obs => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = obs.color;
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowBlur = 0;
      });

      // Draw Player ship
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(playerX + playerWidth/2, playerY);
      ctx.lineTo(playerX, playerY + playerHeight);
      ctx.lineTo(playerX + playerWidth, playerY + playerHeight);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Game Over Screen
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 36px Arial';
        ctx.fillText('Game Over!', canvas.width/2 - 90, canvas.height/2 - 20);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('کۆی خاڵەکانت: ' + score, canvas.width/2 - 60, canvas.height/2 + 20);
      }
    }

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    function moveLeft() {
      if (playerX > 20) playerX -= 30;
    }
    
    function moveRight() {
      if (playerX < canvas.width - playerWidth - 20) playerX += 30;
    }

    function restartGame() {
      playerX = 300;
      obstacles = [];
      score = 0;
      gameOver = false;
      speed = 4;
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') moveLeft();
      if (e.key === 'ArrowRight') moveRight();
    });

    gameLoop();
  </script>
</body>
</html>`
      };
    } else if (type === "website") {
      return {
        name: `ماڵپەڕی پرۆفیشناڵ: ${prompt.slice(0, 30)}...`,
        description: "ماڵپەڕێکی مۆدێرن و ڕیسپۆنسیڤ بە ستایلی مۆدێرن و کارلێککار",
        features: ["ڕیسپۆنسیڤ بۆ مۆبایل و دیسکتۆپ", "سیستەمی فلتەری داینامیکی", "کۆنتڕۆڵی فۆڕمی پەیوەندی"],
        accentColor: "#3b82f6",
        html: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
  <!-- Nav -->
  <nav class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
    <div class="text-xl font-extrabold text-blue-500 tracking-wider">CREATIVE STUDIO</div>
    <div class="flex gap-6 text-sm font-semibold">
      <a href="#" class="hover:text-blue-400">سەرەکی</a>
      <a href="#services" class="hover:text-blue-400">خزمەتگوزارییەکان</a>
      <a href="#portfolio" class="hover:text-blue-400">بەرهەمەکان</a>
      <a href="#contact" class="hover:text-blue-400">پەیوەندی</a>
    </div>
  </nav>

  <!-- Hero -->
  <section class="max-w-6xl mx-auto px-6 py-16 text-center">
    <span class="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-3 py-1.5 rounded-full font-semibold uppercase tracking-wider">پێشەنگ لە تەکنەلۆژیا</span>
    <h1 class="text-4xl md:text-6xl font-black mt-6 tracking-tight leading-none text-white max-w-4xl mx-auto">${prompt}</h1>
    <p class="text-slate-400 text-lg mt-6 max-w-2xl mx-auto">ماڵپەڕێکی مۆدێرن و داهێنەرانە کە بە هاوکاری ژیری دەستکردی SAS-Platform دروستکراوە بە بێ کۆدکردن.</p>
    <div class="mt-8 flex justify-center gap-4">
      <a href="#contact" class="bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition">پەیوەندیمان پێوە بکە</a>
      <a href="#portfolio" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-8 py-3.5 rounded-xl font-bold text-slate-200 transition">پڕۆژەکانمان</a>
    </div>
  </section>

  <!-- Stats Grid -->
  <section id="services" class="max-w-6xl mx-auto px-6 py-12 border-t border-slate-800">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="bg-slate-950 p-8 rounded-2xl border border-slate-800/80 hover:border-blue-500/30 transition">
        <i class="fa-solid class='fa-rocket' text-3xl text-blue-500 mb-4"></i>
        <h3 class="text-xl font-bold text-white">خێرایی بێ وێنە</h3>
        <p class="text-slate-400 mt-2 text-sm leading-relaxed">ئۆپتیمایزکراو بە باشترین کوالیتی بۆ ئەوەی خێراترین ئەزموونی گەڕان پێشکەش بە بەکارهێنەر بکات.</p>
      </div>
      <div class="bg-slate-950 p-8 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition">
        <i class="fa-solid class='fa-shield-halved' text-3xl text-emerald-500 mb-4"></i>
        <h3 class="text-xl font-bold text-white">ئاسایشی زۆر بەرز</h3>
        <p class="text-slate-400 mt-2 text-sm leading-relaxed">پاراستنی زانیاری بەکارهێنەران و سیستەمی بێ کەموکوڕی بە دژی هێرشە دەرەکییەکان.</p>
      </div>
      <div class="bg-slate-950 p-8 rounded-2xl border border-slate-800/80 hover:border-amber-500/30 transition">
        <i class="fa-solid class='fa-palette' text-3xl text-amber-500 mb-4"></i>
        <h3 class="text-xl font-bold text-white">دیزاینی مۆدێرن</h3>
        <p class="text-slate-400 mt-2 text-sm leading-relaxed">ڕوکارێکی ڕازاوە و گونجاو بۆ هەموو جۆرە مۆبایل و کۆمپیوتەرێک بەبێ جیاوازی.</p>
      </div>
    </div>
  </section>

  <!-- Interactive Demo Area -->
  <section id="portfolio" class="bg-slate-950/40 border-y border-slate-800 py-16">
    <div class="max-w-4xl mx-auto text-center px-6">
      <h2 class="text-3xl font-extrabold text-white">کارلێکی ناو ماڵپەڕ</h2>
      <p class="text-slate-400 mt-2">تاقیکردنەوەی خزمەتگوزاری فلتەرکردنی بەرهەمەکان بە شێوەی ڕاستەوخۆ</p>
      
      <div class="flex justify-center gap-3 mt-8">
        <button onclick="filterType('all')" class="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm" id="btn-all">هەمووی</button>
        <button onclick="filterType('digital')" class="bg-slate-800 text-slate-300 px-5 py-2 rounded-full font-bold text-sm" id="btn-digital">دیجیتاڵی</button>
        <button onclick="filterType('physical')" class="bg-slate-800 text-slate-300 px-5 py-2 rounded-full font-bold text-sm" id="btn-physical">فیزیکی</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left" id="itemGrid">
        <div class="bg-slate-900 p-6 rounded-xl border border-slate-800" data-category="digital">
          <span class="text-xs font-bold text-blue-400 uppercase">دیجیتاڵی</span>
          <h4 class="text-lg font-bold text-white mt-1">ئەپلیکەیشنی مۆبایل</h4>
          <p class="text-slate-400 text-xs mt-2">دروستکردنی سیستەم و فرۆشتنی سەر شاشە.</p>
        </div>
        <div class="bg-slate-900 p-6 rounded-xl border border-slate-800" data-category="physical">
          <span class="text-xs font-bold text-amber-400 uppercase">فیزیکی</span>
          <h4 class="text-lg font-bold text-white mt-1">پاکێجی بەرهەمەکان</h4>
          <p class="text-slate-400 text-xs mt-2">دیزاینی ناوازەی کارتۆن و پاکێجی بازرگانی.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="text-center py-12 text-xs text-slate-500 border-t border-slate-800">
    <p>© 2026 Creative Studio. دروستکراوە لە ڕێگەی SAS-Platform. هەموو مافەکان پارێزراون.</p>
  </footer>

  <script>
    function filterType(category) {
      const items = document.querySelectorAll('#itemGrid > div');
      const buttons = ['all', 'digital', 'physical'];
      
      buttons.forEach(btn => {
        const el = document.getElementById('btn-' + btn);
        if (btn === category) {
          el.className = "bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm";
        } else {
          el.className = "bg-slate-800 text-slate-300 px-5 py-2 rounded-full font-bold text-sm";
        }
      });

      items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`
      };
    } else {
      return {
        name: `ئەپەکەت: ${prompt.slice(0, 30)}...`,
        description: "ئەپلیکەیشنێکی زیرەکی بێ کۆد کە لەسەر مۆبایل و تابلێت ڕاستەوخۆ کار دەکات.",
        features: ["بەکارهێنانی لۆکاڵ ستاڕێج بۆ زانیارییەکان", "گەڕان و چاکسازی خێرا", "سیستەمی شیکاری ژمارەکان"],
        accentColor: "#10b981",
        html: `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen font-sans flex flex-col justify-between">
  <!-- Header -->
  <header class="bg-emerald-600 p-4 text-center rounded-b-2xl shadow-lg">
    <h1 class="text-xl font-extrabold text-white tracking-wide flex items-center justify-center gap-2">
      <i class="fa-solid class='fa-cube'"></i> ${prompt.slice(0, 30)}
    </h1>
    <p class="text-xs text-emerald-100 mt-1">ئۆفلاین و ئامادەکراو لە پلاتفۆرمی ساس</p>
  </header>

  <!-- App Body -->
  <main class="flex-1 p-6 max-w-md mx-auto w-full">
    <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
      <h3 class="text-md font-bold text-slate-300 mb-4">زیادکردنی تۆمار یان زانیاری</h3>
      <div class="flex gap-2">
        <input type="text" id="todoInput" placeholder="زانیاری بنووسە..." class="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white flex-1 focus:outline-none focus:border-emerald-500">
        <button onclick="addItem()" class="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 p-3 rounded-xl font-extrabold transition">
          <i class="fa-solid class='fa-plus'"></i>
        </button>
      </div>

      <div class="mt-6">
        <h4 class="text-sm font-semibold text-slate-400 mb-3">لیستی زانیارییە تۆمارکراوەکان</h4>
        <ul id="itemList" class="space-y-2.5">
          <li class="bg-slate-900 px-4 py-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-sm">
            <span>تۆماری تاقیکاری یەکەم</span>
            <button onclick="this.parentElement.remove()" class="text-rose-500 hover:text-rose-400"><i class="fa-solid class='fa-trash-can'"></i></button>
          </li>
        </ul>
      </div>
    </div>
  </main>

  <!-- Footer Navigation -->
  <footer class="bg-slate-950 border-t border-slate-800 p-4 flex justify-around text-xs font-semibold text-slate-400">
    <button class="flex flex-col items-center gap-1 text-emerald-400"><i class="fa-solid class='fa-house' text-lg"></i>ماڵەوە</button>
    <button class="flex flex-col items-center gap-1 hover:text-white"><i class="fa-solid class='fa-chart-pie' text-lg"></i>ڕاپۆرت</button>
    <button class="flex flex-col items-center gap-1 hover:text-white"><i class="fa-solid class='fa-circle-info' text-lg"></i>زانیاری</button>
  </footer>

  <script>
    function addItem() {
      const input = document.getElementById('todoInput');
      const val = input.value.trim();
      if (!val) return;
      
      const list = document.getElementById('itemList');
      const li = document.createElement('li');
      li.className = "bg-slate-900 px-4 py-3 rounded-xl border border-slate-800/80 flex justify-between items-center text-sm animate-fade-in";
      li.innerHTML = "<span>" + val + "</span><button onclick='this.parentElement.remove()' class='text-rose-500 hover:text-rose-400'><i class='fa-solid class=\"fa-trash-can\"'></i></button>";
      list.appendChild(li);
      input.value = "";
    }
  </script>
</body>
</html>`
      };
    }
  };

  if (!ai) {
    return res.json(getMockProduct());
  }

  try {
    let targetLangName = "Sorani Kurdish";
    let targetInstructions = "Use Sorani Kurdish in all UI texts of the generated product! Also, the 'name', 'description', and 'features' fields of the JSON output MUST be in Sorani Kurdish.";

    if (lang === "ar") {
      targetLangName = "Arabic";
      targetInstructions = "Use Arabic in all UI texts of the generated product! Also, the 'name', 'description', and 'features' fields of the JSON output MUST be in Arabic.";
    } else if (lang === "en") {
      targetLangName = "English";
      targetInstructions = "Use English in all UI texts of the generated product! Also, the 'name', 'description', and 'features' fields of the JSON output MUST be in English.";
    }

    const SYSTEM_GENERATION_INSTRUCTION = `
You are the SAS-Platform No-Code compiler engine.
Your task is to take a user prompt and compile it into a fully interactive digital product based on the type specified.
You MUST output your response strictly as a JSON object with the following fields:
1. "name": (string) A catchy name for the product in ${targetLangName}.
2. "description": (string) A brief description of what this product does in ${targetLangName}.
3. "accentColor": (string) A hex color code representing the brand.
4. "features": (array of strings) 3-4 key features of the product in ${targetLangName}.
5. "html": (string) A fully self-contained HTML page representing the working app/website/game.

Guidelines for "html" field:
- It will be embedded inside an iframe, so include all necessary CSS and JS.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Use Lucide Icons or FontAwesome for iconography: <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
- Keep it visually beautiful, modern, dark or elegant light, matching the requested prompt.
- For "3d-game" type: It should simulate a 3D feel. You can do this by creating a Canvas with pseudo-3D graphics (starfields, roads, 3D block projections, camera scaling), or using high-quality 2D physics that play excellently. Ensure the user can play it using keyboard arrows and/or touchscreen button overlays!
- For "website" or "app": Include interactive Javascript features (e.g. adding items, filtering elements, responsive navigation tabs, forms with beautiful validation popups, charts or visual blocks).
- Ensure everything is fully self-contained without external assets (except standard CDN libraries). ${targetInstructions}
`;

    const userPrompt = `Type: "${type}". User Prompt: "${prompt}". Generate a high-quality product matching this prompt with ${targetLangName} text inside.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_GENERATION_INSTRUCTION,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            accentColor: { type: Type.STRING },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            html: { type: Type.STRING }
          },
          required: ["name", "description", "accentColor", "features", "html"]
        }
      }
    });

    const resultText = response.text;
    const parsed = JSON.parse(resultText);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Product Generation Error:", error);
    // Return mock fallback on error so the app continues gracefully
    return res.json(getMockProduct());
  }
});

// API Route: AI Advertisement Copy & Layout Generator
app.post("/api/gemini/generate-ad", async (req, res) => {
  const { productName, productDesc, targetPlatform, lang = "ku" } = req.body;
  if (!productName) {
    return res.status(400).json({ error: lang === "ar" ? "اسم المنتج وتفاصيله مطلوبة" : (lang === "en" ? "Product name and description are required" : "ناو و زانیاری بەرهەمەکە پێویستە") });
  }

  const ai = getGemini();

  if (!ai) {
    // Mock Ad Copy response depending on lang
    const mockResponses: Record<string, any> = {
      ku: {
        headline: `🚀 داهاتووی بازرگانی لێرەوە دەست پێدەکات لەگەڵ ${productName}!`,
        kurdishAdCopy: `دیزاینێکی ناوازە، کارایی سەرنجڕاکێش! بە هاوکاری پلاتفۆرمی نیشتمانیی SAS-Platform، کەمپینی ڕیکلامی خۆت بە کوالیتی بەرز دروست بکە.\n\n💥 تێچووی کەمپین: تەنها ٧,٥٠٠ دینار بۆ هەر ڕیکلامێک لەگەڵ لۆگۆی فەرمی SAS-Platform\n\n🛒 ئێستا لە کۆگای پلاتفۆرمی SAS کڕین ئەنجام بدە.`,
        suggestedVisualPrompt: "A sleek modern holographic workspace with neon orange glowing UI interfaces, dynamic curves and SAS-Platform logo watermark.",
        pricingHighlight: "٧,٥٠٠ دینار بۆ هەر ڕیکلامێک",
        badgeText: "Created on SAS-Platform"
      },
      ar: {
        headline: `🚀 مستقبل التجارة يبدأ من هنا مع ${productName}!`,
        kurdishAdCopy: `تصميم فريد، وأداء مذهل! بالتعاون مع منصة SAS-Platform الوطنية، صمم حملتك الإعلانية بجودة عالية.\n\n💥 تكلفة الحملة: ٧,٥٠٠ دينار فقط لكل إعلان مع الشعار الرسمي لـ SAS-Platform\n\n🛒 اشترِ الآن مباشرة من متجر منصة SAS.`,
        suggestedVisualPrompt: "A sleek modern holographic workspace with neon orange glowing UI interfaces, dynamic curves and SAS-Platform logo watermark.",
        pricingHighlight: "٧,٥٠٠ د.ع لكل إعلان",
        badgeText: "Created on SAS-Platform"
      },
      en: {
        headline: `🚀 The Future of Business Starts Here with ${productName}!`,
        kurdishAdCopy: `Unique design, stunning performance! In collaboration with the national SAS-Platform, build your high-quality ad campaign.\n\n💥 Campaign cost: Only 7,500 IQD per ad with the official SAS-Platform watermark.\n\n🛒 Shop now directly from the SAS Platform store.`,
        suggestedVisualPrompt: "A sleek modern holographic workspace with neon orange glowing UI interfaces, dynamic curves and SAS-Platform logo watermark.",
        pricingHighlight: "7,500 IQD per ad",
        badgeText: "Created on SAS-Platform"
      }
    };
    return res.json(mockResponses[lang] || mockResponses.ku);
  }

  try {
    let targetLangName = "Sorani Kurdish";
    let targetPriceText = "٧,٥٠٠ دینار";
    let targetLangInstructions = `Generate an ad copy in Sorani Kurdish for the product named "${productName}" (Description: "${productDesc}").
The target platform is: ${targetPlatform} (e.g. TikTok, Instagram, Facebook).

IMPORTANT REQUIREMENTS:
1. The price for each ad is strictly 7,500 IQD (٧,٥٠٠ دینار). NEVER mention that ads are free or that there are free tokens.
2. The platform name "SAS-Platform" MUST be prominently featured on the ad copy.
3. Keep the content premium, direct, and professional.

You must output a JSON object with:
1. "headline": A killer catchy headline in Sorani Kurdish.
2. "kurdishAdCopy": A highly professional, persuasive Kurdish ad copy body with emojis, hashtags, call to action. Mention that this was built using SAS-Platform and can be bought in the SAS Store! Make sure to include the price "٧,٥٠٠ دینار".
3. "suggestedVisualPrompt": A short description of a great visual background pattern in English.
4. "pricingHighlight": Highlight of the price, strictly set to "٧,٥٠٠ دینار".
5. "badgeText": Watermark text, which MUST contain "SAS-Platform".`;

    if (lang === "ar") {
      targetLangName = "Arabic";
      targetPriceText = "٧,٥٠٠ د.ع";
      targetLangInstructions = `Generate an ad copy in Arabic for the product named "${productName}" (Description: "${productDesc}").
The target platform is: ${targetPlatform} (e.g. TikTok, Instagram, Facebook).

IMPORTANT REQUIREMENTS:
1. The price for each ad is strictly 7,500 IQD (٧,٥٠٠ د.ع). NEVER mention that ads are free or that there are free tokens.
2. The platform name "SAS-Platform" MUST be prominently featured on the ad copy.
3. Keep the content premium, direct, and professional.

You must output a JSON object with:
1. "headline": A killer catchy headline in Arabic.
2. "kurdishAdCopy": A highly professional, persuasive Arabic ad copy body with emojis, hashtags, call to action. Mention that this was built using SAS-Platform and can be bought in the SAS Store! Make sure to include the price "٧,٥٠٠ د.ع".
3. "suggestedVisualPrompt": A short description of a great visual background pattern in English.
4. "pricingHighlight": Highlight of the price, strictly set to "٧,٥٠٠ د.ع".
5. "badgeText": Watermark text, which MUST contain "SAS-Platform".`;
    } else if (lang === "en") {
      targetLangName = "English";
      targetPriceText = "7,500 IQD";
      targetLangInstructions = `Generate an ad copy in English for the product named "${productName}" (Description: "${productDesc}").
The target platform is: ${targetPlatform} (e.g. TikTok, Instagram, Facebook).

IMPORTANT REQUIREMENTS:
1. The price for each ad is strictly 7,500 IQD. NEVER mention that ads are free or that there are free tokens.
2. The platform name "SAS-Platform" MUST be prominently featured on the ad copy.
3. Keep the content premium, direct, and professional.

You must output a JSON object with:
1. "headline": A killer catchy headline in English.
2. "kurdishAdCopy": A highly professional, persuasive English ad copy body with emojis, hashtags, call to action. Mention that this was built using SAS-Platform and can be bought in the SAS Store! Make sure to include the price "7,500 IQD".
3. "suggestedVisualPrompt": A short description of a great visual background pattern in English.
4. "pricingHighlight": Highlight of the price, strictly set to "7,500 IQD".
5. "badgeText": Watermark text, which MUST contain "SAS-Platform".`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: targetLangInstructions,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            kurdishAdCopy: { type: Type.STRING },
            suggestedVisualPrompt: { type: Type.STRING },
            pricingHighlight: { type: Type.STRING },
            badgeText: { type: Type.STRING }
          },
          required: ["headline", "kurdishAdCopy", "suggestedVisualPrompt", "pricingHighlight", "badgeText"]
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Ad Generation Error:", error);
    return res.status(500).json({ error: lang === "ar" ? "فشل في إنشاء الإعلان" : (lang === "en" ? "Failed to generate advertisement" : "شکستی هێنا لە دروستکردنی ڕیکلامەکە") });
  }
});


// API Route: Sync and Push data to GitHub repository
app.post("/api/github/sync", async (req, res) => {
  const { token, repo, filePath, content } = req.body;

  if (!token || !repo || !content) {
    return res.status(400).json({ error: "تکایە کلیلی گیتھەب، ناوی کۆگا (Repository)، و ناوەڕۆکەکە بنێرە." });
  }

  const cleanRepo = repo.trim();
  const cleanPath = (filePath || "sas-data.json").trim();
  const url = `https://api.github.com/repos/${cleanRepo}/contents/${cleanPath}`;

  try {
    // 1. Check if file already exists to get its SHA (required for updating in GitHub API)
    let sha: string | undefined = undefined;
    try {
      const getRes = await fetch(url, {
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "User-Agent": "sas-platform-app",
        },
      });
      if (getRes.ok) {
        const getData = await getRes.json() as any;
        sha = getData.sha;
      }
    } catch (getErr) {
      console.warn("File check failed or does not exist yet:", getErr);
    }

    // 2. Commit and push the file content to GitHub repo
    const base64Content = Buffer.from(content).toString("base64");
    const commitBody = {
      message: "Sync SAS-Platform digital products and ads data",
      content: base64Content,
      sha: sha || undefined,
    };

    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "sas-platform-app",
      },
      body: JSON.stringify(commitBody),
    });

    if (putRes.ok) {
      const putData = await putRes.json() as any;
      return res.json({ 
        success: true, 
        message: "داتاکان بە سەرکەوتوویی هاوکات (Sync) کران و بۆ گیتھەب نێردران!",
        commitSha: putData.commit.sha,
        htmlUrl: putData.content.html_url
      });
    } else {
      const errorData = await putRes.json() as any;
      const errorMsg = errorData.message || "کێشەیەک لە پەیوەندی گیتھەب ڕوویدا";
      return res.status(putRes.status).json({ 
        error: `شکستی هێنا لە هاوکاتکردن: ${errorMsg}. دڵنیابەرەوە لە دروستی کلیلەکە و ناوی کۆگاکەت.` 
      });
    }
  } catch (error: any) {
    console.error("GitHub Sync Error:", error);
    return res.status(500).json({ error: "کێشەیەک لە سێرڤەر ڕوویدا لە کاتی پەیوەندیکردن بە گیتھەبەوە." });
  }
});


// Helper function to recursively list files in workspace
function getWorkspaceFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const relativePath = path.relative(process.cwd(), fullPath);

    // Filter ignored directories/files
    const parts = relativePath.split(path.sep);
    const isIgnored = parts.includes("node_modules") ||
      parts.includes("dist") ||
      parts.includes(".git") ||
      parts.includes(".aistudio") ||
      parts.includes(".cache") ||
      parts.includes("package-lock.json") ||
      parts.includes(".DS_Store") ||
      parts.includes(".env") ||
      parts.some(part => part.startsWith(".") && part !== ".gitignore" && part !== ".env.example");

    if (isIgnored) {
      return;
    }

    if (fs.statSync(fullPath).isDirectory()) {
      getWorkspaceFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(relativePath);
    }
  });

  return arrayOfFiles;
}

// API Route: Push all workspace files to a repository named SAS-Platform on GitHub
app.post("/api/github/push-all-workspace-files", async (req, res) => {
  const { token, repo } = req.body;

  if (!token) {
    return res.status(400).json({ error: "تکایە سەرەتا کلیلی دەسەڵاتی گیتھەب (GitHub Token) بنێرە." });
  }

  try {
    // 1. Get user profile from GitHub to find the owner username
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "sas-platform-app",
      },
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("GitHub user fetch failed:", errText);
      return res.status(401).json({ error: "کێشەیەک هەیە لە کلیلی گیتھەبەکەت یان ماوەکەی بەسەرچووە." });
    }

    const userData = await userRes.json() as any;
    const username = userData.login;
    
    let fullRepo = "";
    let repoName = "SAS-Platform";

    if (repo && repo.includes("/")) {
      fullRepo = repo.trim();
      repoName = repo.split("/")[1].trim();
    } else if (repo && repo.trim() !== "") {
      repoName = repo.trim();
      fullRepo = `${username}/${repoName}`;
    } else {
      fullRepo = `${username}/${repoName}`;
    }

    // 2. Check if the repository already exists
    let repoExists = false;
    let checkRes = await fetch(`https://api.github.com/repos/${fullRepo}`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "sas-platform-app",
      },
    });

    if (checkRes.ok) {
      repoExists = true;
    }

    // 3. If repo does not exist, create it (handles personal and organization repositories)
    if (!repoExists) {
      console.log(`Creating repository ${fullRepo} since it doesn't exist...`);
      const isOrg = fullRepo.includes("/") && fullRepo.split("/")[0] !== username;
      const orgName = isOrg ? fullRepo.split("/")[0] : null;
      
      const createUrl = orgName 
        ? `https://api.github.com/orgs/${orgName}/repos`
        : "https://api.github.com/user/repos";

      const createRes = await fetch(createUrl, {
        method: "POST",
        headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "User-Agent": "sas-platform-app",
        },
        body: JSON.stringify({
          name: repoName,
          description: "SAS-Platform Codebase - auto synced via SAS-Platform Kurds No-Code Creator",
          private: false,
          auto_init: true,
        }),
      });

      if (!createRes.ok) {
        const createErr = await createRes.json() as any;
        return res.status(createRes.status).json({
          error: `نەتوانرا کۆگای نوێ بە ناوی ${fullRepo} دروست بکرێت: ${createErr.message || "کێشەیەک ڕوویدا"}`
        });
      }

      // Wait 2.5 seconds for GitHub to fully initialize the repository and the default branch
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    // 4. Fetch the default branch name and latest commit SHA
    checkRes = await fetch(`https://api.github.com/repos/${fullRepo}`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "sas-platform-app",
      },
    });

    if (!checkRes.ok) {
      return res.status(checkRes.status).json({ error: "کێشەیەک لە خوێندنەوەی زانیارییەکانی کۆگاکەدا ڕوویدا لە گیتھەب." });
    }

    const repoInfo = await checkRes.json() as any;
    const defaultBranch = repoInfo.default_branch || "main";

    // Get the latest commit of the default branch
    const branchRes = await fetch(`https://api.github.com/repos/${fullRepo}/branches/${defaultBranch}`, {
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "sas-platform-app",
      },
    });

    let parentCommitSha: string | undefined = undefined;
    let baseTreeSha: string | undefined = undefined;
    let isInitialCommit = false;

    if (branchRes.ok) {
      const branchData = await branchRes.json() as any;
      parentCommitSha = branchData.commit.sha;
      baseTreeSha = branchData.commit.commit.tree.sha;
    } else {
      console.log(`Branch ${defaultBranch} not found (status ${branchRes.status}). Treating as initial commit / brand new branch.`);
      isInitialCommit = true;
    }

    // 5. Write sas-manifest.json to workspace and then read all files
    if (req.body.manifestData) {
      try {
        fs.writeFileSync(
          path.join(process.cwd(), "sas-manifest.json"),
          JSON.stringify(req.body.manifestData, null, 2),
          "utf-8"
        );
        console.log("Successfully generated sas-manifest.json in workspace before pushing.");
      } catch (writeErr) {
        console.error("Could not write sas-manifest.json:", writeErr);
      }
    }

    const relativePaths = getWorkspaceFiles(process.cwd());
    const treeItems = [];

    for (const relPath of relativePaths) {
      try {
        const fileContent = fs.readFileSync(path.join(process.cwd(), relPath), "utf-8");
        treeItems.push({
          path: relPath,
          mode: "100644",
          type: "blob",
          content: fileContent,
        });
      } catch (readErr) {
        console.warn(`Could not read file for syncing: ${relPath}`, readErr);
      }
    }

    if (treeItems.length === 0) {
      return res.status(400).json({ error: "هیچ فایلێک نەدۆزرایەوە بۆ هاوکاتکردن لەگەڵ گیتھەبدا." });
    }

    // 6. Create Git Tree on GitHub
    const treeBody: any = {
      tree: treeItems
    };
    if (baseTreeSha) {
      treeBody.base_tree = baseTreeSha;
    }

    const treeRes = await fetch(`https://api.github.com/repos/${fullRepo}/git/trees`, {
      method: "POST",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "sas-platform-app",
      },
      body: JSON.stringify(treeBody),
    });

    if (!treeRes.ok) {
      const treeErr = await treeRes.json() as any;
      return res.status(treeRes.status).json({
        error: `کێشەیەک لە دروستکردنی درەختی فایلەکان (Git Tree) ڕوویدا: ${treeErr.message}`
      });
    }

    const treeData = await treeRes.json() as any;
    const newTreeSha = treeData.sha;

    // 7. Create Git Commit on GitHub
    const commitBody: any = {
      message: "🚀 Auto Synced all workspace files via SAS-Platform Kurds No-Code Creator",
      tree: newTreeSha,
      parents: parentCommitSha ? [parentCommitSha] : [],
    };

    const commitRes = await fetch(`https://api.github.com/repos/${fullRepo}/git/commits`, {
      method: "POST",
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "sas-platform-app",
      },
      body: JSON.stringify(commitBody),
    });

    if (!commitRes.ok) {
      const commitErr = await commitRes.json() as any;
      return res.status(commitRes.status).json({
        error: `کێشەیەک لە تۆمارکردنی کۆمیت (Git Commit) ڕوویدا: ${commitErr.message}`
      });
    }

    const commitData = await commitRes.json() as any;
    const newCommitSha = commitData.sha;

    // 8. Update or Create Reference to point to the new commit
    let refUrl = `https://api.github.com/repos/${fullRepo}/git/refs/heads/${defaultBranch}`;
    let refMethod = "PATCH";
    let refBody: any = {
      sha: newCommitSha,
      force: true
    };

    if (isInitialCommit) {
      refUrl = `https://api.github.com/repos/${fullRepo}/git/refs`;
      refMethod = "POST";
      refBody = {
        ref: `refs/heads/${defaultBranch}`,
        sha: newCommitSha
      };
    }

    const refRes = await fetch(refUrl, {
      method: refMethod,
      headers: {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "sas-platform-app",
      },
      body: JSON.stringify(refBody),
    });

    if (!refRes.ok) {
      const refErr = await refRes.json() as any;
      return res.status(refRes.status).json({
        error: `نەتوانرا برانچی سەرەکی دروستبکرێت یان نوێبکرێتەوە: ${refErr.message}`
      });
    }

    return res.json({
      success: true,
      message: "هەموو فایلەکانی پڕۆژەکەت بە سەرکەوتوویی لەگەڵ کۆگای SAS-Platform هاوکات کران!",
      repoUrl: `https://github.com/${fullRepo}`,
    });

  } catch (error: any) {
    console.error("Push All Workspace Files Error:", error);
    return res.status(500).json({ error: "کێشەیەکی ناوخۆیی سێرڤەر ڕوویدا لە کاتی پەیوەندیکردنم بە گیتھەبەوە." });
  }
});


// API Route: High-Quality Image Generation (gemini-3-pro-image-preview)
app.post("/api/gemini/generate-image", async (req, res) => {
  const { prompt, imageSize = "1K", aspectRatio = "1:1", lang = "ku" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(400).json({ error: "Gemini API key is not configured for image generation." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          return res.json({ imageBase64: base64Data });
        }
      }
    }
    
    return res.status(500).json({ error: "No image was returned in the response parts." });
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred generating image" });
  }
});


// API Route: Veo 3.1 Video Generation (Start Operation)
app.post("/api/gemini/generate-video", async (req, res) => {
  const { prompt, aspectRatio = "16:9", resolution = "1080p", lang = "ku" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required for video generation" });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(400).json({ error: "Gemini API key is not configured for video generation." });
  }

  try {
    const operation = await ai.models.generateVideos({
      model: "veo-3.1-fast-generate-preview",
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution, // '720p' or '1080p'
        aspectRatio: aspectRatio || '16:9' // '16:9' (landscape) or '9:16' (portrait)
      }
    });

    return res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error("Video Generation Start Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred starting video generation" });
  }
});


// API Route: Veo 3.1 Video Polling Status
app.post("/api/gemini/video-status", async (req, res) => {
  const { operationName } = req.body;
  if (!operationName) {
    return res.status(400).json({ error: "operationName is required" });
  }

  const ai = getGemini();
  if (!ai) {
    return res.status(400).json({ error: "Gemini API key is not configured." });
  }

  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    return res.json({ done: updated.done, response: updated.response });
  } catch (error: any) {
    console.error("Video Polling Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred checking video status" });
  }
});


// API Route: Veo 3.1 Video Streaming/Download Proxy
app.post("/api/gemini/video-download", async (req, res) => {
  const { operationName } = req.body;
  if (!operationName) {
    return res.status(400).json({ error: "operationName is required" });
  }

  const ai = getGemini();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!ai || !apiKey) {
    return res.status(400).json({ error: "Gemini API key is not configured." });
  }

  try {
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!uri) {
      return res.status(404).json({ error: "Video URL not found or generation not finished yet." });
    }

    const videoRes = await fetch(uri, {
      headers: { "x-goog-api-key": apiKey },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video from Google servers, status: ${videoRes.status}`);
    }

    res.setHeader("Content-Type", "video/mp4");
    
    if (videoRes.body) {
      // In newer Node fetch, body is a ReadableStream. We can convert it to a response pipe
      const reader = videoRes.body.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              res.end();
              break;
            }
            controller.enqueue(value);
            res.write(value);
          }
        }
      });
    } else {
      return res.status(500).json({ error: "Empty body stream returned from Google servers." });
    }
  } catch (error: any) {
    console.error("Video Proxy Download Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred downloading or streaming video" });
  }
});


// API Route: Custom Multi-Engine Task Runner (fast, general, pro models)
app.post("/api/gemini/custom-task", async (req, res) => {
  const { taskPrompt, modelType = "general", lang = "ku", useSearch = false } = req.body;
  if (!taskPrompt) {
    return res.status(400).json({ error: "Task description is required" });
  }

  const ai = getGemini();
  if (!ai) {
    return res.json({
      text: lang === "en" 
        ? "Mock Response: This action requires an active Gemini API key. Please configure it in your Secrets settings." 
        : (lang === "ar" 
          ? "استجابة تجريبية: هذا الإجراء يتطلب مفتاح API نشط لـ Gemini. يرجى تكوينه في إعدادات الأسرار." 
          : "وەڵامی تاقیکاری: ئەم کردارە پێویستی بە کلیلی چالاکی Gemini API هەیە. تکایە لە بەشی سکرێتس ڕێکیبخە.")
    });
  }

  let modelName = "gemini-3.5-flash"; // default: general
  if (modelType === "fast") {
    modelName = "gemini-3.1-flash-lite";
  } else if (modelType === "pro") {
    modelName = "gemini-3.1-pro-preview";
  }

  try {
    const systemInstruction = `You are a high-performance SAS-Platform Intelligent AI assistant. 
You are completing a specialized task requested by the user.
Your response must be extremely high-quality, professional, accurate, and written in ${lang === "en" ? "English" : (lang === "ar" ? "Arabic" : "Sorani Kurdish")}.
If the user asks for code, provide clean, fully annotated code blocks. If they ask for analysis, be thorough and detailed.`;

    const config: any = {
      systemInstruction,
      temperature: 0.6,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: taskPrompt,
      config,
    });

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    return res.json({ text: response.text, groundingMetadata });
  } catch (error: any) {
    console.error("Custom AI Task Error:", error);
    return res.status(500).json({ error: error.message || "An error occurred executing custom task" });
  }
});


// Serve client assets inside Express with asynchronous bootstrap wrapper
async function startBootstrap() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    // Setup Vite development server middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from compiled dist folder in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SAS-Platform] Server running on port ${PORT} (Prod: ${isProd})`);
  });
}

startBootstrap();
