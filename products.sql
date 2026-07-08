CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(100) NOT NULL,
    product_type VARCHAR(50), -- 'Website', 'App', 'FinanceSystem', 'Mega3DGame'
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0.00, -- نرخی بەرهەمەکە بە دینار یان دۆلار
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
