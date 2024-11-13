document.addEventListener('DOMContentLoaded', function() {
    const ticketId = getTicketIdFromUrl(); // Get the ticket ID from URL (assumed to be part of the URL)

    if (ticketId) {
        fetchTicketDetails(ticketId); // Fetch and populate the ticket details on page load
    }

    //fetchCompanies(); // Populate the companies dropdown on page load
    //fetchUsers(); // Populate the users dropdown on page load

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
            fetch(`http://localhost:5000/tickets/${ticketId}`, {
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

function fetchTicketDetails(ticketId) {
    fetch(`http://localhost:5000/tickets/${ticketId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch ticket details');
            }
            return response.json();
        })
        .then(ticket => {
            // Populate ticket details
            document.getElementById('ticketSummary').value = ticket.summary || '';
            document.getElementById('ticketPriority').value = ticket.priority || 'Medium';
            document.getElementById('ticketStatus').value = ticket.status || 'New';

            // Populate company name
            document.getElementById('companySelect').value = ticket.companyName || 'No company';

            // Populate customer name and contact details
            document.getElementById('customerSelect').value = ticket.contactName || 'No customer';
            document.getElementById('email').value = ticket.contactEmail || 'No email provided';
            document.getElementById('phone').value = ticket.contactPhone || 'No phone provided';

            fetchUsers(ticket.assigned_user_id);

        })
        .catch(error => {
            console.error('Error fetching ticket details:', error);
            displayError('Unable to load ticket details. Please try again later.');
        });
}

// Fetch and display users in the user dropdown, pre-select the assigned user
function fetchUsers(currentAssignedUserId) {
    console.log("Attempting to fetch users from API...");
    fetch('http://localhost:5000/users')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(users => {
            console.log("Users fetched successfully:", users);
            const userSelect = document.getElementById('userSelect');
            userSelect.innerHTML = '<option value="">Select User</option>'; // Clear existing options

            if (users.length === 0) {
                userSelect.innerHTML += '<option value="">No users available</option>';
            } else {
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user.id;
                    option.textContent = `${user.username} (${user.role || 'No role'})`;
                    userSelect.appendChild(option);
                });
            }

            // Pre-select the current assigned user
            if (currentAssignedUserId) {
                userSelect.value = currentAssignedUserId;
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            displayError('Unable to load users. Please try again later.');
        });
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

// Function to get the ticketId from the URL
function getTicketIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ticketId');  // Returns the value of 'ticketId' from the URL query string
}

// Function to update the ticket
function updateTicket(ticketId) {
    const updatedSummary = document.getElementById('ticketSummary').value;
    const updatedAssignedUserId = document.getElementById('userSelect').value;
    const updatedPriority = document.getElementById('ticketPriority').value;
    const updatedStatus = document.getElementById('ticketStatus').value;

    // Create the data object to send in the PATCH request
    const updatedData = {};

    if (updatedSummary) updatedData.summary = updatedSummary;
    if (updatedAssignedUserId) updatedData.assigned_user_id = updatedAssignedUserId;
    if (updatedPriority) updatedData.priority = updatedPriority;
    if (updatedStatus) updatedData.status = updatedStatus;

    // Send the PATCH request to the backend
    fetch(`http://localhost:5000/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedData),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Error: ${response.status} - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        window.location.href = `ticket-details.html?ticketId=${ticketId}`;
    })
    .catch(error => {
        displayError('Error updating ticket. Please try again.');
    });
}

// Fetch the ticketId from the URL
const ticketId = getTicketIdFromURL();

// Make sure the ticketId exists before proceeding
if (ticketId) {
    document.querySelector('.create-ticket-btn').addEventListener('click', function(event) {
        event.preventDefault();
        updateTicket(ticketId);
    });
} else {
    console.error("No ticketId found in URL");
}



