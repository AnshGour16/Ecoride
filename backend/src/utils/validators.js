module.exports = {
    validatePassword: (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const errors = [];
        if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
        if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
        if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
        if (!hasNumbers) errors.push('Password must contain at least one number');
        if (!hasSpecialChar) errors.push('Password must contain at least one special character');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },

    validateUserRegistration: (data) => {
        const { name, email, password } = data;
        const errors = {};
        
        // Name validation
        if (!name || name.trim() === '') {
            errors.name = 'Name is required';
        }

        // Email validation
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        const passwordValidation = module.exports.validatePassword(password);
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.errors;
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    validateUserLogin: (data) => {
        const { email, password } = data;
        const errors = {};

        // Email validation
        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    validateCarData: (data) => {
        const { model, brand, year, price, availability } = data;
        const errors = {};
        if (!model || model.trim() === '') {
            errors.model = 'Model is required';
        }
        if (!brand || brand.trim() === '') {
            errors.brand = 'Brand is required';
        }
        if (!year || isNaN(year) || year < 1886 || year > new Date().getFullYear()) {
            errors.year = 'Valid year is required';
        }
        if (!price || isNaN(price) || price <= 0) {
            errors.price = 'Price must be a positive number';
        }
        if (availability === undefined) {
            errors.availability = 'Availability status is required';
        }
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    validateBookingData: (data) => {
        const { user_id, car_id, start_date, end_date } = data;
        const errors = {};
        if (!user_id) {
            errors.user_id = 'User ID is required';
        }
        if (!car_id) {
            errors.car_id = 'Car ID is required';
        }
        if (!start_date) {
            errors.start_date = 'Start date is required';
        }
        if (!end_date) {
            errors.end_date = 'End date is required';
        }
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};