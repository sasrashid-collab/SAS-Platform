-- بەکارهێنەران
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    wallet_number TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'developer', 'owner'
    plan_type TEXT DEFAULT 'Simple', -- 'Simple', 'Silver', 'Gold'
    trial_start_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    plan_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- بەرهەمەکان
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT, -- 'Website', 'App', 'FinanceSystem', 'Game3D'
    description TEXT,
    prompt_used TEXT,
    tier TEXT DEFAULT 'free', -- 'free', 'silver', 'gold'
    ai_generated_config JSON,
    is_published BOOLEAN DEFAULT 0,
    in_store BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- کلیلەکانی ئەکتیڤکردن
CREATE TABLE IF NOT EXISTS activation_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    activation_key TEXT UNIQUE NOT NULL,
    tier TEXT, -- 'silver', 'gold'
    price_paid INTEGER, -- بۆ نموونە: 25000, 50000, 100000
    is_used BOOLEAN DEFAULT 0,
    assigned_to_user_id INTEGER,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- تریاڵی بەشداربوان (٧ ڕۆژی سەرەتا)
CREATE TABLE IF NOT EXISTS trial_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    products_created INTEGER DEFAULT 0,
    trial_start_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trial_ends_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- فرۆشتنەکان
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    amount INTEGER NOT NULL, -- بە دینار
    platform_fee INTEGER, -- ٢٥٪
    seller_share INTEGER, -- ٧٥٪
    transaction_id TEXT UNIQUE,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- آگهیەکانی خۆکاری (Auto-generated Ads)
CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    ad_title TEXT NOT NULL,
    ad_description TEXT,
    ad_image_url TEXT,
    ad_copy TEXT,
    rotation_priority INTEGER DEFAULT 1, -- چقەندە جار نیشان درێت
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- لیستی سەبسکرايپشنەکان
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_type TEXT NOT NULL, -- 'silver', 'gold'
    amount INTEGER NOT NULL,
    billing_cycle TEXT DEFAULT 'monthly', -- 'monthly', 'yearly'
    next_billing_date TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ڕێکلام و بیلینگ
CREATE TABLE IF NOT EXISTS billing_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    transaction_type TEXT, -- 'subscription', 'sales_withdrawal', 'admin_payout'
    amount INTEGER,
    wallet_number TEXT,
    reference_number TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ئە تا سەرتێپەڕ کردنی
INSERT OR IGNORE INTO users (username, email, role, plan_type, wallet_number) 
VALUES ('SAS.Rashid', 'rashid@sas-platform.com', 'owner', 'gold', '+9647504909260');

CREATE INDEX IF NOT EXISTS idx_products_creator ON products(creator_id);
CREATE INDEX IF NOT EXISTS idx_products_store ON products(in_store);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_ads_product ON ads(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
