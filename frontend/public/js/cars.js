// This file contains JavaScript functions for managing car-related functionalities.

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

let cars = [];
let locations = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCars();
    setupEventListeners();
});

// Function to load and display available cars
async function loadCars() {
    const carList = document.getElementById('car-list');
    try {
        carList.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        const response = await fetch(`${API_BASE_URL}/cars`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        // Handle both single car and array responses
        cars = Array.isArray(data) ? data : [data];
        console.log('Processed cars:', cars);
        
        carList.innerHTML = '';
        
        if (cars.length === 0) {
            carList.innerHTML = '<div class="col-12"><div class="alert alert-dark">No cars available at the moment.</div></div>';
            return;
        }
        
        cars.forEach(car => {
            const carCol = document.createElement('div');
            carCol.className = 'col-md-4 mb-4';
            carCol.innerHTML = `
                <div class="card car-card h-100 bg-dark text-light border-success position-relative" data-category="${car.category}">
                    <div class="position-relative" style="height: 200px;">
                        <img src="${car.image_url || 'images/default-car.jpg'}" 
                             class="card-img-top" 
                             alt="${car.brand} ${car.model}"
                             style="height: 200px; object-fit: cover; border-bottom: 2px solid #2ecc71;">
                        ${car.availability === false || car.availability === 0 ? 
                            `<div class='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center' 
                                  style='background:rgba(0,0,0,0.6);z-index:2;pointer-events:none;height:100%;'>
                                <span class='badge bg-danger fs-5'>Unavailable</span>
                             </div>` : ''}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-success">${car.brand} ${car.model}</h5>
                        <p class="card-text text-muted">${car.year} • ${car.transmission} • ${car.fuel_type}</p>
                        <p class="card-text text-light">
                            <strong>Price:</strong> ₹${car.price}/day
                        </p>
                        <p class="card-text text-light">
                            <strong>Category:</strong> ${car.category}
                        </p>
                        <p class="card-text text-light">
                            <strong>Seats:</strong> ${car.seats}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <button class="btn btn-success" 
                                    onclick="showBookingModal(${car.id})" 
                                    ${car.availability === false || car.availability === 0 ? 'disabled' : ''}>
                                Book Now
                            </button>
                            <button class="btn btn-outline-success" 
                                    onclick="viewCarDetails(${car.id})">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            `;
            carList.appendChild(carCol);
        });
    } catch (error) {
        console.error('Error loading cars:', error);
        carList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error loading cars. Please try again later.</div></div>';
    }
}

// Fetch locations and cache them
async function fetchLocations() {
    try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        if (!response.ok) throw new Error('Failed to fetch locations');
        locations = await response.json();
    } catch (error) {
        console.error('Error fetching locations:', error);
        locations = [];
    }
}

