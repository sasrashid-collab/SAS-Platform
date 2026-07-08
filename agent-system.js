// Guide & Help Agent System
const agentGuides = {
  ku: {
    "پلانەکان": {
      title: "📚 فێری کردنی پلانەکان",
      content: `
        🟢 **پلانی سادە (مجاني):**
        - ماڵپەڕی سادە و ئێلەمنتار
        - تۆ تەنها ٧ ڕۆژ تریاڵ هەیت
        
        🔵 **پلانی زیوی (15,000 د.ع/مانگانە):**
        - دروستکردنی ئەپی مۆبایل
        - سیستەمی بەڕێوەبردن
        - سیستەمی دارایی ساتەز
        
        🟡 **پلانی زێڕین (30,000 د.ع/مانگانە):**
        - هەموو جۆری بەرهەم
        - یاری سێ ڕەهەندی گەورە
        - بەبێ سنور
      `
    },
    "دروستکردنی بەرهەم": {
      title: "🎨 ڕێندەری دروستکردنی بەرهەم",
      content: `
        ١️⃣ **نیویسە پڕۆمپت:**
        وەصفی درێج بنووسە کە دەتەوێت دروست کردن:
        "سیستەمی کڕینکاری بۆ کۆگا"
        
        ٢️⃣ **سیستەم دەستی پێکات:**
        پلاتفۆرم خۆبەخۆ کۆدی دروست دەکات
        
        ٣️⃣ **بەرهەم ئامادە:**
        بەرهەمی تۆ ئامادە بووو کۆگادا دراوە
        
        ٤️⃣ **فرۆشتن:**
        کێی خواست، کڕیاری و کلیلی ئەکتیڤکردن
      `
    },
    "فرۆشتن": {
      title: "💰 سیستەمی فرۆشتن و پشک دابەشکردن",
      content: `
        💳 **پڕۆسەی فرۆشتن:**
        - کریار بەرهەمەکەت هەڵدەبژێرێت
        - پارە دەدات (FastPay/FIB)
        - سیستەم خۆکارانە پارە دابەش دەکات
        
        📊 **دابەشکردنی پشک:**
        - SAS-platform: 25٪
        - گەشەپێدەرەکە: 75٪
        
        🔐 **کلیلی ئەکتیڤکردن:**
        - هەریەک بەرهەمی فروتە کلیلێکی هەرەمەکی
        - کریار کلیلی نیویس دەکات
      `
    }
  },
  ar: {
    "الخطط": {
      title: "📚 شرح الخطط",
      content: `
        🟢 **الخطة البسيطة (مجاني):**
        - مواقع بسيطة
        - تجربة مجانية ٧ أيام فقط
        
        🔵 **خطة الفضة (15,000 د.ع/شهر):**
        - تطبيقات الموبايل
        - نظام إدارة
        - نظام مالي
        
        🟡 **خطة الذهب (30,000 د.ع/شهر):**
        - جميع أنواع المنتجات
        - ألعاب ثلاثية الأبعاد
        - بلا حد
      `
    },
    "إنشاء منتج": {
      title: "🎨 خطوات إنشاء المنتج",
      content: `
        ١️⃣ **اكتب البرومبت:**
        اوصف ما تريد إنشاءه بالتفصيل
        
        ٢️⃣ **المنصة تبدأ العمل:**
        نظام ذكي ينشئ الكود تلقائياً
        
        ٣️⃣ **المنتج جاهز:**
        يتم إضافته مباشرة إلى متجرك
        
        ٤️⃣ **البيع:**
        عندما يشتري أحدهم، تحصل على نسبتك
      `
    },
    "المبيعات": {
      title: "💰 نظام المبيعات والعمولات",
      content: `
        💳 **عملية البيع:**
        - المشتري يختار المنتج
        - يدفع عبر الطرق الآمنة
        - النظام يوزع المبالغ تلقائياً
        
        📊 **توزيع الأرباح:**
        - منصة SAS: 25٪
        - المنشئ: 75٪
        
        🔐 **مفاتيح التفعيل:**
        - كل منتج مباع = مفتاح فريد
        - المشتري ينسخ المفتاح بسهولة
      `
    }
  },
  en: {
    "Plans": {
      title: "📚 Understanding Plans",
      content: `
        🟢 **Simple Plan (Free):**
        - Basic websites
        - 7-day free trial only
        
        🔵 **Silver Plan ($15,000/month):**
        - Mobile apps
        - Management systems
        - Financial systems
        
        🟡 **Gold Plan ($30,000/month):**
        - All product types
        - 3D games
        - Unlimited features
      `
    },
    "Creating Products": {
      title: "🎨 How to Create Products",
      content: `
        ١️⃣ **Write Your Prompt:**
        Describe in detail what you want to create:
        "E-commerce system for marketplace"
        
        ٢️⃣ **System Starts:**
        AI automatically generates the code
        
        ٣️⃣ **Product Ready:**
        Added to your store instantly
        
        ٤️⃣ **Start Selling:**
        When someone buys, you get your share
      `
    },
    "Sales": {
      title: "💰 Sales & Commission System",
      content: `
        💳 **Sales Process:**
        - Buyer selects product
        - Pays via secure payment
        - System distributes funds automatically
        
        📊 **Profit Sharing:**
        - SAS Platform: 25٪
        - Product Creator: 75٪
        
        🔐 **Activation Keys:**
        - Each sale = unique key
        - Buyer copies it easily
      `
    }
  }
};

// AI Agent Responses
const agentResponses = {
  ku: {
    greeting: "سڵاو! من ئەجێنتی یارمەتیدەری SAS-tech ـم. 👋",
    default: "بڕوا دەتوانم تۆ یارمەتی بدەم. کام بابەتێک تێ دەخۆشت؟",
    unknown: "ببوورە، ئەم بابەتە تێدا نیم. بڕوا یەکێکی تریش هەیە؟"
  },
  ar: {
    greeting: "مرحباً! أنا وكيل مساعدة SAS-tech 👋",
    default: "يمكنني مساعدتك في أي شيء. ماذا تريد أن تعرف؟",
    unknown: "آسف، لا أعرف عن هذا. هل هناك شيء آخر؟"
  },
  en: {
    greeting: "Hello! I'm the SAS-tech help agent 👋",
    default: "I can help you with anything. What would you like to know?",
    unknown: "Sorry, I don't know about that. Is there something else?"
  }
};

export { agentGuides, agentResponses };
