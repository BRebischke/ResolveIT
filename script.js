// Fetch and display companies in the company dropdown for adding users
function fetchCompanies() {
    fetch('http://localhost:5000/companies')
        .then(response => response.json())
        .then(companies => {
            const companyDropdown = document.getElementById('companySelect');
            companyDropdown.innerHTML = '<option value="">Select Company</option>'; // Clear existing options

            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.innerText = company.name;
                companyDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching companies:', error);
        });
}

// Fetch and display tickets from the API
function fetchTickets() {
    fetch('http://localhost:5000/tickets')
        .then(response => response.json())
        .then(tickets => {
            renderTickets(tickets);  // Make sure tickets are rendered
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
        });
}

// Render tickets on the page
function renderTickets(ticketList) {
    const ticketContainer = document.getElementById('ticketContainer');
    ticketContainer.innerHTML = '';

    ticketList.forEach(ticket => {
        const ticketItem = document.createElement('li');
        ticketItem.innerHTML = `
            <span>${ticket.description} (Priority: ${ticket.priority})</span>
            <span class="status ${ticket.status}">${ticket.status}</span>
        `;
        ticketContainer.appendChild(ticketItem);
    });
}

// Fetch and populate the company dropdown
function fetchCompanies() {
    fetch('http://localhost:5000/companies')
        .then(response => response.json())
        .then(companies => {
            const companySelect = document.getElementById('companySelect');
            companySelect.innerHTML = '<option value="">Select a Company</option>'; // Clear existing options

            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                companySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching companies:', error));
}

// Call fetchCompanies when the page loads
window.onload = function() {
    fetchCompanies();
};


// Call fetchTickets to load tickets from the database
fetchTickets();


// Add new company
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
        document.getElementById('addCompanyForm').reset();
        fetchCompanies(); // Refresh the company dropdown for users
    })
    .catch(error => console.error('Error adding company:', error));
});

// Add new user (customer) to a company
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
}

// Fetch and display companies in the company dropdown
function fetchCompanies() {
    fetch('http://localhost:5000/companies')
        .then(response => response.json())
        .then(companies => {
            const companyDropdown = document.getElementById('companySelect');
            companyDropdown.innerHTML = '<option value="">Select Company</option>'; // Clear existing options

            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.innerText = company.name;
                companyDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching companies:', error);
        });
}

// Function to toggle dropdown visibility
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
}


// Call fetchCompanies on page load to populate the company dropdown
fetchCompanies();
