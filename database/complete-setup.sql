-- Create missing tables and data for Docker MySQL setup
-- This script assumes the database 'ecoride' already exists

-- Add missing columns to existing tables
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS driver_license_number VARCHAR(50);

-- Create missing tables (if they don't exist)
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    service_date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2) NOT NULL,
    odometer_reading INT NOT NULL,
    next_service_date DATE,
    serviced_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
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

CREATE TABLE IF NOT EXISTS insurance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    insurance_type ENUM('basic', 'premium', 'comprehensive') NOT NULL,
    coverage_details TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    provider VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS damages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    car_id INT NOT NULL,
    damage_date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    repair_cost DECIMAL(10, 2),
    repair_status ENUM('reported', 'assessed', 'in_repair', 'completed') NOT NULL,
    images TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    min_booking_amount DECIMAL(10, 2),
    max_discount DECIMAL(10, 2),
    usage_limit INT,
    times_used INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- Insert sample data (only if tables are empty)
INSERT IGNORE INTO locations (id, name, address, city, state, postal_code, country, phone, operating_hours)
VALUES (1, 'EcoRide Main Center', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 'India', '+91-1234567890', '24/7');

-- Insert sample cars (only if table is empty)
INSERT IGNORE INTO cars (id, model, brand, year, price, category, transmission, fuel_type, seats, mileage, license_plate, vin, image_url, features, location_id, availability)
VALUES 
(1, 'Camry', 'Toyota', 2023, 3500.00, 'economy', 'automatic', 'petrol', 5, 12000, 'MH01AB1111', 'TOY123CAMRY2023001', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD1Wk9VE-rR_aiDbDdEc6yvx6Kg_qjk07roVSLnvRQOfRXPM9AsIPkZw7GjrAKARzivwM&usqp=CAU', '["AC", "Power Steering", "Power Windows"]', 1, true),
(2, 'CR-V', 'Honda', 2023, 4500.00, 'suv', 'automatic', 'diesel', 5, 14000, 'MH01AB1112', 'HON123CRV2023002', 'https://images8.alphacoders.com/549/549210.jpg', '["AC", "Power Steering", "Power Windows", "Sunroof"]', 1, true),
(3, 'S-Class', 'Mercedes', 2023, 12000.00, 'luxury', 'automatic', 'petrol', 5, 9000, 'MH01AB1113', 'MER123SCLS2023003', 'https://www.hdcarwallpapers.com/walls/mercedes_benz_s_klasse_lang_amg_line_2020_4k-HD.jpg', '["AC", "Premium Audio", "Leather Seats", "Sunroof"]', 1, true),
(4, 'Swift', 'Maruti Suzuki', 2023, 2000.00, 'economy', 'manual', 'petrol', 5, 22000, 'MH01AB1117', 'MAR123SWI2023007', 'https://images5.alphacoders.com/136/1365537.jpeg', '["AC", "Power Steering", "ABS"]', 1, true),
(5, 'Nexon EV', 'Tata', 2023, 5000.00, 'suv', 'automatic', 'electric', 5, 300, 'MH01AB1115', 'TAT123NEX2023005', 'https://s7ap1.scene7.com/is/image/tatapassenger/City-33?$B-1228-696-S$&fit=crop&fmt=webp', '["Electric", "Fast Charging", "Connected Car Tech"]', 1, true);

-- Create a default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT IGNORE INTO users (id, name, email, hashed_password, role, phone, created_at)
VALUES (1, 'Admin User', 'admin@ecoride.com', '$2b$10$rNdQGQJyS4.NXhO1GFGKyeE8HbUYeFqiY.ZBQk.Y8pVsKXKD9hCOq', 'admin', '+91-9876543210', NOW());

-- Create a test user (password: user123)
-- Password hash for 'user123' using bcrypt
INSERT IGNORE INTO users (id, name, email, hashed_password, role, phone, created_at)
VALUES (2, 'Test User', 'user@test.com', '$2b$10$QZ2.QNX.HSiNmQyxjI.TGO.jUyYjJoL2PfTR/KhcJ3.AY8E0Lvy0W', 'user', '+91-9876543211', NOW());