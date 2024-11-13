document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('systemUserForm').addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the form from submitting the default way

        const systemUserName = document.getElementById('systemUserName').value;
        const systemPassword = document.getElementById('systemPassword').value;
        const systemUserRole = document.getElementById('systemUserRole').value;


        // Prepare the data to send in the POST request
        const systemUserData = {
            username: systemUserName,  // Email is being used as the username
            password: systemPassword,
            role: systemUserRole
        };

        // Make the POST request to create the new system user
        fetch('http://localhost:5000/system-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(systemUserData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create system user');
            }
            return response.json();
        })
        .then(result => {
            document.getElementById('message').innerText = result.message || 'System user created successfully!';
            document.getElementById('systemUserForm').reset();
            window.location.href = 'ticketScreen.html';
        })
        .catch(error => {
            console.error('Error creating system user:', error);
            document.getElementById('message').innerText = 'Unable to create system user. Please try again later.';
        });
    });
});