// Update showBookingModal to use a dropdown for pickup location
async function showBookingModal(carId) {
    // Fetch locations if not already loaded
    if (locations.length === 0) await fetchLocations();
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    const modalBody = document.querySelector('#bookingModal .modal-body');
    
    // Build the location dropdown
    let locationOptions = '<option value="">Select a location</option>';
    locations.forEach(loc => {
        locationOptions += `<option value="${loc.id}">${loc.name} - ${loc.address}, ${loc.city}</option>`;
    });

    modalBody.innerHTML = `
        <form id="booking-form" class="bg-dark text-light p-3 rounded">
            <input type="hidden" name="carId" value="${carId}">
            <div class="mb-3">
                <label for="startDate" class="form-label text-success">Start Date</label>
                <input type="date" class="form-control bg-dark text-light border-success" id="startDate" name="startDate" required>
            </div>
            <div class="mb-3">
                <label for="endDate" class="form-label text-success">End Date</label>
                <input type="date" class="form-control bg-dark text-light border-success" id="endDate" name="endDate" required>
            </div>
            <div class="mb-3">
                <label for="pickupLocationId" class="form-label text-success">Pickup Location</label>
                <select class="form-control bg-dark text-light border-success" id="pickupLocationId" name="pickupLocationId" required>
                    ${locationOptions}
                </select>
            </div>
            <div class="mb-3">
                <label for="driverLicenseNumber" class="form-label text-success">Driver License Number</label>
                <input type="text" class="form-control bg-dark text-light border-success" id="driverLicenseNumber" name="driverLicenseNumber" required placeholder="Enter your driver license number">
            </div>
            <div class="text-end">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-success">Confirm Booking</button>
            </div>
        </form>`;
    
    // Attach the event listener after the form is added to the DOM
    const bookingForm = modalBody.querySelector('#booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    modal.show();
}

// Function to view car details
function viewCarDetails(carId) {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    const modal = new bootstrap.Modal(document.getElementById('carDetailsModal'));
    const modalBody = document.querySelector('#carDetailsModal .modal-body');
    
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';
    
    modalBody.innerHTML = `
        <div class="card bg-dark text-light border-success">
            <img src="${car.image_url || 'images/default-car.jpg'}" 
                 class="card-img-top" 
                 alt="${car.brand} ${car.model}"
                 style="height: 300px; object-fit: cover; border-bottom: 2px solid #28a745;">
            <div class="card-body">
                <h5 class="card-title text-success">${car.brand} ${car.model}</h5>
                <div class="car-details">
                    <p class="text-light"><strong>Year:</strong> ${car.year}</p>
                    <p class="text-light"><strong>Transmission:</strong> ${car.transmission}</p>
                    <p class="text-light"><strong>Fuel Type:</strong> ${car.fuel_type}</p>
                    <p class="text-light"><strong>Seats:</strong> ${car.seats}</p>
                    <p class="text-light"><strong>Mileage:</strong> ${car.mileage} km</p>
                    <p class="text-light"><strong>Price:</strong> ₹${car.price}/day</p>
                    <p class="text-light"><strong>Category:</strong> ${car.category}</p>
                    <p class="text-light"><strong>Status:</strong> 
                        <span class="badge ${car.availability ? 'bg-success' : 'bg-danger'}">
                            ${car.availability ? 'Available' : 'Unavailable'}
                        </span>
                    </p>
                </div>
                <div class="text-end mt-3">
                    ${isAdmin ? `
                        <div class="admin-controls mb-3">
                            <button class="btn btn-warning" onclick="toggleCarAvailability(${car.id}, ${car.availability})">
                                ${car.availability ? 'Make Unavailable' : 'Make Available'}
                            </button>
                            <button class="btn btn-primary" onclick="editCar(${car.id})">
                                Edit Car
                            </button>
                            <button class="btn btn-danger" onclick="deleteCar(${car.id})">
                                Delete Car
                            </button>
                        </div>
                    ` : ''}
                    <button class="btn btn-success" onclick="showBookingModal(${car.id})" ${car.availability === false || car.availability === 0 ? 'disabled' : ''}>
                        Book Now
                    </button>
                    ${car.availability === false || car.availability === 0 ? `<span class='badge bg-danger ms-2'>Unavailable</span>` : ''}
                </div>
            </div>
        </div>`;
    
    modal.show();
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Setup event listeners for filters and other UI elements
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Get the filter value
            const filter = button.getAttribute('data-filter');
            // Filter cars based on category
            filterCars(filter);
        });
    });
}

// Function to filter cars by category
function filterCars(category) {
    const carCards = document.querySelectorAll('.car-card');
    carCards.forEach(card => {
        const carCategory = card.getAttribute('data-category')?.toLowerCase() || '';
        if (category === 'all' || carCategory === category.toLowerCase()) {
            card.closest('.col-md-4').style.display = 'block';
            card.closest('.col-md-4').style.opacity = 0;
            setTimeout(() => {
                card.closest('.col-md-4').style.opacity = 1;
                card.closest('.col-md-4').style.transition = 'opacity 0.4s';
            }, 10);
        } else {
            card.closest('.col-md-4').style.opacity = 1;
            card.closest('.col-md-4').style.transition = 'opacity 0.4s';
            setTimeout(() => {
                card.closest('.col-md-4').style.opacity = 0;
                setTimeout(() => {
                    card.closest('.col-md-4').style.display = 'none';
                }, 400);
            }, 10);
        }
    });
}

