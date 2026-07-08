import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

let db = null;

export async function initDatabase() {
    db = await open({
        filename: './sas-platform.db',
        driver: sqlite3.Database
    });

    // فعالکردنی پیوەندیدانی دەرەکی
    await db.exec('PRAGMA foreign_keys = ON');

    // تێک خستن و نووسینی جديد
    const schemaFile = path.join(process.cwd(), 'schema.sql');
    const schema = fs.readFileSync(schemaFile, 'utf-8');
    
    try {
        await db.exec(schema);
        console.log('✅ داتابەیس سەرتێپەڕی کرا بە سفلتە ڕاستکراوە');

        const owner = await db.get('SELECT id FROM users WHERE username = ?', 'SAS.Rashid');
        const sampleProducts = [
            { name: 'سێستەمی کڕینکاری', type: 'App', description: 'پلاتفۆرمی فروش و پاراستنی بابەت', tier: 'gold', in_store: 1 },
            { name: 'ماڵپەڕی رێکلامی', type: 'Website', description: 'ماڵپەڕی زیبا بۆ نیشاندانی پرۆگرامەکان', tier: 'silver', in_store: 1 },
            { name: 'یاری 3D گومێتری', type: 'Game3D', description: 'یاری 3D خۆشحاڵکەر بۆ مەوبایل', tier: 'gold', in_store: 1 }
        ];
        if (owner) {
            for (const item of sampleProducts) {
                const exists = await db.get('SELECT id FROM products WHERE creator_id = ? AND product_name = ?', owner.id, item.name);
                if (!exists) {
                    await db.run(
                        'INSERT INTO products (creator_id, product_name, product_type, description, tier, is_published, in_store) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [owner.id, item.name, item.type, item.description, item.tier, 1, item.in_store]
                    );
                }
            }
            console.log('✅ Seed products ensured for store display');
        }
    } catch (error) {
        console.error('❌ هەڵە لە ساخت کردنی داتابەیس:', error);
    }

    return db;
}

export function getDB() {
    return db;
}
