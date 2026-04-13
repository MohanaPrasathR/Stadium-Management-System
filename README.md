# Stadium Management System

A full-fledged stadium management system built with Next.js, TypeScript, Tailwind CSS, and MySQL.

## Features

- User management (registration, login)
- Event management (create, view events)
- Seat booking system
- Admin dashboard for managing users, events, and bookings
- Responsive web interface

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MySQL
- **Styling:** Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your MySQL database and update the environment variables in `.env.local`:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=stadium_management
   ```

4. Create the database tables (see database schema below)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user'
);
```

### Events Table
```sql
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATETIME NOT NULL,
  description TEXT,
  capacity INT NOT NULL
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);
```

## API Endpoints

- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create a new booking

## Pages

- `/` - Home page with navigation
- `/user` - User dashboard
- `/admin` - Admin panel
- `/events` - Browse events

## Building for Production

```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
