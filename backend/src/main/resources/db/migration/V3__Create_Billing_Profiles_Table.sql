-- Create BILLING_PROFILES table
CREATE TABLE IF NOT EXISTS BILLING_PROFILES (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    address_id VARCHAR(50),
    account_holder_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_billing_profile_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_billing_profile_address 
        FOREIGN KEY (address_id) REFERENCES USER_ADDRESSES(id) ON DELETE SET NULL,
    
    -- Unique constraint to ensure one billing profile per user
    CONSTRAINT uk_billing_profile_user UNIQUE (user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_billing_profiles_user_id ON BILLING_PROFILES(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_address_id ON BILLING_PROFILES(address_id);
CREATE INDEX IF NOT EXISTS idx_billing_profiles_account_holder ON BILLING_PROFILES(account_holder_name);

-- Create trigger to update updated_at timestamp on row updates (PostgreSQL specific)
CREATE OR REPLACE FUNCTION update_billing_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_billing_profiles_updated_at
    BEFORE UPDATE ON BILLING_PROFILES
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_profiles_updated_at();