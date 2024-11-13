document.addEventListener('DOMContentLoaded', function() {
    const ticketId = getTicketIdFromUrl(); // Get the ticket ID from URL (assumed to be part of the URL)

    if (ticketId) {
        fetchTicketDetails(ticketId); // Fetch and populate the ticket details on page load
    }

    fetchCompanies(); // Populate the companies dropdown on page load
    fetchUsers(); // Populate the users dropdown on page load

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
                customer_id: customerId,
                company_id: companyId,
                assigned_user_id: assignedUserId
            };

            // Log ticket data before sending the request
            console.log("Ticket Data to Update:", ticketData);

            // Update the ticket by sending a PUT request
            fetch(`http://localhost:5001/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketData)
            })
            .then(response => {
                console.log("Response Status:", response.status);  // Log response status
                if (!response.ok) {
                    throw new Error('Failed to update ticket');
                }
                return response.json();
            })
            .then(result => {
                console.log("Ticket Updated Result:", result);  // Log success response
                displaySuccess('Ticket updated successfully');
                ticketForm.reset();  // Reset the form
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
    fetch(`http://localhost:5001/tickets/${ticketId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch ticket details');
            }
            return response.json();
        })
        .then(ticket => {
            // Use fallback values to prevent undefined
            document.getElementById('ticketSummary').value = ticket.summary || '';
            document.getElementById('ticketPriority').value = ticket.priority || 'Medium';
            document.getElementById('ticketStatus').value = ticket.status || 'New';

            // Set the company dropdown with the company name
            const companySelect = document.getElementById('companySelect');
            companySelect.value = ticket.company_id || ''; // Set the company ID
            fetchCompanyName(ticket.company_id);  // Fetch company name and update UI
            fetchCustomers(ticket.company_id);  // Fetch and populate customers dropdown

            // Set the customer dropdown and fetch the customer's name
            const customerSelect = document.getElementById('customerSelect');
            customerSelect.value = ticket.customer_id || ''; // Set the customer ID
            fetchCustomerName(ticket.customer_id);  // Fetch customer name and auto-fill the details
            customerSelect.dispatchEvent(new Event('change'));  // Auto-fill contact details

            // Set the assigned user dropdown
            const userSelect = document.getElementById('userSelect');
            userSelect.value = ticket.assigned_user_id || ''; // Set assigned user
        })
        .catch(error => {
            console.error('Error fetching ticket details:', error);
            displayError('Unable to load ticket details. Please try again later.');
        });
}


// Fetch and populate the companies dropdown with company names
function fetchCompanies() {
    const companySelect = document.getElementById('companySelect');
    fetch('http://localhost:5001/companies')
        .then(response => response.json())
        .then(companies => {
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;  // Use company name
                companySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching companies:', error));
}

// Fetch and populate the customers dropdown with customer names based on selected company
function fetchCustomers(companyId) {
    const customerSelect = document.getElementById('customerSelect');
    fetch(`http://localhost:5001/companies/${companyId}/customers`)
        .then(response => response.json())
        .then(customers => {
            customerSelect.innerHTML = '<option value="">Select Customer</option>'; // Clear existing options
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer.id;
                option.textContent = customer.name;  // Use customer name
                option.setAttribute('data-email', customer.email);
                option.setAttribute('data-phone', customer.phone);
                customerSelect.appendChild(option);
            });
            customerSelect.disabled = false;  // Enable customer select after fetching
        })
        .catch(error => console.error('Error fetching customers:', error));
}

// Fetch and display the company name based on company_id
function fetchCompanyName(companyId) {
    const companySelect = document.getElementById('companySelect');
    fetch(`http://localhost:5001/companies/${companyId}`)
        .then(response => response.json())
        .then(company => {
            const option = companySelect.querySelector(`option[value='${company.id}']`);
            if (option) {
                option.textContent = company.name;  // Ensure the correct company name is displayed
            }
        })
        .catch(error => console.error('Error fetching company name:', error));
}

// Fetch and display the customer's name based on customer_id
function fetchCustomerName(customerId) {
    const customerSelect = document.getElementById('customerSelect');
    const selectedCustomerOption = customerSelect.querySelector(`option[value="${customerId}"]`);
    if (selectedCustomerOption) {
        document.getElementById('customerName').textContent = selectedCustomerOption.textContent; // Display customer name
    }
}

// Fetch and display the users (technicians) to be assigned to tickets
function fetchUsers() {
    const userSelect = document.getElementById('userSelect');
    fetch('http://localhost:5001/users')
        .then(response => response.json())
        .then(users => {
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.name;  // Use user name
                userSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching users:', error));
}

// Utility function to display error messages
function displayError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Utility function to display success messages
function displaySuccess(message) {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
        successElement.textContent = message;
        successElement.style.display = 'block';
    }
}
