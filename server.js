import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// ساختن داتابەیس
await initDatabase();

// APIs
const { default: apiRoutes } = await import('./api.js');
app.use(apiRoutes);

// سێرڤ کردنی ماڵپەڕەکان
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-full.html'));
});

app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-full.html'));
});

app.get('/store', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-full.html'));
});

// سێرڤ کردنی i18n.json
app.get('/i18n.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'i18n.json'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ سێرڤەری SAS-platform لە پۆرت ${PORT} کار دەکات`);
    console.log(`📱 بکەوە: http://localhost:${PORT}`);
    console.log(`🌐 زمانەکان: کوردی | عەرەبی | ئینگلیزی`);
    console.log(`💳 سیستەمی پارەدان: FastPay + Stripe`);
    console.log(`🛍️ کۆگای بەرهەمەکان: چالاک!`);
});
