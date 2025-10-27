// Helper function to check admin authentication
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No authentication token found');
        localStorage.clear(); // Clear any stale data
        window.location.href = 'login.html';
        return false;
    }

    let user;
    try {
        user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id || !user.role) {
            throw new Error('Invalid user data');
        }
    } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.clear();
        window.location.href = 'login.html';
        return false;
    }

    if (user.role !== 'admin') {
        console.log('User is not an admin:', user.role);
        window.location.href = 'dashboard.html';
        return false;
    }

    return true;
}

// Helper function for making authenticated API requests
async function makeAuthenticatedRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    // If the options include a body that's not already a string, stringify it
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = 'login.html';
                throw new Error('Session expired. Please log in again.');
            } else if (response.status === 403) {
                window.location.href = 'dashboard.html';
                throw new Error('Access denied. Admin privileges required.');
            }
            throw new Error(data.message || `API error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
    }
}

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin JS loaded');
    
    // Check admin authentication
    if (!checkAdminAuth()) {
        return;
    }

    // Set up periodic auth check (every 5 minutes)
    setInterval(checkAdminAuth, 5 * 60 * 1000);
    
    console.log('Admin authenticated, loading default section');
    loadUsers();
});

async function loadUsers() {
    console.log('Loading users...');
    showLoading('userTableBody');
    
    try {
        const users = await makeAuthenticatedRequest('/admin/users');
        console.log('Users data received:', users);
        
        if (!Array.isArray(users) || !users.length) {
            document.getElementById('userTableBody').innerHTML = '<div class="text-center">No users found.</div>';
        } else {
            document.getElementById('userTableBody').innerHTML = generateUserTable(users);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('userTableBody', error.message);
    } finally {
        showAdminSection('users');
    }
}

function generateUserTable(users) {
    let html = `<table class="table table-striped table-dark">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Actions</th></tr></thead><tbody>`;
    users.forEach(u => {
        html += `<tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.phone || ''}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewUserDetails(${u.id})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
                </td>
        </tr>`;
        });
    html += '</tbody></table>';
    return html;
}

async function loadCars() {
    console.log('Loading cars...');
    showLoading('carTableBody');
    
    try {
        // Get both car metrics and list in parallel
        const [metrics, cars] = await Promise.all([
            makeAuthenticatedRequest('/admin/metrics/cars'),
            makeAuthenticatedRequest('/cars')
        ]);
        
        console.log('Cars data received:', { metrics, cars });
        const html = `
            ${generateCarMetrics(metrics)}
            <hr class="my-4">
            ${generateCarsTable(cars)}
        `;
        document.getElementById('carTableBody').innerHTML = html;
    } catch (error) {
        console.error('Error loading cars:', error);
        showError('carTableBody', error.message);
    } finally {
        showAdminSection('cars');
    }
}

function generateCarsTable(cars) {
    if (!Array.isArray(cars) || !cars.length) {
        return '<div class="text-center">No cars found.</div>';
    }
    
    let html = `<table class="table table-striped table-dark">
        <thead>
            <tr>
                <th>ID</th>
                <th>Brand</th>
                <th>Model</th>
                <th>Year</th>
                <th>Category</th>
                <th>Price/Day</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>`;
    
    cars.forEach(car => {
        html += `<tr>
            <td>${car.id}</td>
            <td>${car.brand}</td>
            <td>${car.model}</td>
            <td>${car.year}</td>
            <td>${car.category}</td>
            <td>₹${car.price}</td>
            <td>
                <span class="badge ${car.availability ? 'bg-success' : 'bg-danger'}">
                    ${car.availability ? 'Available' : 'Not Available'}
                </span>
            </td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editCar(${car.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteCar(${car.id})">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn ${car.availability ? 'btn-warning' : 'btn-success'} btn-sm" 
                        onclick="toggleCarAvailability(${car.id}, ${car.availability})">
                    <i class="fas fa-${car.availability ? 'ban' : 'check'}"></i>
                </button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    return html;
}

function addNewCar() {
    const modal = new bootstrap.Modal(document.getElementById('addCarModal'));
    const form = document.getElementById('addCarForm');
    form.reset();
    modal.show();
}

async function handleAddCarSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const carData = Object.fromEntries(formData.entries());
    
    try {
        // Validate required fields
        const requiredFields = ['brand', 'model', 'year', 'price', 'category', 'transmission', 'fuel_type', 'seats'];
        const missingFields = requiredFields.filter(field => !carData[field]);
        if (missingFields.length > 0) {
            throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        }

        // Clean and validate data
        const year = parseInt(carData.year);
        const price = parseFloat(carData.price);
        const seats = parseInt(carData.seats);

        if (isNaN(year) || year < 2000 || year > 2025) {
            throw new Error('Year must be between 2000 and 2025');
        }
        if (isNaN(price) || price <= 0) {
            throw new Error('Please enter a valid price');
        }
        if (isNaN(seats) || seats < 2 || seats > 9) {
            throw new Error('Number of seats must be between 2 and 9');
        }

        // Validate category
        const validCategories = ['economy', 'luxury', 'suv', 'electric', 'hybrid'];
        if (!validCategories.includes(carData.category.toLowerCase())) {
            throw new Error(`Category must be one of: ${validCategories.join(', ')}`);
        }

        // Prepare data for API
        const cleanData = {
            brand: carData.brand.trim(),
            model: carData.model.trim(),
            year: year,
            price: price,
            category: carData.category.toLowerCase(),
            transmission: carData.transmission.trim(),
            fuel_type: carData.fuel_type.trim(),
            seats: seats,
            mileage: parseInt(carData.mileage || '0'),
            image_url: carData.image_url ? carData.image_url.trim() : null,
            availability: carData.availability === 'on' || carData.availability === true
        };

        await makeAuthenticatedRequest('/admin/cars', {
            method: 'POST',
            body: JSON.stringify(cleanData)
        });

        const modal = bootstrap.Modal.getInstance(document.getElementById('addCarModal'));
        modal.hide();
        alert('Car added successfully');
        loadCars();
    } catch (error) {
        console.error('Error adding car:', error);
        alert('Error adding car. Please try again.');
    }
}