async function handleBookingSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const carId = form.querySelector('[name="carId"]').value;
    const startDate = form.querySelector('[name="startDate"]').value;
    const endDate = form.querySelector('[name="endDate"]').value;
    const pickupLocationId = form.querySelector('[name="pickupLocationId"]').value;
    const driverLicenseNumber = form.querySelector('[name="driverLicenseNumber"]').value;

    // Enhanced validation
    const validationErrors = [];
    
    if (!carId) validationErrors.push('Car selection is required');
    if (!startDate) validationErrors.push('Start date is required');
    if (!endDate) validationErrors.push('End date is required');
    if (!pickupLocationId) validationErrors.push('Pickup location is required');
    if (!driverLicenseNumber) validationErrors.push('Driver license number is required');
    
    if (validationErrors.length > 0) {
        showNotification(validationErrors.join('\n'), notificationTypes.ERROR);
        return;
    }

    // Validate pickup location
    if (isNaN(parseInt(pickupLocationId))) {
        showNotification('Please select a valid pickup location', notificationTypes.ERROR);
        return;
    }

    // Enhanced date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (start < now) {
        showNotification('Start date cannot be in the past', notificationTypes.ERROR);
        return;
    }

    if (end <= start) {
        showNotification('End date must be after start date', notificationTypes.ERROR);
        return;
    }

    // Validate user session
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user && user.id ? user.id : null;
    if (!userId) {
        showNotification('Your session has expired. Please log in again.', notificationTypes.WARNING);
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating booking...';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication required. Please log in again.', notificationTypes.WARNING);
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const payload = {
            user_id: userId,
            car_id: parseInt(carId),
            start_date: startDate,
            end_date: endDate,
            pickup_location_id: parseInt(pickupLocationId),
            dropoff_location_id: null,
            driver_license_number: driverLicenseNumber
        };

        console.log('Booking payload:', payload);
        
        const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Booking response:', result);

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create booking');
        }

        // Close modal and show payment interface
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
        if (modal) modal.hide();
        
        // Show payment interface for the newly created booking
        showPaymentInterface(result.booking);

    } catch (error) {
        console.error('Booking error:', error);
        showNotification(error.message || 'An error occurred while processing your booking', notificationTypes.ERROR);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Confirm Booking';
    }
}
window.handleBookingSubmit = handleBookingSubmit;

