// Declare ticketsData globally at the beginning
let ticketsData = [];

// Function to get logged-in user's ID from local storage
function getLoggedInUserId() {
    return localStorage.getItem('userId');
}

// Fetch all tickets and store them globally
function fetchTickets() {
    fetch('http://localhost:5000/tickets')
        .then(response => response.json())
        .then(tickets => {
            console.log('Fetched Tickets:', tickets);  // Debug
            ticketsData = tickets;  // Store fetched tickets globally
            renderTickets(ticketsData);  // Render all tickets initially
        })
        .catch(error => console.error('Error fetching tickets:', error));
}

// Fetch tickets assigned to a specific user, optionally filtered by status
function fetchTicketsForUser(userId, status = null) {
    let url = `http://localhost:5000/users/${userId}/tickets`;
    if (status) {
        url += `?status=${encodeURIComponent(status)}`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tickets');
            }
            return response.json();
        })
        .then(tickets => {
            console.log('Fetched User Tickets:', tickets); // Debug
            renderTickets(tickets);
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
            displayError('Unable to load tickets. Please try again later.');
        });
}

function renderTickets(ticketList) {
    const ticketContainer = document.getElementById('ticketContainer');
    if (!ticketContainer) {
        console.error('Ticket container not found.');
        return;
    }
    
    ticketContainer.innerHTML = ''; // Clear existing tickets

    if (ticketList.length === 0) {
        ticketContainer.innerHTML = '<p>No tickets available.</p>';
    } else {
        ticketList.forEach(ticket => {
            const ticketItem = document.createElement('div');
            ticketItem.className = 'ticket-item';
            ticketItem.innerHTML = `
                <h4>${ticket.summary}</h4>
                <p>Status: ${ticket.status}</p>
                <p>Priority: ${ticket.priority}</p>
            `;
            ticketItem.addEventListener('click', function() {
                // Redirect to ticket-details.html with ticket ID as a query parameter
                window.location.href = `ticket-details.html?ticketId=${ticket.id}`;
            });
            ticketContainer.appendChild(ticketItem);
        });
    }
}


// Filter tickets by status from global ticketsData
function filterTickets(status) {
    console.log('Filtering tickets with status:', status);  // Debug
    let filteredTickets;

    if (status === 'all') {
        filteredTickets = ticketsData;
    } else {
        filteredTickets = ticketsData.filter(ticket => ticket.status.toLowerCase() === status.toLowerCase());
    }

    renderTickets(filteredTickets);
}

// Display error message
function displayError(message) {
    const messageElement = document.getElementById('ticketMessage');
    if (messageElement) {
        messageElement.style.color = 'red';
        messageElement.innerText = message;
        setTimeout(() => {
            messageElement.innerText = ''; // Clear message after 3 seconds
        }, 3000);
    }
}

// Load tickets and set up event listeners on page load
document.addEventListener('DOMContentLoaded', function() {
    const loggedInUserId = getLoggedInUserId();
    
    if (loggedInUserId) {
        fetchTicketsForUser(loggedInUserId); // Fetch tickets for logged-in user
    } else {
        fetchTickets(); // Fallback to fetching all tickets if no user is logged in
    }

    // Add event listeners for filter buttons
    document.getElementById('allButton').addEventListener('click', () => filterTickets('all'));
    document.getElementById('newButton').addEventListener('click', () => filterTickets('New'));
    document.getElementById('assignedButton').addEventListener('click', () => filterTickets('Assigned'));
    document.getElementById('inProgressButton').addEventListener('click', () => filterTickets('In Progress'));
    document.getElementById('waitingButton').addEventListener('click', () => filterTickets('Waiting'));
    document.getElementById('clientUpdatedButton').addEventListener('click', () => filterTickets('Client Updated'));
    document.getElementById('completeButton').addEventListener('click', () => filterTickets('Complete'));
});
