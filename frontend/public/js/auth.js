// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Check if localStorage is available
function isLocalStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.error('localStorage is not available:', e);
        return false;
    }
}

// Function to check server health
async function checkServerHealth() {
    try {
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        console.log('Server status:', data);
        return data.status === 'ok';
    } catch (error) {
        console.error('Server health check failed:', error);
        return false;
    }
}

// Function to show error message
function showError(message) {
    alert(message); // You can replace this with a better UI notification
}

// Function to show success message
function showSuccess(message) {
    alert(message); // You can replace this with a better UI notification
}

// Function to validate password strength
function validatePassword(password) {
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
}

// Function to update UI based on auth state
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const loggedInElements = document.querySelectorAll('.logged-in-only');
    const loggedOutElements = document.querySelectorAll('.logged-out-only');
    
    if (token) {
        loggedInElements.forEach(el => el.style.display = '');
        loggedOutElements.forEach(el => el.style.display = 'none');
        
        // Update user name if available
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
            el.textContent = user.name || 'User';
        });
    } else {
        loggedInElements.forEach(el => el.style.display = 'none');
        loggedOutElements.forEach(el => el.style.display = '');
    }
}

// Function to handle user registration
async function registerUser(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };

    console.log('Registration attempt with data:', { ...data, password: '***' });

    // Validate password match
    if (data.password !== data.confirmPassword) {
        console.error('Password mismatch');
        alert('Passwords do not match');
        return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
        console.error('Password validation failed:', passwordValidation.errors);
        alert(passwordValidation.errors.join('\n'));
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';

    try {
        console.log('Sending registration request to:', `${API_BASE_URL}/auth/register`);
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                password: data.password
            }),
        });

        const result = await response.json();
        console.log('Registration response:', { status: response.status, data: result });

        if (response.ok) {
            alert('Registration successful! Please log in.');
                window.location.href = 'login.html';
        } else {
            console.error('Registration failed:', result);
            alert(result.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Register';
    }
}

// Function to handle user login
async function loginUser(event) {
    event.preventDefault();
    
    // Check localStorage availability first
    if (!isLocalStorageAvailable()) {
        alert('Local storage is not available. Please enable cookies and try again.');
        return;
    }

    const formData = new FormData(event.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    console.log('Login attempt for:', data.email);
    console.log('Current origin:', window.location.origin);
    console.log('localStorage test before login:', {
        available: isLocalStorageAvailable(),
        testWrite: (() => {
            try {
                localStorage.setItem('test', 'test');
                const value = localStorage.getItem('test');
                localStorage.removeItem('test');
                return value === 'test';
            } catch (e) {
                return false;
            }
        })()
    });

    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';

    try {
        console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log('Login response:', { 
            status: response.status, 
            ok: response.ok,
            hasToken: !!result.token,
            hasUser: !!result.user,
            resultKeys: Object.keys(result)
        });

        if (response.ok && result.token) {
            console.log('Login successful, attempting to store token and user data');
            try {
                // Try storing a test value first
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');

                // Now try storing the actual data
            localStorage.setItem('token', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            
                // Verify the data was stored
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                
                console.log('Storage verification:', {
                    tokenStored: !!storedToken,
                    userStored: !!storedUser
                });

                if (!storedToken || !storedUser) {
                    throw new Error('Data storage verification failed');
                }

                // If we get here, storage was successful
                console.log('Token and user data stored successfully');
                
                // Small delay to ensure storage is complete before redirect
                setTimeout(() => {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user && user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 100);
            } catch (storageError) {
                console.error('Error storing data in localStorage:', storageError);
                alert('Error storing login data. Please check if cookies/storage are enabled and try again.');
            }
        } else {
            console.error('Login failed:', result);
            alert(result.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

// Function to handle user logout
function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Add event listeners for forms when they exist
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Setting up auth event listeners');

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('Register form found, adding submit listener');
        registerForm.addEventListener('submit', registerUser);
    } else {
        console.log('Register form not found');
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found, adding submit listener');
        loginForm.addEventListener('submit', loginUser);
    } else {
        console.log('Login form not found');
    }

    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        console.log('Logout button found, adding click listener');
        logoutButton.addEventListener('click', logoutUser);
    } else {
        console.log('Logout button not found');
    }
});