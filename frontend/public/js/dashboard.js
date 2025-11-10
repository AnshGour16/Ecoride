// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Define API base URL - make sure this matches your backend server
    window.API_BASE_URL = 'http://localhost:5000/api';
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    // Update profile information
    updateProfileInfo(user);
    loadDashboardData();
});

function updateProfileInfo(user) {
    document.querySelector('.user-fullname').textContent = user.name || 'User';
    document.querySelector('.user-email').textContent = user.email || 'No email provided';
    
    const userName = document.querySelector('.user-name');
    if (userName) {
        userName.textContent = user.name ? user.name.split(' ')[0] : 'User';
    }

    // Populate edit profile form
    document.getElementById('fullName').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
}

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = 'login.html';
            return;
        }

        // Ensure API_BASE_URL is defined
        const apiUrl = window.API_BASE_URL || 'http://localhost:5000/api';
        const dashboardUrl = `${apiUrl}/bookings/dashboard`;
        
        console.log('Fetching dashboard data from:', dashboardUrl);
        
        const response = await fetch(dashboardUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                console.error('Error data from server:', errorData);
            } catch (e) {
                errorData = { message: 'Could not parse error response' };
            }
            
            throw new Error(errorData.message || `Failed to fetch dashboard data (${response.status})`);
        }

        const data = await response.json();
        console.log('Dashboard data received:', data);
        
        // Check if the data has the expected structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data structure received from server');
        }

        // Update user data in localStorage if available
        if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Check for stored payment statuses
        const paymentStatuses = JSON.parse(localStorage.getItem('paymentStatuses') || '{}');
        
        // Ensure payment status is properly set for current booking
        if (data.currentBooking) {
            // If we have a stored payment status for this booking, use it
            if (paymentStatuses[data.currentBooking.id]) {
                data.currentBooking.payment_status = paymentStatuses[data.currentBooking.id].status;
                data.currentBooking.paid_at = paymentStatuses[data.currentBooking.id].paid_at;
            }
            // If no stored status and no status from server, set to pending
            else if (!data.currentBooking.payment_status) {
                data.currentBooking.payment_status = 'pending';
            }
            console.log('Current booking payment status:', data.currentBooking.payment_status);
        }
        
        updateDashboardStats(data);
        updateRecentActivity(data.recentActivity);
        updateCurrentBooking(data.currentBooking);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show error to user
        const bookingContainer = document.querySelector('.current-booking');
        if (bookingContainer) {
            bookingContainer.innerHTML = `
                <div class="card bg-dark">
                    <div class="card-body text-center">
                        <p class="text-danger mb-0">Error loading dashboard data: ${error.message}</p>
                        <button class="btn btn-sm btn-outline-success mt-2" onclick="loadDashboardData()">
                            <i class="fas fa-sync-alt me-1"></i>Try Again
                        </button>
                    </div>
                </div>`;
        }
        
        // Also update the activity section to show the error
        const activityContainer = document.querySelector('.recent-activity');
        if (activityContainer) {
            activityContainer.innerHTML = `
                <div class="text-center">
                    <p class="text-danger">Could not load recent activity</p>
                </div>
            `;
        }
    }
}

function updateDashboardStats(data) {
    const totalBookingsElement = document.querySelector('.total-bookings');
    const activeBookingsElement = document.querySelector('.active-bookings');
    
    if (totalBookingsElement) {
        totalBookingsElement.textContent = data.totalBookings || 0;
    }
    if (activeBookingsElement) {
        activeBookingsElement.textContent = data.activeBookings || 0;
    }
}

