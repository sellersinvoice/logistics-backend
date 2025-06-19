import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET all reorders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reorders ORDER BY expected_arrival');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new reorder
router.post('/', async (req, res) => {
  const {
    product_id,
    vendor_id,
    warehouse_id,
    quantity_ordered,
    expected_arrival,
    tracking_number,
    carrier,
    fulfillment_type,
    label_notes
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO reorders (
        product_id, vendor_id, warehouse_id, quantity_ordered,
        expected_arrival, tracking_number, carrier,
        fulfillment_type, label_notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [product_id, vendor_id, warehouse_id, quantity_ordered,
       expected_arrival, tracking_number, carrier,
       fulfillment_type, label_notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH reorder
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  if (keys.length === 0) {
    return res.status(400).json({ error: 'No fields provided' });
  }

  const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  try {
    const result = await pool.query(
      `UPDATE reorders SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
