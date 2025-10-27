// This file contains JavaScript functions for managing bookings.

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    fetchBookings();
});

// Helper: Ensure user is logged in and token exists
function ensureAuthenticated() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user || !user.id) {
        alert('Your session has expired or you are not logged in. Please log in again.');
        window.location.href = 'login.html';
        return false;
    }
    return { token, user };
}

// Function to fetch bookings from the server
async function fetchBookings() {
    const auth = ensureAuthenticated();
    if (!auth) return;
    const { token, user } = auth;
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/user/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayBookings(data);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        document.getElementById('booking-list').innerHTML = 
            '<tr><td colspan="6" class="text-center">Error loading bookings. Please try again later.</td></tr>';
    }
}

// Function to format date in a user-friendly way
function formatDate(dateString) {
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to display bookings in the table
function displayBookings(bookings) {
    const bookingList = document.getElementById('booking-list');
    if (!bookingList) return;

    bookingList.innerHTML = '';

    if (!bookings || bookings.length === 0) {
        bookingList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-success">
                    No bookings found. 
                    <a href="cars.html" class="btn btn-sm btn-success ms-2">Browse Cars</a>
                </td>
            </tr>`;
        return;
    }

    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.className = 'text-success';
        row.innerHTML = `
            <td style="vertical-align: top;">${booking.id}</td>
            <td style="vertical-align: top;" class="text-start fw-bold">
              ${booking.car.brand} ${booking.car.model} ${booking.car.year || ''}
            </td>
            <td style="vertical-align: top;">${formatDate(booking.start_date)}</td>
            <td style="vertical-align: top;">${formatDate(booking.end_date)}</td>
            <td style="vertical-align: top;">
                <span class="badge ${getStatusBadgeClass(booking.status)}">
                    ${booking.status}
                </span>
            </td>
            <td style="vertical-align: top;">
                <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-outline-success" 
                            onclick="viewBookingDetails(${booking.id})">
                        View
                    </button>
                    ${booking.status === 'pending' ? `
                        <button type="button" class="btn btn-sm btn-outline-danger" 
                                onclick="cancelBooking(${booking.id})">
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        bookingList.appendChild(row);
    });
}

// Function to get booking action buttons based on status
function getBookingActions(booking) {
    const actions = [];
    
    if (booking.status === 'pending' || booking.status === 'confirmed') {
        actions.push(`<button onclick="cancelBooking(${booking.id})" class="btn btn-danger btn-sm">Cancel</button>`);
    }
    
    if (booking.status === 'pending') {
        actions.push(`<button onclick="updateBookingStatus(${booking.id}, 'confirmed')" class="btn btn-success btn-sm ml-2">Confirm</button>`);
    }
    
    if (booking.status === 'confirmed') {
        actions.push(`<button onclick="updateBookingStatus(${booking.id}, 'completed')" class="btn btn-info btn-sm ml-2">Complete</button>`);
    }
    
    return actions.join('');
}

// Function to view booking details
async function viewBookingDetails(bookingId) {
    const auth = ensureAuthenticated();
    if (!auth) return;
    const { token } = auth;
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch booking details');
        }
        const booking = await response.json();

        // Get modal elements
        const modalElement = document.getElementById('bookingDetailsModal');
        if (!modalElement) {
            alert('Booking details modal not found!');
            return;
        }
        const modalBody = modalElement.querySelector('.modal-body');
        if (!modalBody) {
            alert('Modal body not found!');
            return;
        }

        // Fill modal with booking details
        modalBody.innerHTML = `
            <div>
                <h5>Booking #${booking.id}</h5>
                <p><strong>Car:</strong> ${booking.car ? booking.car.brand + ' ' + booking.car.model : ''}</p>
                <p><strong>Start Date:</strong> ${new Date(booking.start_date).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${new Date(booking.end_date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
                <p><strong>Total Amount:</strong> Rs${booking.total_amount}</p>
            </div>
        `;
        
        // Show the modal
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error('Error fetching booking details:', error);
        showError('Failed to load booking details');
    }
}

// Function to cancel a booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    const auth = ensureAuthenticated();
    if (!auth) return;
    const { token } = auth;
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }
        showSuccess('Booking cancelled successfully');
        fetchBookings(); // Refresh the bookings list
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showError('Failed to cancel booking');
    }
}

// Function to update booking status
function updateBookingStatus(bookingId, status) {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(`Booking ${status} successfully`);
            fetchBookings();
        } else {
            alert('Error updating booking: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error updating booking:', error);
        alert('Error updating booking. Please try again later.');
    });
}

// Helper function to get badge class based on booking status
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'confirmed':
            return 'bg-success';
        case 'pending':
            return 'bg-warning text-dark';
        case 'cancelled':
            return 'bg-danger';
        case 'completed':
            return 'bg-success';
        default:
            return 'bg-secondary';
    }
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Function to create a new booking
async function createBooking(carId, startDate, endDate) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                carId,
                startDate,
                endDate
            })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return;
            }
            throw new Error(data.message || 'Failed to create booking');
        }

        showSuccess('Booking created successfully!');
        return data.booking;
    } catch (error) {
        console.error('Error creating booking:', error);
        showError(error.message || 'Failed to create booking. Please try again.');
        return null;
    }
}

// Function to handle booking form submission
async function handleBookingSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    const carId = form.querySelector('[name="carId"]').value;
    const startDate = form.querySelector('[name="startDate"]').value;
    const endDate = form.querySelector('[name="endDate"]').value;

    // Basic validation
    if (!carId || !startDate || !endDate) {
        showError('Please fill in all required fields');
        return;
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
        showError('Start date cannot be in the past');
        return;
    }

    if (end <= start) {
        showError('End date must be after start date');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating booking...';

    try {
        const booking = await createBooking(carId, startDate, endDate);
        if (booking) {
            // Close the booking modal if it exists
            const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
            if (modal) {
                modal.hide();
            }
            // Refresh the bookings list
            fetchBookings();
        }
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Confirm Booking';
    }
}

// Function to show success message
function showSuccess(message) {
    // You can implement a better UI notification system
    alert(message);
}

// Function to show error message
function showError(message) {
    // You can implement a better UI notification system
    alert(message);
}