const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { generateToken, verifyToken } = require('../middleware/auth');

// Register new user
router.post('/register', (req, res) => {
  const { email, password, name, role } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email, password, and name are required' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters' 
    });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userRole = role || 'guest';

  db.run(
    'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
    [email, hashedPassword, name, userRole],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already registered' 
          });
        }
        return res.status(500).json({ 
          success: false, 
          message: 'Error registering user' 
        });
      }

      // If guest, create guest profile
      if (userRole === 'guest') {
        db.run(
          'INSERT INTO guests (user_id) VALUES (?)',
          [this.lastID],
          (err) => {
            if (err) console.error('Error creating guest profile:', err);
          }
        );
      }

      res.status(201).json({ 
        success: true, 
        message: 'User registered successfully',
        userId: this.lastID
      });
    }
  );
});

// Login user
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  db.get(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Compare passwords
      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Generate token
      const token = generateToken(user);

      res.json({ 
        success: true, 
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }
  );
});

// Get current user
router.get('/me', verifyToken, (req, res) => {
  db.get(
    'SELECT id, email, name, role FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({ 
        success: true, 
        user 
      });
    }
  );
});

// Change password
router.post('/change-password', verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      success: false, 
      message: 'Current and new password are required' 
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'New password must be at least 6 characters' 
    });
  }

  db.get(
    'SELECT password FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      if (!bcrypt.compareSync(currentPassword, user.password)) {
        return res.status(401).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);

      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: 'Error updating password' 
            });
          }

          res.json({ 
            success: true, 
            message: 'Password changed successfully' 
          });
        }
      );
    }
  );
});

module.exports = router;
