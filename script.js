// Declare ticketsData globally at the beginning
let ticketsData = [];

// Fetch all tickets and store them
function fetchTickets() {
    fetch('http://localhost:5000/tickets')
        .then(response => response.json())
        .then(tickets => {
            console.log('Fetched Tickets:', tickets);  // Debug: Check fetched tickets
            ticketsData = tickets;  // Store fetched tickets in a global variable
            renderTickets(ticketsData);  // Initially render all tickets
        })
        .catch(error => console.error('Error fetching tickets:', error));
}

// Function to render tickets on the page
function renderTickets(ticketList) {
    console.log('Rendering Tickets:', ticketList);  // Debug: Check ticketList being rendered
    const ticketContainer = document.getElementById('ticketContainer');
    ticketContainer.innerHTML = '';

    if (ticketList.length === 0) {
        ticketContainer.innerHTML = '<p>No tickets available.</p>';
    }

    ticketList.forEach(ticket => {
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.innerText = `${ticket.description} (Priority: ${ticket.priority})`;
        ticketContainer.appendChild(ticketItem);
    });
}

function fetchAssignedTickets(userId) {
    fetch(`http://localhost:5000/users/${userId}/tickets`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }
            return response.json();
        })
        .then(tickets => {
            const ticketContainer = document.getElementById('ticketContainer');
            ticketContainer.innerHTML = ''; // Clear previous tickets

            if (tickets.length === 0) {
                ticketContainer.innerHTML = '<p>No tickets assigned to you.</p>';
            } else {
                tickets.forEach(ticket => {
                    const ticketItem = document.createElement('div');
                    ticketItem.className = 'ticket-item';
                    ticketItem.innerHTML = `
                        <h4>${ticket.description}</h4>
                        <p>Status: ${ticket.status}</p>
                        <p>Priority: ${ticket.priority}</p>
                    `;
                    ticketContainer.appendChild(ticketItem);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
            displayError('Unable to load tickets. Please try again later.');
        });
}

// Assuming you have a function that gets the logged-in user's ID
const loggedInUserId = getLoggedInUserId();
if (loggedInUserId) {
    fetchAssignedTickets(loggedInUserId);
}


// Filter tickets based on status
function filterTickets(status) {
    console.log('Filtering tickets with status:', status);  // Debug: Check selected status
    let filteredTickets;

    if (status === 'all') {
        filteredTickets = ticketsData;
    } else {
        filteredTickets = ticketsData.filter(ticket => ticket.status.toLowerCase() === status.toLowerCase());
    }

    renderTickets(filteredTickets);
}

// Fetch and display companies in the company dropdown
function fetchCompanies() {
    fetch('http://localhost:5000/companies')
        .then(response => response.json())
        .then(companies => {
            const companySelectElements = document.querySelectorAll('#companySelect');
            companySelectElements.forEach(companySelect => {
                companySelect.innerHTML = '<option value="">Select Company</option>'; // Clear existing options

                companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company.id;
                    option.textContent = company.name;
                    companySelect.appendChild(option);
                });
            });
        })
        .catch(error => console.error('Error fetching companies:', error));
}

// Function to show the "New Ticket" form
function showNewTicketForm() {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = `
        <h2>Create a New Ticket</h2>
        <form id="ticketForm">
            <input type="text" id="ticketDesc" placeholder="Enter ticket description" required>
            <select id="companySelect" required>
                <option value="">Select Company</option>
            </select>
            <select id="customerSelect" required>
                <option value="">Select Customer</option>
            </select>
            <button type="submit">Create Ticket</button>
        </form>
    `;
    fetchCompanies(); // Populate company dropdown

    // Add event listener for submitting the new ticket form
    document.getElementById('ticketForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const description = document.getElementById('ticketDesc').value;
        const companyId = document.getElementById('companySelect').value;
        const customerId = document.getElementById('customerSelect').value;

        const ticketData = { description, companyId, customerId, status: 'open', priority: 'Medium' };

        fetch('http://localhost:5000/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketData)
        })
        .then(response => response.json())
        .then(result => {
            alert('Ticket created successfully');
            fetchTickets(); // Refresh tickets list
        })
        .catch(error => console.error('Error adding ticket:', error));
    });
}

// Function to show the "New Company" form
function showNewCompanyForm() {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = `
        <h2>Add a New Company</h2>
        <form id="addCompanyForm">
            <input type="text" id="companyName" placeholder="Company Name" required>
            <input type="text" id="companyAddress" placeholder="Company Address">
            <button type="submit">Add Company</button>
        </form>
    `;

    // Add event listener for submitting the new company form
    document.getElementById('addCompanyForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const companyName = document.getElementById('companyName').value;
        const companyAddress = document.getElementById('companyAddress').value;

        const companyData = { name: companyName, address: companyAddress };

        fetch('http://localhost:5000/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData)
        })
        .then(response => response.json())
        .then(result => {
            alert('Company added successfully');
            fetchCompanies(); // Refresh the company dropdown for users
        })
        .catch(error => console.error('Error adding company:', error));
    });
}

// Function to show the "New User" form
function showNewUserForm() {
    const formContainer = document.getElementById('formContainer');
    formContainer.innerHTML = `
        <h2>Add a New User</h2>
        <form id="addUserForm">
            <select id="companySelect" required>
                <option value="">Select Company</option>
            </select>
            <input type="text" id="userName" placeholder="User Name" required>
            <input type="email" id="userEmail" placeholder="User Email" required>
            <button type="submit">Add User</button>
        </form>
    `;
    fetchCompanies(); // Populate company dropdown for selecting company

    // Add event listener for submitting the new user form
    document.getElementById('addUserForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const companyId = document.getElementById('companySelect').value;
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;

        const userData = { name: userName, email: userEmail, company_id: companyId };

        fetch('http://localhost:5000/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        .then(response => response.json())
        .then(result => {
            alert('User added successfully');
            document.getElementById('addUserForm').reset();
        })
        .catch(error => console.error('Error adding user:', error));
    });
}

// Toggle dropdown visibility
function toggleDropdown() {
    const dropdownContent = document.getElementById('dropdownContent');
    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        const dropdownContent = document.getElementById('dropdownContent');
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        }
    }
};

function login(username, password) {
    fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save userId to local storage or session
            localStorage.setItem('userId', data.userId);
            // Redirect to the dashboard
            window.location.href = 'dashboard.html';
        } else {
            displayError('Invalid username or password');
        }
    })
    .catch(error => {
        console.error('Error logging in:', error);
        displayError('Unable to log in. Please try again later.');
    });
}

function getLoggedInUserId() {
    return localStorage.getItem('userId');
}


// Event listeners for filter buttons
document.getElementById('allButton').addEventListener('click', () => filterTickets('all'));
document.getElementById('openButton').addEventListener('click', () => filterTickets('open'));
document.getElementById('inProgressButton').addEventListener('click', () => filterTickets('in progress'));
document.getElementById('resolvedButton').addEventListener('click', () => filterTickets('resolved'));

// Load tickets and companies on page load
window.onload = function() {
    fetchTickets();
    fetchCompanies();
};
