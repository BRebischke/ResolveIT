document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(result => {
            console.log('Login response:', result); // Debug log

            if (result.requires2FA) {
                console.log('2FA enabled. Redirecting to verification step.'); // Debug log
                document.getElementById('loginStep1').style.display = 'none';
                document.getElementById('loginStep2').style.display = 'block';
                localStorage.setItem('userId', result.userId);
            } else if (result.qrCodeData) {
                console.log('QR Code received:', result.qrCodeData); // Debug log
                document.getElementById('loginStep1').style.display = 'none';
                const qrCodeContainer = document.getElementById('qrCodeContainer');
                qrCodeContainer.innerHTML = `<img src="${result.qrCodeData}" alt="Scan this QR Code to enable 2FA">`;
                qrCodeContainer.style.display = 'block';
            } else {
                localStorage.setItem('userId', result.userId);
                window.location.href = 'ticketScreen.html';
            }
        })
        .catch(error => {
            console.error('Error during login request:', error); // Debug log
        });
});
