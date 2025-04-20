// server.js
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const db         = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Récupérer tous les clients
app.get('/api/clients', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Ajouter un client
app.post('/api/clients', (req, res) => {
  const { lastname, firstname, email, phone, address } = req.body;
  if (!lastname || !firstname || !email || !phone || !address) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }
  const stmt = db.prepare(`
    INSERT INTO clients (lastname, firstname, email, phone, address)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run([lastname, firstname, email, phone, address], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM clients WHERE id = ?', [this.lastID], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(row);
    });
  });
  stmt.finalize();
});

// Mettre à jour un client
app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const { lastname, firstname, email, phone, address } = req.body;
  if (!lastname || !firstname || !email || !phone || !address) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }
  const stmt = db.prepare(`
    UPDATE clients
    SET lastname = ?, firstname = ?, email = ?, phone = ?, address = ?
    WHERE id = ?
  `);
  stmt.run([lastname, firstname, email, phone, address, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Client non trouvé.' });
    db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
  });
  stmt.finalize();
});

// Supprimer un client
app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Client non trouvé.' });
    res.json({ deleted: true });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
