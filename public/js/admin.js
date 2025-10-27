async function makeAuthenticatedRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', url, error);
        throw error;
    }
}

async function handleAddCarSubmit(event) {
    event.preventDefault();
    
    try {
        // ...existing code...
        const response = await makeAuthenticatedRequest('/admin/cars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carData)
        });

        if (response.success) {
            showNotification('Car added successfully', 'success');
            // ...existing code...
        }
    } catch (error) {
        showNotification(`Failed to add car: ${error.message}`, 'error');
        console.error('Error adding car:', error);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}