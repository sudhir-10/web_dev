================================================================================
HOTEL MANAGEMENT SYSTEM - COMPLETE DOCUMENTATION
================================================================================

PROJECT OVERVIEW
================

A complete, production-ready web application for managing hotel operations.

Features:
✓ User authentication and authorization
✓ Role-based access control (Admin, Staff, Guest)
✓ Room inventory management
✓ Booking and reservation system
✓ Professional responsive web interface
✓ SQLite database with proper schema
✓ REST API with 30+ endpoints
✓ Secure password hashing and JWT tokens

VERSION: 1.0.0
STATUS: Production Ready
TECHNOLOGY: Node.js, Express, SQLite3, JWT


TABLE OF CONTENTS
=================

1. Installation & Setup
2. Login Credentials
3. User Roles & Permissions
4. Features Guide
5. API Reference
6. Database Schema
7. Configuration
8. Security Features
9. Troubleshooting
10. Deployment


1. INSTALLATION & SETUP
=======================

REQUIREMENTS:
- Node.js (version 14 or higher)
- npm (comes with Node.js)
- 50MB disk space
- Modern web browser

INSTALLATION STEPS:

Step 1: Extract the ZIP File
    unzip hotel-management-system.zip
    cd hotel-management

Step 2: Install Dependencies
    npm install
    
    This will install:
    - express (web server)
    - sqlite3 (database)
    - bcryptjs (password hashing)
    - jsonwebtoken (authentication)
    - cors (security)

Step 3: Start the Server
    npm start
    
    You should see:
    ✓ Connected to SQLite database
    🏨 Hotel Management System running on http://localhost:5000

Step 4: Open in Browser
    http://localhost:5000

The database file (hotel.db) will be created automatically on first run with 
default data included.


2. LOGIN CREDENTIALS
====================

Three default accounts are created automatically:

ADMIN USER (Full System Access)
  Email: admin@hotel.com
  Password: admin123
  Role: admin

STAFF USER (Limited Access)
  Email: staff@hotel.com
  Password: staff123
  Role: staff

GUEST USER (View-Only Access)
  Email: guest@hotel.com
  Password: guest123
  Role: guest

You can create additional users after logging in as admin.


3. USER ROLES & PERMISSIONS
===========================

ADMIN ROLE - Full System Access
  Dashboard:
    ✓ View statistics (total users, rooms, bookings, revenue)
  
  Room Management:
    ✓ View all rooms
    ✓ Add new rooms
    ✓ Edit room details
    ✓ Delete rooms
    ✓ Change room status
  
  Booking Management:
    ✓ View all bookings
    ✓ Create bookings
    ✓ Edit bookings
    ✓ Cancel bookings
  
  User Management:
    ✓ View all users
    ✓ Create new users
    ✓ Edit user details
    ✓ Reset user passwords
    ✓ Delete users
    ✓ Assign roles

STAFF ROLE - Limited Access
  Dashboard:
    ✓ View statistics
  
  Room Management:
    ✓ View all rooms
    ✓ Add new rooms
    ✓ Edit room details
    ✓ Delete rooms
  
  Booking Management:
    ✓ View all bookings
    ✓ Create bookings
    ✓ Edit bookings
    ✓ Cancel bookings
  
  User Management:
    ✗ Cannot access

GUEST ROLE - View-Only Access
  Dashboard:
    ✗ No access
  
  Room Management:
    ✓ Search rooms by date
    ✓ View room details
  
  Booking Management:
    ✓ View own bookings
    ✓ Create bookings
    ✓ Cancel own bookings
  
  User Management:
    ✗ No access


4. FEATURES GUIDE
=================

DASHBOARD
---------
View system overview with key metrics:
- Total users count
- Total rooms count
- Total bookings count
- Confirmed bookings count
- Total revenue

ROOM MANAGEMENT
---------------
Add and manage hotel rooms:

Add Room:
  - Enter room number (e.g., 101, 102)
  - Select room type (single, double, suite)
  - Set price per night
  - Set room capacity
  - Add description
  - Click Save

Edit Room:
  - Click Edit button on any room
  - Modify details
  - Change status if needed
  - Save changes

Delete Room:
  - Cannot delete if room has active bookings
  - Must cancel all bookings first

Room Status Values:
  - available: Ready for booking
  - occupied: Currently booked
  - maintenance: Under maintenance

BOOKING MANAGEMENT
------------------
Create and manage reservations:

Create Booking:
  - Select room
  - Choose check-in date
  - Choose check-out date
  - Add special requests (optional)
  - System auto-calculates total price
  - Click Create

View Bookings:
  - See all bookings (staff/admin) or own (guest)
  - Filter by status if needed
  - View guest name, dates, price

Edit Booking:
  - Modify check-in/out dates
  - Change booking status
  - Update special requests

Cancel Booking:
  - Changes status to "cancelled"
  - Refund policies would be handled separately

