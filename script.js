let tickets = [
    { id: 1, description: 'Issue with login', createdBy: 'User A', status: 'open', priority: 'High' },
    { id: 2, description: 'Bug in checkout', createdBy: 'User B', status: 'inProgress', priority: 'Medium' },
    { id: 3, description: 'Feature request: Dark mode', createdBy: 'User C', status: 'resolved', priority: 'Low' }
];

// Render tickets
function renderTickets(ticketList) {
    const ticketContainer = document.getElementById('ticketContainer');
    ticketContainer.innerHTML = '';

    ticketList.forEach(ticket => {
        const ticketItem = document.createElement('li');
        ticketItem.innerHTML = `
            <span>${ticket.description} (Priority: ${ticket.priority})</span>
            <span class="status ${ticket.status}">${ticket.status}</span>
        `;
        ticketItem.onclick = () => viewTicketDetails(ticket);
        ticketContainer.appendChild(ticketItem);
    });
}

// Filter tickets by status
function filterTickets(status) {
    if (status === 'all') {
        renderTickets(tickets);
    } else {
        const filtered = tickets.filter(ticket => ticket.status === status);
        renderTickets(filtered);
    }
}

// View ticket details
function viewTicketDetails(ticket) {
    const ticketDetails = document.getElementById('ticketDetails');
    ticketDetails.innerHTML = `
        <p><strong>ID:</strong> ${ticket.id}</p>
        <p><strong>Description:</strong> ${ticket.description}</p>
        <p><strong>Created By:</strong> ${ticket.createdBy}</p>
        <p><strong>Status:</strong> ${ticket.status}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
    `;
}

// Initial render
renderTickets(tickets);
