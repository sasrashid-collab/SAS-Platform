import express from 'express';
import crypto from 'crypto';
const app = express();
app.use(express.urlencoded({ extended: true })); // بۆ خوێندنەوەی داتای نامەکە

// پۆستی تایبەت کە کلاودی SMS نامەکەی بۆ دەنێرێت
app.post('/api/sas-platform/sms-receiver', async (req, res) => {
    // دەق و ناردنی نامەکە لە کلاودەوە وەردەگرین
    const smsSender = req.body.From; // بۆ نموونە: 'FastPay'
    const smsBody = req.body.Body;   // دەقی نامەکە

    // ١. دڵنیابوون لەوەی نامەکە ساختە نییە و لە لایەن فاست پەی خۆیەوە هاتووە
    if (!smsSender.includes('FastPay')) {
        return res.status(400).send('نامەیەکی نەناسراوە');
    }

    // ٢. شیکارکردنی نامەکە بۆ دۆزینەوەی بڕی پارە و کۆدی ڕێپێدان (Ref Code)
    // نموونەی نامەی فاست پەی: "You received 15000 IQD. Ref: SAS-ABC12"
    const amountRegex = /(\d+)\s*IQD/i;
    const refRegex = /Ref:\s*(SAS-[A-Z0-9]+)/i;

    const matchAmount = smsBody.match(amountRegex);
    const matchRef = smsBody.match(refRegex);

    if (matchAmount && matchRef) {
        const receivedAmount = parseInt(matchAmount[1]);
        const referenceCode = matchRef[1];

        // ٣. گەڕان لە داتابەیس بۆ دۆزینەوەی ئەو کڕینەی کە چاوەڕێی ئەم کۆدەیە
        const order = await db.findOrderByReference(referenceCode);

        if (order) {
            // پشکنین ئەگەر پارەکە تەواو بێت یان زیاتر بێت
            if (receivedAmount >= order.price) {
                
                // ٤. دروستکردنی کلیلێکی ئەکتیڤکردنی بێهاوتا بە شێوازی دەستبەجێ
                const activationKey = `SAS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                
                // پاشەکەوتکردنی کلیلەکە لە داتابەیس و گۆڕینی دۆخی کڕینەکە بۆ "سەرکەوتوو"
                await db.confirmPaymentAndGenerateKey(order.id, activationKey);

                // ٥. ئەپدێیتکردنی حساباتی دارایی گەشەپێدەرەکە (٧٥٪) لە داتابەیسدا
                const developerShare = receivedAmount * 0.75;
                await db.updateDeveloperWallet(order.developer_id, developerShare);

                console.log(`🚀 کلیل چالاک کرا بۆ کۆدی [${referenceCode}] و ڕەوانەی کڕیار کرا لە ناو پلاتفۆرم.`);
                
                // وەڵامدانەوەی سەرکەوتوو بۆ سێرڤەری نامەکە
                return res.status(200).send('<Response></Response>'); 
            }
        }
    }

    return res.status(400).send('کۆد یان بڕی پارەکە لەگەڵ سیستەم یەکناگرێتەوە');
});
