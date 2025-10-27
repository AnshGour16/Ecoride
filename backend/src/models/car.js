const { query } = require('../config/db');

class Car {
    static async findAll() {
        try {
            console.log('[Car Model] Executing findAll query');
            const sql = 'SELECT * FROM cars';
            console.log('[Car Model] SQL Query:', sql);
            
            const cars = await query(sql);
            console.log(`[Car Model] Found ${cars.length} cars:`, cars);
            
            if (!Array.isArray(cars)) {
                console.error('[Car Model] Query did not return an array:', cars);
                throw new Error('Invalid response format from database');
            }
            
            return cars;
        } catch (error) {
            console.error('[Car Model] Error in findAll:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack
            });
            throw error;
        }
    }

    static async findById(id) {
        try {
            const cars = await query('SELECT * FROM cars WHERE id = ?', [id]);
            return cars[0];
        } catch (error) {
            console.error('[Car Model] Error in findById:', error);
            throw error;
        }
    }

    static async create(carData) {
        try {
            console.log('[Car Model] Creating car with data:', carData);

            // Validate required fields
            const requiredFields = ['model', 'brand', 'year', 'price', 'category', 'transmission', 'fuel_type', 'seats'];
            const missingFields = requiredFields.filter(field => !carData[field] && carData[field] !== 0);
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate string fields
            const stringFields = ['model', 'brand', 'category', 'transmission', 'fuel_type'];
            stringFields.forEach(field => {
                if (typeof carData[field] !== 'string' || carData[field].trim().length === 0) {
                    throw new Error(`Invalid ${field}: must be a non-empty string`);
                }
            });

            // Clean and validate numeric fields
            const year = parseInt(carData.year);
            const price = parseFloat(carData.price);
            const seats = parseInt(carData.seats);

            if (isNaN(year) || year < 2000 || year > 2025) {
                throw new Error('Year must be between 2000 and 2025');
            }
            if (isNaN(price) || price <= 0) {
                throw new Error('Price must be a positive number');
            }
            if (isNaN(seats) || seats < 2 || seats > 9) {
                throw new Error('Number of seats must be between 2 and 9');
            }

            // Validate category values
            const validCategories = ['economy', 'luxury', 'suv', 'electric', 'hybrid'];
            if (!validCategories.includes(carData.category.toLowerCase())) {
                throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
            }

            const insertData = {
                model: carData.model.trim(),
                brand: carData.brand.trim(),
                year: year,
                price: price,
                category: carData.category.trim(),
                transmission: carData.transmission.trim(),
                fuel_type: carData.fuel_type.trim(),
                seats: seats,
                mileage: carData.mileage ? parseInt(carData.mileage) : 0,
                license_plate: carData.license_plate ? carData.license_plate.trim() : null,
                vin: carData.vin ? carData.vin.trim() : null,
                image_url: carData.image_url ? carData.image_url.trim() : null,
                features: carData.features ? JSON.stringify(carData.features) : '[]',
                location_id: parseInt(carData.location_id) || 1,
                availability: carData.availability === undefined ? true : !!carData.availability
            };
            
            console.log('[Car Model] Executing insert with:', insertData);
            const result = await query(
                'INSERT INTO cars (model, brand, year, price, category, transmission, fuel_type, seats, mileage, license_plate, vin, image_url, features, location_id, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    insertData.model, 
                    insertData.brand, 
                    insertData.year, 
                    insertData.price, 
                    insertData.category, 
                    insertData.transmission, 
                    insertData.fuel_type, 
                    insertData.seats, 
                    insertData.mileage,
                    insertData.license_plate,
                    insertData.vin,
                    insertData.image_url,
                    insertData.features,
                    insertData.location_id,
                    insertData.availability
                ]
            );
            console.log('[Car Model] Insert result:', result);
            return result.insertId;
        } catch (error) {
            console.error('[Car Model] Error in create:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack
            });
            throw error;
        }
    }

    static async update(id, carData) {
        try {
            const result = await query(
                'UPDATE cars SET model = ?, brand = ?, year = ?, price = ?, category = ?, transmission = ?, fuel_type = ?, seats = ?, mileage = ?, license_plate = ?, vin = ?, image_url = ?, features = ?, location_id = ?, availability = ? WHERE id = ?',
                [carData.model, carData.brand, carData.year, carData.price, carData.category, carData.transmission, carData.fuel_type, carData.seats, carData.mileage, carData.license_plate, carData.vin, carData.image_url, JSON.stringify(carData.features), carData.location_id, carData.availability, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('[Car Model] Error in update:', error);
            throw error;
        }
    }

    static async updateAvailability(id, availability) {
        try {
            console.log('[Car Model] Updating availability:', { id, availability });
            const result = await query(
                'UPDATE cars SET availability = ? WHERE id = ?',
                [availability, id]
            );
            console.log('[Car Model] Update result:', result);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('[Car Model] Error in updateAvailability:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            console.log('[Car Model] Deleting car:', { id });
            const result = await query('DELETE FROM cars WHERE id = ?', [id]);
            console.log('[Car Model] Delete result:', result);
            if (result.affectedRows === 0) {
                throw new Error('Car not found or could not be deleted');
            }
            return true;
        } catch (error) {
            console.error('[Car Model] Error in delete:', {
                message: error.message,
                code: error.code,
                sqlState: error.sqlState,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = Car;