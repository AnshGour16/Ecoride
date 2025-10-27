-- Drop database if exists and create new one
DROP DATABASE IF EXISTS ecoride_db;
CREATE DATABASE ecoride_db;
USE ecoride_db;

-- Create tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    driver_license VARCHAR(50),
    license_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    operating_hours TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    year YEAR NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    location_id INT,
    category ENUM('economy', 'compact', 'luxury', 'suv', 'van') NOT NULL,
    transmission ENUM('manual', 'automatic') NOT NULL,
    fuel_type ENUM('petrol', 'diesel', 'electric', 'hybrid') NOT NULL,
    seats INT NOT NULL,
    mileage INT DEFAULT 0,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vin VARCHAR(17) UNIQUE NOT NULL,
    image_url VARCHAR(255),
    features TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_location_id INT NOT NULL,
    dropoff_location_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'active', 'completed', 'canceled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (dropoff_location_id) REFERENCES locations(id) ON DELETE RESTRICT
);

CREATE TABLE reviews (
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

CREATE TABLE maintenance_records (
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

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_method ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer') NOT NULL,    payment_status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    refund_amount DECIMAL(10, 2) NULL,
    refund_date TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT
);

CREATE TABLE insurance_records (
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

CREATE TABLE damages (
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

CREATE TABLE promotions (
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

-- Insert location and car data
INSERT INTO locations (name, address, city, state, postal_code, country, phone, operating_hours)
VALUES ('EcoRide Main Center', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 'India', '+91-1234567890', '24/7');

INSERT INTO cars (model, brand, year, price, category, transmission, fuel_type, seats, mileage, license_plate, vin, image_url, features, location_id, availability)
VALUES 
('Camry', 'Toyota', 2023, 3500, 'economy', 'automatic', 'petrol', 5, 12000, 'MH01AB1111', 'TOY123CAMRY2023001', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD1Wk9VE-rR_aiDbDdEc6yvx6Kg_qjk07roVSLnvRQOfRXPM9AsIPkZw7GjrAKARzivwM&usqp=CAU', '["AC", "Power Steering", "Power Windows"]', 1, true),
('CR-V', 'Honda', 2023, 4500, 'suv', 'automatic', 'diesel', 5, 14000, 'MH01AB1112', 'HON123CRV2023002', 'https://images8.alphacoders.com/549/549210.jpg', '["AC", "Power Steering", "Power Windows", "Sunroof"]', 1, true),
('S-Class', 'Mercedes', 2023, 12000, 'luxury', 'automatic', 'petrol', 5, 9000, 'MH01AB1113', 'MER123SCLS2023003', 'https://www.hdcarwallpapers.com/walls/mercedes_benz_s_klasse_lang_amg_line_2020_4k-HD.jpg', '["AC", "Premium Audio", "Leather Seats", "Sunroof"]', 1, true),
('M4', 'BMW', 2023, 15000, 'luxury', 'manual', 'petrol', 4, 8000, 'MH01AB1114', 'BMW123M42023004', 'https://i.ytimg.com/vi/x9fB-2OOHFo/maxresdefault.jpg', '["Sports Mode", "Premium Audio", "Carbon Fiber Trim"]', 1, false),
('Nexon EV', 'Tata', 2023, 5000, 'suv', 'automatic', 'electric', 5, 300, 'MH01AB1115', 'TAT123NEX2023005', 'https://s7ap1.scene7.com/is/image/tatapassenger/City-33?$B-1228-696-S$&fit=crop&fmt=webp', '["Electric", "Fast Charging", "Connected Car Tech"]', 1, true),
('Creta', 'Hyundai', 2023, 4000, 'suv', 'automatic', 'diesel', 5, 16000, 'MH01AB1116', 'HYU123CRE2023006', 'https://w0.peakpx.com/wallpaper/775/571/HD-wallpaper-hyundai-creta-road-2021-cars-crossovers-mx-spec-su2-2021-hyundai-creta-korean-cars-hyundai.jpg', '["Panoramic Sunroof", "Connected Car Tech"]', 1, true),
('Swift', 'Maruti Suzuki', 2023, 2000, 'economy', 'manual', 'petrol', 5, 22000, 'MH01AB1117', 'MAR123SWI2023007', 'https://images5.alphacoders.com/136/1365537.jpeg', '["AC", "Power Steering", "ABS"]', 1, true),
('Seltos', 'Kia', 2023, 4200, 'suv', 'automatic', 'diesel', 5, 18000, 'MH01AB1118', 'KIA123SEL2023008', 'https://www.hdcarwallpapers.com/walls/kia_seltos_2023_4k-HD.jpg', '["Premium Audio", "Ventilated Seats"]', 1, false),
('Thar', 'Mahindra', 2023, 5500, 'suv', 'manual', 'petrol', 4, 15000, 'MH01AB1119', 'MAH123THA2023009', 'https://assets.onecompiler.app/43fngyxa8/43fngz4vv/photo-1633867179970-c54688bcfa33.jpg', '["4x4", "Convertible Top", "Off-road Capability"]', 1, true),
('Fortuner', 'Toyota', 2023, 7000, 'suv', 'automatic', 'diesel', 7, 12000, 'MH01AB1120', 'TOY123FOR2023010', 'https://wallpapercave.com/wp/wp5345258.jpg', '["Premium Interior", "4x4", "Third Row Seating"]', 1, true),
('Verna', 'Hyundai', 2023, 3800, 'economy', 'automatic', 'petrol', 5, 17000, 'MH01AB1121', 'HYU123VER2023011', 'https://cdn.wallpapersafari.com/88/26/Wyt3su.jpg', '["Ventilated Seats", "Digital Cluster"]', 1, true),
('Kwid', 'Renault', 2023, 1800, 'economy', 'manual', 'petrol', 5, 22000, 'MH01AB1122', 'REN123KWI2023012', 'https://w0.peakpx.com/wallpaper/94/401/HD-wallpaper-renault-kwid-ultra-crossovers-2021-cars-za-spec-2021-renault-kwid-french-cars-renault.jpg', '["AC", "Power Steering"]', 1, true),
('Safari', 'Tata', 2023, 5200, 'suv', 'automatic', 'diesel', 7, 14000, 'MH01AB1123', 'TAT123SAF2023013', 'https://wallpapercave.com/wp/wp4537772.jpg', '["Premium Interior", "Third Row Seating"]', 1, true),
('Hector', 'MG', 2023, 4800, 'suv', 'automatic', 'petrol', 5, 15000, 'MH01AB1124', 'MGM123HEC2023014', 'https://assets.gqindia.com/photos/5cdc04a7306c1c61f76e2b86/16:9/w_2560%2Cc_limit/top-image103.jpg', '["Panoramic Sunroof", "Connected Car Tech"]', 1, true),
('Baleno', 'Maruti', 2023, 2100, 'economy', 'manual', 'petrol', 5, 21000, 'MH01AB1125', 'MAR123BAL2023015', 'https://wallpapercat.com/w/full/f/8/f/1745577-2880x1800-desktop-hd-suzuki-baleno-background-image.jpg', '["Smart Play Infotainment", "LED DRLs"]', 1, true);
