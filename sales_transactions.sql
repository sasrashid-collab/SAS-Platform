CREATE TABLE sales_transactions (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    buyer_id INT REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL, -- نرخی گشتی کڕینەکە
    platform_fee DECIMAL(10, 2) NOT NULL, -- ٢٥٪ بۆ پلاتفۆرمەکەی تۆ (SAS.Rashid)
    developer_revenue DECIMAL(10, 2) NOT NULL, -- ٧٥٪ بۆ دروستکەری بەرهەمەکە
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
