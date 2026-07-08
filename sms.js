app.post('/api/payment/sms-webhook', async (req, res) => {
    // ئەپەکەی سەر مۆبایلت دەقی کورتەنامەی فاست پەیت بۆ دەنێرێت
    const { sms_sender, sms_body } = req.body; 

    // دڵنیابوون لەوەی کورتەنامەکە لە لایەن FastPay خۆیەوە هاتووە
    if (sms_sender !== 'FastPay') {
        return res.status(403).send('نامەیەکی ساختەیە');
    }

    // دەقی کورتەنامەکە شیکار دەکەین (بۆ نموونە: You received 10000 IQD from ... Ref: SAS-1234)
    const amountRegex = /(\d+)\s*IQD/i;
    const refRegex = /Ref:\s*(SAS-\d+)/i;

    const matchAmount = sms_body.match(amountRegex);
    const matchRef = sms_body.match(refRegex);

    if (matchAmount && matchRef) {
        const receivedAmount = parseInt(matchAmount[1]);
        const referenceCode = matchRef[1];

        // ١. پشکنین لە داتابەیس کە ئایا ئەم پڕۆژەیە چاوەڕێی ئەم کۆدی تێبینییەیە؟
        const order = await db.findOrderByRef(referenceCode);
        
        if (order && receivedAmount >= order.expected_price) {
            // ٢. دروستکردنی کلیل بە شێوازی ئۆتۆماتیکی
            const activationKey = generateUniqueKey();
            await db.saveKeyAndActivate(order.product_id, order.buyer_id, activationKey);

            // ٣. دابەشکاری حسابات لە داتابەیس (چونکە ناتوانیت بەبێ API پارە بنێریتەوە)
            // پارەکە هەمووی لای تۆیە لە فاست پەی، بەڵام لە داتابەیسدا پشکی گەشەپێدەرەکە خەزن دەکرێت
            const developerShare = receivedAmount * 0.75;
            await db.addDeveloperBalance(order.developer_id, developerShare);

            console.log(`💰 پارە گەیشت! کلیل بۆ کۆدی ${referenceCode} چالاک کرا. ٧٥٪ خرایە سەر بالانسی گەشەپێدەر بۆ کاتی ڕاکێشان.`);
            return res.status(200).send('SUCCESS');
        }
    }

    return res.status(400).send('زانیاری کورتەنامەکە نادروستە');
});
