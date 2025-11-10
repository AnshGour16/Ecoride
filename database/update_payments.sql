-- Update script to modify the payments table to support dummy payment gateway methods

-- First, let's add the new payment methods to the enum
ALTER TABLE payments 
MODIFY COLUMN payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'card', 'upi') NOT NULL;

-- Add any additional columns that might be useful for the dummy gateway
-- (The existing schema already has most of what we need)

-- Optional: Add indexes for better performance
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Optional: Add a column for gateway-specific data if needed
ALTER TABLE payments 
ADD COLUMN gateway_response JSON NULL COMMENT 'Store gateway response details';

-- Update any existing test data if needed
-- UPDATE payments SET payment_method = 'card' WHERE payment_method = 'credit_card';
-- UPDATE payments SET payment_method = 'card' WHERE payment_method = 'debit_card';