Booking Status Values:
  - pending: Awaiting confirmation
  - confirmed: Confirmed reservation
  - cancelled: Cancelled booking
  - completed: Stay finished

GUEST SEARCH (Guest Users Only)
-------------------------------
Search for available rooms:

1. Go to "Search Rooms" section
2. Enter check-in date
3. Enter check-out date
4. Select room type (optional)
5. Click Search
6. Click "Book Room" on desired room
7. Booking created automatically

USER MANAGEMENT (Admin Only)
----------------------------
Create and manage system users:

Add User:
  - Click "Add User"
  - Enter name and email
  - Set password
  - Assign role (admin, staff, guest)
  - Click Create

Edit User:
  - Click Edit on any user
  - Modify name, email, or role
  - Save changes

Reset Password:
  - Click password reset option
  - Enter new password
  - User can log in with new password

Delete User:
  - Click Delete button
  - Cannot delete your own account
  - Confirmation required


5. API REFERENCE
================

BASE URL: http://localhost:5000/api

Authentication Header (for all endpoints except login/register):
  Authorization: Bearer <your_jwt_token>

AUTHENTICATION ENDPOINTS
------------------------

Login:
  POST /auth/login
  Body: {"email": "admin@hotel.com", "password": "admin123"}
  Returns: token, user info

Register:
  POST /auth/register
  Body: {"email": "new@example.com", "password": "pass123", "name": "Name"}
  Returns: userId

Get Current User:
  GET /auth/me
  Returns: current user info

Change Password:
  POST /auth/change-password
  Body: {"currentPassword": "old", "newPassword": "new"}

ROOM ENDPOINTS
--------------

List All Rooms:
  GET /rooms
  Query: ?status=available&type=double
  Returns: array of rooms

Get Single Room:
  GET /rooms/:id
  Returns: room details

Create Room (Admin):
  POST /rooms
  Body: {"room_number": "101", "type": "single", "price_per_night": 80, ...}
  Returns: roomId

Update Room (Admin):
  PUT /rooms/:id
  Body: {fields to update}
  Returns: success message

Delete Room (Admin):
  DELETE /rooms/:id
  Returns: success message

Search Available Rooms:
  GET /rooms/available/search
  Query: ?check_in=2024-02-01&check_out=2024-02-05&type=double
  Returns: array of available rooms

BOOKING ENDPOINTS
-----------------

List Bookings:
  GET /bookings
  Query: ?status=confirmed
  Returns: array of bookings

Get Single Booking:
  GET /bookings/:id
  Returns: booking details

Create Booking:
  POST /bookings
  Body: {"room_id": 1, "check_in": "2024-02-01", "check_out": "2024-02-05"}
  Returns: bookingId, totalPrice, nights

Update Booking:
  PUT /bookings/:id
  Body: {fields to update}
  Returns: success message

Cancel Booking:
  DELETE /bookings/:id
  Returns: success message

USER ENDPOINTS (Admin Only)
----------------------------

List All Users:
  GET /users
  Returns: array of all users

Get Single User:
  GET /users/:id
  Returns: user details

Create User:
  POST /auth/register (use this instead)
  Returns: userId

Update User:
  PUT /users/:id
  Body: {"name": "New Name", "email": "new@email.com"}
  Returns: success message

Reset Password:
  POST /users/:id/reset-password
  Body: {"newPassword": "newpass123"}
  Returns: success message

Delete User:
  DELETE /users/:id
  Returns: success message

Get Statistics:
  GET /users/stats/overview
  Returns: totalUsers, totalRooms, totalBookings, confirmedBookings, totalRevenue


6. DATABASE SCHEMA
==================

Four main tables with proper relationships:

USERS TABLE
-----------
Stores user accounts

Fields:
  id              - Unique user ID
  email           - User email (unique, for login)
  password        - Hashed password
  name            - User's full name
  role            - User role (admin, staff, guest)
  created_at      - Account creation date

ROOMS TABLE
-----------
Stores hotel rooms

Fields:
  id              - Unique room ID
  room_number     - Room number (unique, e.g., "101")
  type            - Room type (single, double, suite)
  price_per_night - Nightly rate in dollars
  capacity        - Number of guests
  status          - Room status (available, occupied, maintenance)
  description     - Room details
  created_at      - Created date

GUESTS TABLE
------------
Stores guest information

Fields:
  id              - Unique guest ID
  user_id         - Reference to users table
  phone           - Phone number
  address         - Street address
  city            - City name
  country         - Country name
  id_number       - ID/passport number
  created_at      - Created date

BOOKINGS TABLE
--------------
Stores reservations

Fields:
  id              - Unique booking ID
  guest_id        - Reference to guests table
  room_id         - Reference to rooms table
  check_in        - Check-in date (YYYY-MM-DD)
  check_out       - Check-out date (YYYY-MM-DD)
  total_price     - Total booking cost
  status          - Status (pending, confirmed, cancelled, completed)
  special_requests - Special guest requests
  created_at      - Booking creation date

