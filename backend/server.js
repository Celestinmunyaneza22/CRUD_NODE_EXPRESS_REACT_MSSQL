const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('msnodesqlv8');
const authenticate = require('./middleware/auth');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'supersecret'; // Store securely in .env in production

app.use(cors());
app.use(express.json());

const conn =
  "server=DESKTOP-5EMC2O1\\MSSQLSERVER01;Database=ERN;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";

// REGISTER
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const query = `INSERT INTO Users (name, email, passwordHash) VALUES (?, ?, ?)`;

  sql.query(conn, query, [name, email, hashed], (err) => {
    if (err) return res.status(500).json({ error: 'Registration failed', details: err });
    res.json({ message: 'Registered successfully' });
  });
});

// LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM Users WHERE email = ?`;

  sql.query(conn, query, [email], async (err, rows) => {
    if (err || rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) return res.status(401).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  });
});

// PROTECTED EXAMPLE
app.get('/api/profile', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });

  const token = auth.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    res.json({ message: 'Welcome!', user: decoded });
  });
});

// GET all products
app.get('/api/products', authenticate, (req, res) => {
  const query = 'SELECT * FROM Products';

  sql.query(conn, query, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch products', details: err });
    res.json(rows);
  });
});

// CREATE a product
app.post('/api/products', authenticate, (req, res) => {
  const { name, price, quantity } = req.body;
  const query = 'INSERT INTO Products (name, price, quantity) VALUES (?, ?, ?)';

  sql.query(conn, query, [name, price, quantity], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to create product', details: err });
    res.status(201).json({ message: 'Product created' });
  });
});

// UPDATE a product
app.put('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;
  // const query = 'UPDATE Products SET name = ?, price = ?, quantity=? WHERE id = ?';
  const query = 'UPDATE Products SET name = ?, price = ?, quantity = ?, updatedAt = GETDATE() WHERE id = ?';
  sql.query(conn, query, [name, price,quantity, id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update product', details: err });
    res.json({ message: 'Product updated' });
  });
});

// DELETE a product
app.delete('/api/products/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Products WHERE id = ?';

  sql.query(conn, query, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete product', details: err });
    res.json({ message: 'Product deleted' });
  });
});

//adjust add or remove products and its reports
app.patch('/api/products/:id/quantity', authenticate, (req, res) => {
  const { id } = req.params;
  const { delta } = req.body;

  if (typeof delta !== 'number') {
    return res.status(400).json({ error: 'Delta must be a number' });
  }

  const updateQuery = 'UPDATE Products SET quantity = quantity + ? WHERE id = ?';
  const adjustmentQuery = `
    INSERT INTO QuantityAdjustments (productId, productName, delta)
    SELECT id, name, ? FROM Products WHERE id = ?
  `;

  // First update quantity
  sql.query(conn, updateQuery, [delta, id], err => {
    if (err) return res.status(500).json({ error: 'Failed to update quantity', details: err });

    // Then insert the log
    sql.query(conn, adjustmentQuery, [delta, id], err2 => {
      if (err2) return res.status(500).json({ error: 'Failed to log adjustment', details: err2 });
      res.json({ message: 'Quantity updated and logged' });
    });
  });
});

//create a reporting daily
app.get('/api/reports/daily', authenticate, (req, res) => {
  const query = `
    SELECT * FROM Products
    WHERE CAST(createdAt AS DATE) = CAST(GETDATE() AS DATE)
       OR CAST(updatedAt AS DATE) = CAST(GETDATE() AS DATE)
  `;

  sql.query(conn, query, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch report', details: err });
    res.json(rows);
  });
});

//create a reporting weekly
app.get('/api/reports/weekly', authenticate, (req, res) => {
  const query = `
    SELECT * FROM Products
    WHERE createdAt >= DATEADD(DAY, -7, GETDATE())
       OR updatedAt >= DATEADD(DAY, -7, GETDATE())
  `;

  sql.query(conn, query, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch report', details: err });
    res.json(rows);
  });
});

//new report endpoint(for add/remove)
app.get('/api/reports/adjustments', authenticate, (req, res) => {
  const query = `
    SELECT id, productId, productName, delta, adjustedAt
    FROM QuantityAdjustments
    ORDER BY adjustedAt DESC
  `;
  sql.query(conn, query, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch adjustment report', details: err });
    res.json(rows);
  });
});
//app starting
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
