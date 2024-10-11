const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to SQLite database
const db = new sqlite3.Database('./ticketing_system.db', (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Root route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all tickets
app.get('/tickets', (req, res) => {
    const sql = 'SELECT * FROM tickets';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// Get all companies
app.get('/companies', (req, res) => {
    const sql = 'SELECT * FROM companies';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// Get customers for a specific company
app.get('/companies/:companyId/customers', (req, res) => {
    const { companyId } = req.params;
    const sql = 'SELECT * FROM customers WHERE company_id = ?';
    db.all(sql, [companyId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});

// Add a new ticket
app.post('/tickets', (req, res) => {
    const { description, companyId, customerId, status, priority } = req.body;
    const sql = 'INSERT INTO tickets (description, status, priority, customer_id, company_id) VALUES (?, ?, ?, ?, ?)';
    const params = [description, status, priority, customerId, companyId];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: 'Ticket created successfully', ticketId: this.lastID });
    });
});

// Add a new company
app.post('/companies', (req, res) => {
    const { name, address } = req.body;
    const sql = 'INSERT INTO companies (name, address) VALUES (?, ?)';
    const params = [name, address];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: 'Company added successfully', companyId: this.lastID });
    });
});


// Add a new customer
app.post('/customers', (req, res) => {
    const { name, email, company_id } = req.body;
    const sql = 'INSERT INTO customers (name, email, company_id) VALUES (?, ?, ?)';
    const params = [name, email, company_id];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: 'Customer added successfully', customerId: this.lastID });
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
