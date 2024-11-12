document.addEventListener('DOMContentLoaded', function() {
    const ticketId = getTicketIdFromUrl(); // Get the ticket ID from URL (assumed to be part of the URL)

    if (ticketId) {
        fetchTicketDetails(ticketId); // Fetch and populate the ticket details on page load
    }

    fetchCompanies(); // Populate the companies dropdown on page load
    fetchUsers(); // Populate the users dropdown on page load

    // Add event listener for when a company is selected
    const companySelect = document.getElementById('companySelect');
    if (companySelect) {
        companySelect.addEventListener('change', function() {
            const companyId = this.value;
            const customerSelect = document.getElementById('customerSelect');

            if (companyId) {
                customerSelect.disabled = true; // Disable until customers are loaded
                fetchCustomers(companyId);  // Fetch customers only if a company is selected
            } else {
                customerSelect.innerHTML = '<option value="">Select Customer</option>';
                customerSelect.disabled = true;
                clearContactDetails(); // Clear email and phone fields if no company is selected
            }
        });
    }

    // Add event listener for when a customer is selected to auto-fill the email and phone number
    const customerSelect = document.getElementById('customerSelect');
    if (customerSelect) {
        customerSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const emailInput = document.getElementById('email');
            const phoneInput = document.getElementById('phone');

            if (selectedOption && selectedOption.value) {
                const customerEmail = selectedOption.getAttribute('data-email');
                const customerPhone = selectedOption.getAttribute('data-phone');
                if (emailInput) emailInput.value = customerEmail;  // Set the email field
                if (phoneInput) phoneInput.value = customerPhone;  // Set the phone field
            } else {
                clearContactDetails(); // Clear email and phone fields if no customer is selected
            }
        });
    }

    // Handle the form submission to update the ticket
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const summary = document.getElementById('ticketSummary').value;
            const companyId = document.getElementById('companySelect').value;
            const customerId = document.getElementById('customerSelect').value;
            const priority = document.getElementById('ticketPriority').value;
            const status = document.getElementById('ticketStatus').value;
            const assignedUserId = document.getElementById('userSelect').value;

            if (!companyId || !customerId || !assignedUserId) {
                displayError('Please select a company, customer, and user');
                return;
            }

            const ticketData = {
                summary,
                status,
                priority,
                customerId,
                companyId,
                assignedUserId
            };

            // Update the ticket by calling PUT request
            fetch(`http://localhost:5000/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update ticket');
                }
                return response.json();
            })
            .then(result => {
                displaySuccess('Ticket updated successfully');
                ticketForm.reset();  // Clear the form
                clearContactDetails();  // Clear email and phone fields
                window.location.href = `ticket-details.html?ticketId=${ticketId}`;  // Redirect to ticket details page
            })
            .catch(error => {
                console.error('Error updating ticket:', error);
                displayError('Unable to update ticket. Please try again later.');
            });
        });
    }
});

// Function to get ticket ID from the URL (assumed format: /edit-ticket/:ticketId)
function getTicketIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ticketId'); // Assumes URL is something like /edit-ticket?ticketId=123
}

// Fetch and display the current ticket's details
function fetchTicketDetails(ticketId) {
    fetch(`http://localhost:5000/tickets/${ticketId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch ticket details');
            }
            return response.json();
        })
        .then(ticket => {
            // Populate the form fields with the current ticket's data
            document.getElementById('ticketSummary').value = ticket.summary;
            document.getElementById('ticketPriority').value = ticket.priority;
            document.getElementById('ticketStatus').value = ticket.status;

            // Set the company dropdown
            const companySelect = document.getElementById('companySelect');
            companySelect.value = ticket.companyId;
            fetchCustomers(ticket.companyId);  // Re-fetch customers for the selected company

            // Set the customer dropdown
            const customerSelect = document.getElementById('customerSelect');
            customerSelect.value = ticket.customerId;
            customerSelect.dispatchEvent(new Event('change'));  // Auto-fill contact details

            // Set the assigned user dropdown
            const userSelect = document.getElementById('userSelect');
            userSelect.value = ticket.assignedUserId;
        })
        .catch(error => {
            console.error('Error fetching ticket details:', error);
            displayError('Unable to load ticket details. Please try again later.');
        });
}

// Function to clear contact details fields
function clearContactDetails() {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    if (emailInput) emailInput.value = '';
    if (phoneInput) phoneInput.value = '';
}

// Fetch and populate the companies dropdown
function fetchCompanies() {
    const companySelect = document.getElementById('companySelect');
    fetch('http://localhost:5000/companies')
        .then(response => response.json())
        .then(companies => {
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                companySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching companies:', error));
}

// Fetch and populate the users dropdown
function fetchUsers() {
    const userSelect = document.getElementById('userSelect');
    fetch('http://localhost:5000/users')
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.first_name} ${user.last_name}`;
                userSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

// Fetch and populate the customers dropdown based on selected company
function fetchCustomers(companyId) {
    const customerSelect = document.getElementById('customerSelect');
    fetch(`http://localhost:5000/companies/${companyId}/customers`)
        .then(response => response.json())
        .then(customers => {
            customerSelect.innerHTML = '<option value="">Select Customer</option>'; // Clear existing options
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = `${customer.first_name} ${customer.last_name}`;
                option.setAttribute('data-email', customer.email);
                option.setAttribute('data-phone', customer.phone);
                customerSelect.appendChild(option);
            });
            customerSelect.disabled = false;  // Enable customer select after fetching
        })
        .catch(error => console.error('Error fetching customers:', error));
}

// Display success message
function displaySuccess(message) {
    const messageElement = document.createElement('p');
    messageElement.style.color = 'green';
    messageElement.innerText = message;
    document.body.appendChild(messageElement);
}

// Display error message
function displayError(message) {
    const messageElement = document.createElement('p');
    messageElement.style.color = 'red';
    messageElement.innerText = message;
    document.body.appendChild(messageElement);
}

