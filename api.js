import express from 'express';
import crypto from 'crypto';
import { getDB } from './db.js';

const router = express.Router();

function getDBInstance() {
    const db = getDB();
    if (!db) {
        throw new Error('Database has not been initialized yet');
    }
    return db;
}

// ١. APIی دروستکردنی بەرهەمی نوێ (بە پڕۆمپت)
router.post('/api/products/generate', async (req, res) => {
    try {
        const { userId, prompt, tier } = req.body;
        const db = getDBInstance();

        // بڕوانین ئایا بەکارهێنەرەکە موافق بۆ ئەم tier
        const user = await db.get('SELECT * FROM users WHERE id = ?', userId);
        if (!user) return res.status(404).json({ error: 'بەکارهێنەر نەدۆزرایەوە' });

        // چێکتی چاویو plan
        const tierAccessMap = {
            'free': ['Website', 'SimplePage'],
            'silver': ['Website', 'App', 'FinanceSystem'],
            'gold': ['Website', 'App', 'FinanceSystem', 'Game3D']
        };

        // AI Config Simulator (واقعیتدا OpenAI/Claude کو داخوازی بکەیت)
        const aiConfig = {
            prompt,
            generatedAt: new Date().toISOString(),
            templateType: 'template-react',
            features: ['responsive', 'darkMode', 'animations'],
            mockCode: `// Generated from prompt: "${prompt}"\nexport default () => <div>Product</div>`
        };

        // ساختن بەرهەمی نوێ
        const result = await db.run(
            'INSERT INTO products (creator_id, product_name, product_type, prompt_used, tier, ai_generated_config, is_published, in_store) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, `Product-${Date.now()}`, 'Website', prompt, user.plan_type.toLowerCase(), JSON.stringify(aiConfig), 1, 1]
        );

        res.json({
            status: 'SUCCESS',
            product_id: result.lastID,
            message: 'بەرهەمەکە کامیابی دروست کرا',
            ai_config: aiConfig
        });

    } catch (error) {
        console.error('❌ هەڵە لە دروست کردن:', error);
        res.status(500).json({ error: 'کێشەیەک ڕوویدا' });
    }
});

// ٢. APIی کۆگای بەرهەمەکان (Store)
router.get('/api/products/store', async (req, res) => {
    try {
        const db = getDBInstance();
        const page = req.query.page || 1;
        const limit = 12;
        const offset = (page - 1) * limit;

        // بەرهەمی منتاقلن لە کۆگادا
        const products = await db.all(
            'SELECT p.*, u.username FROM products p JOIN users u ON p.creator_id = u.id WHERE p.in_store = 1 LIMIT ? OFFSET ?',
            [limit, offset]
        );

        // آگهیەکانی خۆکاری
        const ads = await db.all('SELECT * FROM ads WHERE is_active = 1 ORDER BY RANDOM() LIMIT 3');

        res.json({
            products,
            ads,
            total: (await db.get('SELECT COUNT(*) as count FROM products WHERE in_store = 1')).count
        });

    } catch (error) {
        console.error('❌ هەڵە لە کۆگا:', error);
        res.status(500).json({ error: 'کێشە' });
    }
});

// ٣. APIی فرۆشتنی بەرهەم (خریدی لێکردنی پڕۆسێس)
router.post('/api/payment/purchase', async (req, res) => {
    try {
        const db = getDBInstance();
        const { product_id, buyer_id, tier } = req.body;

        // نرخەکان
        const priceMap = {
            'silver': 25000,
            'gold': 50000,
            'mega': 100000
        };

        const price = priceMap[tier] || 25000;

        // ساختن تریکسکشن
        const result = await db.run(
            'INSERT INTO sales (product_id, buyer_id, seller_id, amount, platform_fee, seller_share, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [product_id, buyer_id, 1, price, Math.floor(price * 0.25), Math.floor(price * 0.75), 'pending']
        );

        res.json({
            status: 'PENDING',
            transaction_id: result.lastID,
            amount: price,
            message: 'ئەوەتا پارەدانی پێوندیدار بکە'
        });

    } catch (error) {
        console.error('❌ هەڵە لە فرۆشتن:', error);
        res.status(500).json({ error: 'کێشە' });
    }
});