function updateRecentActivity(activities) {
    const activityContainer = document.querySelector('.recent-activity');
    if (!activityContainer) return;
    
    if (!activities || activities.length === 0) {
        activityContainer.innerHTML = `
            <div class="text-center">
                <p>No recent activity</p>
            </div>
        `;
        return;
    }

    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="fas ${getActivityIcon(activity.type)} text-success me-2"></i>
                    <span>${activity.description}</span>
                </div>
                <span class="activity-time">${formatDate(activity.timestamp)}</span>
            </div>
        </div>
    `).join('');
}

function updateCurrentBooking(booking) {
    const bookingContainer = document.querySelector('.current-booking');
    if (!bookingContainer) return;
    
    if (!booking) {
        bookingContainer.innerHTML = `
            <div class="card bg-dark">
                <div class="card-body text-center">
                    <p class="text-success mb-0">No active bookings at the moment</p>
                    <a href="cars.html" class="btn btn-success btn-sm mt-2">Book a Car</a>
                </div>
            </div>`;
        return;
    }

    // Only render the booking card, not the modal
    bookingContainer.innerHTML = `
        <div class="card bg-dark">
            <div class="card-body">
                <h5 class="card-title text-success mb-3">Current Active Booking</h5>
                <div class="d-flex flex-wrap align-items-center gap-2" style="font-size: 1.1rem;">
                    <span class="fw-bold text-success">${booking.car?.brand || ''} ${booking.car?.model || ''}</span>
                    <span class="text-white">|</span>
                    <span><i class="fas fa-calendar me-1"></i>${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}</span>
                    <span class="text-white">|</span>
                    <span class="badge bg-success">${booking.status}</span>
                    <span class="text-white">|</span>
                    <span class="badge ${booking.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}">
                        <i class="fas ${booking.payment_status === 'paid' ? 'fa-check-circle' : 'fa-clock'} me-1"></i>
                        ${booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                    <a href="bookings.html" class="btn btn-outline-success btn-sm ms-3">View Details</a>
                    ${booking.payment_status === 'paid' ? 
                        `<button class="btn btn-outline-primary btn-sm ms-2" id="viewBillBtn">View Bill</button>` : 
                        `<button class="btn btn-primary btn-sm ms-2" id="payNowBtn">Pay Now</button>`
                    }
                </div>
            </div>
        </div>
    `;

    // Attach event listeners for payment or view bill
    if (booking.payment_status === 'paid') {
        requestAnimationFrame(() => {
            const viewBillBtn = document.getElementById('viewBillBtn');
            if (viewBillBtn) {
                viewBillBtn.addEventListener('click', () => {
                    const user = JSON.parse(localStorage.getItem('user')) || {};
                    const paidAt = new Date().toLocaleString();
                    const billHtml = `
                        <div class='text-center mb-3'>
                            <i class='fas fa-check-circle fa-2x text-success mb-2'></i><br>
                            <strong>Payment Successful!</strong>
                        </div>
                        <div class='card bg-light text-dark mb-2 border-success'>
                            <div class='card-body'>
                                <h5 class='card-title text-success'>E-Bill Receipt</h5>
                                <p><strong>Name:</strong> ${user.name || ''}</p>
                                <p><strong>Email:</strong> ${user.email || ''}</p>
                                <p><strong>Car:</strong> ${booking.car?.brand || ''} ${booking.car?.model || ''}</p>
                                <p><strong>Booking Dates:</strong> ${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}</p>
                                <p><strong>Amount Paid:</strong> Rs${booking.total_amount || 0}</p>
                                <p><strong>Payment Status:</strong> <span class="badge bg-success">Paid</span></p>
                                <p><strong>Paid At:</strong> ${paidAt}</p>
                                <p class='small text-muted'>Thank you for your payment!</p>
                            </div>
                        </div>
                    `;
                    const billModalBody = document.getElementById('billModalBody');
                    if (billModalBody) billModalBody.innerHTML = billHtml;
                    const billModal = new bootstrap.Modal(document.getElementById('billModal'));
                    billModal.show();
                });
            }
        });
    } else {
        requestAnimationFrame(() => {
            const payNowBtn = document.getElementById('payNowBtn');
            if (!payNowBtn) {
                console.error('Pay Now button not found in the DOM');
                return;
            }
            payNowBtn.addEventListener('click', () => {
                // Inject modal content and show modal
                const modalContent = `
                  <div class="modal-header">
                    <h5 class="modal-title" id="paymentModalLabel">Checkout & Payment</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <div class="alert alert-info text-center mb-3">
                      <strong>Amount to Pay:</strong> Rs${booking.total_amount || 0}
                    </div>
                    <div class="mb-4">
                      <label class="form-label">Select Payment Method</label>
                      <div class="payment-methods">
                        <div class="form-check mb-2">
                          <input class="form-check-input" type="radio" name="paymentMethod" id="cardPayment" value="card" checked>
                          <label class="form-check-label" for="cardPayment">
                            <i class="fas fa-credit-card me-2"></i>Credit/Debit Card
                          </label>
                        </div>
                        <div class="form-check">
                          <input class="form-check-input" type="radio" name="paymentMethod" id="upiPayment" value="upi">
                          <label class="form-check-label" for="upiPayment">
                            <i class="fas fa-mobile-alt me-2"></i>UPI
                          </label>
                        </div>
                      </div>
                    </div>
                    <!-- Card Payment Form -->
                    <form id="cardPaymentForm" class="payment-form">
                      <div class="mb-3">
                        <label for="cardNumber" class="form-label">Card Number</label>
                        <input type="text" class="form-control" id="cardNumber" required maxlength="19" placeholder="1234 5678 9012 3456">
                      </div>
                      <div class="mb-3">
                        <label for="expiry" class="form-label">Expiry Date</label>
                        <input type="text" class="form-control" id="expiry" required maxlength="5" placeholder="MM/YY">
                      </div>
                      <div class="mb-3">
                        <label for="cvc" class="form-label">CVC</label>
                        <input type="text" class="form-control" id="cvc" required maxlength="4" placeholder="123">
                      </div>
                    </form>
                    <!-- UPI Form -->
                    <form id="upiPaymentForm" class="payment-form" style="display: none;">
                      <div class="mb-3">
                        <label for="upiId" class="form-label">UPI ID</label>
                        <input type="text" class="form-control" id="upiId" required placeholder="example@upi">
                      </div>
                      <div class="text-center">
                        <p class="small text-muted">Scan QR code to pay</p>
                        <div class="qr-code-placeholder bg-light p-3 rounded">
                          <i class="fas fa-qrcode fa-3x"></i>
                        </div>
                      </div>
                    </form>
                    <div id="paymentError" class="text-danger mb-2" style="display:none;"></div>
                    <div id="paymentSuccess" class="text-success mb-2" style="display:none;"></div>
                    <div id="ebillContainer" style="display:none;"></div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-success" id="submitPaymentBtn">Pay Now</button>
                  </div>
                `;
                const modalContentDiv = document.getElementById('paymentModalContent');
                if (modalContentDiv) {
                    modalContentDiv.innerHTML = modalContent;
                }
                const modalElement = document.getElementById('paymentModal');
                if (typeof bootstrap === 'undefined' || !modalElement) {
                    alert('Error: Bootstrap library is not loaded or modal element missing.');
                    return;
                }
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
                // Payment method switching
                const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
                const paymentForms = document.querySelectorAll('.payment-form');
                paymentMethods.forEach(method => {
                    method.addEventListener('change', (e) => {
                        paymentForms.forEach(form => form.style.display = 'none');
                        const selectedForm = document.getElementById(`${e.target.value}PaymentForm`);
                        if (selectedForm) selectedForm.style.display = 'block';
                    });
                });
                // Payment handler
                const submitBtn = document.getElementById('submitPaymentBtn');
                const errorDiv = document.getElementById('paymentError');
                const successDiv = document.getElementById('paymentSuccess');
                const ebillDiv = document.getElementById('ebillContainer');
                if (submitBtn) {
                    submitBtn.onclick = async function(e) {
                        e.preventDefault();
                        errorDiv.style.display = 'none';
                        successDiv.style.display = 'none';
                        ebillDiv.style.display = 'none';
                        submitBtn.disabled = true;
                        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

                        try {
                            const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
                            if (!selectedMethod) {
                                throw new Error('Please select a payment method');
                            }

                            // Validate booking data
                            if (!booking || !booking.id || !booking.total_amount) {
                                throw new Error('Invalid booking data');
                            }

                            console.log('Processing payment for booking:', booking.id);
                            console.log('Payment method:', selectedMethod.value);

                            // Prepare payment data
                            let paymentData = { 
                                booking_id: booking.id,
                                payment_method: selectedMethod.value,
                                amount: booking.total_amount
                            };

                            if (selectedMethod.value === 'card') {
                                const cardNumber = document.getElementById('cardNumber').value;
                                const expiry = document.getElementById('expiry').value;
                                const cvc = document.getElementById('cvc').value;
                                
                                if (!cardNumber || !expiry || !cvc) {
                                    throw new Error('Please fill in all card details');
                                }

                                // Basic card validation
                                if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
                                    throw new Error('Invalid card number');
                                }
                                if (!/^\d{2}\/\d{2}$/.test(expiry)) {
                                    throw new Error('Invalid expiry date format (MM/YY)');
                                }
                                if (!/^\d{3,4}$/.test(cvc)) {
                                    throw new Error('Invalid CVC');
                                }

                                paymentData.card_details = {
                                    number: cardNumber.replace(/\s/g, ''),
                                    expiry: expiry,
                                    cvc: cvc
                                };
                            } else if (selectedMethod.value === 'upi') {
                                const upiId = document.getElementById('upiId').value;
                                if (!upiId) {
                                    throw new Error('Please enter UPI ID');
                                }
                                paymentData.upi_id = upiId;
                            }

                            // Get auth token
                            const token = localStorage.getItem('token');
                            if (!token) {
                                throw new Error('Please log in to continue payment');
                            }

                            // Make API call to process payment
                            const response = await fetch(`${window.API_BASE_URL}/payments/process`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(paymentData)
                            });

                            const responseData = await response.json();
                            console.log('Payment response:', responseData);

                            if (responseData.success) {
                                // Payment successful
                                modal.hide();

                                // Update booking status in localStorage
                                const user = JSON.parse(localStorage.getItem('user')) || {};
                                if (user.bookings) {
                                    const bookingIndex = user.bookings.findIndex(b => b.id === booking.id);
                                    if (bookingIndex !== -1) {
                                        user.bookings[bookingIndex].payment_status = 'paid';
                                        user.bookings[bookingIndex].paid_at = new Date().toISOString();
                                        localStorage.setItem('user', JSON.stringify(user));
                                    }
                                }

                                // Store payment status
                                const paymentStatuses = JSON.parse(localStorage.getItem('paymentStatuses') || '{}');
                                paymentStatuses[booking.id] = {
                                    status: 'paid',
                                    paid_at: new Date().toISOString(),
                                    transaction_id: responseData.transaction_id,
                                    payment_id: responseData.payment_id
                                };
                                localStorage.setItem('paymentStatuses', JSON.stringify(paymentStatuses));

                                // Update current booking display
                                const updatedBooking = {
                                    ...booking,
                                    payment_status: 'paid',
                                    paid_at: new Date().toISOString()
                                };
                                updateCurrentBooking(updatedBooking);

                                // Show success message
                                const dashboardContainer = document.querySelector('main.container');
                                if (dashboardContainer) {
                                    const alertDiv = document.createElement('div');
                                    alertDiv.className = 'alert alert-success text-center';
                                    alertDiv.innerHTML = `
                                        <i class="fas fa-check-circle me-2"></i>
                                        Payment successful! Transaction ID: ${responseData.transaction_id}
                                    `;
                                    dashboardContainer.prepend(alertDiv);
                                    
                                    // Auto remove alert after 5 seconds
                                    setTimeout(() => {
                                        alertDiv.remove();
                                    }, 5000);
                                }

                                // Show bill modal after short delay
                                setTimeout(() => {
                                    const billHtml = generateBillHtml(updatedBooking, responseData);
                                    const billModalBody = document.getElementById('billModalBody');
                                    if (billModalBody) billModalBody.innerHTML = billHtml;
                                    const billModal = new bootstrap.Modal(document.getElementById('billModal'));
                                    billModal.show();
                                    
                                    // Print button logic
                                    const printBtn = document.getElementById('printBillBtn');
                                    if (printBtn) {
                                        printBtn.onclick = function() {
                                            const printContents = billModalBody.innerHTML;
                                            const win = window.open('', '', 'height=600,width=400');
                                            win.document.write('<html><head><title>E-Bill Receipt</title>');
                                            win.document.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css">');
                                            win.document.write('</head><body>');
                                            win.document.write(printContents);
                                            win.document.write('</body></html>');
                                            win.document.close();
                                            win.focus();
                                            setTimeout(() => { win.print(); win.close(); }, 500);
                                        };
                                    }
                                }, 1500);
                            } else {
                                // Payment failed
                                throw new Error(responseData.error_message || responseData.message || 'Payment failed');
                            }

                        } catch (error) {
                            console.error('Payment error:', error);
                            errorDiv.textContent = error.message || 'Payment failed. Please try again.';
                            errorDiv.style.display = 'block';
                        } finally {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Pay Now';
                        }
                    };
                }
            });
        });
    }
}// Helper function to generate bill HTML
function generateBillHtml(booking, paymentData = {}) {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const paidAt = paymentData.paid_at || booking.paid_at || new Date().toISOString();
    
    return `
        <div class='text-center mb-3'>
            <i class='fas fa-check-circle fa-2x text-success mb-2'></i><br>
            <strong>Payment Successful!</strong>
        </div>
        <div class='card bg-light text-dark mb-2 border-success'>
            <div class='card-body'>
                <h5 class='card-title text-success'>E-Bill Receipt</h5>
                <p><strong>Name:</strong> ${user.name || ''}</p>
                <p><strong>Email:</strong> ${user.email || ''}</p>
                <p><strong>Car:</strong> ${booking.car?.brand || ''} ${booking.car?.model || ''}</p>
                <p><strong>Booking Dates:</strong> ${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}</p>
                <p><strong>Amount Paid:</strong> Rs${booking.total_amount || 0}</p>
                <p><strong>Payment Status:</strong> <span class="badge bg-success">Paid</span></p>
                ${paymentData.transaction_id ? `<p><strong>Transaction ID:</strong> ${paymentData.transaction_id}</p>` : ''}
                <p><strong>Paid At:</strong> ${new Date(paidAt).toLocaleString()}</p>
                <p class='small text-muted'>Thank you for your payment!</p>
            </div>
        </div>
    `;
}

function getActivityIcon(type) {
    const icons = {
        booking: 'fa-calendar-plus',
        cancellation: 'fa-calendar-minus',
        payment: 'fa-credit-card',
        profile: 'fa-user-edit',
        default: 'fa-info-circle'
    };
    return icons[type] || icons.default;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

// Handle profile edit form submission
document.addEventListener('DOMContentLoaded', function() {
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', handleProfileUpdate);
    }
});

async function handleProfileUpdate(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not logged in. Please log in again.');
        window.location.href = 'login.html';
        return;
    }
    
    const formData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        currentPassword: document.getElementById('currentPassword').value
    };

    try {
        // Ensure API_BASE_URL is defined
        const apiUrl = window.API_BASE_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${apiUrl}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            localStorage.setItem('user', JSON.stringify(updatedUser));
            updateProfileInfo(updatedUser);
            alert('Profile updated successfully!');
            
            // Close the modal
            const modalElement = document.getElementById('editProfileModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
            
            // Clear the password field
            document.getElementById('currentPassword').value = '';
        } else {
            let error;
            try {
                error = await response.json();
            } catch (e) {
                error = { message: 'Unknown error occurred' };
            }
            alert(error.message || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating your profile');
    }
}