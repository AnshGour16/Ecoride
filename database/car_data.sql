-- Insert a default location
INSERT INTO locations (name, address, city, state, postal_code, country, phone, operating_hours)
VALUES ('EcoRide Main Center', '123 Main Street', 'Mumbai', 'Maharashtra', '400001', 'India', '+91-1234567890', '24/7');

-- Insert cars data
INSERT INTO cars (model, brand, year, price, category, transmission, fuel_type, seats, mileage, license_plate, vin, image_url, features, location_id, availability)
VALUES 
('Camry', 'Toyota', 2023, 3500, 'economy', 'automatic', 'petrol', 5, 12000, 'MH01AB1111', 'TOY1CAMRY2023001T', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD1Wk9VE-rR_aiDbDdEc6yvx6Kg_qjk07roVSLnvRQOfRXPM9AsIPkZw7GjrAKARzivwM&usqp=CAU', '["AC", "Power Steering", "Power Windows"]', 1, true),

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