// ٤. APIی وێبهۆک پۆستی پارەدان (Payment Webhook)
router.post('/api/payment/webhook', async (req, res) => {
    try {
        const db = getDBInstance();
        const { transactionId, status, amount, phone } = req.body;

        if (status !== 'SUCCESS') {
            return res.status(400).json({ error: 'پارەدانەکە نەسەرکەوتوو' });
        }

        // وەربگرە سیلز ریکۆرد
        const sale = await db.get('SELECT * FROM sales WHERE id = ?', transactionId);
        if (!sale) return res.status(404).json({ error: 'فرۆشتنی نەدۆزریایەوە' });

        // کلیلی ئەکتیڤکردن
        const activationKey = `SAS-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // پاشەکەوتکردنی کلیل
        await db.run(
            'INSERT INTO activation_keys (product_id, activation_key, tier, price_paid, is_used) VALUES (?, ?, ?, ?, ?)',
            [sale.product_id, activationKey, sale.seller_id === 1 ? 'gold' : 'silver', amount, 0]
        );

        // نوێکردنی سیلز بۆ کامیابی
        await db.run('UPDATE sales SET status = ? WHERE id = ?', ['completed', transactionId]);

        // پاشەکەوتی دابەش پارەکان
        await db.run(
            'INSERT INTO billing_transactions (user_id, transaction_type, amount, wallet_number, status) VALUES (?, ?, ?, ?, ?)',
            [sale.seller_id, 'sales_withdrawal', sale.seller_share, phone, 'completed']
        );

        res.json({
            status: 'COMPLETED',
            activation_key: activationKey,
            message: 'کامیاب! مافەکان دابەشکران'
        });

    } catch (error) {
        console.error('❌ هەڵە لە وێبهۆک:', error);
        res.status(500).json({ error: 'کێشە سیستەمی' });
    }
});

// ٥. APIی وەرگرتنی کلیلی ئەکتیڤکردن
router.get('/api/products/:id/activation-key', async (req, res) => {
    try {
        const db = getDBInstance();
        const { id } = req.params;
        const key = await db.get('SELECT * FROM activation_keys WHERE product_id = ? AND is_used = 0', id);

        if (!key) {
            return res.status(404).json({ error: 'کلیل نەدۆزریایەوە' });
        }

        res.json({ activation_key: key.activation_key, product_id: id });
    } catch (error) {
        res.status(500).json({ error: 'کێشە' });
    }
});

// ٦. APIی دروستکردنی آگهی خۆکاری
router.post('/api/ads/generate', async (req, res) => {
    try {
        const db = getDBInstance();
        const { product_id, product_name } = req.body;

        const adTexts = [
            `🎁 بەرهەمی نوێ: ${product_name}! هیوا ناکا!`,
            `💥 فرۆشتنی تایبەت: ${product_name} تەنها ئەمڕۆ!`,
            `🚀 فراوانی: ${product_name} بۆ هەموو!`
        ];

        const randomAd = adTexts[Math.floor(Math.random() * adTexts.length)];

        const result = await db.run(
            'INSERT INTO ads (product_id, ad_title, ad_description, rotation_priority) VALUES (?, ?, ?, ?)',
            [product_id, randomAd, `بزانە بۆ ${product_name}`, Math.floor(Math.random() * 5) + 1]
        );

        res.json({ ad_id: result.lastID, ad_text: randomAd });
    } catch (error) {
        res.status(500).json({ error: 'کێشە' });
    }
});

// ٨. Learning Agent: guide (hardcoded-first)
router.get('/api/learning/guide', async (req, res) => {
    try {
        const { topic = 'publish', role = 'Simple', plan = 'Simple' } = req.query;

        const guideByTopic = {
            publish: {
                // فارسی (Farsi)
                farsi: [
                    { step: 1, title: 'شروع با یک درخواست درست', body: 'در چت داخل پلتفرم، یک prompt واضح بنویسید. مثلا: «یک فروشگاه No-Code برای محصولات دیجیتال با صفحات: خانه، محصول، صفحه پرداخت، و صفحه فعال‌سازی».' },
                    { step: 2, title: 'ایجاد محصول', body: 'برای تولید، روی دکمه ارسال prompt بزنید تا محصول در سیستم ساخته شود (در حال حاضر شبیه‌سازی شده است، بعداً به تولید واقعی متصل می‌شود).' },
                    { step: 3, title: 'نمایش در Store', body: 'بعد از ساخت، باید محصول در حالت «in_store» قرار بگیرد تا داخل فروشگاه نمایش داده شود. (در UI فعلی دکمه «برو به کـوگـا» فقط یک alert است؛ بعداً آن را به API وصل می‌کنیم).' },
                    { step: 4, title: 'فعال‌سازی و کلید', body: 'بعد از خرید موفق، پلتفرم یک activation key تولید می‌کند و به خریدار نمایش می‌دهد. خریدار باید بتواند آن را کپی کند.' },
                    { step: 5, title: 'تست نقش و پلن', body: 'حالا نقش/پلن را از بالا انتخاب کنید (Simple/Silver/Gold/Owner) و دوباره همان مسیر را تست کنید تا محدودیت‌ها درست اعمال شوند.' }
                ],
                // Kurdish (Bê kurdî yêkەم)
                kurdish: [
                    { step: 1, title: 'دەستپێکردن بە پڕۆمپتی ڕاست', body: 'لە چاتی ناو پلاتفۆرم، پڕۆمپتێکی ڕوون بنووسە بۆ نموونە: «ماڵپەری No-Code بۆ بەرهەمە دیجیتاڵەکان دروست بکە: ماڵ، بەرهەم، پارەدان، و صفحەی ئەکتیڤکردن». ' },
                    { step: 2, title: 'دروستکردنی بەرهەم', body: 'بۆ دروستکردن، دکمه‌ی ناردن بکە تا بەرهەم لە ناو سیستەمەکە دروست بکرێت (ئێستا هەڵبژاردن/شیمولیشنیە بۆ پێشکەوتن).' },
                    { step: 3, title: 'نیشاندانی لە کۆگا', body: 'دواتر دەبێت بەرهەم لە دۆخی «in_store» بێت بۆ ئەوەی لە کۆگای پلاتفۆرم نیشان بدرێت. (لە UI ئێستادا دکمه‌ی «بڕۆ بۆ کۆگا» تەنها alert ـە؛ دواتر بە API دەبەستێنەوە).' },
                    { step: 4, title: 'کلیلەکانی ئەکتیڤکردن', body: 'لە کڕینی سەرکەوتوو، پلاتفۆرم کلیلێکی activation دروست دەکات و بۆ کڕیار نیشان دەدات. دەبێت کڕیار بتوانێت بە ئاسانی کۆپی بکات.' },
                    { step: 5, title: 'تێستکردنی پلن/ڕۆڵ', body: 'لە سەرەوە پلن/ڕۆڵ هەڵبژێرە (Simple/Silver/Gold/Owner) و هەمان ڕێگای تێست بکە بۆ ئەوەی ڕێستەکان باش کار بکەن.' }
                ],
                // Arabic
                arabic: [
                    { step: 1, title: 'ابدأ بطلب واضح', body: 'داخل الدردشة على المنصة، اكتب prompt واضح. مثال: «متجر No-Code للمنتجات الرقمية مع صفحات: الرئيسية، المنتج، الدفع، وتفعيل المنتج». ' },
                    { step: 2, title: 'إنشاء المنتج', body: 'اضغط إرسال الـ prompt لإنتاج المنتج في النظام (حالياً محاكاة؛ لاحقاً نربطه بالتوليد الحقيقي).' },
                    { step: 3, title: 'عرضه في المتجر (Store)', body: 'بعد الإنشاء، يجب ضبط المنتج على حالة in_store لعرضه داخل المتجر. (زر «بڕۆ بۆ کۆگا» حالياً يظهر تنبيه فقط، وسيُربط بـ API لاحقاً).' },
                    { step: 4, title: 'التفعيل والمفتاح', body: 'بعد نجاح الدفع، تولّد المنصة activation key وتعرضها للمشتري ليتمكن من نسخها بسهولة.' },
                    { step: 5, title: 'اختبار الخطة/الدور', body: 'اختر الخطة/الدور من الأعلى (Simple/Silver/Gold/Owner) ثم أعد نفس المسار للتأكد من تطبيق القيود.' }
                ],
                // English
                english: [
                    { step: 1, title: 'Start with a clear prompt', body: 'In the platform chat, write a clear prompt. Example: «Build a No-Code marketplace for digital products with pages: Home, Product, Checkout, and Activation». ' },
                    { step: 2, title: 'Generate the product', body: 'Send the prompt to create the product in the system (currently simulated; will be connected to real generation later).' },
                    { step: 3, title: 'Show it in the Store', body: 'After generation, set the product to in_store so it appears in the platform store. (UI button is currently only an alert; later we will wire it to the API).' },
                    { step: 4, title: 'Activation key', body: 'After successful payment, the platform generates an activation key and shows it to the buyer so they can copy it.' },
                    { step: 5, title: 'Test plan/role restrictions', body: 'Select plan/role (Simple/Silver/Gold/Owner) and test the flow to verify restrictions work as expected.' }
                ]
            }
        };

        const topicObj = guideByTopic[topic] || guideByTopic.publish;

        const lang = req.query.lang || 'kurdish';
        const steps = topicObj[lang] || topicObj.kurdish;

        res.json({
            status: 'SUCCESS',
            topic,
            role,
            plan,
            lang,
            steps
        });
    } catch (error) {
        console.error('❌ Learning guide error:', error);
        res.status(500).json({ error: 'کێشەی Learning guide' });
    }
});

// ٧. APIی زیادکردنی بەرهەمی دەرەکی (Drag & Drop)
router.post('/api/products/external', async (req, res) => {
    try {
        const db = getDBInstance();
        const { creator_id, product_name, external_url, tier } = req.body;

        const result = await db.run(
            'INSERT INTO products (creator_id, product_name, product_type, description, tier, is_published, in_store) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [creator_id, product_name, 'External', external_url, tier, 1, 0]
        );

        res.json({ product_id: result.lastID, message: 'بەرهەمە دەرەکی زیاد کرا' });
    } catch (error) {
        res.status(500).json({ error: 'کێشە' });
    }
});

// ٨. APIی پارەدانی FastPay (SMS Billing)
router.post('/api/payment/fastpay', async (req, res) => {
    try {
        const db = getDBInstance();
        const { phone, amount, product_id, buyer_id } = req.body;

        // ناردنی SMS بۆ ژمارە FastPay
        console.log(`📱 SMS نێرانی بۆ FastPay: ${phone} - بۆ ${amount} د.ع`);

        // کلیل دروست بکە
        const activationKey = `SAS-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // ساتێن کلیل
        await db.run(
            'INSERT INTO activation_keys (product_id, activation_key, price_paid, assigned_to_user_id) VALUES (?, ?, ?, ?)',
            [product_id, activationKey, amount, buyer_id]
        );

        res.json({
            status: 'PENDING',
            message: 'پێدەگات SMS بۆ ژمارەت بۆ تەستیق کردنی پارەدان',
            phone: phone,
            amount: amount,
            activation_key: activationKey
        });

    } catch (error) {
        console.error('❌ FastPay هەڵە:', error);
        res.status(500).json({ error: 'کێشە' });
    }
});

// ٩. APIی بۆ وەرگرتنی کۆگای بەرهەمەکان (بە نرخ و ستایل جیاجیا)
router.get('/api/products/store/featured', async (req, res) => {
    try {
        const db = getDBInstance();
        const products = await db.all(`
            SELECT p.*, u.username, COUNT(ak.id) as sales_count 
            FROM products p 
            JOIN users u ON p.creator_id = u.id 
            LEFT JOIN activation_keys ak ON p.id = ak.product_id 
            WHERE p.in_store = 1 
            GROUP BY p.id 
            ORDER BY sales_count DESC 
            LIMIT 12
        `);

        res.json({
            products: products.map(p => ({
                ...p,
                tier_badge: p.tier === 'gold' ? '👑' : (p.tier === 'silver' ? '🥈' : '⭐')
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'کێشە' });
    }
});

export default router;