RELATIONSHIPS:
  Users (1) ---- (1) Guests
  Guests (1) ---- (Many) Bookings
  Rooms (1) ---- (Many) Bookings


7. CONFIGURATION
================

Environment Variables (.env file):

PORT=5000
  Server port (default 5000)

JWT_SECRET=hotel-management-secret-key-2024
  Secret key for JWT tokens (change for security)

NODE_ENV=development
  Environment (development or production)

Database:
  Automatically uses SQLite (hotel.db)
  No configuration needed for development

To Change Port:
  Option 1: Edit server.js
    const PORT = 3000;
  
  Option 2: Set environment variable
    PORT=3000 npm start


8. SECURITY FEATURES
====================

✓ PASSWORD HASHING
  - bcryptjs with 10 salt rounds
  - Passwords never stored in plain text

✓ JWT AUTHENTICATION
  - Token-based authentication
  - Tokens expire after 24 hours
  - No session data stored on server

✓ ROLE-BASED ACCESS CONTROL
  - Each endpoint checks user role
  - Guests cannot access admin features
  - Staff cannot manage users

✓ INPUT VALIDATION
  - Server-side validation of all inputs
  - Data type checking
  - Length validation

✓ DATABASE CONSTRAINTS
  - Foreign key constraints
  - Unique constraints
  - NOT NULL constraints
  - CHECK constraints

✓ CORS PROTECTION
  - Cross-origin resource sharing enabled
  - Prevents unauthorized API access


9. TROUBLESHOOTING
==================

PROBLEM: Port 5000 already in use
SOLUTION:
  Option 1: Kill process on port 5000
  Option 2: Change port: PORT=3000 npm start

PROBLEM: "npm command not found"
SOLUTION:
  Install Node.js from nodejs.org
  npm comes included with Node.js

PROBLEM: "Module not found" error
SOLUTION:
  Delete node_modules folder: rm -rf node_modules
  Reinstall: npm install

PROBLEM: Database connection error
SOLUTION:
  Delete database: rm hotel.db
  Restart server: npm start
  Database will be recreated

PROBLEM: Cannot login
SOLUTION:
  Check email spelling (case-sensitive)
  Try default: admin@hotel.com / admin123
  Clear browser cookies and cache

PROBLEM: Bookings not showing
SOLUTION:
  Guests only see their own bookings
  Staff/Admin see all bookings
  Ensure you're logged in as correct role

PROBLEM: Cannot create room
SOLUTION:
  Only admin can create rooms
  Log in as admin@hotel.com
  Check all fields are filled

PROBLEM: Changes not saving
SOLUTION:
  Check browser console for errors
  Check server logs in terminal
  Verify token is still valid
  Try logging out and back in


10. DEPLOYMENT
===============

PREPARING FOR PRODUCTION:

1. Change JWT Secret:
   Edit .env and change JWT_SECRET to random string
   
2. Set Node Environment:
   NODE_ENV=production npm start
   
3. Use PostgreSQL Instead:
   SQLite is for development
   Use PostgreSQL for production
   Update database.js accordingly
   
4. Enable HTTPS/SSL:
   Get SSL certificate
   Configure Express for HTTPS
   
5. Add Rate Limiting:
   Prevent API abuse
   Use express-rate-limit package
   
6. Set Up Backups:
   Regular database backups
   Store backups securely
   
7. Add Logging:
   Log all API requests
   Monitor for errors
   Set up alerts
   
8. Security Headers:
   Add helmet.js for security headers
   Set CORS restrictions
   Implement CSP headers
   
9. Environment Variables:
   Never hardcode secrets
   Use .env file for all config
   Never commit .env to git
   
10. Testing:
    Test all features before launch
    Load testing
    Security testing


SUGGESTED DEPLOYMENT PLATFORMS:

- Heroku (easy, free tier available)
- AWS (EC2, RDS for database)
- DigitalOcean (affordable VPS)
- Google Cloud Platform
- Microsoft Azure


FILES INCLUDED IN ZIP
====================

server.js              - Main server file
database.js            - Database setup
package.json           - Dependencies list
.env.example           - Configuration template
.gitignore            - Git ignore rules
README.txt            - This file

middleware/
  auth.js             - Authentication & authorization

routes/
  auth.js             - Login/registration API
  rooms.js            - Room management API
  bookings.js         - Booking management API
  users.js            - User management API

public/
  index.html          - Complete web interface


GETTING HELP
============

1. Read QUICK_START.txt for setup
2. Check API_REFERENCE.txt for endpoints
3. Review DATABASE_STRUCTURE.sql for schema
4. Look at code comments in source files
5. Check browser console for JavaScript errors
6. Check terminal for server errors


GOOD LUCK!
==========

You now have a complete hotel management system ready to use.

Next steps:
1. Extract the ZIP file
2. Run: npm install
3. Run: npm start
4. Open: http://localhost:5000
5. Login with admin credentials

Enjoy your hotel management system! 🏨

For questions or issues, refer to the other documentation files.
