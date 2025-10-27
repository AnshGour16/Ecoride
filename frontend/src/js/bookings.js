// Fixed bookings.js
const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    fetchBookings();

    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', createBooking);
    }
    
    // Add booking button event listener
    const addBookingBtn = document.getElementById('add-booking-btn');
    if (addBookingBtn) {
        addBookingBtn.addEventListener('click', function() {
            const modal = document.getElementById('booking-modal');
            if (modal) {
                modal.style.display = 'block';
            }
        });
    }
    
    // Close modal event listeners
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = document.getElementById('booking-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
});

// Function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Function to fetch bookings from the server
function fetchBookings() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.id) {
        console.error('User data not found in localStorage');
        return;
    }

    const userId = user.id;

    fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        displayBookings(data);
    })
    .catch(error => {
        console.error('Error fetching bookings:', error);
        document.getElementById('booking-list').innerHTML = 
            '<tr><td colspan="6" class="text-center">Error loading bookings. Please try again later.</td></tr>';
    });
}

// Function to display bookings in the booking list
function displayBookings(bookings) {
    const bookingList = document.getElementById('booking-list');
    
    if (!bookingList) {
        console.error('booking-list element not found');
        return;
    }

    bookingList.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        bookingList.innerHTML = '<tr><td colspan="6" class="text-center">No bookings found</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Safely format dates
        const startDate = booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A';
        const endDate = booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A';
        
        row.innerHTML = `
            <td>${booking.id || 'N/A'}</td>
            <td>${booking.brand || ''} ${booking.model || booking.car_id}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td><span class="badge bg-${getStatusBadgeClass(booking.status)}">${booking.status || 'unknown'}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewBooking(${booking.id})">View</button>
                ${booking.status === 'pending' ? 
                    `<button class="btn btn-sm btn-danger ms-1" onclick="cancelBooking(${booking.id})">Cancel</button>` 
                    : ''}
            </td>
        `;
        bookingList.appendChild(row);
    });
}

// Function to get badge class based on booking status
function getStatusBadgeClass(status) {
    switch (status) {
        case 'confirmed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'cancelled':
            return 'danger';
        case 'completed':
            return 'info';
        default:
            return 'secondary';
    }
}

// Function to view booking details
function viewBooking(bookingId) {
    const token = localStorage.getItem('token');
    
    fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(booking => {
        // Show booking details in modal or alert
        const details = `
Booking ID: ${booking.id}
Car: ${booking.brand} ${booking.model}
User: ${booking.user_name} (${booking.email})
Start Date: ${new Date(booking.start_date).toLocaleDateString()}
End Date: ${new Date(booking.end_date).toLocaleDateString()}
Status: ${booking.status}
        `;
        alert(details);
    })
    .catch(error => {
        console.error('Error fetching booking details:', error);
        alert('Error loading booking details');
    });
}

// Function to cancel booking
function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    const token = localStorage.getItem('token');
    
    fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Failed to cancel booking');
            });
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || 'Booking cancelled successfully');
        fetchBookings(); // Refresh the list
    })
    .catch(error => {
        console.error('Error cancelling booking:', error);
        alert(`Error cancelling booking: ${error.message}`);
    });
}

// Function to create a new booking
function createBooking(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || !user.id) {
        alert('User session expired. Please log in again.');
        window.location.href = 'login.html';
        return;
    }

    const userId = user.id;
    const carIdInput = document.getElementById('car-id');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const pickupLocationInput = document.getElementById('pickup-location');
    const dropoffLocationInput = document.getElementById('dropoff-location');

    if (!carIdInput || !startDateInput || !endDateInput) {
        alert('Required form fields not found');
        return;
    }

    const carId = carIdInput.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    // Get optional fields if they exist
    const pickupLocationId = pickupLocationInput ? pickupLocationInput.value : null;
    const dropoffLocationId = dropoffLocationInput ? dropoffLocationInput.value : null;

    // Validate inputs
    if (!carId || !startDate || !endDate) {
        alert('Please fill in all required fields: Car ID, Start Date, and End Date');
        return;
    }

    // Validate dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    const now = new Date();

    if (startDateTime < now) {
        alert('Start date cannot be in the past');
        return;
    }

    if (endDateTime <= startDateTime) {
        alert('End date must be after start date');
        return;
    }

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Creating...';
    submitButton.disabled = true;

    // Create booking request object with all required fields
    const bookingData = {
        user_id: userId,
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
        pickup_location_id: pickupLocationId || 1, // Default to location ID 1 if not provided
        dropoff_location_id: dropoffLocationId || 1 // Default to location ID 1 if not provided
    };
    
    console.log('Sending booking request with data:', bookingData);

    fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
    })
    .then(async response => {
        const responseData = await response.json();
        console.log('Server response:', {
            status: response.status,
            data: responseData
        });
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Booking failed');
        }
        return responseData;
    })
    .then(data => {
        alert(data.message || 'Booking created successfully!');
        
        // Close booking modal if it exists
        const modal = document.getElementById('booking-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Reset form
        event.target.reset();
        
        // Refresh the bookings list
        fetchBookings();
    })
    .catch(error => {
        console.error('Error creating booking:', error);
        alert(`Failed to create booking: ${error.message}`);
    })
    .finally(() => {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
}