function editCar(carId) {
    makeAuthenticatedRequest(`/admin/cars/${carId}`)
        .then(car => {
            const modal = new bootstrap.Modal(document.getElementById('editCarModal'));
            const form = document.getElementById('editCarForm');
            
            // Populate form fields
            form.elements['carId'].value = car.id;
            form.elements['brand'].value = car.brand;
            form.elements['model'].value = car.model;
            form.elements['year'].value = car.year;
            form.elements['price'].value = car.price;
            form.elements['category'].value = car.category;
            form.elements['transmission'].value = car.transmission;
            form.elements['fuel_type'].value = car.fuel_type;
            form.elements['seats'].value = car.seats;
            form.elements['image_url'].value = car.image_url || '';
            form.elements['availability'].checked = car.availability;
            
            modal.show();
        })
        .catch(error => {
            console.error('Error loading car details:', error);
            alert('Error loading car details. Please try again.');
        });
}

async function handleEditCarSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const carData = Object.fromEntries(formData.entries());
    const carId = carData.carId;
    delete carData.carId;

    try {
        await makeAuthenticatedRequest(`/cars/${carId}`, {
            method: 'PUT',
            body: JSON.stringify(carData)
        });

        const modal = bootstrap.Modal.getInstance(document.getElementById('editCarModal'));
        modal.hide();
        alert('Car updated successfully');
        loadCars();
    } catch (error) {
        console.error('Error updating car:', error);
        alert('Error updating car. Please try again.');
    }
}

async function deleteCar(carId) {
    if (!confirm('Are you sure you want to delete this car?')) return;
    
    try {
        await makeAuthenticatedRequest(`/admin/cars/${carId}`, { method: 'DELETE' });
        showSuccess('Car deleted successfully');
        loadCars(); // Reload the car list
    } catch (error) {
        console.error('Error deleting car:', error);
        showError('carTableBody', error.message);
    }
}

