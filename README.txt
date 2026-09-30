HotelHub - Hotel Management System

A full-stack hotel management web application built with Node.js, Express, SQLite3, and JWT authentication.

Live Deployment

Render Backend / Full Application

Live URL: https://web-dev-eu4i.onrender.com/

The application is deployed on Render and serves the HotelHub web interface and REST API.

Technology Stack

Node.js

Express.js

SQLite3

JWT authentication

bcryptjs password hashing

HTML, CSS, JavaScript

REST API

Features

User authentication and authorization

Role-based access control

Admin

Staff

Guest

Room inventory management

Booking and reservation management

Responsive web interface

SQLite database

REST API with 30+ endpoints

Secure password hashing

JWT-based authentication

Demo Login Credentials

Admin

Email: admin@hotel.com

Password: admin123

Access: Full system access

Staff

Email: staff@hotel.com

Password: staff123

Access: Room and booking management

Guest

Email: guest@hotel.com

Password: guest123

Access: Room search and personal bookings

User Roles

Admin

View dashboard statistics

Add, edit, delete and manage rooms

Create, edit and cancel bookings

Create, edit and delete users

Reset user passwords

Assign user roles

Staff

View dashboard statistics

View, add, edit and delete rooms

Create, edit and cancel bookings

Cannot manage users

Guest

Search available rooms

View room details

Create bookings

View own bookings

Cancel own bookings

Cannot access administration features

Main Features

Dashboard

Displays:

Total users

Total rooms

Total bookings

Confirmed bookings

Total revenue

Room Management

Rooms support:

Room number

Room type

Price per night

Capacity

Description

Status

Room statuses:

available

occupied

maintenance

Booking Management

Users can:

Create reservations

Select check-in and check-out dates

Add special requests

View bookings

Edit bookings

Cancel bookings

Booking statuses:

pending

confirmed

cancelled

completed

Guest Room Search

Guests can search available rooms using:

Check-in date

Check-out date

Room type

API

Production Base URL

https://web-dev-eu4i.onrender.com/api

Authentication

Most API endpoints require:

Authorization: Bearer <your_jwt_token>

Authentication Endpoints

Method

Endpoint

Description

POST

/auth/login

User login

POST

/auth/register

Register a user

GET

/auth/me

Get current user

POST

/auth/change-password

Change password

Room Endpoints

Method

Endpoint

Description

GET

/rooms

List rooms

GET

/rooms/:id

Get room details

POST

/rooms

Create room

PUT

/rooms/:id

Update room

DELETE

/rooms/:id

Delete room

GET

/rooms/available/search

Search available rooms

Booking Endpoints

Method

Endpoint

Description

GET

/bookings

List bookings

GET

/bookings/:id

Get booking

POST

/bookings

Create booking

PUT

/bookings/:id

Update booking

DELETE

/bookings/:id

Cancel booking

User Endpoints

Method

Endpoint

Description

GET

/users

List users

GET

/users/:id

Get user

PUT

/users/:id

Update user

POST

/users/:id/reset-password

Reset password

DELETE

/users/:id

Delete user

GET

/users/stats/overview

Dashboard statistics

Database

The application uses SQLite with the following main tables:

users

rooms

guests

bookings

Relationships:

Users (1) ---- (1) Guests
Guests (1) ---- (Many) Bookings
Rooms (1) ---- (Many) Bookings

The database is initialized automatically when the application starts.

Local Installation

Requirements

Node.js 14 or higher

npm

Modern web browser

1. Clone the repository

git clone <your-github-repository-url>
cd hotel-management-system

2. Install dependencies

npm install

3. Start the server

npm start

The local application will normally be available at:

http://localhost:5000

Environment Variables

For local development, create a .env file if required:

PORT=5000
JWT_SECRET=your-secure-secret
NODE_ENV=development

For Render deployment, configure sensitive environment variables through the Render dashboard instead of committing them to GitHub.

Security

The application includes:

bcryptjs password hashing

JWT authentication

Role-based authorization

Server-side input validation

Database constraints

CORS support

Environment-based configuration

Important: Change the JWT secret for any real deployment and never commit .env or production secrets to GitHub.

Deployment

The application is currently deployed using Render.

Render Configuration

Root Directory: hotel-management-system
Build Command: npm install
Start Command: npm start
Branch: main

Live Application

https://web-dev-eu4i.onrender.com/

Production API

https://web-dev-eu4i.onrender.com/api

Database Note

The project currently uses SQLite. For a long-term production deployment, a persistent database such as PostgreSQL is recommended. SQLite data may require persistent storage configuration when hosted on a cloud platform.

Project Structure

hotel-management-system/
├── server.js
├── database.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
│
├── public/
│   └── index.html
│
├── middleware/
│   └── auth.js
│
└── routes/
    ├── auth.js
    ├── rooms.js
    ├── bookings.js
    └── users.js

Troubleshooting

Cannot login

Try the default admin credentials:

Email: admin@hotel.com
Password: admin123

If the deployed application is unavailable, check the Render service logs.

Module not found

Run:

npm install

and restart the server.

Database error

For local development, stop the server and recreate the SQLite database if necessary.

Port error

Change the local port using the PORT environment variable.

Documentation

Additional project documentation includes:

API reference

Database schema

Installation instructions

Quick start guide

Project Status

Version: 1.0.0

Deployment: Render

Application: HotelHub - Hotel Management System

Live URL: https://web-dev-eu4i.onrender.com/

🏨 HotelHub - Hotel Management System
