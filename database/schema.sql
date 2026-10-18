CREATE DATABASE IF NOT EXISTS cinebook;
USE cinebook;

-- 1. Movies
CREATE TABLE IF NOT EXISTS movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    poster VARCHAR(255) NOT NULL,
    language VARCHAR(100) NOT NULL,
    genre VARCHAR(150) NOT NULL,
    duration VARCHAR(30) NOT NULL,
    ticket_price DECIMAL(10, 2) NOT NULL DEFAULT 180.00,
    status ENUM('Now Showing', 'Coming Soon')
        NOT NULL DEFAULT 'Now Showing'
);

-- 2. Registered users
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

-- 3. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time VARCHAR(20) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
);

-- 4. Seats selected for bookings
CREATE TABLE IF NOT EXISTS booked_seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    movie_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time VARCHAR(20) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,

    UNIQUE (movie_id, show_date, show_time, seat_number),

    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
        ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
);