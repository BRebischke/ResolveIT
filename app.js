const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
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
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // SQL query to check for user
    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (user && bcrypt.compareSync(password, user.password)) {
            // User found and password matched
            res.json({ message: 'Login successful' });
        } else {
            // Invalid credentials
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

app.post('/tickets', (req, res) => {
    const { summary, status, priority, customerId, companyId, assignedUserId } = req.body;
    const sql = 'INSERT INTO tickets (summary, status, priority, customer_id, company_id, assigned_user_id) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [summary, status, priority, customerId, companyId, assignedUserId];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: 'Ticket created successfully', ticketId: this.lastID });
    });
});


//add new user to database
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
    db.get(checkUserQuery, [username], (err, user) => {
        

        if (user) {
            return res.status(409).json({ error: 'Username already taken' });
        } else {
            // Hash the password before storing it
            const hashedPassword = bcrypt.hashSync(password, 10);
            const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.run(insertUserQuery, [username, hashedPassword], function (err) {
                
                res.json({ message: 'Account created successfully', userId: this.lastID });
            });
        }
    });
});

// Endpoint to get all tickets
app.get('/tickets', (req, res) => {
    const sql = 'SELECT * FROM tickets';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows); // Return all tickets
    });
});

// Get ticket details by ID
app.get('/tickets/:ticketId', (req, res) => {
    const ticketId = req.params.ticketId;
    const sql = 'SELECT * FROM tickets WHERE id = ?';
    db.get(sql, [ticketId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        res.json(row);
    });
});


// Get all users
app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM users';
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
    const sql = 'SELECT id, name, email, phone FROM customers WHERE company_id = ?';
    db.all(sql, [companyId], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json(rows);
    });
});


// Add new company
app.post('/companies', (req, res) => {
    const { name, address } = req.body;
    const sql = 'INSERT INTO companies (name, address) VALUES (?, ?)';
    db.run(sql, [name, address], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Company created successfully', companyId: this.lastID });
    });
});

// Add new user
app.post('/users', (req, res) => {
    const { company_id, name, email } = req.body;
    const sql = 'INSERT INTO clients (company_id, name, email) VALUES (?, ?, ?)';
    db.run(sql, [company_id, name, email], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'User created successfully', userId: this.lastID });
    });
});

// Add new system user (admin or technician)
app.post('/system-users', (req, res) => {
    const { username, email, role } = req.body;
    const sql = 'INSERT INTO system_users (username, email, role) VALUES (?, ?, ?)';
    db.run(sql, [username, email, role], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'System user created successfully', userId: this.lastID });
    });
});


// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
