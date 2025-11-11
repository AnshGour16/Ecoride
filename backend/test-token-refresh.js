const fetch = require('node-fetch');

// Test configuration
const API_URL = 'http://localhost:5000/api';
const TEST_USER = {
    email: 'test@example.com',
    password: 'TestPassword123!'
};

// Store tokens
let accessToken = null;
let refreshToken = null;

// Helper function to parse cookies
const parseCookies = (response) => {
    const raw = response.headers.raw()['set-cookie'];
    return raw.map((entry) => {
        const parts = entry.split(';');
        const cookiePart = parts[0];
        return cookiePart;
    }).join(';');
};

async function loginUser() {
    console.log('Attempting to login...');
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(TEST_USER)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Login failed: ${data.message}`);
    }

    accessToken = data.token;
    console.log('Login successful. Access token received.');
    
    // Get refresh token from cookies
    const cookies = parseCookies(response);
    console.log('Cookies received:', cookies);

    return { accessToken, cookies };
}

async function makeAuthenticatedRequest() {
    console.log('Making authenticated request...');
    const response = await fetch(`${API_URL}/cars`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.status === 401) {
        console.log('Token expired, attempting refresh...');
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Cookie': refreshToken
            }
        });

        if (!refreshResponse.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await refreshResponse.json();
        accessToken = data.token;
        console.log('Token refreshed successfully');

        // Retry the original request
        return fetch(`${API_URL}/cars`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    }

    return response;
}

async function runTest() {
    try {
        // 1. Login
        const { accessToken: token, cookies } = await loginUser();
        refreshToken = cookies;
        console.log('Initial login successful');

        // 2. Make authenticated request
        const response = await makeAuthenticatedRequest();
        const data = await response.json();
        console.log('Authenticated request successful:', data);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();