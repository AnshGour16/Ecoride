// API base URL from config
const API_BASE_URL = 'http://localhost:5000/api';

class TokenManager {
    constructor() {
        this.accessToken = localStorage.getItem('token');
        this.refreshing = false;
        this.refreshQueue = [];
    }

    getAccessToken() {
        return this.accessToken;
    }

    setAccessToken(token) {
        this.accessToken = token;
        localStorage.setItem('token', token);
    }

    async refreshToken() {
        // If already refreshing, queue this request
        if (this.refreshing) {
            return new Promise((resolve, reject) => {
                this.refreshQueue.push({ resolve, reject });
            });
        }

        this.refreshing = true;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include', // Important for sending cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            this.setAccessToken(data.token);

            // Process queued requests
            this.refreshQueue.forEach(request => {
                request.resolve(data.token);
            });

            return data.token;
        } catch (error) {
            // Handle refresh failure
            this.refreshQueue.forEach(request => {
                request.reject(error);
            });
            
            // Clear tokens and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
            
            throw error;
        } finally {
            this.refreshing = false;
            this.refreshQueue = [];
        }
    }

    // Utility function to check if a token is expired
    isTokenExpired(token) {
        if (!token) return true;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            return Date.now() >= expiryTime;
        } catch (error) {
            console.error('Error checking token expiry:', error);
            return true;
        }
    }

    // Wrapper for fetch that handles token refresh
    async fetchWithToken(url, options = {}) {
        // Check if token is expired or will expire soon (within 1 minute)
        if (this.isTokenExpired(this.accessToken)) {
            try {
                await this.refreshToken();
            } catch (error) {
                throw new Error('Unable to refresh token');
            }
        }

        // Add token to headers
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`
        };

        try {
            const response = await fetch(url, { ...options, headers });
            
            // If we get a 401, try refreshing token once
            if (response.status === 401) {
                try {
                    await this.refreshToken();
                    // Retry the request with new token
                    headers.Authorization = `Bearer ${this.accessToken}`;
                    return fetch(url, { ...options, headers });
                } catch (error) {
                    throw new Error('Token refresh failed');
                }
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    }
}

// Create a singleton instance
const tokenManager = new TokenManager();

export default tokenManager;