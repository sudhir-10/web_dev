const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, authorize } = require('../middleware/auth');

// Get all rooms
router.get('/', verifyToken, (req, res) => {
  const { status, type } = req.query;
  let query = 'SELECT * FROM rooms WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY room_number';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching rooms' 
      });
    }

    res.json({ 
      success: true, 
      data: rows 
    });
  });
});

// Get single room
router.get('/:id', verifyToken, (req, res) => {
  db.get(
    'SELECT * FROM rooms WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching room' 
        });
      }

      if (!row) {
        return res.status(404).json({ 
          success: false, 
          message: 'Room not found' 
        });
      }

      res.json({ 
        success: true, 
        data: row 
      });
    }
  );
});

// Create new room (Admin only)
router.post('/', verifyToken, authorize(['admin']), (req, res) => {
  const { room_number, type, price_per_night, capacity, description } = req.body;

  // Validation
  if (!room_number || !type || !price_per_night || !capacity) {
    return res.status(400).json({ 
      success: false, 
      message: 'All required fields must be provided' 
    });
  }

  if (!['single', 'double', 'suite'].includes(type)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid room type' 
    });
  }

  db.run(
    'INSERT INTO rooms (room_number, type, price_per_night, capacity, status, description) VALUES (?, ?, ?, ?, ?, ?)',
    [room_number, type, price_per_night, capacity, 'available', description || ''],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ 
            success: false, 
            message: 'Room number already exists' 
          });
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Error creating room' 
        });
      }

      res.status(201).json({ 
        success: true, 
        message: 'Room created successfully',
        roomId: this.lastID
      });
    }
  );
});

// Update room (Admin only)
router.put('/:id', verifyToken, authorize(['admin']), (req, res) => {
  const { room_number, type, price_per_night, capacity, status, description } = req.body;

  db.get('SELECT * FROM rooms WHERE id = ?', [req.params.id], (err, room) => {
    if (err || !room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }

    const updatedRoom = {
      room_number: room_number || room.room_number,
      type: type || room.type,
      price_per_night: price_per_night || room.price_per_night,
      capacity: capacity || room.capacity,
      status: status || room.status,
      description: description !== undefined ? description : room.description
    };

    if (!['single', 'double', 'suite'].includes(updatedRoom.type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid room type' 
      });
    }

    if (!['available', 'occupied', 'maintenance'].includes(updatedRoom.status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid room status' 
      });
    }

    db.run(
      'UPDATE rooms SET room_number = ?, type = ?, price_per_night = ?, capacity = ?, status = ?, description = ? WHERE id = ?',
      [updatedRoom.room_number, updatedRoom.type, updatedRoom.price_per_night, updatedRoom.capacity, updatedRoom.status, updatedRoom.description, req.params.id],
      (err) => {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ 
              success: false, 
              message: 'Room number already exists' 
            });
          }
          return res.status(500).json({ 
            success: false, 
            message: 'Error updating room' 
          });
        }

        res.json({ 
          success: true, 
          message: 'Room updated successfully' 
        });
      }
    );
  });
});

// Delete room (Admin only)
router.delete('/:id', verifyToken, authorize(['admin']), (req, res) => {
  db.get('SELECT * FROM rooms WHERE id = ?', [req.params.id], (err, room) => {
    if (err || !room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }

    // Check if room has active bookings
    db.get(
      'SELECT COUNT(*) as count FROM bookings WHERE room_id = ? AND status IN ("pending", "confirmed")',
      [req.params.id],
      (err, result) => {
        if (result.count > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Cannot delete room with active bookings' 
          });
        }

        db.run('DELETE FROM rooms WHERE id = ?', [req.params.id], (err) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: 'Error deleting room' 
            });
          }

          res.json({ 
            success: true, 
            message: 'Room deleted successfully' 
          });
        });
      }
    );
  });
});

// Get available rooms for a date range
router.get('/available/search', verifyToken, (req, res) => {
  const { check_in, check_out, type } = req.query;

  if (!check_in || !check_out) {
    return res.status(400).json({ 
      success: false, 
      message: 'Check-in and check-out dates are required' 
    });
  }

  let query = `
    SELECT DISTINCT r.* FROM rooms r
    WHERE r.status = 'available'
    AND r.id NOT IN (
      SELECT room_id FROM bookings 
      WHERE status IN ('pending', 'confirmed')
      AND NOT (check_out <= ? OR check_in >= ?)
    )
  `;
  const params = [check_in, check_out];

  if (type) {
    query += ' AND r.type = ?';
    params.push(type);
  }

  query += ' ORDER BY r.room_number';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error searching rooms' 
      });
    }

    res.json({ 
      success: true, 
      data: rows 
    });
  });
});

module.exports = router;
