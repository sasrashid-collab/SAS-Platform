-- ١. زیادکردنی زانیاری پارەدانی گەشەپێدەران لە خشتەی بەکارهێنەراندا
ALTER TABLE users ADD COLUMN wallet_number VARCHAR(20) NULL; -- بۆ نموونە ژمارەی فاست پەی گەشەپێدەرەکە

-- ٢. خشتەی کلیلەکانی ئەکتیڤکردن (Activation Keys)
CREATE TABLE product_keys (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    activation_key VARCHAR(100) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    assigned_to_user_id INT REFERENCES users(id) NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
