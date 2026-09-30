const express = require('express');
const router = express.Router();
const db = require('../database');
const { verifyToken, authorize } = require('../middleware/auth');

// Get all bookings
router.get('/', verifyToken, (req, res) => {
  let query = 'SELECT b.*, r.room_number, r.type, u.name FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN guests g ON b.guest_id = g.id JOIN users u ON g.user_id = u.id WHERE 1=1';
  const params = [];

  // Guests can only see their own bookings
  if (req.user.role === 'guest') {
    query += ' AND g.user_id = ?';
    params.push(req.user.id);
  }

  const status = req.query.status;
  if (status) {
    query += ' AND b.status = ?';
    params.push(status);
  }

  query += ' ORDER BY b.check_in DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching bookings' 
      });
    }

    res.json({ 
      success: true, 
      data: rows || [] 
    });
  });
});

// Get single booking
router.get('/:id', verifyToken, (req, res) => {
  let query = 'SELECT b.*, r.room_number, r.type, u.name FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN guests g ON b.guest_id = g.id JOIN users u ON g.user_id = u.id WHERE b.id = ?';
  const params = [req.params.id];

  // Guests can only see their own bookings
  if (req.user.role === 'guest') {
    query += ' AND g.user_id = ?';
    params.push(req.user.id);
  }

  db.get(query, params, (err, row) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching booking' 
      });
    }

    if (!row) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    res.json({ 
      success: true, 
      data: row 
    });
  });
});

// Create new booking
router.post('/', verifyToken, (req, res) => {
  const { room_id, check_in, check_out, special_requests } = req.body;

  // Validation
  if (!room_id || !check_in || !check_out) {
    return res.status(400).json({ 
      success: false, 
      message: 'Room ID, check-in, and check-out dates are required' 
    });
  }

  const checkInDate = new Date(check_in);
  const checkOutDate = new Date(check_out);

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ 
      success: false, 
      message: 'Check-out date must be after check-in date' 
    });
  }

  // Get room details
  db.get('SELECT * FROM rooms WHERE id = ?', [room_id], (err, room) => {
    if (err || !room) {
      return res.status(404).json({ 
        success: false, 
        message: 'Room not found' 
      });
    }

    // Check if room is available for the date range
    db.get(
      `SELECT COUNT(*) as count FROM bookings 
       WHERE room_id = ? AND status IN ('pending', 'confirmed')
       AND NOT (check_out <= ? OR check_in >= ?)`,
      [room_id, check_in, check_out],
      (err, result) => {
        if (result.count > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Room is not available for the selected dates' 
          });
        }

        // Get or create guest profile for user
        db.get('SELECT id FROM guests WHERE user_id = ?', [req.user.id], (err, guest) => {
          let guestId = guest?.id;

          if (!guest) {
            // Create guest profile if it doesn't exist
            db.run(
              'INSERT INTO guests (user_id) VALUES (?)',
              [req.user.id],
              function(err) {
                if (err) {
                  return res.status(500).json({ 
                    success: false, 
                    message: 'Error creating guest profile' 
                  });
                }
                guestId = this.lastID;
                createBooking();
              }
            );
          } else {
            createBooking();
          }

          function createBooking() {
            // Calculate total price
            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            const totalPrice = nights * room.price_per_night;

            db.run(
              'INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_price, status, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [guestId, room_id, check_in, check_out, totalPrice, 'pending', special_requests || ''],
              function(err) {
                if (err) {
                  return res.status(500).json({ 
                    success: false, 
                    message: 'Error creating booking' 
                  });
                }

                res.status(201).json({ 
                  success: true, 
                  message: 'Booking created successfully',
                  bookingId: this.lastID,
                  totalPrice: totalPrice,
                  nights: nights
                });
              }
            );
          }
        });
      }
    );
  });
});

// Update booking
router.put('/:id', verifyToken, (req, res) => {
  const { check_in, check_out, status, special_requests } = req.body;

  // Get booking
  db.get(
    'SELECT b.*, g.user_id FROM bookings b JOIN guests g ON b.guest_id = g.id WHERE b.id = ?',
    [req.params.id],
    (err, booking) => {
      if (err || !booking) {
        return res.status(404).json({ 
          success: false, 
          message: 'Booking not found' 
        });
      }

      // Check authorization
      if (req.user.role === 'guest' && booking.user_id !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to update this booking' 
        });
      }

      const newCheckIn = check_in || booking.check_in;
      const newCheckOut = check_out || booking.check_out;
      const newStatus = status || booking.status;
      const newSpecialRequests = special_requests !== undefined ? special_requests : booking.special_requests;

      // Validate status
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(newStatus)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid booking status' 
        });
      }

      // If dates are being changed, verify availability
      if (check_in || check_out) {
        db.get(
          `SELECT COUNT(*) as count FROM bookings 
           WHERE room_id = ? AND id != ? AND status IN ('pending', 'confirmed')
           AND NOT (check_out <= ? OR check_in >= ?)`,
          [booking.room_id, req.params.id, newCheckIn, newCheckOut],
          (err, result) => {
            if (result.count > 0) {
              return res.status(400).json({ 
                success: false, 
                message: 'Room is not available for the new dates' 
              });
            }

            // Calculate new total price
            const checkInDate = new Date(newCheckIn);
            const checkOutDate = new Date(newCheckOut);
            const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

            db.get('SELECT price_per_night FROM rooms WHERE id = ?', [booking.room_id], (err, room) => {
              const totalPrice = nights * room.price_per_night;

              updateBooking(totalPrice);
            });
          }
        );
      } else {
        updateBooking(booking.total_price);
      }

      function updateBooking(totalPrice) {
        db.run(
          'UPDATE bookings SET check_in = ?, check_out = ?, total_price = ?, status = ?, special_requests = ? WHERE id = ?',
          [newCheckIn, newCheckOut, totalPrice, newStatus, newSpecialRequests, req.params.id],
          (err) => {
            if (err) {
              return res.status(500).json({ 
                success: false, 
                message: 'Error updating booking' 
              });
            }

            res.json({ 
              success: true, 
              message: 'Booking updated successfully',
              totalPrice: totalPrice
            });
          }
        );
      }
    }
  );
});

// Cancel booking
router.delete('/:id', verifyToken, (req, res) => {
  db.get(
    'SELECT b.*, g.user_id FROM bookings b JOIN guests g ON b.guest_id = g.id WHERE b.id = ?',
    [req.params.id],
    (err, booking) => {
      if (err || !booking) {
        return res.status(404).json({ 
          success: false, 
          message: 'Booking not found' 
        });
      }

      // Check authorization
      if (req.user.role === 'guest' && booking.user_id !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to delete this booking' 
        });
      }

      db.run(
        'UPDATE bookings SET status = ? WHERE id = ?',
        ['cancelled', req.params.id],
        (err) => {
          if (err) {
            return res.status(500).json({ 
              success: false, 
              message: 'Error cancelling booking' 
            });
          }

          res.json({ 
            success: true, 
            message: 'Booking cancelled successfully' 
          });
        }
      );
    }
  );
});

module.exports = router;
