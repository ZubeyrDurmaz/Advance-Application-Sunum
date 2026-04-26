-- Create USER_ADDRESSES table
CREATE TABLE IF NOT EXISTS USER_ADDRESSES (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    address_title VARCHAR(50),
    full_address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10),
    is_default BOOLEAN DEFAULT false,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON USER_ADDRESSES(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON USER_ADDRESSES(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_user_addresses_city ON USER_ADDRESSES(city);