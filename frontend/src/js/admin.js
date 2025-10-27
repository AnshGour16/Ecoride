// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    loadUsers();
    loadCars();
    loadBookingMetrics();
});

function loadUsers() {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const userTable = document.getElementById('userTableBody');
        userTable.innerHTML = '';
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="viewUserDetails(${user.id})" class="btn btn-info btn-sm">View</button>
                    ${user.role !== 'admin' ? 
                        `<button onclick="deleteUser(${user.id})" class="btn btn-danger btn-sm ml-2">Delete</button>` : 
                        ''}
                </td>
            `;
            userTable.appendChild(row);
        });
    })
    .catch(error => console.error('Error loading users:', error));
}

function loadCars() {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/cars`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const carTable = document.getElementById('carTableBody');
        carTable.innerHTML = '';
        data.forEach(car => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${car.id}</td>
                <td>${car.model}</td>
                <td>${car.brand}</td>
                <td>${car.year}</td>
                <td>Rs${car.price}/day</td>
                <td>
                    <span class="badge ${getAvailabilityBadge(car.availability)}">${car.availability ? 'Available' : 'Not Available'}</span>
                    <button onclick="toggleCarAvailability(${car.id}, ${car.availability})" class="btn btn-sm ${car.availability ? 'btn-warning' : 'btn-success'} ms-2">
                        ${car.availability ? 'Make Unavailable' : 'Make Available'}
                    </button>
                </td>
                <td>
                    <button onclick="editCar(${car.id})" class="btn btn-primary btn-sm">Edit</button>
                    <button onclick="deleteCar(${car.id})" class="btn btn-danger btn-sm ms-2">Delete</button>
                </td>
            `;
            carTable.appendChild(row);
        });
    })
    .catch(error => console.error('Error loading cars:', error));
}

function loadBookingMetrics() {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/metrics/bookings`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalBookings').textContent = data.totalBookings;
        document.getElementById('completedBookings').textContent = data.completedBookings;
        document.getElementById('pendingBookings').textContent = data.pendingBookings;

        // Show custom alert if there are pending bookings
        if (data.pendingBookings > 0) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-info alert-dismissible fade show mt-3';
            alertDiv.innerHTML = `
                <strong>Pending Bookings!</strong> You have ${data.pendingBookings} booking(s) waiting for confirmation.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                <div class="mt-2">
                    <button class="btn btn-primary btn-sm" onclick="document.querySelector('#bookingsSection')?.scrollIntoView({behavior:'smooth'})">
                        View Bookings
                    </button>
                </div>
            `;
            const container = document.querySelector('#alerts-container') || document.body;
            container.insertBefore(alertDiv, container.firstChild);
            
            // Auto dismiss after 5 seconds
            setTimeout(() => alertDiv.remove(), 5000);
        }
    })
    .catch(error => {
        console.error('Error loading metrics:', error);
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
        alertDiv.innerHTML = `
            <strong>Error!</strong> Failed to load booking metrics.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        const container = document.querySelector('#alerts-container') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        setTimeout(() => alertDiv.remove(), 5000);
    });
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            alert('User deleted successfully');
            loadUsers();
        } else {
            throw new Error('Failed to delete user');
        }
    })
    .catch(error => {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    });
}

function deleteCar(carId) {
    if (!confirm('Are you sure you want to delete this car?')) return;

    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/cars/${carId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Car deleted successfully');
            loadCars();
        } else {
            throw new Error('Failed to delete car');
        }
    })
    .catch(error => {
        console.error('Error deleting car:', error);
        alert('Error deleting car. Please try again.');
    });
}

function viewUserDetails(userId) {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(user => {
        // Show user details in modal
        const modal = document.getElementById('userDetailsModal');
        const modalContent = modal.querySelector('.modal-body');
        modalContent.innerHTML = `
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Created:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            <h5 class="mt-4">Booking History</h5>
            ${user.bookings?.length ? generateBookingsTable(user.bookings) : '<p>No bookings found</p>'}
        `;
        modal.style.display = 'block';
    })
    .catch(error => console.error('Error loading user details:', error));
}

function editCar(carId) {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/admin/cars/${carId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(car => {
        // Show edit car form in modal
        const modal = document.getElementById('editCarModal');
        const form = modal.querySelector('form');
        
        // Populate all form fields
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
        
        // Show the modal using Bootstrap
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    })
    .catch(error => {
        console.error('Error loading car details:', error);
        alert('Error loading car details. Please try again.');
    });
}

function getAvailabilityBadge(availability) {
    return availability ? 'bg-success' : 'bg-danger';
}

function generateBookingsTable(bookings) {
    return `
        <table class="table table-sm">
            <thead>
                <tr>
                    <th>Car</th>
                    <th>Dates</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.car.brand} ${booking.car.model}</td>
                        <td>${new Date(booking.start_date).toLocaleDateString()} - ${new Date(booking.end_date).toLocaleDateString()}</td>
                        <td><span class="badge ${getStatusBadgeClass(booking.status)}">${booking.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-success';
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

// Helper function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.getElementsByClassName('modal');
    for (const modal of modals) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function addNewCar() {
    const modal = document.getElementById('addCarModal');
    const form = modal.querySelector('form');
    form.reset();
    modal.style.display = 'block';
}

async function handleAddCarSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    
    try {
        const formData = new FormData(form);
        const carData = {};
        
        // Process and validate form data
        for (const [key, value] of formData.entries()) {
            if (value.trim() === '' && key !== 'image_url') {
                throw new Error(`${key} is required`);
            }
            
            switch(key) {
                case 'price':
                    const price = parseFloat(value);
                    if (isNaN(price) || price <= 0) {
                        throw new Error('Price must be a positive number');
                    }
                    carData[key] = price;
                    break;
                    
                case 'seats':
                case 'year':
                    const num = parseInt(value);
                    if (isNaN(num) || num <= 0) {
                        throw new Error(`${key} must be a valid positive number`);
                    }
                    carData[key] = num;
                    break;
                    
                case 'availability':
                    carData[key] = value === 'on';
                    break;
                    
                default:
                    carData[key] = value.trim();
            }
        }

        console.log('Submitting car data:', carData);
        
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Adding...';

        const result = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/cars`, {
            method: 'POST',
            body: JSON.stringify(carData)
        });

        console.log('Car added successfully:', result);
        showSuccess('Car added successfully');
        form.reset();
        
        const modal = document.getElementById('addCarModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        } else {
            modal.style.display = 'none';
        }
        
        loadCars();
    } catch (error) {
        console.error('Error adding car:', error);
        showError(error.message || 'Failed to add car');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Add Car';
    }
}

function validateCarData(form) {
    const requiredFields = {
        brand: 'Brand',
        model: 'Model',
        category: 'Category',
        price: 'Price',
        transmission: 'Transmission',
        fuel_type: 'Fuel Type',
        seats: 'Seats',
        year: 'Year'
    };

    const carData = {};
    const errors = [];

    // Validate each field
    for (const [field, label] of Object.entries(requiredFields)) {
        const value = form[field]?.value?.trim();
        if (!value) {
            errors.push(`${label} is required`);
            continue;
        }

        // Type validation
        switch (field) {
            case 'price':
                const price = parseFloat(value);
                if (isNaN(price) || price <= 0) {
                    errors.push('Price must be a positive number');
                }
                carData[field] = price;
                break;
            case 'seats':
            case 'year':
                const num = parseInt(value);
                if (isNaN(num) || num <= 0) {
                    errors.push(`${label} must be a valid number`);
                }
                carData[field] = num;
                break;
            default:
                carData[field] = value;
        }
    }

    if (errors.length > 0) {
        throw new Error(errors.join('\n'));
    }

    // Add optional fields
    carData.image_url = form.image_url?.value?.trim() || '';
    carData.availability = form.availability?.checked || false;

    return carData;
}

function showError(message) {
    console.error('Showing error:', message);
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <strong>Error!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('#alerts-container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('#alerts-container').appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 5000);
}

async function handleEditCarSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const carData = Object.fromEntries(formData.entries());
    const carId = carData.carId;
    delete carData.carId;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/cars/${carId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(carData)
        });

        if (!response.ok) {
            throw new Error('Failed to update car');
        }

        alert('Car updated successfully');
        document.getElementById('editCarModal').style.display = 'none';
        loadCars();
    } catch (error) {
        console.error('Error updating car:', error);
        alert('Error updating car. Please try again.');
    }
}

async function toggleCarAvailability(carId, currentStatus) {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'make unavailable' : 'make available'} this car?`)) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/cars/${carId}/availability`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ availability: !currentStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update car availability');
        }

        alert('Car availability updated successfully');
        loadCars();
    } catch (error) {
        console.error('Error updating car availability:', error);
        alert('Error updating car availability. Please try again.');
    }
}

function getAuthToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Authentication token not found');
    }
    return token;
}

async function makeAuthenticatedRequest(url, options = {}) {
    try {
        console.log('Making request to:', url, 'with options:', options);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
                ...options.headers
            }
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error('Unexpected response format:', text);
            throw new Error('Invalid server response format');
        }

        console.log('Server response:', response.status, data);

        if (!response.ok) {
            throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Request failed:', error);
        throw new Error(error.message || 'Failed to complete request');
    }
}