document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('systemUserForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const systemUserName = document.getElementById('systemUserName').value;
        const systemPassword = document.getElementById('systemPassword').value;
        const systemUserRole = document.getElementById('systemUserRole').value;

        const systemUserData = {
            username: systemUserName,
            password: systemPassword,
            role: systemUserRole
        };

        fetch('http://localhost:5000/system-users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(systemUserData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create system user');
            }
            
            return response.json();
        })
        .then(result => {
            document.getElementById('message').innerText = result.message;
            document.getElementById('systemUserForm').reset();
          
          
        })
        .catch(error => {
            console.error('Error creating system user:', error);
            document.getElementById('message').innerText = 'Unable to create system user. Please try again later.';
        });
    });
});
