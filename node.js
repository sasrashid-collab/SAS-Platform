import express from 'express';
import crypto from 'crypto';
const app = express();
app.use(express.json());

// زانیارییە جێگیرەکانی تۆ وەک خاوەن پلاتفۆرم
const OWNER_WALLET = "+9647504909260";
const PLATFORM_FEE_PERCENT = 0.25; // ٢٥٪

// ئەمە ئەو ناونیشانەیە (Webhook) کە فاست پەی یان FIB پێوەندی پێوە دەکەن دوای پارەدان
app.post('/api/payment/webhook', async (req, res) => {
    const { transactionId, status, amount, productId, buyerId, developerWallet } = req.body;

    // ١. دڵنیابوونەوە لە سەرکەوتنی ناردنی پارەکە بۆ بانک
    if (status !== 'SUCCESS') {
        return res.status(400).send('پارەدانەکە سەرکەوتوو نەبووە، کلیل دەرناچێت.');
    }

    try {
        // ٢. حیسابکردنی پشکی تۆ و پشکی پەرەپێدەرەکە
        const platformShare = amount * PLATFORM_FEE_PERCENT;
        const developerShare = amount - platformShare;

        console.log(`💵 گشتی پارە: ${amount} د.ع`);
        
        // ٣. ناردنی خۆکارانەی پارە بۆ ئەژماری تۆ (SAS.Rashid)
        await transferFundsViaBankAPI({
            to_wallet: OWNER_WALLET,
            amount: platformShare,
            description: "پارەی فرۆشتنی دیجیتاڵی - SAS-platform" // تێبینی فەرمی
        });
        console.log(`✅ بڕی ${platformShare} د.ع نێردرا بۆ SAS.Rashid لەسەر ژمارەی ${OWNER_WALLET}`);

        // ٤. ناردنی خۆکارانەی پارە بۆ ئەژماری پەرەپێدەرەکە
        if (developerWallet) {
            await transferFundsViaBankAPI({
                to_wallet: developerWallet,
                amount: developerShare,
                description: "پشکی فرۆشتنی خزمەتی دیجیتاڵی - SAS-platform"
            });
            console.log(`✅ بڕی ${developerShare} د.ع نێردرا بۆ گەشەپێدەرەکە.`);
        }

        // ٥. دروستکردنی کلیلێکی ئەکتیڤکردنی هەرەمەکی و بێهاوتا (Unique Activation Key)
        const generatedKey = `SAS-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        
        // لێرەدا کلیلەکە لە داتابەیس پاشەکەوت دەبێت و دەبەسترێتەوە بە کڕیارەکەوە
        await saveKeyToDatabase(productId, buyerId, generatedKey);

        // ٦. ناردنی وەڵامی سەرکەوتوو بۆ کڕیار (خۆکارانە لە ڕوکاردا کلیلەکەی پێدەگات)
        return res.status(200).json({
            status: "COMPLETED",
            message: "مافەکان مسۆگەر کران و پارە دابەش کرا.",
            activation_key: generatedKey // کلیلەکە لێرەدا دەدرێتە کڕیار
        });

    } catch (error) {
        console.error("هەڵەیەک لە پڕۆسەی ئۆتۆماتیکی پارەدان ڕوویدا:", error);
        return res.status(500).send("کێشەیەک لە دابەشکاری ڕوویدا.");
    }
});

// مۆدیۆلی پەیوەندی بە API ی فەرمی بانک (FastPay / FIB) بۆ گواستنەوەی پارەی ڕاستەقینە
async function transferFundsViaBankAPI({ to_wallet, amount, description }) {
    // لێرەدا داواکاری (Axios/Fetch Request) دەنێردرێت بۆ سێرڤەری بانکەکە بە بەکارهێنانی کلیلەکانی بانکەکەت
    // بۆ نموونە: post('https://fast-pay.cash', { to_wallet, amount, description })
    return true; 
}

async function saveKeyToDatabase(productId, buyerId, key) {
    // لێرەدا کۆدی SQL جێبەجێ دەبێت بۆ تۆمارکردنی کلیلەکە لە داتابەیس
    console.log(`🔑 کلیلەکە پاشەکەوت کرا بۆ کڕیاری ژمارە [${buyerId}]: ${key}`);
    return true;
}

app.listen(3000, () => console.log('سێرڤەری دارایی SAS-platform لەسەر پۆرت ٢٠٢٦ کار دەکات'));
