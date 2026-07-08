CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'user' یان 'admin' یان 'owner'
    plan_type VARCHAR(20) DEFAULT 'Simple', -- 'Simple', 'Silver', 'Gold', 'Owner'
    trial_start_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    plan_expires_at TIMESTAMP NULL
);

-- زیادکردنی تۆ وەک خاوەنی فەرمی بە پلانی بێبەرامبەر و بێ کۆتایی
INSERT INTO users (username, email, role, plan_type) 
VALUES ('SAS.Rashid', 'rashid@sas-platform.com', 'owner', 'Owner');