async function toggleCarAvailability(carId, currentStatus) {
    try {
        await makeAuthenticatedRequest(`/admin/cars/${carId}/availability`, {
            method: 'PUT',
            body: JSON.stringify({ availability: !currentStatus })
        });
        showSuccess(`Car ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
        loadCars(); // Reload the car list
    } catch (error) {
        console.error('Error toggling car availability:', error);
        showError('carTableBody', error.message);
    }
}

function loadBookingMetrics() {
    console.log('Loading booking metrics...');
    showLoading('bookingTableBody');
    
    makeAuthenticatedRequest('/admin/metrics/bookings')
        .then(data => {
            console.log('Booking metrics received:', data);
            document.getElementById('bookingTableBody').innerHTML = generateBookingMetrics(data);
            showAdminSection('bookings');
        })
        .catch(err => {
            console.error('Error loading booking metrics:', err);
            showError('bookingTableBody', `Error loading booking metrics: ${err.message}`);
            showAdminSection('bookings');
        });
}

function generateBookingMetrics(metrics) {
    if (!metrics) return '<div class="text-center">No booking metrics found.</div>';
    return `<div class="row justify-content-center">
        <div class="col-md-4">
            <div class="card bg-dark text-success mb-3"><div class="card-body">
                <h5 class="card-title">Total Bookings</h5>
                <p class="card-text fs-3">${metrics.totalBookings || 0}</p>
            </div></div>
        </div>
        <div class="col-md-4">
            <div class="card bg-dark text-success mb-3"><div class="card-body">
                <h5 class="card-title">Completed</h5>
                <p class="card-text fs-3">${metrics.completedBookings || 0}</p>
            </div></div>
        </div>
        <div class="col-md-4">
            <div class="card bg-dark text-success mb-3"><div class="card-body">
                <h5 class="card-title">Pending</h5>
                <p class="card-text fs-3">${metrics.pendingBookings || 0}</p>
            </div></div>
        </div>
    </div>`;
}

function generateCarMetrics(metrics) {
    if (!metrics) return '<div class="text-center">No car metrics found.</div>';
    let html = `<div class="row justify-content-center">
        <div class="col-md-4">
            <div class="card bg-dark text-success mb-3"><div class="card-body">
                <h5 class="card-title">Total Cars</h5>
                <p class="card-text fs-3">${metrics.totalCars || 0}</p>
            </div></div>
        </div>
        <div class="col-md-4">
            <div class="card bg-dark text-success mb-3"><div class="card-body">
                <h5 class="card-title">Available</h5>
                <p class="card-text fs-3">${metrics.availableCars || 0}</p>
            </div></div>
        </div>
        <div class="col-md-4">
            <div class="card bg-dark text-success mb-3"><div class="card-body">
                <h5 class="card-title">Unavailable</h5>
                <p class="card-text fs-3">${metrics.unavailableCars || 0}</p>
            </div></div>
        </div>
    </div>`;
    if (metrics.byCategory && metrics.byCategory.length) {
        html += `<h5 class="text-success mt-4">By Category</h5><ul class="list-group">`;
        metrics.byCategory.forEach(cat => {
            html += `<li class="list-group-item bg-dark text-success d-flex justify-content-between align-items-center">
                ${cat.category}
                <span class="badge bg-success rounded-pill">${cat.count}</span>
            </li>`;
        });
        html += '</ul>';
    }
    return html;
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    makeAuthenticatedRequest(`/admin/users/${userId}`, {
        method: 'DELETE'
    })
    .then(() => {
        alert('User deleted successfully');
        loadUsers();
    })
    .catch(error => {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    });
}

function viewUserDetails(userId) {
    makeAuthenticatedRequest(`/admin/users/${userId}`)
        .then(user => {
            // Show user details in modal
            const modal = document.getElementById('userDetailsModal');
            if (!modal) {
                // Create modal if it doesn't exist
                createUserDetailsModal();
            }
            const modalContent = document.querySelector('#userDetailsModal .modal-body');
            modalContent.innerHTML = `
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Created:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                <h5 class="mt-4">Booking History</h5>
                ${user.bookings?.length ? generateBookingsTable(user.bookings) : '<p>No bookings found</p>'}
            `;
            
            // Show the modal
            const modalElement = document.getElementById('userDetailsModal');
            const modalInstance = new bootstrap.Modal(modalElement);
            modalInstance.show();
        })
        .catch(error => console.error('Error loading user details:', error));
}

function createUserDetailsModal() {
    // Create modal HTML if it doesn't exist
    const modalHTML = `
        <div class="modal fade" id="userDetailsModal" tabindex="-1" aria-labelledby="userDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content bg-dark text-light">
                    <div class="modal-header">
                        <h5 class="modal-title text-success" id="userDetailsModalLabel">User Details</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        Loading user details...
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function generateBookingsTable(bookings) {
    if (!Array.isArray(bookings) || !bookings.length) {
        return '<div class="text-center">No bookings found.</div>';
    }
    let html = `<table class="table table-striped table-dark">
        <thead><tr><th>ID</th><th>User</th><th>Car</th><th>Dates</th><th>Status</th><th>Action</th></tr></thead><tbody>`;
    bookings.forEach(b => {
        html += `<tr>
            <td>${b.id}</td>
            <td>${b.user?.name || b.user_id}</td>
            <td>${b.car?.brand || ''} ${b.car?.model || ''}</td>
            <td>${new Date(b.start_date).toLocaleDateString()} - ${new Date(b.end_date).toLocaleDateString()}</td>
            <td><span class="badge ${getStatusBadgeClass(b.status)}">${b.status}</span></td>
            <td>
                ${b.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="acceptBooking(${b.id})">Accept</button> <button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.id})">Cancel</button>` : ''}
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    return html;
}

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-success text-white'; // Green background, white text
        case 'pending':
            return 'bg-warning text-dark';
        case 'cancelled':
            return 'bg-danger';
        case 'completed':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

function acceptBooking(bookingId) {
    makeAuthenticatedRequest(`/bookings/${bookingId}/accept`, {
        method: 'PUT'
    })
    .then(() => {
        alert('Booking accepted!');
        loadBookings();
    });
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    makeAuthenticatedRequest(`/bookings/${bookingId}/cancel`, {
        method: 'PUT'
    })
    .then(() => {
        alert('Booking cancelled!');
        loadBookings();
    })
    .catch(err => {
        alert('Error cancelling booking.');
    });
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Helper to show only the relevant section
function showAdminSection(section) {
    document.getElementById('userTableBody').style.display = section === 'users' ? 'block' : 'none';
    document.getElementById('carTableBody').style.display = section === 'cars' ? 'block' : 'none';
    document.getElementById('bookingTableBody').style.display = section === 'bookings' ? 'block' : 'none';
    
    document.querySelectorAll('.admin-btn').forEach(btn => btn.classList.remove('active'));
    if (section === 'users') document.getElementById('btnUsers').classList.add('active');
    if (section === 'cars') document.getElementById('btnCars').classList.add('active');
    if (section === 'bookings') document.getElementById('btnBookings').classList.add('active');
    console.log('Switched to section:', section);
}

function showLoading(id) {
    document.getElementById(id).innerHTML = '<div class="text-center text-success"><i class="fas fa-spinner fa-spin me-2"></i>Loading...</div>';
}

function showError(id, msg) {
    document.getElementById(id).innerHTML = `<div class="alert alert-danger text-center">${msg}</div>`;
}

function showSuccess(msg) {
    alert(msg);
}

function loadBookings() {
    showLoading('bookingTableBody');
    makeAuthenticatedRequest('/bookings')
        .then(data => {
            document.getElementById('bookingTableBody').innerHTML = generateBookingsTable(data);
            showAdminSection('bookings');
        })
        .catch(err => {
            showError('bookingTableBody', 'Error loading bookings.');
            showAdminSection('bookings');
        });
}

window.loadBookings = loadBookings;

// Make functions available globally
window.loadUsers = loadUsers;
window.loadCars = loadCars;
window.loadBookingMetrics = loadBookingMetrics;
window.deleteUser = deleteUser;
window.viewUserDetails = viewUserDetails;
window.acceptBooking = acceptBooking;
window.cancelBooking = cancelBooking;
window.addNewCar = addNewCar;
window.handleAddCarSubmit = handleAddCarSubmit;
window.editCar = editCar;
window.handleEditCarSubmit = handleEditCarSubmit;
window.deleteCar = deleteCar;
window.toggleCarAvailability = toggleCarAvailability;