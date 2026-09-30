# Hotel Management System

A complete web-based hotel management application with authentication, authorization, database integration, and role-based access control.

## Features

- **User Authentication**: JWT-based login system
- **Role-Based Authorization**: Admin, Staff, and Guest roles
- **Room Management**: Add, edit, view, and manage hotel rooms
- **Booking System**: Create and manage room bookings
- **Guest Management**: Manage guest information
- **Dashboard**: Overview of hotel operations
- **User Management**: Manage staff and users (Admin only)

## Project Structure

```
hotel-management/
├── server.js              # Express backend server
├── database.js            # Database setup and initialization
├── middleware/
│   └── auth.js           # Authentication and authorization middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── rooms.js          # Room management routes
│   ├── bookings.js       # Booking management routes
│   └── users.js          # User management routes
├── public/
│   ├── index.html        # Frontend application
│   ├── style.css         # Styling
│   └── app.js            # Frontend JavaScript
├── package.json          # Node.js dependencies
└── hotel.db              # SQLite database (auto-created)
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Steps

1. **Extract the project files**
   ```bash
   unzip hotel-management.zip
   cd hotel-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:5000`
   - Database will be automatically created on first run

## Default Login Credentials

### Admin Account
- **Email**: admin@hotel.com
- **Password**: admin123
- **Role**: Administrator (full access)

### Staff Account
- **Email**: staff@hotel.com
- **Password**: staff123
- **Role**: Staff (limited access)

### Guest Account
- **Email**: guest@hotel.com
- **Password**: guest123
- **Role**: Guest (view-only access)

## User Roles & Permissions

### Admin
- Dashboard overview
- Manage all rooms
- Manage all bookings
- Manage users and staff
- System configuration

### Staff
- Dashboard overview
- View and manage rooms
- Manage bookings
- View guest information
- Cannot manage users

### Guest
- View available rooms
- Create and manage own bookings
- View booking history
- Cannot access admin functions

## Database Schema

### Users Table
- id (INTEGER, PRIMARY KEY)
- email (TEXT, UNIQUE)
- password (TEXT, hashed with bcrypt)
- name (TEXT)
- role (TEXT: admin, staff, guest)
- created_at (TIMESTAMP)

### Rooms Table
- id (INTEGER, PRIMARY KEY)
- room_number (TEXT, UNIQUE)
- type (TEXT: single, double, suite)
- price_per_night (DECIMAL)
- capacity (INTEGER)
- status (TEXT: available, occupied, maintenance)
- description (TEXT)
- created_at (TIMESTAMP)

### Bookings Table
- id (INTEGER, PRIMARY KEY)
- guest_id (INTEGER, FOREIGN KEY)
- room_id (INTEGER, FOREIGN KEY)
- check_in (DATE)
- check_out (DATE)
- total_price (DECIMAL)
- status (TEXT: pending, confirmed, cancelled, completed)
- created_at (TIMESTAMP)

### Guests Table
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- phone (TEXT)
- address (TEXT)
- city (TEXT)
- country (TEXT)
- id_number (TEXT)
- created_at (TIMESTAMP)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create new room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)

### Bookings
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Users
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for development

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT token-based authentication
- Role-based access control (RBAC)
- Protected routes with authentication middleware
- Password validation
- CORS protection

## Environment Variables

Create a `.env` file in the root directory (optional):
```
PORT=5000
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Troubleshooting

### Port already in use
If port 5000 is already in use, change it in `server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

### Database issues
Delete `hotel.db` file and restart the server to reset the database.

### Login issues
Clear browser cookies and try again. Make sure you're using the correct credentials.

## Development Notes

- The system uses SQLite for simplicity. For production, consider PostgreSQL or MySQL
- All passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- The frontend is responsive and works on mobile devices

## License

This project is provided as-is for learning and development purposes.

## Support

For issues or questions, review the code comments and API documentation above.
