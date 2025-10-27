# EcoRide Backend Documentation

## Overview
EcoRide is a full-featured car rental application designed to provide a seamless experience for users looking to rent cars. The backend is built using Node.js and Express.js, with MySQL as the database management system. This document outlines the setup and running instructions for the backend application.

## Features
- User authentication (registration and login)
- Car management (CRUD operations)
- Booking system (create and manage bookings)
- Admin dashboard for user and car management

## Prerequisites
- Node.js (version 14 or higher)
- MySQL (version 5.7 or higher)
- npm (Node package manager)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EcoRide/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a MySQL database for EcoRide.
   - Run the SQL schema located in `database/schema.sql` to set up the necessary tables.

4. **Configure database connection**
   - Update the database connection settings in `src/config/db.js` with your MySQL credentials.

## Running the Application

1. **Start the server**
   ```bash
   npm start
   ```

2. **Access the API**
   - The backend API will be available at `http://localhost:3000`.

## API Endpoints
- **Authentication**
  - `POST /api/auth/register` - Register a new user
  - `POST /api/auth/login` - Log in an existing user

- **Car Management**
  - `GET /api/cars` - Retrieve all cars
  - `POST /api/cars` - Add a new car
  - `PUT /api/cars/:id` - Update car details
  - `DELETE /api/cars/:id` - Delete a car

- **Booking Management**
  - `POST /api/bookings` - Create a new booking
  - `GET /api/bookings` - Retrieve all bookings

- **Admin Functions**
  - `GET /api/admin/users` - Retrieve all users
  - `GET /api/admin/cars` - Retrieve all cars for admin

## Middleware
- Authentication middleware is used to protect routes based on user roles.
- Error handling middleware is implemented to manage errors gracefully.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.