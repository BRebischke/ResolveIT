document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const registerData = { username, password };

    fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.message) {
            alert(result.message); // Show success message
            window.location.href = 'ticketScreen.html';
            
        } else {
            // Show error message
            document.getElementById('errorMessage').innerText = result.error;
        }
    })
    .catch(error => console.error('Error:', error));
});