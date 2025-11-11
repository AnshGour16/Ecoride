// API base URL from config
const API_BASE_URL = 'http://localhost:5000/api';
import tokenManager from './tokenManager.js';

export async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    return tokenManager.fetchWithToken(url, options);
}

// API functions for authentication
export async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for receiving the refresh token cookie
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
        tokenManager.setAccessToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return { ok: response.ok, data };
}

export async function register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    return { ok: response.ok, data: await response.json() };
}

export async function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear the refresh token cookie by setting it to expire
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

// Export the tokenManager for direct access if needed
export { tokenManager };