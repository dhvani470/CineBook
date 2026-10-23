# CineBook — Online Movie Ticket Booking System

CineBook is a web-based movie ticket booking system that allows users to browse movies, explore show details, select seats, and book tickets online. It also provides user registration and login, booking history, and an admin interface for managing movies and viewing bookings.

The project combines a simple HTML, CSS, and Bootstrap frontend with a React-based seat booking interface, a Node.js and Express backend, and a MySQL database.

## Features

### User Features
- **User Registration and Login:** Create an account and log in to the application.
- **Browse Movies:** View available movies along with their posters and details.
- **Movie Status:** Identify movies that are currently showing or coming soon.
- **Seat Selection:** Select seats for a movie based on the chosen show date and time.
- **Ticket Booking:** Book tickets and calculate the total ticket price.
- **Seat Availability:** View already-booked seats to avoid selecting unavailable seats.
- **My Bookings:** View previously made bookings and their details.
- **Responsive Interface:** Use the website across different screen sizes.

### Admin Features
- **Admin Dashboard:** View movie-related information and booking statistics.
- **Movie Management:** Manage movie listings.
- **Booking Management:** View booking records through the admin interface.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structure of the web pages |
| CSS3 | Styling and layout |
| Bootstrap 5 | Responsive layouts and UI components |
| JavaScript | Frontend interactions and API requests |
| React | Interactive seat booking interface |
| Node.js | Backend JavaScript runtime |
| Express.js | Backend server and REST API |
| MySQL | Store users, movies, bookings, and seat information |
| Git and GitHub | Version control and team collaboration |

## Project Structure

```text
CineBook/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── booking-react/
│       ├── public/
│       ├── src/
│       └── package.json
├── css/
│   └── style.css
├── database/
│   ├── schema.sql
│   └── seed.sql
├── images/
├── js/
│   ├── admin-bookings.js
│   ├── admin.js
│   ├── auth.js
│   ├── home.js
│   ├── login.js
│   ├── movies.js
│   ├── my-bookings.js
│   └── register.js
├── admin-bookings.html
├── admin.html
├── index.html
├── login.html
├── movies.html
├── my-bookings.html
├── register.html
└── README.md
```

## Prerequisites

Make sure the following software is installed:

- [Node.js and npm](https://nodejs.org/)
- MySQL or XAMPP with MySQL/MariaDB
- A modern web browser
- Visual Studio Code or another code editor
- Git (optional, for cloning the repository)

## Installation and Setup

### 1. Clone the Repository

Clone the repository and navigate to the project directory.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CineBook
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the actual URL of your GitHub repository.

Alternatively, download the repository as a ZIP file and extract it.

### 2. Set Up the Database

1. Start MySQL using your installed database software.
2. Open phpMyAdmin or your MySQL client.
3. Import `database/schema.sql` to create the database tables.
4. Import `database/seed.sql` to insert the sample data, if required.

The database is named `cinebook`.

**Important:** Import the schema before importing the seed data.

### 3. Configure the Database Connection

Open `backend/server.js` and locate the MySQL connection configuration.

The connection should use your local MySQL credentials and the `cinebook` database.

Example:

```javascript
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "cinebook"
});
```

Update the username and password according to your MySQL configuration. The example above assumes that the MySQL root account has an empty password.

Do not commit real database passwords or other secrets to a public repository.

### 4. Install Backend Dependencies

Open a terminal in the project directory and run:

```bash
cd backend
npm install
```

### 5. Start the Backend Server

Run:

```bash
node server.js
```

The backend runs on port `5001` in the current configuration.

If the server starts successfully and the database connection is working, the terminal should display a database connection message.

You can check the backend by opening:

```text
http://localhost:5001
```

The response should indicate that the CineBook backend is running.

Keep the backend server running while using features that require the database.

### 6. Start the Frontend

The regular HTML pages can be opened using the Live Server extension in Visual Studio Code.

1. Open the CineBook project in VS Code.
2. Open `index.html`.
3. Right-click and select **Open with Live Server**.
4. Open the website using the local address provided by Live Server, typically:

```text
http://localhost:5500
```

The exact port may differ depending on your configuration.

### 7. Run the React Booking Interface

The React booking interface is located in `backend/booking-react`.

Open another terminal and run:

```bash
cd backend/booking-react
npm install
npm start
```

The React development server typically opens at:

```text
http://localhost:3000
```

Keep the React development server running while testing the seat booking interface.

**Note:** The regular frontend, React interface, backend, and database must be running as required for the corresponding features to work.

## Application Workflow

1. **Register:** Create a user account using the registration page.
2. **Log In:** Sign in to access the application.
3. **Browse Movies:** Explore movie listings and view movie details.
4. **Choose a Movie:** Select a movie that is currently showing.
5. **Select Show Details:** Choose the desired show date and time.
6. **Choose Seats:** Select available seats from the seat selection interface.
7. **Book Tickets:** Confirm the selection to save the booking.
8. **View Bookings:** Open the My Bookings page to view booking details.
9. **Admin Operations:** Use the admin interface to manage movie listings and view bookings.

## Backend API Endpoints

The backend provides HTTP endpoints for communication between the frontend and the MySQL database.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check whether the backend is running |
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate a user |
| GET | `/movies` | Retrieve movie listings |
| POST | `/movies` | Add a movie |
| PUT | `/movies/:id` | Update movie details |
| DELETE | `/movies/:id` | Delete a movie |
| GET | `/booked-seats` | Retrieve booked seats for a particular show |
| POST | `/bookings` | Create a ticket booking |
| GET | `/my-bookings` | Retrieve a user's booking history |
| GET | `/admin/bookings` | Retrieve booking records for the admin interface |

**Note:** The endpoint list describes the routes present in the backend code discussed for this project. Additional routes or changes in your current code should be reflected in this table.

## Database

CineBook uses MySQL to store and manage application data.

The database schema is maintained in `database/schema.sql`, while `database/seed.sql` contains sample data for development and testing.

The database supports the main application entities, including users, movies, bookings, and booked seats.

## Version Control and Team Collaboration

Git and GitHub are used to manage the source code and coordinate team contributions.

The project can be developed collaboratively using separate branches for individual contributions and merged into the main branch after reviewing changes.

## Future Improvements

Potential improvements include:

- Implementing secure, server-side authentication and role-based authorization.
- Adding booking cancellation functionality.
- Improving error handling and form validation.
- Adding payment gateway integration.
- Introducing automated tests for backend APIs.
- Deploying the application to a production server.

## Conclusion

CineBook demonstrates the development of a movie ticket booking application using frontend technologies, React, Node.js, Express.js, and MySQL. It brings together movie browsing, seat selection, booking management, and administrative functionality in one application.

The project also provides practical experience with database integration, REST APIs, frontend-backend communication, and collaborative software development.
