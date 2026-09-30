const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'hotel.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('✓ Connected to SQLite database');
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'guest')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rooms table
    db.run(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_number TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('single', 'double', 'suite')),
        price_per_night DECIMAL(10, 2) NOT NULL,
        capacity INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('available', 'occupied', 'maintenance')),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Guests table
    db.run(`
      CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        id_number TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Bookings table
    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )
    `);

    // Insert default users if they don't exist
    insertDefaultData();
  });
}

function insertDefaultData() {
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const staffPassword = bcrypt.hashSync('staff123', 10);
  const guestPassword = bcrypt.hashSync('guest123', 10);

  // Check if admin exists
  db.get('SELECT * FROM users WHERE email = ?', ['admin@hotel.com'], (err, row) => {
    if (!row) {
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin@hotel.com', adminPassword, 'Administrator', 'admin'],
        function(err) {
          if (err) console.error('Error inserting admin:', err);
        }
      );
    }
  });

  // Check if staff exists
  db.get('SELECT * FROM users WHERE email = ?', ['staff@hotel.com'], (err, row) => {
    if (!row) {
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['staff@hotel.com', staffPassword, 'Staff Member', 'staff'],
        function(err) {
          if (err) console.error('Error inserting staff:', err);
        }
      );
    }
  });

  // Check if guest exists
  db.get('SELECT * FROM users WHERE email = ?', ['guest@hotel.com'], (err, row) => {
    if (!row) {
      db.run(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['guest@hotel.com', guestPassword, 'John Guest', 'guest'],
        function(err) {
          if (err) console.error('Error inserting guest:', err);
          // Create guest profile
          db.run(
            'INSERT INTO guests (user_id, phone, address, city, country) VALUES (?, ?, ?, ?, ?)',
            [this.lastID, '123-456-7890', '123 Main St', 'New York', 'USA'],
            (err) => {
              if (err) console.error('Error inserting guest profile:', err);
            }
          );
        }
      );
    }
  });

  // Insert sample rooms
  const sampleRooms = [
    { room_number: '101', type: 'single', price: 80, capacity: 1, status: 'available', desc: 'Single room with city view' },
    { room_number: '102', type: 'double', price: 120, capacity: 2, status: 'available', desc: 'Double room with en-suite bathroom' },
    { room_number: '103', type: 'suite', price: 200, capacity: 4, status: 'available', desc: 'Luxury suite with living area' },
    { room_number: '104', type: 'double', price: 120, capacity: 2, status: 'occupied', desc: 'Double room on 1st floor' },
    { room_number: '105', type: 'single', price: 80, capacity: 1, status: 'available', desc: 'Single room with garden view' }
  ];

  db.get('SELECT COUNT(*) as count FROM rooms', (err, row) => {
    if (row && row.count === 0) {
      sampleRooms.forEach(room => {
        db.run(
          'INSERT INTO rooms (room_number, type, price_per_night, capacity, status, description) VALUES (?, ?, ?, ?, ?, ?)',
          [room.room_number, room.type, room.price, room.capacity, room.status, room.desc],
          (err) => {
            if (err) console.error('Error inserting room:', err);
          }
        );
      });
    }
  });
}

module.exports = db;
