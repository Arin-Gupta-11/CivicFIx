const express = require('express');
const router = express.Router();
const db = require('../models/db');
const auth = require('../middleware/auth');

// Get all complaints (public - for map)
router.get('/', async (req, res) => {
  try {
    const [complaints] = await db.query(
      'SELECT * FROM complaints ORDER BY created_at DESC'
    );
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my complaints (citizen)
router.get('/my', auth, async (req, res) => {
  try {
    const [complaints] = await db.query(
      'SELECT * FROM complaints WHERE citizen_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit new complaint
router.post('/', auth, async (req, res) => {
  const { category, description, latitude, longitude, address } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO complaints
       (citizen_id, category, description, latitude, longitude, address, status)
       VALUES (?, ?, ?, ?, ?, ?, 'open')`,
      [req.user.id, category, description, latitude, longitude, address]
    );
    const [newComplaint] = await db.query(
      'SELECT * FROM complaints WHERE id = ?', [result.insertId]
    );
    req.app.get('io').emit('newComplaint', newComplaint[0]);
    res.status(201).json(newComplaint[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update complaint status
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query(
      'UPDATE complaints SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    const [updated] = await db.query(
      'SELECT * FROM complaints WHERE id = ?', [req.params.id]
    );
    req.app.get('io').emit('statusUpdated', updated[0]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;