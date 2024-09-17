const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database('./ticketing_system.db', (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
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

// Add a new company
app.post('/companies', (req, res) => {
    const { name, address } = req.body;
    const sql = 'INSERT INTO companies (name, address) VALUES (?, ?)';
    db.run(sql, [name, address], function (err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: 'Company added successfully', companyId: this.lastID });
    });
});

// Add a new customer (user) to a company
app.post('/customers', (req, res) => {
    const { name, email, company_id } = req.body;
    const sql = 'INSERT INTO customers (name, email, company_id) VALUES (?, ?, ?)';
    db.run(sql, [name, email, company_id], function (err) {
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
    console.log(`Server is running on port ${PORT}`);
});
