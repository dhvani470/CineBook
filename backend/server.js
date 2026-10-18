const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const crypto = require("crypto");
const { promisify } = require("util");

const app = express();
const PORT = 5000;
const scrypt = promisify(crypto.scrypt);

// CORS configuration for Live Server and React
app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000"
    ],
    credentials: true
}));

app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "cinebook"
});

db.connect(function (error) {
    if (error) {
        console.log("Database connection failed:", error.message);
        return;
    }

    console.log("Connected to CineBook database!");
});

// Test backend
app.get("/", function (req, res) {
    res.send("CineBook backend is running!");
});

// Hash password
async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, 64);

    return salt + ":" + hash.toString("hex");
}

// Verify password
async function verifyPassword(password, storedPassword) {
    if (typeof storedPassword !== "string") {
        return false;
    }

    const parts = storedPassword.split(":");

    if (parts.length !== 2) {
        return false;
    }

    const salt = parts[0];
    const storedHash = Buffer.from(parts[1], "hex");

    if (storedHash.length !== 64) {
        return false;
    }

    const hash = await scrypt(password, salt, 64);

    return crypto.timingSafeEqual(hash, storedHash);
}

// Register user
app.post("/register", async function (req, res) {
    const fullName = (req.body.fullName || "").trim();
    const username = (req.body.username || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (
        !fullName ||
        !username ||
        !email ||
        typeof password !== "string" ||
        !password
    ) {
        return res.status(400).json({
            message: "Please fill in all fields."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            message: "Password must contain at least 6 characters."
        });
    }

    try {
        const hashedPassword = await hashPassword(password);

        const sql = `
            INSERT INTO users (full_name, username, email, password)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [fullName, username, email, hashedPassword],
            function (error, result) {
                if (error) {
                    console.log("Registration error:", error.message);

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Username or email already exists."
                        });
                    }

                    return res.status(500).json({
                        message: "Could not register user."
                    });
                }

                res.status(201).json({
                    message: "Registration successful!",
                    user_id: result.insertId
                });
            }
        );
    } catch (error) {
        console.log("Password hashing error:", error.message);

        res.status(500).json({
            message: "Registration failed."
        });
    }
});

// Login user
app.post("/login", function (req, res) {
    const username = (req.body.username || "").trim();
    const password = req.body.password;

    if (!username || typeof password !== "string" || !password) {
        return res.status(400).json({
            message: "Please enter your username and password."
        });
    }

    const sql = `
        SELECT user_id, full_name, username, email, password, role
        FROM users
        WHERE username = ?
    `;

    db.query(sql, [username], async function (error, results) {
        if (error) {
            console.log("Login database error:", error.message);

            return res.status(500).json({
                message: "Could not log in."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password."
            });
        }

        const user = results[0];

        try {
            const passwordMatches = await verifyPassword(
                password,
                user.password
            );

            if (!passwordMatches) {
                return res.status(401).json({
                    message: "Invalid username or password."
                });
            }

            res.json({
                message: "Login successful!",
                user: {
                    user_id: user.user_id,
                    full_name: user.full_name,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.log("Login verification error:", error.message);

            res.status(500).json({
                message: "Login failed."
            });
        }
    });
});

// Get all movies
app.get("/movies", function (req, res) {
    db.query(
        "SELECT * FROM movies ORDER BY movie_id",
        function (error, results) {
            if (error) {
                console.log("Load movies error:", error.message);

                return res.status(500).json({
                    message: "Could not load movies."
                });
            }

            res.json(results);
        }
    );
});

// Add movie
app.post("/movies", function (req, res) {
    const movie = req.body;

    const sql = `
        INSERT INTO movies
        (title, poster, language, genre, duration, ticket_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        movie.title,
        movie.poster,
        movie.language,
        movie.genre,
        movie.duration,
        movie.ticket_price,
        movie.status
    ];

    db.query(sql, values, function (error, result) {
        if (error) {
            console.log("Add movie error:", error.message);

            return res.status(500).json({
                message: "Could not add movie."
            });
        }

        res.status(201).json({
            message: "Movie added successfully.",
            movie_id: result.insertId
        });
    });
});

// Update movie
app.put("/movies/:id", function (req, res) {
    const movie = req.body;

    const sql = `
        UPDATE movies
        SET title = ?, poster = ?, language = ?, genre = ?,
            duration = ?, ticket_price = ?, status = ?
        WHERE movie_id = ?
    `;

    const values = [
        movie.title,
        movie.poster,
        movie.language,
        movie.genre,
        movie.duration,
        movie.ticket_price,
        movie.status,
        req.params.id
    ];

    db.query(sql, values, function (error, result) {
        if (error) {
            console.log("Update movie error:", error.message);

            return res.status(500).json({
                message: "Could not update movie."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }

        res.json({
            message: "Movie updated successfully."
        });
    });
});

// Delete movie
app.delete("/movies/:id", function (req, res) {
    db.query(
        "DELETE FROM movies WHERE movie_id = ?",
        [req.params.id],
        function (error, result) {
            if (error) {
                console.log("Delete movie error:", error.message);

                return res.status(500).json({
                    message: "Could not delete movie."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Movie not found."
                });
            }

            res.json({
                message: "Movie deleted successfully."
            });
        }
    );
});

// Get booked seats
app.get("/booked-seats", function (req, res) {
    const movieId = req.query.movieId;
    const showDate = req.query.showDate;
    const showTime = req.query.showTime;

    if (!movieId || !showDate || !showTime) {
        return res.status(400).json({
            message: "Movie, date and showtime are required."
        });
    }

    const sql = `
        SELECT seat_number
        FROM booked_seats
        WHERE movie_id = ?
          AND show_date = ?
          AND show_time = ?
    `;

    db.query(
        sql,
        [movieId, showDate, showTime],
        function (error, results) {
            if (error) {
                console.log("Load booked seats error:", error.message);

                return res.status(500).json({
                    message: "Could not load booked seats."
                });
            }

            res.json(results.map(function (seat) {
                return seat.seat_number;
            }));
        }
    );
});

// Save booking and selected seats
app.post("/bookings", function (req, res) {
    const userId = Number(req.body.user_id);
    const movieId = Number(req.body.movie_id);
    const showDate = req.body.show_date;
    const showTime = req.body.show_time;
    const seats = req.body.seats;

    if (
        !Number.isInteger(userId) || userId <= 0 ||
        !Number.isInteger(movieId) || movieId <= 0 ||
        !showDate || !showTime ||
        !Array.isArray(seats) || seats.length === 0
    ) {
        return res.status(400).json({
            message: "Please provide valid booking details."
        });
    }

    if (
        !seats.every(function (seat) {
            return typeof seat === "string" &&
                /^[A-F][1-8]$/.test(seat);
        }) ||
        new Set(seats).size !== seats.length
    ) {
        return res.status(400).json({
            message: "Invalid or duplicate seats."
        });
    }

    db.beginTransaction(function (error) {
        if (error) {
            console.log("Start transaction error:", error.message);

            return res.status(500).json({
                message: "Could not start booking."
            });
        }

        db.query(
            "SELECT user_id FROM users WHERE user_id = ?",
            [userId],
            function (error, users) {
                if (error || users.length === 0) {
                    console.log(
                        "User check error:",
                        error ? error.message : "User ID does not exist."
                    );

                    return db.rollback(function () {
                        res.status(400).json({
                            message: "Invalid user ID. Please check the users table."
                        });
                    });
                }

                db.query(
                    "SELECT ticket_price, status FROM movies WHERE movie_id = ?",
                    [movieId],
                    function (error, movies) {
                        if (
                            error ||
                            movies.length === 0 ||
                            movies[0].status !== "Now Showing"
                        ) {
                            console.log(
                                "Movie check error:",
                                error ? error.message : "Movie unavailable."
                            );

                            return db.rollback(function () {
                                res.status(400).json({
                                    message: "Movie is unavailable for booking."
                                });
                            });
                        }

                        const totalPrice =
                            Number(movies[0].ticket_price) * seats.length;

                        const sql = `
                            INSERT INTO bookings
                            (user_id, movie_id, show_date, show_time, total_price)
                            VALUES (?, ?, ?, ?, ?)
                        `;

                        db.query(
                            sql,
                            [userId, movieId, showDate, showTime, totalPrice],
                            function (error, result) {
                                if (error) {
                                    console.log(
                                        "Booking insert error:",
                                        error.message,
                                        error.code
                                    );

                                    return db.rollback(function () {
                                        res.status(500).json({
                                            message: "Could not save booking: " +
                                                error.message
                                        });
                                    });
                                }

                                const bookingId = result.insertId;
                                let savedSeats = 0;

                                function saveNextSeat() {
                                    if (savedSeats === seats.length) {
                                        return db.commit(function (error) {
                                            if (error) {
                                                console.log(
                                                    "Commit error:",
                                                    error.message
                                                );

                                                return db.rollback(function () {
                                                    res.status(500).json({
                                                        message: "Could not complete booking."
                                                    });
                                                });
                                            }

                                            res.status(201).json({
                                                message: "Booking saved successfully!",
                                                booking_id: bookingId,
                                                total_price: totalPrice
                                            });
                                        });
                                    }

                                    const seatSql = `
                                        INSERT INTO booked_seats
                                        (booking_id, movie_id, show_date, show_time, seat_number)
                                        VALUES (?, ?, ?, ?, ?)
                                    `;

                                    db.query(
                                        seatSql,
                                        [
                                            bookingId,
                                            movieId,
                                            showDate,
                                            showTime,
                                            seats[savedSeats]
                                        ],
                                        function (error) {
                                            if (error) {
                                                console.log(
                                                    "Seat insert error:",
                                                    error.message,
                                                    error.code
                                                );

                                                return db.rollback(function () {
                                                    if (error.code === "ER_DUP_ENTRY") {
                                                        return res.status(409).json({
                                                            message: "A selected seat has already been booked. Please choose other seats."
                                                        });
                                                    }

                                                    res.status(500).json({
                                                        message: "Could not save selected seats: " +
                                                            error.message
                                                    });
                                                });
                                            }

                                            savedSeats++;
                                            saveNextSeat();
                                        }
                                    );
                                }

                                saveNextSeat();
                            }
                        );
                    }
                );
            }
        );
    });
});

// Get a user's booking history
app.get("/my-bookings", function (req, res) {
    const userId = req.query.userId;

    if (!userId || !/^\d+$/.test(userId)) {
        return res.status(400).json({
            message: "A valid user ID is required."
        });
    }

    const sql = `
        SELECT
            b.booking_id,
            m.title,
            m.poster,
            b.show_date,
            b.show_time,
            b.total_price,
            b.booking_date,
            GROUP_CONCAT(
                bs.seat_number
                ORDER BY bs.seat_number
                SEPARATOR ', '
            ) AS seats,
            COUNT(bs.seat_id) AS ticket_count
        FROM bookings b
        JOIN movies m ON b.movie_id = m.movie_id
        LEFT JOIN booked_seats bs ON b.booking_id = bs.booking_id
        WHERE b.user_id = ?
        GROUP BY
            b.booking_id,
            m.title,
            m.poster,
            b.show_date,
            b.show_time,
            b.total_price,
            b.booking_date
        ORDER BY b.booking_date DESC
    `;

    db.query(sql, [Number(userId)], function (error, results) {
        if (error) {
            console.error("My Bookings error:", error.message);

            return res.status(500).json({
                message: "Could not load your bookings."
            });
        }

        res.json(results);
    });
});

// Get all bookings for the admin page
app.get("/admin/bookings", function (req, res) {
    const sql = `
        SELECT
            b.booking_id,
            u.full_name,
            u.username,
            m.title AS movie_title,
            b.show_date,
            b.show_time,
            GROUP_CONCAT(
                bs.seat_number
                ORDER BY bs.seat_number
                SEPARATOR ', '
            ) AS seats,
            COUNT(bs.seat_id) AS ticket_count,
            b.total_price,
            b.booking_date
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        JOIN movies m ON b.movie_id = m.movie_id
        LEFT JOIN booked_seats bs ON b.booking_id = bs.booking_id
        GROUP BY
            b.booking_id,
            u.full_name,
            u.username,
            m.title,
            b.show_date,
            b.show_time,
            b.total_price,
            b.booking_date
        ORDER BY b.booking_date DESC
    `;

    db.query(sql, function (error, results) {
        if (error) {
            console.error("Admin bookings error:", error);

            return res.status(500).json({
                message: "Could not load all bookings."
            });
        }

        res.json(results);
    });
});

// Start server
app.listen(PORT, function () {
    console.log(`Server running at http://localhost:${PORT}`);
});