// Helper function to check if user is logged in and token exists
function requireAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user || user.role !== 'admin') {
        alert('Your session has expired or you are not authorized. Please log in as admin.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Add admin car management functions
async function toggleCarAvailability(carId, currentStatus) {
    if (!requireAdminAuth()) return;
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

function editCar(carId) {
    if (!requireAdminAuth()) return;
    const car = cars.find(c => c.id === carId);
    if (!car) return;

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
}

async function deleteCar(carId) {
    if (!requireAdminAuth()) return;
    if (!confirm('Are you sure you want to delete this car? This action cannot be undone.')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/cars/${carId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete car');
        }

        alert('Car deleted successfully');
        loadCars();
    } catch (error) {
        console.error('Error deleting car:', error);
        alert('Error deleting car. Please try again.');
    }
}

// Payment Interface Functions
function showPaymentInterface(booking) {
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    const modalBody = document.querySelector('#bookingModal .modal-body');
    
    // Calculate total amount (assuming it's available in booking object)
    const totalAmount = booking.total_amount || 0;
    
    modalBody.innerHTML = `
        <div class="payment-interface bg-dark text-light p-4 rounded">
            <div class="text-center mb-4">
                <h4 class="text-success">Complete Your Payment</h4>
                <p class="text-muted">Booking ID: #${booking.id}</p>
            </div>
            
            <div class="booking-summary mb-4 p-3 border border-success rounded">
                <h5 class="text-success mb-3">Booking Summary</h5>
                <div class="row">
                    <div class="col-6"><strong>Car:</strong></div>
                    <div class="col-6">${booking.car?.brand || 'Car'} ${booking.car?.model || ''}</div>
                </div>
                <div class="row">
                    <div class="col-6"><strong>Start Date:</strong></div>
                    <div class="col-6">${new Date(booking.start_date).toLocaleDateString()}</div>
                </div>
                <div class="row">
                    <div class="col-6"><strong>End Date:</strong></div>
                    <div class="col-6">${new Date(booking.end_date).toLocaleDateString()}</div>
                </div>
                <div class="row">
                    <div class="col-6"><strong>Total Amount:</strong></div>
                    <div class="col-6 text-success"><h5>₹${totalAmount}</h5></div>
                </div>
            </div>

            <form id="payment-form">
                <input type="hidden" name="bookingId" value="${booking.id}">
                <input type="hidden" name="amount" value="${totalAmount}">
                
                <div class="payment-method-selection mb-4">
                    <h5 class="text-success mb-3">Select Payment Method</h5>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <div class="payment-option p-3 border border-success rounded" 
                                 style="cursor: pointer;" 
                                 onclick="selectPaymentMethod('card')">
                                <input type="radio" id="card-payment" name="paymentMethod" value="card" class="me-2">
                                <label for="card-payment" class="form-label">
                                    <i class="fas fa-credit-card me-2"></i>Credit/Debit Card
                                </label>
                            </div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <div class="payment-option p-3 border border-success rounded" 
                                 style="cursor: pointer;" 
                                 onclick="selectPaymentMethod('upi')">
                                <input type="radio" id="upi-payment" name="paymentMethod" value="upi" class="me-2">
                                <label for="upi-payment" class="form-label">
                                    <i class="fas fa-mobile-alt me-2"></i>UPI Payment
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Card Payment Form -->
                <div id="card-payment-form" class="payment-form-section" style="display: none;">
                    <h6 class="text-success mb-3">Card Details</h6>
                    <div class="row">
                        <div class="col-12 mb-3">
                            <label for="cardNumber" class="form-label">Card Number</label>
                            <input type="text" class="form-control bg-dark text-light border-success" 
                                   id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" 
                                   maxlength="19" oninput="formatCardNumber(this)">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="expiryDate" class="form-label">Expiry Date</label>
                            <input type="text" class="form-control bg-dark text-light border-success" 
                                   id="expiryDate" name="expiryDate" placeholder="MM/YY" 
                                   maxlength="5" oninput="formatExpiryDate(this)">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="cvv" class="form-label">CVV</label>
                            <input type="text" class="form-control bg-dark text-light border-success" 
                                   id="cvv" name="cvv" placeholder="123" maxlength="4">
                        </div>
                        <div class="col-12 mb-3">
                            <label for="cardholderName" class="form-label">Cardholder Name</label>
                            <input type="text" class="form-control bg-dark text-light border-success" 
                                   id="cardholderName" name="cardholderName" placeholder="John Doe">
                        </div>
                    </div>
                </div>

                <!-- UPI Payment Form -->
                <div id="upi-payment-form" class="payment-form-section" style="display: none;">
                    <h6 class="text-success mb-3">UPI Details</h6>
                    <div class="mb-3">
                        <label for="upiId" class="form-label">UPI ID</label>
                        <input type="text" class="form-control bg-dark text-light border-success" 
                               id="upiId" name="upiId" placeholder="your-upi@paytm">
                    </div>
                </div>

                <div class="text-end mt-4">
                    <button type="button" class="btn btn-secondary me-2" onclick="cancelPayment()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-success" id="paymentSubmitBtn">
                        <i class="fas fa-lock me-2"></i>Pay ₹${totalAmount}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Attach payment form event listener
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
    
    modal.show();
}

function selectPaymentMethod(method) {
    // Update radio button
    document.querySelector(`input[value="${method}"]`).checked = true;
    
    // Hide all payment forms
    document.querySelectorAll('.payment-form-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected payment form
    const formToShow = document.getElementById(`${method}-payment-form`);
    if (formToShow) {
        formToShow.style.display = 'block';
    }
    
    // Update payment option styling
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('border-primary');
        option.style.backgroundColor = '';
    });
    
    const selectedOption = document.querySelector(`input[value="${method}"]`).closest('.payment-option');
    selectedOption.classList.add('border-primary');
    selectedOption.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
}

async function handlePaymentSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const bookingId = formData.get('bookingId');
    const amount = formData.get('amount');
    const paymentMethod = formData.get('paymentMethod');
    
    if (!paymentMethod) {
        showNotification('Please select a payment method', notificationTypes.ERROR);
        return;
    }
    
    // Validate payment details based on method
    const validationErrors = [];
    
    if (paymentMethod === 'card') {
        const cardNumber = formData.get('cardNumber')?.replace(/\s/g, '');
        const expiryDate = formData.get('expiryDate');
        const cvv = formData.get('cvv');
        const cardholderName = formData.get('cardholderName');
        
        if (!cardNumber || cardNumber.length < 16) validationErrors.push('Valid card number is required');
        if (!expiryDate || expiryDate.length < 5) validationErrors.push('Valid expiry date is required');
        if (!cvv || cvv.length < 3) validationErrors.push('Valid CVV is required');
        if (!cardholderName?.trim()) validationErrors.push('Cardholder name is required');
    } else if (paymentMethod === 'upi') {
        const upiId = formData.get('upiId');
        if (!upiId?.includes('@')) validationErrors.push('Valid UPI ID is required');
    }
    
    if (validationErrors.length > 0) {
        showNotification(validationErrors.join('\n'), notificationTypes.ERROR);
        return;
    }
    
    const submitButton = document.getElementById('paymentSubmitBtn');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Authentication required. Please log in again.', notificationTypes.WARNING);
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }
        
        // Prepare payment data
        const paymentData = {
            booking_id: parseInt(bookingId),
            amount: parseFloat(amount),
            payment_method: paymentMethod
        };
        
        // Add method-specific data
        if (paymentMethod === 'card') {
            paymentData.card_details = {
                card_number: formData.get('cardNumber').replace(/\s/g, ''),
                expiry_date: formData.get('expiryDate'),
                cvv: formData.get('cvv'),
                cardholder_name: formData.get('cardholderName')
            };
        } else if (paymentMethod === 'upi') {
            paymentData.upi_details = {
                upi_id: formData.get('upiId')
            };
        }
        
        console.log('Processing payment:', paymentData);
        
        const response = await fetch(`${API_BASE_URL}/payments/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        console.log('Payment response:', result);
        
        if (!response.ok) {
            throw new Error(result.message || 'Payment failed');
        }
        
        // Show payment success
        showPaymentSuccess(result);
        
    } catch (error) {
        console.error('Payment error:', error);
        showNotification(error.message || 'Payment failed. Please try again.', notificationTypes.ERROR);
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

function showPaymentSuccess(paymentResult) {
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    const modalBody = document.querySelector('#bookingModal .modal-body');
    
    modalBody.innerHTML = `
        <div class="payment-success bg-dark text-light p-4 rounded text-center">
            <div class="success-icon mb-4">
                <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
            </div>
            <h3 class="text-success mb-3">Payment Successful!</h3>
            <p class="text-light mb-4">Your booking has been confirmed and payment processed successfully.</p>
            
            <div class="payment-details p-3 border border-success rounded mb-4">
                <h5 class="text-success mb-3">Payment Details</h5>
                <div class="row text-start">
                    <div class="col-6"><strong>Transaction ID:</strong></div>
                    <div class="col-6">${paymentResult.transaction_id}</div>
                </div>
                <div class="row text-start">
                    <div class="col-6"><strong>Amount Paid:</strong></div>
                    <div class="col-6">₹${paymentResult.amount}</div>
                </div>
                <div class="row text-start">
                    <div class="col-6"><strong>Payment Method:</strong></div>
                    <div class="col-6">${paymentResult.payment_method.toUpperCase()}</div>
                </div>
                <div class="row text-start">
                    <div class="col-6"><strong>Status:</strong></div>
                    <div class="col-6">
                        <span class="badge bg-success">${paymentResult.status}</span>
                    </div>
                </div>
            </div>
            
            <div class="action-buttons">
                <button type="button" class="btn btn-success me-2" onclick="viewBookings()">
                    View My Bookings
                </button>
                <button type="button" class="btn btn-outline-success" onclick="continueBrowsing()">
                    Continue Browsing
                </button>
            </div>
        </div>
    `;
}

function cancelPayment() {
    if (confirm('Are you sure you want to cancel the payment? This will also cancel your booking.')) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
        if (modal) modal.hide();
        
        showNotification('Payment cancelled. Your booking has been cancelled.', notificationTypes.WARNING);
        
        // Redirect to cars page
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}

function viewBookings() {
    window.location.href = 'bookings.html';
}

function continueBrowsing() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
    if (modal) modal.hide();
    
    showNotification('Thank you for your booking!', notificationTypes.SUCCESS);
}

// Card formatting functions
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    input.value = formattedValue;
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}