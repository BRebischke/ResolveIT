document.addEventListener('DOMContentLoaded', function() {
    fetchCompanies(); // Populate the companies dropdown on page load
});

// Fetch and display companies in the company dropdown
function fetchCompanies() {
    fetch('http://localhost:5000/companies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }
            return response.json();
        })
        .then(companies => {
            const companySelect = document.getElementById('companySelect');
            companySelect.innerHTML = '<option value="">Select Company</option>'; // Clear existing options

            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                companySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching companies:', error);
            displayError('Unable to load companies. Please try again later.');
        });
}

// Add event listener for when a company is selected
document.getElementById('companySelect').addEventListener('change', function() {
    const companyId = this.value;
    const customerSelect = document.getElementById('customerSelect');

    if (companyId) {
        customerSelect.disabled = true; // Disable until customers are loaded
        fetchCustomers(companyId);  // Fetch customers only if a company is selected
    } else {
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        customerSelect.disabled = true;
    }
});

// Fetch and populate the customer dropdown for the selected company
function fetchCustomers(companyId) {
    fetch(`http://localhost:5000/companies/${companyId}/customers`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            return response.json();
        })
        .then(customers => {
            const customerSelect = document.getElementById('customerSelect');
            customerSelect.innerHTML = '<option value="">Select Customer</option>'; // Clear existing options

            if (customers.length === 0) {
                customerSelect.innerHTML += '<option value="">No customers available</option>';
            } else {
                customers.forEach(customer => {
                    const option = document.createElement('option');
                    option.value = customer.id;
                    option.textContent = customer.name;
                    customerSelect.appendChild(option);
                });
            }
            customerSelect.disabled = false; // Enable customer dropdown after successful fetch
        })
        .catch(error => {
            console.error('Error fetching customers:', error);
            displayError('Unable to load customers. Please try again later.');
        });
}

// Handle the form submission to create a new ticket
document.getElementById('ticketForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const description = document.getElementById('ticketDesc').value;
    const companyId = document.getElementById('companySelect').value;
    const customerId = document.getElementById('customerSelect').value;
    const priority = document.getElementById('ticketPriority').value;
    const status = document.getElementById('ticketStatus').value;

    if (!companyId || !customerId) {
        displayError('Please select both a company and a customer');
        return;
    }

    const ticketData = {
        description,
        companyId,
        customerId,
        status,
        priority
    };

    fetch('http://localhost:5000/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create ticket');
        }
        return response.json();
    })
    .then(result => {
        displaySuccess('Ticket created successfully');
        document.getElementById('ticketForm').reset();  // Clear the form
        document.getElementById('customerSelect').disabled = true; // Reset customer dropdown to disabled state
    })
    .catch(error => {
        console.error('Error adding ticket:', error);
        displayError('Unable to create ticket. Please try again later.');
    });
});

// Display success message
function displaySuccess(message) {
    const messageElement = document.getElementById('ticketMessage');
    messageElement.style.color = 'green';
    messageElement.innerText = message;
    setTimeout(() => {
        messageElement.innerText = ''; // Clear message after 3 seconds
    }, 3000);
}

// Display error message
function displayError(message) {
    const messageElement = document.getElementById('ticketMessage');
    messageElement.style.color = 'red';
    messageElement.innerText = message;
    setTimeout(() => {
        messageElement.innerText = ''; // Clear message after 3 seconds
    }, 3000);
}
