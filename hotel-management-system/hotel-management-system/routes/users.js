const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { verifyToken, authorize } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', verifyToken, authorize(['admin']), (req, res) => {
  db.all(
    'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching users' 
        });
      }

      res.json({ 
        success: true, 
        data: rows 
      });
    }
  );
});

// Get single user (Admin only)
router.get('/:id', verifyToken, authorize(['admin']), (req, res) => {
  db.get(
    'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
    [req.params.id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching user' 
        });
      }

      if (!row) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({ 
        success: true, 
        data: row 
      });
    }
  );
});

// Update user (Admin only)
router.put('/:id', verifyToken, authorize(['admin']), (req, res) => {
  const { name, email, role } = req.body;

  // Validation
  if (!name && !email && !role) {
    return res.status(400).json({ 
      success: false, 
      message: 'At least one field must be provided' 
    });
  }

  if (role && !['admin', 'staff', 'guest'].includes(role)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid role' 
    });
  }

  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const updatedName = name || user.name;
    const updatedEmail = email || user.email;
    const updatedRole = role || user.role;

    db.run(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [updatedName, updatedEmail, updatedRole, req.params.id],
      (err) => {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ 
              success: false, 
              message: 'Email already exists' 
            });
          }
          return res.status(500).json({ 
            success: false, 
            message: 'Error updating user' 
          });
        }

        res.json({ 
          success: true, 
          message: 'User updated successfully' 
        });
      }
    );
  });
});

// Reset user password (Admin only)
router.post('/:id/reset-password', verifyToken, authorize(['admin']), (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters' 
    });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  db.run(
    'UPDATE users SET password = ? WHERE id = ?',
    [hashedPassword, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error resetting password' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Password reset successfully' 
      });
    }
  );
});

// Delete user (Admin only)
router.delete('/:id', verifyToken, authorize(['admin']), (req, res) => {
  // Prevent deleting yourself
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ 
      success: false, 
      message: 'Cannot delete your own account' 
    });
  }

  db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    db.run('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Error deleting user' 
        });
      }

      res.json({ 
        success: true, 
        message: 'User deleted successfully' 
      });
    });
  });
});

// Get user statistics (Admin only)
router.get('/stats/overview', verifyToken, authorize(['admin']), (req, res) => {
  let stats = {};

  db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
    stats.totalUsers = result.count;

    db.get('SELECT COUNT(*) as count FROM rooms', [], (err, result) => {
      stats.totalRooms = result.count;

      db.get('SELECT COUNT(*) as count FROM bookings', [], (err, result) => {
        stats.totalBookings = result.count;

        db.get('SELECT COUNT(*) as count FROM bookings WHERE status = "confirmed"', [], (err, result) => {
          stats.confirmedBookings = result.count;

          db.get('SELECT SUM(total_price) as revenue FROM bookings WHERE status IN ("confirmed", "completed")', [], (err, result) => {
            stats.totalRevenue = result.revenue || 0;

            res.json({ 
              success: true, 
              data: stats 
            });
          });
        });
      });
    });
  });
});

module.exports = router;
