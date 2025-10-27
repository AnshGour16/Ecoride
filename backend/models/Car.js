const db = require('../config/db');

class Car {
    constructor(id, brand, model, year, price, category, transmission, fuel_type, seats, license_plate, vin, image_url, availability) {
        this.id = id;
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.price = price;
        this.category = category;
        this.transmission = transmission;
        this.fuel_type = fuel_type;
        this.seats = seats;
        this.license_plate = license_plate;
        this.vin = vin;
        this.image_url = image_url;
        this.availability = availability;
    }

    static async create(carData) {
        const sql = `
            INSERT INTO cars (
                brand, model, year, price, category, 
                transmission, fuel_type, seats,
                license_plate, vin, image_url, availability
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(sql, [
                carData.brand,
                carData.model,
                carData.year,
                carData.price,
                carData.category,
                carData.transmission,
                carData.fuel_type,
                carData.seats,
                carData.license_plate,
                carData.vin,
                carData.image_url || null,
                carData.availability || true
            ]);
            
            return result.insertId;
        } catch (error) {
            console.error('Error in Car.create:', error);
            throw error;
        }
    }

    static async findById(id) {
        const sql = 'SELECT * FROM cars WHERE id = ?';
        const [rows] = await db.execute(sql, [id]);
        if (rows.length === 0) {
            return null;
        }
        const car = rows[0];
        return new Car(
            car.id, car.brand, car.model, car.year, car.price, car.category,
            car.transmission, car.fuel_type, car.seats, car.license_plate, car.vin,
            car.image_url, car.availability
        );
    }

    static async findAll() {
        const sql = 'SELECT * FROM cars';
        const [rows] = await db.execute(sql);
        return rows.map(car => new Car(
            car.id, car.brand, car.model, car.year, car.price, car.category,
            car.transmission, car.fuel_type, car.seats, car.license_plate, car.vin,
            car.image_url, car.availability
        ));
    }

    static async update(id, carData) {
        const sql = `
            UPDATE cars SET
                brand = ?, model = ?, year = ?, price = ?, category = ?, 
                transmission = ?, fuel_type = ?, seats = ?, license_plate = ?, 
                vin = ?, image_url = ?, availability = ?
            WHERE id = ?
        `;
        
        try {
            const [result] = await db.execute(sql, [
                carData.brand,
                carData.model,
                carData.year,
                carData.price,
                carData.category,
                carData.transmission,
                carData.fuel_type,
                carData.seats,
                carData.license_plate,
                carData.vin,
                carData.image_url || null,
                carData.availability || true,
                id
            ]);
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in Car.update:', error);
            throw error;
        }
    }

    static async delete(id) {
        const sql = 'DELETE FROM cars WHERE id = ?';
        const [result] = await db.execute(sql, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Car;