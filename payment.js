// ئەم کۆدە لە ڕوکاری پێشەوە (Frontend) جێبەجێ دەبێت دوای سەرکەوتنی پارەدانەکە
function showActivationKeyToBuyer(generatedKey) {
    const chatBox = document.getElementById('chatBox');
    
    chatBox.innerHTML += `
        <div class="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-xl max-w-[85%] self-start shadow-lg my-3">
            <p class="text-xs text-emerald-400 font-extrabold mb-1">SAS-Billing System 💳:</p>
            <p class="text-sm text-gray-200 mb-3">🎉 سوپاس بۆ کڕینەکەت! پارەدانەکەت مسۆگەر کرا و پشکەکان دابەشکران.</p>
            <div class="bg-gray-950 border border-gray-800 p-3 rounded-lg flex justify-between items-center font-mono text-center">
                <span class="text-emerald-400 font-black tracking-wider text-base">${generatedKey}</span>
                <button onclick="navigator.clipboard.writeText('${generatedKey}')" class="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300">کۆپی</button>
            </div>
            <p class="text-[10px] text-gray-500 mt-2">تێبینی: ئەم کلیلە تەنها بۆ یەک جار ئەکتیڤکردن کاردەکات.</p>
        </div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}
