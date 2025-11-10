-- Sample cars for testing the Ecoride application
-- This script adds a variety of cars across different categories

-- First ensure we have a location
INSERT IGNORE INTO locations (id, name, address, city, state, postal_code, country, phone, operating_hours)
VALUES (1, 'EcoRide Main Center', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 'India', '+91-1234567890', '24/7');

-- Add sample cars
INSERT INTO cars (model, brand, year, price, category, transmission, fuel_type, seats, mileage, license_plate, vin, image_url, features, location_id, availability) VALUES 
-- Economy Cars
('Swift', 'Maruti Suzuki', 2023, 1800, 'economy', 'manual', 'petrol', 5, 22000, 'MH01AB1001', 'MAR123SWI2023001', 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500', 'AC, Power Steering, ABS, Airbags', 1, true),
('Baleno', 'Maruti Suzuki', 2022, 2100, 'economy', 'automatic', 'petrol', 5, 21000, 'MH01AB1002', 'MAR123BAL2022002', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500', 'Smart Play Infotainment, LED DRLs, Automatic Climate Control', 1, true),
('i20', 'Hyundai', 2023, 2200, 'economy', 'automatic', 'petrol', 5, 20000, 'MH01AB1003', 'HYU123I202023003', 'https://images.unsplash.com/photo-1549399381-c4b6b4b7b0b4?w=500', 'Touchscreen Infotainment, Wireless Charging, Sunroof', 1, true),
('Kwid', 'Renault', 2023, 1500, 'economy', 'manual', 'petrol', 5, 22000, 'MH01AB1004', 'REN123KWI2023004', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500', 'Digital Instrument Cluster, Touchscreen', 1, true),

-- Compact Cars
('Verna', 'Hyundai', 2023, 2800, 'compact', 'automatic', 'petrol', 5, 17000, 'MH01AB1005', 'HYU123VER2023005', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500', 'Ventilated Seats, Digital Cluster, Wireless Android Auto', 1, true),
('City', 'Honda', 2023, 3000, 'compact', 'automatic', 'petrol', 5, 17500, 'MH01AB1006', 'HON123CIT2023006', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500', 'Honda Sensing, Lane Watch Camera, Sunroof', 1, true),
('Rapid', 'Skoda', 2022, 2600, 'compact', 'manual', 'petrol', 5, 16000, 'MH01AB1007', 'SKO123RAP2022007', 'https://images.unsplash.com/photo-1494976688153-ca3ce0ced5b0?w=500', 'Cruise Control, Rain Sensing Wipers, Auto Headlamps', 1, false),

-- SUVs
('Creta', 'Hyundai', 2023, 4000, 'suv', 'automatic', 'diesel', 5, 16000, 'MH01AB1008', 'HYU123CRE2023008', 'https://images.unsplash.com/photo-1605515298946-d062f2108ac4?w=500', 'Panoramic Sunroof, Connected Car Tech, Air Purifier', 1, true),
('Seltos', 'Kia', 2023, 4200, 'suv', 'automatic', 'petrol', 5, 18000, 'MH01AB1009', 'KIA123SEL2023009', 'https://images.unsplash.com/photo-1511527844068-006b95d162c2?w=500', 'Premium Audio, Ventilated Seats, 360 Camera', 1, true),
('Compass', 'Jeep', 2023, 5500, 'suv', 'automatic', 'diesel', 5, 14000, 'MH01AB1010', 'JEE123COM2023010', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500', '4x4, Uconnect Touchscreen, Dual-Pane Sunroof', 1, true),
('Thar', 'Mahindra', 2023, 5000, 'suv', 'manual', 'diesel', 4, 15000, 'MH01AB1011', 'MAH123THA2023011', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500', '4x4, Convertible Top, Off-road Capability, Roll Cage', 1, true),
('Nexon', 'Tata', 2023, 3500, 'suv', 'automatic', 'electric', 5, 0, 'MH01AB1012', 'TAT123NEX2023012', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500', 'Electric, Fast Charging, Connected Car Tech, ISOFIX', 1, true),
('Fortuner', 'Toyota', 2023, 7000, 'suv', 'automatic', 'diesel', 7, 12000, 'MH01AB1013', 'TOY123FOR2023013', 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=500', 'Premium Interior, 4x4, Third Row Seating, Toyota Safety Sense', 1, true),

-- Luxury Cars
('C-Class', 'Mercedes-Benz', 2023, 15000, 'luxury', 'automatic', 'petrol', 5, 12000, 'MH01AB1014', 'MER123CCL2023014', 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500', 'MBUX Infotainment, Premium Audio, Ambient Lighting', 1, true),
('3 Series', 'BMW', 2023, 16000, 'luxury', 'automatic', 'petrol', 5, 11000, 'MH01AB1015', 'BMW123SER2023015', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500', 'iDrive, Sports Mode, Premium Leather, Gesture Control', 1, false),
('A4', 'Audi', 2023, 14000, 'luxury', 'automatic', 'petrol', 5, 13000, 'MH01AB1016', 'AUD123A42023016', 'https://images.unsplash.com/photo-1549399381-c4b6b4b7b0b4?w=500', 'Virtual Cockpit, Quattro AWD, Bang & Olufsen Audio', 1, true),
('Camry', 'Toyota', 2023, 12000, 'luxury', 'automatic', 'hybrid', 5, 23000, 'MH01AB1017', 'TOY123CAM2023017', 'https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=500', 'Hybrid Technology, JBL Premium Audio, Wireless Charging', 1, true),

-- Vans
('Innova Crysta', 'Toyota', 2023, 6000, 'van', 'automatic', 'diesel', 8, 13000, 'MH01AB1018', 'TOY123INN2023018', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500', 'Captain Seats, Dual AC, Premium Interior, Third Row', 1, true),
('Ertiga', 'Maruti Suzuki', 2023, 3200, 'van', 'manual', 'petrol', 7, 19000, 'MH01AB1019', 'MAR123ERT2023019', 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500', 'Smart Play Studio, Auto AC, Third Row Seating', 1, true),
('Carnival', 'Kia', 2023, 8000, 'van', 'automatic', 'diesel', 9, 14000, 'MH01AB1020', 'KIA123CAR2023020', 'https://images.unsplash.com/photo-1511527844068-006b95d162c2?w=500', 'Premium MPV, Captain Seats, Dual Sunroof, 8-inch Display', 1, false),

-- Electric/Hybrid Vehicles
('Nexon EV Max', 'Tata', 2023, 5500, 'suv', 'automatic', 'electric', 5, 0, 'MH01AB1021', 'TAT123NEV2023021', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500', 'Long Range Battery, Fast Charging, Connected Features', 1, true),
('ZS EV', 'MG', 2023, 6500, 'suv', 'automatic', 'electric', 5, 0, 'MH01AB1022', 'MGM123ZSE2023022', 'https://images.unsplash.com/photo-1605515298946-d062f2108ac4?w=500', 'Electric SUV, i-Smart Technology, Fast Charging', 1, true),
('Tigor EV', 'Tata', 2023, 4200, 'compact', 'automatic', 'electric', 5, 0, 'MH01AB1023', 'TAT123TIG2023023', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500', 'Ziptron Technology, Connected Car Features, Fast Charging', 1, true);

-- Add some location data if needed
INSERT IGNORE INTO locations (id, name, address, city, state, postal_code, country, phone, operating_hours) VALUES
(2, 'EcoRide Airport Hub', 'Terminal 2, Chhatrapati Shivaji Airport', 'Mumbai', 'Maharashtra', '400099', 'India', '+91-1234567891', '24/7'),
(3, 'EcoRide Pune Center', '456 Pune Station Road', 'Pune', 'Maharashtra', '411001', 'India', '+91-1234567892', '6:00 AM - 10:00 PM'),
(4, 'EcoRide Delhi Hub', '789 Connaught Place', 'New Delhi', 'Delhi', '110001', 'India', '+91-1234567893', '24/7');

-- Update some cars to be at different locations
UPDATE cars SET location_id = 2 WHERE id IN (3, 7, 11, 15, 19);
UPDATE cars SET location_id = 3 WHERE id IN (5, 9, 13, 17, 21);
UPDATE cars SET location_id = 4 WHERE id IN (2, 6, 10, 14, 18);

-- Add some sample bookings for testing (optional)
-- Note: These use the test user account we created earlier
INSERT IGNORE INTO bookings (user_id, car_id, start_date, end_date, pickup_location_id, dropoff_location_id, status, total_amount, driver_license_number) VALUES
(2, 1, '2025-11-15', '2025-11-17', 1, 1, 'confirmed', 3600.00, 'MH12345678901'),
(2, 8, '2025-11-20', '2025-11-22', 1, 2, 'pending', 8000.00, 'MH12345678901'),
(2, 12, '2025-11-25', '2025-11-27', 2, 2, 'active', 7000.00, 'MH12345678901');