-- Create bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location_id INT NOT NULL,
    dropoff_location_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'active', 'completed', 'canceled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    driver_license_number VARCHAR(50),
    booking_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (dropoff_location_id) REFERENCES locations(id) ON DELETE RESTRICT
);

-- Create payments table with dummy gateway support
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer', 'card', 'upi') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    refund_amount DECIMAL(10, 2) NULL,
    refund_date TIMESTAMP NULL DEFAULT NULL,
    gateway_response JSON NULL COMMENT 'Store gateway response details',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);

-- Create reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    car_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Insert test data if table is empty
INSERT IGNORE INTO locations (id, name, address, city, state, postal_code, country, phone, operating_hours)
VALUES (1, 'EcoRide Main Center', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 'India', '+91-1234567890', '24/7');

-- Create a default admin user (password: admin123)
INSERT IGNORE INTO users (id, name, email, hashed_password, role, phone, created_at)
VALUES (1, 'Admin User', 'admin@ecoride.com', '$2b$10$rNdQGQJyS4.NXhO1GFGKyeE8HbUYeFqiY.ZBQk.Y8pVsKXKD9hCOq', 'admin', '+91-9876543210', NOW());

-- Create a test user (password: user123)
INSERT IGNORE INTO users (id, name, email, hashed_password, role, phone, created_at)
VALUES (2, 'Test User', 'user@test.com', '$2b$10$QZ2.QNX.HSiNmQyxjI.TGO.jUyYjJoL2PfTR/KhcJ3.AY8E0Lvy0W', 'user', '+91-9876543211', NOW());