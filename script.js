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

// Call fetchCompanies on page load to populate the company dropdown
fetchCompanies();
