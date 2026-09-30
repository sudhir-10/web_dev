# Hotel Management System - Database Schema

## Overview
The system uses SQLite3 as the database with the following tables and relationships.

## Tables

### 1. Users Table
Stores user information and authentication data.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'guest')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Fields:**
- `id`: Unique user identifier
- `email`: User email (unique, used for login)
- `password`: Hashed password (bcrypt with 10 salt rounds)
- `name`: User's full name
- `role`: User role (admin, staff, or guest)
- `created_at`: Account creation timestamp

**Indexes:** Email is unique

---

### 2. Rooms Table
Stores hotel room information.

```sql
CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('single', 'double', 'suite')),
  price_per_night DECIMAL(10, 2) NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('available', 'occupied', 'maintenance')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Fields:**
- `id`: Unique room identifier
- `room_number`: Unique room number (e.g., "101", "A2B")
- `type`: Room type (single, double, or suite)
- `price_per_night`: Nightly rate in dollars
- `capacity`: Number of guests the room can accommodate
- `status`: Current room status
  - `available`: Ready for booking
  - `occupied`: Currently booked
  - `maintenance`: Under maintenance
- `description`: Room details and amenities
- `created_at`: Room creation timestamp

**Indexes:** room_number is unique

---

### 3. Guests Table
Stores guest profile information linked to users.

```sql
CREATE TABLE guests (
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
```

**Fields:**
- `id`: Unique guest identifier
- `user_id`: Reference to users table (one-to-one relationship)
- `phone`: Guest phone number
- `address`: Street address
- `city`: City name
- `country`: Country name
- `id_number`: Guest ID/passport number
- `created_at`: Profile creation timestamp

**Foreign Keys:**
- `user_id` → `users.id` (CASCADE DELETE)

**Indexes:** user_id is unique

---

### 4. Bookings Table
Stores reservation information.

```sql
CREATE TABLE bookings (
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
```

**Fields:**
- `id`: Unique booking identifier
- `guest_id`: Reference to guests table
- `room_id`: Reference to rooms table
- `check_in`: Check-in date (YYYY-MM-DD format)
- `check_out`: Check-out date (YYYY-MM-DD format)
- `total_price`: Total booking cost (calculated as nights × price_per_night)
- `status`: Booking status
  - `pending`: Awaiting confirmation
  - `confirmed`: Confirmed booking
  - `cancelled`: Cancelled booking
  - `completed`: Completed stay
- `special_requests`: Guest special requests or notes
- `created_at`: Booking creation timestamp

**Foreign Keys:**
- `guest_id` → `guests.id` (CASCADE Delete)
- `room_id` → `rooms.id` (CASCADE Delete)

---

## Entity Relationship Diagram

```
Users (1) ──── (1) Guests
  │                │
  │                │
  │         (1)    │
  │         Bookings ──── (1) Rooms
  │         (Many)  (Many)
```

### Relationships

1. **Users ↔ Guests** (One-to-One)
   - One user has one guest profile
   - Cascade delete: Deleting a user deletes their guest profile

2. **Guests ↔ Bookings** (One-to-Many)
   - One guest can have multiple bookings
   - Cascade delete: Deleting a guest deletes their bookings

3. **Rooms ↔ Bookings** (One-to-Many)
   - One room can have multiple bookings (for different dates)
   - Cascade delete: Deleting a room deletes its bookings

---

## Default Data

### Default Users
The system creates three default users on first run:

1. **Admin User**
   - Email: admin@hotel.com
   - Password: admin123
   - Role: admin (full system access)

2. **Staff User**
   - Email: staff@hotel.com
   - Password: staff123
   - Role: staff (limited access - cannot manage users)

3. **Guest User**
   - Email: guest@hotel.com
   - Password: guest123
   - Role: guest (view-only access to own bookings)

### Default Rooms
Five sample rooms are created:

1. Room 101 - Single ($80/night)
2. Room 102 - Double ($120/night)
3. Room 103 - Suite ($200/night)
4. Room 104 - Double ($120/night, occupied)
5. Room 105 - Single ($80/night)

---

## Constraints and Validations

### CHECK Constraints
- `role` must be one of: 'admin', 'staff', 'guest'
- `type` must be one of: 'single', 'double', 'suite'
- `status` (rooms) must be one of: 'available', 'occupied', 'maintenance'
- `status` (bookings) must be one of: 'pending', 'confirmed', 'cancelled', 'completed'

### UNIQUE Constraints
- `email` in users table
- `room_number` in rooms table
- `user_id` in guests table

### NOT NULL Constraints
- Users: email, password, name, role
- Rooms: room_number, type, price_per_night, capacity, status
- Guests: user_id
- Bookings: guest_id, room_id, check_in, check_out, total_price, status

### Foreign Key Constraints
- Both cascade on delete to maintain referential integrity

---

## Performance Considerations

### Recommended Indexes
For production use, consider adding these indexes:

```sql
-- Improve booking queries by date range
CREATE INDEX idx_bookings_dates ON bookings(room_id, check_in, check_out);

-- Improve guest queries
CREATE INDEX idx_guests_user ON guests(user_id);

-- Improve room queries by status and type
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);

-- Improve booking queries by status
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
```

---

## Data Types

- **INTEGER**: Used for IDs, capacity, and other whole numbers
- **TEXT**: Used for variable-length strings (email, name, addresses, etc.)
- **DECIMAL(10, 2)**: Used for prices (up to 99,999,999.99)
- **DATE**: Used for check-in and check-out dates
- **TIMESTAMP**: Used for automatic timestamp tracking

---

## Backup and Recovery

### Backing Up
```bash
# Backup the database
cp hotel.db hotel.db.backup
```

### Restoring
```bash
# Restore from backup
cp hotel.db.backup hotel.db
```

### Resetting the Database
```bash
# Delete the database file and restart the server
rm hotel.db
npm start
```

---

## Migration Notes

When upgrading the system:

1. **Always backup** before making schema changes
2. **Test migrations** in a development environment first
3. **Keep foreign key constraints** enabled for data integrity
4. **Use CASCADE DELETE** carefully - consider archiving data first

---

## Security Considerations

1. **Password Storage**: All passwords are hashed using bcryptjs with 10 salt rounds
2. **Data Isolation**: Guests can only see their own bookings
3. **Role-Based Access**: Authorization is enforced at the API level
4. **Foreign Keys**: Referential integrity is maintained through foreign key constraints
5. **Input Validation**: All inputs are validated on both client and server side

---

## Queries Reference

### Find available rooms for a date range
```sql
SELECT r.* FROM rooms r
WHERE r.status = 'available'
AND r.id NOT IN (
  SELECT room_id FROM bookings 
  WHERE status IN ('pending', 'confirmed')
  AND NOT (check_out <= '2024-01-15' OR check_in >= '2024-01-20')
);
```

### Get guest's booking history
```sql
SELECT b.*, r.room_number, r.type 
FROM bookings b
JOIN rooms r ON b.room_id = r.id
WHERE b.guest_id = ?
ORDER BY b.check_in DESC;
```

### Get revenue by room
```sql
SELECT r.room_number, SUM(b.total_price) as revenue
FROM bookings b
JOIN rooms r ON b.room_id = r.id
WHERE b.status IN ('confirmed', 'completed')
GROUP BY r.id
ORDER BY revenue DESC;
```

### Get occupancy rate
```sql
SELECT r.room_number,
  CAST(COUNT(b.id) AS FLOAT) / 
  CAST((SELECT COUNT(*) FROM bookings WHERE status='completed') AS FLOAT) * 100 as occupancy
FROM rooms r
LEFT JOIN bookings b ON r.id = b.room_id AND b.status='completed'
GROUP BY r.id;
```
