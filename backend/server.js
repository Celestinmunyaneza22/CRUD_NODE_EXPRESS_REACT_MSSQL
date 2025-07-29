const express=require("express");
const sql = require("msnodesqlv8");
const cors = require('cors');
const app=express();

app.use(express.json());
app.use(cors());

const PORT=5000;
//connection to MS SQL
const conn="server=DESKTOP-5EMC2O1\\MSSQLSERVER01;Database=ERN;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";

// codes for displaying data on persontable(adminpage)
app.get('/api/users', (req, res) => {
  const query = "SELECT TOP 10 * FROM Person";

  sql.query(conn, query, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(rows);
    console.log(rows)
  });
});
// codes for inserting data on tabledob
app.post('/api/data', (req, res) => {
  const { id,name, age } = req.body;

    // Validation
  // if (!id || !name || age == null) {
  //   return res.status(400).json({ error: "All fields are required." });
  // }
  // if (isNaN(age) || age <= 0) {
  //   return res.status(400).json({ error: "Age must be a positive number." });
  // }
  // if (!/^\d+$/.test(id)) {
  //   return res.status(400).json({ error: "ID must be a numeric value." });
  // }

  const query = `INSERT INTO dob (id,name, age) VALUES (?,?, ?)`;
  const params = [id,name, age];

  sql.query(conn, query, params, (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Failed to insert data" });
    }
    res.json({ message: "Data inserted successfully" });
  });
});
// codes for displaying data on tabledob

app.get('/api/data', (req, res) => {
  const query = "SELECT * FROM dob";

  sql.query(conn, query, (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(rows);
    console.log(rows)
  });
});
//// codes for updating data on tabledob
app.put('/api/data/:id', (req, res) => {
  const { id } = req.params;
  const { name, age } = req.body;
  
  // Validation
  // if (!name || age == null) {
  //   return res.status(400).json({ error: "Name and age are required." });
  // }
  // if (isNaN(age) || age <= 0) {
  //   return res.status(400).json({ error: "Age must be a positive number." });
  // }

  const query = `UPDATE dob SET name = ?, age = ? WHERE id = ?`;
  sql.query(conn, query, [name, age, id], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed', details: err });
    res.json({ message: 'Record updated successfully' });
  });
});

//codes to delete data from tabledob
app.delete('/api/data/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM dob WHERE id = ?`;
  sql.query(conn, query, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed', details: err });
    res.json({ message: 'Record deleted successfully' });
  });
});

app.listen(PORT,()=>console.log(`Server started at:${PORT}`));