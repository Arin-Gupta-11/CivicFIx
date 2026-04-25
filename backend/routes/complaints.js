const express = require('express');
const router = express.Router();
const db = require('../models/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

const sendResolutionEmail = async (citizenEmail, citizenName, category, address) => {
  try {
    await transporter.sendMail({
      from: `"CivicFix" <${process.env.EMAIL_USER}>`,
      to: citizenEmail,
      subject: 'Your complaint has been resolved!',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f9f9f9;border-radius:16px;">
          <div style="background:#1a1a1a;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:24px;">CivicFix</h1>
          </div>
          <h2 style="color:#1a1a1a;">Your complaint is resolved! ✅</h2>
          <p style="color:#555;line-height:1.7;">Hi ${citizenName},</p>
          <p style="color:#555;line-height:1.7;">
            Great news! Your complaint about <strong>${category}</strong> at 
            <strong>${address}</strong> has been resolved by our field team.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:20px 0;">
            <p style="color:#16a34a;font-weight:600;margin:0;">✅ Status: Resolved</p>
          </div>
          <p style="color:#555;line-height:1.7;">Thank you for helping improve your city!</p>
          <p style="color:#555;">— Team CivicFix</p>
        </div>
      `
    });
    console.log('Resolution email sent to:', citizenEmail);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

// Get all complaints (public - for map)
router.get('/', async (req, res) => {
  try {
    const [complaints] = await db.query(`
      SELECT c.*, 
        u.name as citizen_name, u.email as citizen_email,
        w.name as worker_name
      FROM complaints c
      LEFT JOIN users u ON c.citizen_id = u.id
      LEFT JOIN users w ON c.assigned_to = w.id
      ORDER BY c.created_at DESC
    `);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my complaints (citizen)
router.get('/my', auth, async (req, res) => {
  try {
    const [complaints] = await db.query(
      `SELECT c.*, w.name as worker_name 
       FROM complaints c
       LEFT JOIN users w ON c.assigned_to = w.id
       WHERE c.citizen_id = ? ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get assigned complaints (field worker only)
router.get('/assigned', auth, async (req, res) => {
  try {
    const [complaints] = await db.query(
      `SELECT c.*, u.name as citizen_name
       FROM complaints c
       LEFT JOIN users u ON c.citizen_id = u.id
       WHERE c.assigned_to = ? ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all field workers (officer only)
router.get('/workers', auth, async (req, res) => {
  if (req.user.role !== 'officer') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const [workers] = await db.query(
      "SELECT id, name, email FROM users WHERE role = 'worker'"
    );
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit new complaint (with image upload kept)
router.post('/', auth, upload.single('image'), async (req, res) => {
  const { category, description, latitude, longitude, address } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const [result] = await db.query(
      `INSERT INTO complaints
       (citizen_id, category, description, latitude, longitude, address, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
      [req.user.id, category, description, latitude, longitude, address, image_url]
    );
    const [newComplaint] = await db.query(
      `SELECT c.*, u.name as citizen_name FROM complaints c
       LEFT JOIN users u ON c.citizen_id = u.id WHERE c.id = ?`,
      [result.insertId]
    );
    req.app.get('io').emit('newComplaint', newComplaint[0]);
    res.status(201).json(newComplaint[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign complaint to worker (officer only)
router.patch('/:id/assign', auth, async (req, res) => {
  if (req.user.role !== 'officer') {
    return res.status(403).json({ error: 'Only officers can assign complaints' });
  }
  const { worker_id } = req.body;
  try {
    await db.query(
      "UPDATE complaints SET assigned_to = ?, status = 'in_progress' WHERE id = ?",
      [worker_id, req.params.id]
    );
    const [updated] = await db.query(
      `SELECT c.*, u.name as citizen_name, w.name as worker_name
       FROM complaints c
       LEFT JOIN users u ON c.citizen_id = u.id
       LEFT JOIN users w ON c.assigned_to = w.id
       WHERE c.id = ?`,
      [req.params.id]
    );
    req.app.get('io').emit('statusUpdated', updated[0]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update complaint status
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;

  // Field workers can only update their own assigned complaints
  if (req.user.role === 'worker') {
    const [check] = await db.query(
      'SELECT * FROM complaints WHERE id = ? AND assigned_to = ?',
      [req.params.id, req.user.id]
    );
    if (check.length === 0) {
      return res.status(403).json({ error: 'Not your assigned complaint' });
    }
  }

  try {
    const resolvedAt = status === 'resolved' ? new Date() : null;
    await db.query(
      'UPDATE complaints SET status = ?, resolved_at = ? WHERE id = ?',
      [status, resolvedAt, req.params.id]
    );

    const [updated] = await db.query(
      `SELECT c.*, u.name as citizen_name, u.email as citizen_email, w.name as worker_name
       FROM complaints c
       LEFT JOIN users u ON c.citizen_id = u.id
       LEFT JOIN users w ON c.assigned_to = w.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    // Send email notification to citizen when resolved
    if (status === 'resolved' && updated[0].citizen_email) {
      sendResolutionEmail(
        updated[0].citizen_email,
        updated[0].citizen_name,
        updated[0].category,
        updated[0].address
      );
    }

    req.app.get('io').emit('statusUpdated', updated[0]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
