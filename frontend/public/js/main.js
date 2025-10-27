// This file contains the main JavaScript logic for the frontend. 

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Update navigation based on authentication status
function updateNavigation() {
    const token = localStorage.getItem('token');
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    const bookingsLink = document.querySelector('a[href="bookings.html"]');
    const logoutBtn = document.getElementById('logoutBtn');

    if (token) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (bookingsLink) bookingsLink.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (bookingsLink) bookingsLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Error handler
function handleError(error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again later.');
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize tooltips and popovers if using Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add event listeners for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const target = event.target.getAttribute('href');
            loadPage(target);
        });
    });

    // Function to load pages dynamically
    function loadPage(page) {
        fetch(page)
            .then(response => response.text())
            .then(html => {
                document.getElementById('content').innerHTML = html;
            })
            .catch(error => console.error('Error loading page:', error));
    }

    // Load the default page
    loadPage('index.html');

    updateNavigation();

    // Add logout button if not exists
    if (!document.getElementById('logoutBtn') && isLoggedIn()) {
        const nav = document.querySelector('.navbar-nav');
        const li = document.createElement('li');
        li.className = 'nav-item';
        const button = document.createElement('button');
        button.id = 'logoutBtn';
        button.className = 'btn btn-link nav-link';
        button.textContent = 'Logout';
        button.onclick = logout;
        li.appendChild(button);
        nav.appendChild(li);
    }
});