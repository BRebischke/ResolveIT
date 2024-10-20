document.addEventListener('DOMContentLoaded', function() {
    // Extract ticket ID from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('ticketId');
    
    console.log('Extracted ticket ID:', ticketId);  // Debug log

    if (!ticketId) {
        console.error('No ticket ID provided.');
        displayError('Unable to load ticket details. Please try again later.');
        return;
    }

    fetchTicketDetails(ticketId);
});


console.log('Ticket ID before fetching:', ticketId);


// Function to fetch ticket details
function fetchTicketDetails(ticketId) {
    fetch(`http://localhost:5000/tickets/${ticketId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch ticket details');
            }
            return response.json();
        })
        .then(ticket => {
            renderTicketDetails(ticket);
        })
        .catch(error => {
            console.error('Error fetching ticket details:', error);
            displayError('Unable to load ticket details. Please try again later.');
        });
}

// Function to render ticket details
function renderTicketDetails(ticket) {
    const ticketDetailsContainer = document.getElementById('ticketDetails');

    ticketDetailsContainer.innerHTML = `
        <p><strong>Description:</strong> ${ticket.description}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>Assigned User:</strong> ${ticket.assignedUser || 'Unassigned'}</p>
        <p><strong>Company:</strong> ${ticket.company}</p>
        <p><strong>Contact:</strong> ${ticket.contact}</p>
        <p><strong>Phone:</strong> ${ticket.phone}</p>
        <p><strong>Email:</strong> ${ticket.email}</p>
    `;

    // You can add more functions here to fetch audit trail and email chain
    fetchAuditTrail(ticket.id);
    fetchEmailChain(ticket.id);
}

// Function to fetch and render audit trail
function fetchAuditTrail(ticketId) {
    fetch(`http://localhost:5000/tickets/${ticketId}/audit`)
        .then(response => response.json())
        .then(auditTrail => {
            const auditContainer = document.getElementById('auditTrail');
            auditContainer.innerHTML = '';

            auditTrail.forEach(entry => {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'audit-entry';
                entryDiv.innerHTML = `
                    <p><strong>${entry.timestamp}:</strong> ${entry.action}</p>
                `;
                auditContainer.appendChild(entryDiv);
            });
        })
        .catch(error => console.error('Error fetching audit trail:', error));
}

// Function to fetch and render email communication
function fetchEmailChain(ticketId) {
    fetch(`http://localhost:5000/tickets/${ticketId}/emails`)
        .then(response => response.json())
        .then(emailChain => {
            const emailContainer = document.getElementById('emailChain');
            emailContainer.innerHTML = '';

            emailChain.forEach(email => {
                const emailDiv = document.createElement('div');
                emailDiv.className = 'email-entry';
                emailDiv.innerHTML = `
                    <p><strong>From:</strong> ${email.from}</p>
                    <p><strong>To:</strong> ${email.to}</p>
                    <p><strong>Subject:</strong> ${email.subject}</p>
                    <p><strong>Body:</strong> ${email.body}</p>
                `;
                emailContainer.appendChild(emailDiv);
            });
        })
        .catch(error => console.error('Error fetching email chain:', error));
}

// Display error message
function displayError(message) {
    const messageElement = document.createElement('p');
    messageElement.style.color = 'red';
    messageElement.innerText = message;
    const ticketDetailsContainer = document.getElementById('ticketDetails');
    ticketDetailsContainer.appendChild(messageElement);
}
