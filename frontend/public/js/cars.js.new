// API base URL
const API_BASE_URL = 'http://localhost:5000/api';
let carsData = [];
let bookingModal = null;

document.addEventListener('DOMContentLoaded', function() {
    loadCars();
    setupEventListeners();
    // Initialize the Bootstrap modal
    bookingModal = new bootstrap.Modal(document.getElementById('booking-modal'));
});

async function loadCars() {
    const carList = document.getElementById('car-list');
    try {
        carList.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-success"></div>
            </div>`;

        const response = await fetch(`${API_BASE_URL}/cars`);
        if (!response.ok) {
            throw new Error('Failed to fetch cars');
        }
        
        carsData = await response.json();
        displayCars(carsData);
    } catch (error) {
        console.error('Error loading cars:', error);
        carList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Error loading cars</div>
            </div>`;
    }
}

function displayCars(cars) {
    const carList = document.getElementById('car-list');
    carList.innerHTML = '';
    
    if (!cars || cars.length === 0) {
        carList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">No cars available</div>
            </div>`;
        return;
    }
    
    cars.forEach(car => {
        const carCol = document.createElement('div');
        carCol.className = 'col-md-4 mb-4';
        carCol.innerHTML = createCarCard(car);
        carList.appendChild(carCol);
    });
}

function createCarCard(car) {
    return `
        <div class="card h-100">
            <img src="${car.image_url}" class="card-img-top" alt="${car.brand} ${car.model}">
            <div class="card-body">
                <h5 class="card-title">${car.brand} ${car.model}</h5>
                <p class="card-text">
                    <span class="badge bg-primary">${car.category}</span>
                    <span class="badge bg-success">₹${car.price}/day</span>
                </p>
                <div class="car-specs">
                    <div><i class="fas fa-cog"></i> ${car.transmission}</div>
                    <div><i class="fas fa-gas-pump"></i> ${car.fuel_type}</div>
                    <div><i class="fas fa-users"></i> ${car.seats} seats</div>
                </div>
                <div class="mt-3">
                    ${car.availability ? 
                        `<button class="btn btn-success w-100 book-car-btn" 
                            data-car='${JSON.stringify(car)}'>
                            Book Now
                        </button>` : 
                        `<button class="btn btn-secondary w-100" disabled>
                            Currently Unavailable
                        </button>`
                    }
                </div>
            </div>
        </div>`;
}

function openBookingModal(car) {
    document.getElementById('car-details').innerHTML = `
        <div class="card mb-3">
            <div class="row g-0">
                <div class="col-md-4">
                    <img src="${car.image_url}" class="img-fluid rounded-start" alt="${car.brand} ${car.model}">
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">${car.brand} ${car.model}</h5>
                        <p class="card-text">Price per day: ₹${car.price}</p>
                    </div>
                </div>
            </div>
        </div>`;
    
    document.getElementById('car-id').value = car.id;
    
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    startDateInput.min = today;
    startDateInput.value = today;
    endDateInput.min = today;
    
    document.getElementById('booking-form').reset();
    bookingModal.show();
}

function validateDates(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
        alert('Start date cannot be in the past');
        return false;
    }
    
    if (end <= start) {
        alert('End date must be after start date');
        return false;
    }
    
    return true;
}

async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const carId = document.getElementById('car-id').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    if (!validateDates(startDate, endDate)) {
        return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                carId: parseInt(carId),
                startDate,
                endDate
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to create booking');
        }
        
        bookingModal.hide();
        alert('Booking successful! You can view your booking in the My Bookings section.');
        window.location.href = 'bookings.html';
        
    } catch (error) {
        console.error('Booking error:', error);
        alert(error.message || 'An error occurred while processing your booking');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Confirm Booking';
    }
}

function setupEventListeners() {
    // Booking button clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('book-car-btn')) {
            const carData = e.target.getAttribute('data-car');
            if (carData) {
                try {
                    const car = JSON.parse(carData);
                    openBookingModal(car);
                } catch (error) {
                    console.error('Error parsing car data:', error);
                }
            }
        }
    });
    
    // Booking form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Date input handlers
    const startDateInput = document.getElementById('start-date');
    if (startDateInput) {
        startDateInput.addEventListener('change', () => {
            const endDateInput = document.getElementById('end-date');
            if (endDateInput) {
                endDateInput.min = startDateInput.value;
            }
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-filter');
            filterCars(type);
            
            document.querySelectorAll('.filter-btn').forEach(btn => 
                btn.classList.toggle('active', btn === button));
        });
    });
}

function filterCars(type) {
    if (type === 'all') {
        displayCars(carsData);
        return;
    }
    
    const filteredCars = carsData.filter(car => 
        car.category.toLowerCase() === type.toLowerCase());
    displayCars(filteredCars);
}
