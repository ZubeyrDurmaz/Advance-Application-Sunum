-- Create USER_PAYMENT_METHODS table
CREATE TABLE IF NOT EXISTS USER_PAYMENT_METHODS (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    method_type VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    card_token VARCHAR(255),
    last_four VARCHAR(4),
    expiry_date VARCHAR(7),
    is_default BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_user_id ON USER_PAYMENT_METHODS(user_id);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_is_default ON USER_PAYMENT_METHODS(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_method_type ON USER_PAYMENT_METHODS(method_type);
CREATE INDEX IF NOT EXISTS idx_user_payment_methods_provider ON USER_PAYMENT_METHODS(provider);