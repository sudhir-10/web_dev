-- ============================================================================
-- HOTEL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- SQLite3 Database Schema
-- Tables: Users, Rooms, Guests, Bookings
-- ============================================================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- ============================================================================
-- TABLE 1: USERS
-- ============================================================================
-- Stores user account information and authentication data

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'guest')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Default users (created automatically):
-- INSERT INTO users (email, password, name, role) VALUES 
--   ('admin@hotel.com', 'hashed_password', 'Administrator', 'admin'),
--   ('staff@hotel.com', 'hashed_password', 'Staff Member', 'staff'),
--   ('guest@hotel.com', 'hashed_password', 'John Guest', 'guest');

-- ============================================================================
-- TABLE 2: ROOMS
-- ============================================================================
-- Stores hotel room information and inventory

CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('single', 'double', 'suite')),
    price_per_night DECIMAL(10, 2) NOT NULL,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('available', 'occupied', 'maintenance')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_number ON rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);

-- Sample room data (created automatically):
-- INSERT INTO rooms (room_number, type, price_per_night, capacity, status, description) VALUES
--   ('101', 'single', 80.00, 1, 'available', 'Single room with city view'),
--   ('102', 'double', 120.00, 2, 'available', 'Double room with en-suite'),
--   ('103', 'suite', 200.00, 4, 'available', 'Luxury suite with living area'),
--   ('104', 'double', 120.00, 2, 'occupied', 'Double room on 1st floor'),
--   ('105', 'single', 80.00, 1, 'available', 'Single room with garden view');

-- ============================================================================
-- TABLE 3: GUESTS
-- ============================================================================
-- Stores guest profile information (linked to users)

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
);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_user ON guests(user_id);

-- ============================================================================
-- TABLE 4: BOOKINGS
-- ============================================================================
-- Stores reservation information

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
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(room_id, check_in, check_out);

-- ============================================================================
-- DATA TYPES REFERENCE
-- ============================================================================
-- INTEGER: Whole numbers
-- TEXT: Variable-length strings
-- DECIMAL(10,2): Numbers with decimals (up to 99,999,999.99)
-- DATE: Date values (YYYY-MM-DD)
-- TIMESTAMP: Date and time with timezone

-- ============================================================================
-- CONSTRAINTS REFERENCE
-- ============================================================================
-- PRIMARY KEY: Unique identifier for each row
-- UNIQUE: Ensures no duplicate values
-- NOT NULL: Field must have a value
-- CHECK: Validates that values meet specific criteria
-- FOREIGN KEY: Links to another table with CASCADE DELETE
-- AUTOINCREMENT: Auto-generates ID for new rows
-- DEFAULT: Sets default value if not provided

-- ============================================================================
-- ENTITY RELATIONSHIP DIAGRAM
-- ============================================================================
--
--     USERS (1)
--       │
--       └─── (1) GUESTS
--              │
--              └─── (Many) BOOKINGS ──────── (1) ROOMS
--
-- Relationships:
--   Users (1) ---- (1) Guests (one user = one guest profile)
--   Guests (1) ---- (Many) Bookings (one guest can have multiple bookings)
--   Rooms (1) ---- (Many) Bookings (one room can have multiple bookings on different dates)

-- ============================================================================
-- USEFUL QUERIES
-- ============================================================================

-- Get available rooms for a date range
-- SELECT r.* FROM rooms r
-- WHERE r.status = 'available'
-- AND r.id NOT IN (
--   SELECT room_id FROM bookings 
--   WHERE status IN ('pending', 'confirmed')
--   AND NOT (check_out <= '2024-02-01' OR check_in >= '2024-02-05')
-- );

-- Get guest's booking history
-- SELECT b.*, r.room_number, r.type 
-- FROM bookings b
-- JOIN rooms r ON b.room_id = r.id
-- WHERE b.guest_id = 3
-- ORDER BY b.check_in DESC;

-- Get total revenue
-- SELECT SUM(total_price) as revenue
-- FROM bookings 
-- WHERE status IN ('confirmed', 'completed');

-- Get bookings by status
-- SELECT COUNT(*) FROM bookings WHERE status = 'confirmed';

-- Get room occupancy
-- SELECT r.room_number, COUNT(b.id) as bookings
-- FROM rooms r
-- LEFT JOIN bookings b ON r.id = b.room_id
-- WHERE b.status IN ('confirmed', 'pending')
-- GROUP BY r.id;

-- Get users by role
-- SELECT COUNT(*) FROM users WHERE role = 'guest';

-- Get upcoming check-ins
-- SELECT b.*, r.room_number, u.name
-- FROM bookings b
-- JOIN rooms r ON b.room_id = r.id
-- JOIN guests g ON b.guest_id = g.id
-- JOIN users u ON g.user_id = u.id
-- WHERE b.check_in = DATE('now')
-- AND b.status IN ('confirmed', 'pending');

-- ============================================================================
-- BACKUP & RESTORE
-- ============================================================================

-- Backup database
-- In terminal: sqlite3 hotel.db ".dump" > backup.sql

-- Restore from backup
-- In terminal: sqlite3 hotel.db < backup.sql

-- Reset database (delete all data)
-- DELETE FROM bookings;
-- DELETE FROM guests;
-- DELETE FROM rooms;
-- DELETE FROM users;

-- ============================================================================
-- FOREIGN KEY CASCADE BEHAVIOR
-- ============================================================================

-- When a user is deleted:
--   → Their guest profile is deleted
--   → All their bookings are deleted

-- When a guest profile is deleted:
--   → All their bookings are deleted

-- When a room is deleted:
--   → All bookings for that room are deleted

-- This ensures data integrity and prevents orphaned records

-- ============================================================================
-- STATUS VALUES
-- ============================================================================

-- ROOM STATUS:
--   available   - Ready for booking
--   occupied    - Currently booked
--   maintenance - Under maintenance

-- BOOKING STATUS:
--   pending     - Awaiting confirmation
--   confirmed   - Confirmed reservation
--   cancelled   - Cancelled booking
--   completed   - Stay finished

-- USER ROLES:
--   admin       - Full system access
--   staff       - Limited access (no user management)
--   guest       - View-only access to own bookings

-- ============================================================================
-- INDEXES CREATED FOR PERFORMANCE
-- ============================================================================

-- idx_users_email        - Fast email lookups for login
-- idx_rooms_number       - Fast room number searches
-- idx_rooms_status       - Fast filtering by status
-- idx_rooms_type         - Fast filtering by type
-- idx_guests_user        - Fast guest lookups by user
-- idx_bookings_guest     - Fast booking queries by guest
-- idx_bookings_room      - Fast booking queries by room
-- idx_bookings_status    - Fast filtering by status
-- idx_bookings_dates     - Fast availability searches

-- ============================================================================
-- NOTES FOR PRODUCTION
-- ============================================================================

-- For production deployment:

-- 1. Migrate to PostgreSQL or MySQL
--    SQLite is fine for development but has limitations in production
--
-- 2. Add regular backups
--    Daily backups recommended
--    Store backups in secure location
--
-- 3. Add more indexes if needed
--    Monitor slow queries
--    Add indexes for frequently used filters
--
-- 4. Archive old data
--    Move completed bookings to archive
--    Keep database size manageable
--
-- 5. Add views for common queries
--    Simplifies complex queries
--    Improves consistency
--
-- 6. Enable audit logging
--    Track all changes
--    Compliance and troubleshooting
--
-- 7. Set up monitoring
--    Monitor database size
--    Monitor query performance
--    Set up alerts

-- ============================================================================
-- END OF DATABASE SCHEMA
-- ============================================================================
