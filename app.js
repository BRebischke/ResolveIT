const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const { authenticator } = require('otplib');
const QRCode = require('qrcode');
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

app.put('/tickets/:id', (req, res) => {
    const ticketId = req.params.id;
    const { summary, status, priority, customer_id, assigned_user_id } = req.body;

    // Only update the fields that can be changed
    const sql = `
        UPDATE tickets
        SET summary = ?, status = ?, priority = ?, customer_id = ?, assigned_user_id = ?
        WHERE id = ?`;

    db.run(sql, [summary, status, priority, customer_id, assigned_user_id, ticketId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: 'Ticket updated successfully', changes: this.changes });
    });
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
            const userId = user.id;
            const role = user.role;
            // Send userId to login to show technician assigned tickets alongside success message
            res.json({ role, userId, message: 'Login successful' });
        } else {
            // Invalid credentials
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});
// Generate a 2FA secret for the user
app.post('/2fa/setup', (req, res) => {
    const { userId } = req.body;

    // Ensure the user exists
    const query = 'SELECT * FROM users WHERE id = ?';
    db.get(query, [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate a new secret
        const secret = authenticator.generateSecret();
        const otpauthURL = authenticator.keyuri(user.username, 'ResolveIT', secret);

        // Save the secret to the user's record
        const updateQuery = 'UPDATE users SET otp_secret = ? WHERE id = ?';
        db.run(updateQuery, [secret, userId], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ error: 'Failed to save 2FA secret' });
            }

            // Send the QR code data to the client
            QRCode.toDataURL(otpauthURL, (qrErr, qrCodeData) => {
                if (qrErr) {
                    return res.status(500).json({ error: 'Failed to generate QR code' });
                }
                res.json({ qrCodeData, otpauthURL });
            });
        });
    });
});

// Validate a 2FA token
app.post('/2fa/validate', (req, res) => {
    const { userId, token } = req.body;

    // Retrieve the user's secret
    const query = 'SELECT otp_secret FROM users WHERE id = ?';
    db.get(query, [userId], (err, user) => {
        if (err || !user || !user.otp_secret) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // Validate the token
        const isValid = authenticator.verify({ token, secret: user.otp_secret });
        if (isValid) {
            res.json({ message: '2FA validated successfully' });
        } else {
            res.status(401).json({ error: 'Invalid 2FA token' });
        }
    });
});
app.post('/tickets', (req, res) => {
    const { summary, status, priority, customerId, companyId, assignedUserId } = req.body;
    const sql = `INSERT INTO tickets (summary, status, priority, customer_id, company_id, assigned_user_id)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [summary, status, priority, customerId, companyId, assignedUserId];
    db.run(sql, params, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ ticketId: this.lastID });
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

app.get('/tickets/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT tickets.*,
               users.name AS assignedUserName,
               companies.name AS companyName,
               customers.name AS contactName,
               customers.email AS contactEmail,
               customers.phone AS contactPhone
        FROM tickets
        LEFT JOIN users ON tickets.assigned_user_id = users.id
        LEFT JOIN companies ON tickets.company_id = companies.id
        LEFT JOIN customers ON tickets.customer_id = customers.id
        WHERE tickets.id = ?
    `;

    //console.log('Executing SQL:', sql);  // Log the query to check if it's formed properly.

    db.get(sql, [id], (err, ticket) => {
        if (err) {
            console.error('Error fetching ticket:', err);
            return res.status(500).json({ message: 'Error retrieving ticket' });
        }

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        //console.log('Ticket details fetched:', ticket);  // Log the fetched ticket to check the response.

        // Respond with the full ticket data, including additional fields
        res.json(ticket);
    });
});

// Endpoint to get all tickets
app.get('/tickets', (req, res) => {
    const userId = req.query.assigned_user_id;
    let sql = `
    SELECT tickets.*, 
           companies.name AS company_name, 
           users.name AS ticket_owner_name,
           customers.name AS contact_name
    FROM tickets
    LEFT JOIN companies ON tickets.company_id = companies.id
    LEFT JOIN users ON tickets.assigned_user_id = users.id
    LEFT JOIN customers ON tickets.customer_id = customers.id
`;

    let params = [];

    
    // Get ticket details by ID
    if (userId) {
        sql += ' WHERE assigned_user_id = ?';
        params.push(userId);
        
    }
    
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows); // Return all tickets
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

/*
// Endpoint to fetch company details by company_id
app.get('/companies/:id', (req, res) => {
    const companyId = req.params.id;

    // Query to get company details by ID
    db.get('SELECT * FROM v_companies WHERE id = ?', [companyId], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Company not found' });
        }
        // Send the company details back as the response
        res.json({
            id: row.id,
            name: row.name,
            address: row.address,
            created_at: row.created_at
        });
    });
}); */

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
app.post('/customers', (req, res) => {
    const { company_id, name, email } = req.body;
    
    const sql = 'INSERT INTO customers (company_id, name, email) VALUES (?, ?, ?)';
    db.run(sql, [company_id, name, email], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'User created successfully', userId: this.lastID });
    });
});


// Add or update a system user 
app.post('/users', (req, res) => {
    const { username, password, role } = req.body;

    // First, check if the user already exists in the database
    const checkUserSql = 'SELECT * FROM users WHERE username = ?';
    
    db.get(checkUserSql, [username], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        // If user exists, update the password or role
        if (row) {
            let updateSql = 'UPDATE users SET ';
            let params = [];

            // If a new password is provided, hash it and add to the update query
            if (password) {
                const hashedPassword = bcrypt.hashSync(password, 10);
                updateSql += 'password = ?, ';
                params.push(hashedPassword);
            }

            // If a new role is provided, update the role
            if (role) {
                updateSql += 'role = ? ';
                params.push(role);
            }

            updateSql += 'WHERE username = ?';
            params.push(username); // Always include username in the WHERE clause

            // Execute the update query
            db.run(updateSql, params, function(err) {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }

                // Return a success message
                res.json({
                    message: 'System user updated successfully',
                    changes: this.changes
                });
            });
        } else {
            // If user doesn't exist, create a new user
            const hashedPassword = bcrypt.hashSync(password, 10);
            const insertSql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';

            db.run(insertSql, [username, hashedPassword, role], function(err) {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }

                res.json({
                    message: 'System user created successfully',
                    userId: this.lastID
                });
            });
        }
    });
});

// PATCH route to update ticket fields
app.patch('/tickets/:id', (req, res) => {
    const { id } = req.params;
    const { summary, assigned_user_id, priority, status } = req.body;

    // Construct the update query
    const updates = [];
    const values = [];

    if (summary !== undefined) {
        updates.push("summary = ?");
        values.push(summary);
    }
    if (assigned_user_id !== undefined) {
        updates.push("assigned_user_id = ?");
        values.push(assigned_user_id);
    }
    if (priority !== undefined) {
        updates.push("priority = ?");
        values.push(priority);
    }
    if (status !== undefined) {
        updates.push("status = ?");
        values.push(status);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields provided to update' });
    }

    values.push(id);

    const sql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update ticket' });
        }
        res.json({ message: 'Ticket updated successfully' });
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
