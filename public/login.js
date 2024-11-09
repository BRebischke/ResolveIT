document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const loginData = { username, password };

    fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(result => {
        
        if (result.message === 'Login successful') {
            // Redirect to main dashboard or save authentication state
            window.location.href = 'ticketScreen.html'; // Redirect to dashboard
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('role', result.role);
        }else {
            // Show error message
            document.getElementById('errorMessage').innerText = result.error;
        }
    })
    .catch(error => console.error('Error:', error));
   
});
