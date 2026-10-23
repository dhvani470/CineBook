import React, { useState, useEffect } from "react";
import "./App.css";

function getToday() 
{
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function App() 
{
    const [movie, setMovie] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [error, setError] = useState("");
    const [seatError, setSeatError] = useState("");
    const [loadingSeats, setLoadingSeats] = useState(false);

    const [showDate, setShowDate] = useState(getToday());
    const [showTime, setShowTime] = useState("6:30 PM");

    const params = new URLSearchParams(window.location.search);
    const movieId = params.get("movieId");
    const userId = params.get("userId");

    const rows = ["A", "B", "C", "D", "E", "F"];

    const showtimes = ["10:00 AM", "1:30 PM", "4:00 PM", "6:30 PM", "9:30 PM"];

    // Load the selected movie from the database API
    useEffect(() => {
        fetch("http://localhost:5001/movies").then(function (response) {

            if (!response.ok) 
                    throw new Error("Unable to load movies.");
                return response.json();
            })
            .then(function (movies) {
                const selectedMovie = movies.find(function (m) {
                    return String(m.movie_id) === movieId;
                });

                if (!selectedMovie) 
                    throw new Error("Movie not found.");

                setMovie(selectedMovie);
            })
            .catch(function (err) {
                setError(err.message);
            });
    }, [movieId]);

    // Load booked seats for the selected movie, date and showtime
    useEffect(() => {
        if (!movieId || !showDate || !showTime) 
            return;

        let cancelled = false;

        setLoadingSeats(true);
        setSeatError("");
        setBookedSeats([]);
        setSelectedSeats([]);
        setBookingConfirmed(false);

        const url = "http://localhost:5001/booked-seats?movieId=" +
                    encodeURIComponent(movieId) +
                    "&showDate=" +
                    encodeURIComponent(showDate) +
                    "&showTime=" +
                    encodeURIComponent(showTime);

        fetch(url).then(function (response) {
                if (!response.ok) 
                    throw new Error("Unable to load booked seats.");

                return response.json();
            })
            .then(function (seats) {
                if (!cancelled) 
                    setBookedSeats(seats);
            })
            .catch(function (err) {
                if (!cancelled) 
                    setSeatError(err.message);
            })
            .finally(function () {
                if (!cancelled) 
                    setLoadingSeats(false);
            });

        return function () {
            cancelled = true;
        };
    }, [movieId, showDate, showTime]);

    if (error) 
        return <div className="container py-5">{error}</div>;

    if (!movie) 
        return <div className="container py-5">Loading movie...</div>;

    // Calculate the ticket price using the database value
    const price = Number(movie.ticket_price);
    const totalPrice = selectedSeats.length * price;

    // Build the correct poster URL
    let poster = movie.poster || "";

    if (!poster.startsWith("images/"))
        poster = "images/" + poster;

    const posterUrl = "http://localhost:5500/" + poster;

    function handleSeatClick(seat) 
    {
        if (bookedSeats.includes(seat) || loadingSeats || seatError) 
            return;

        if (selectedSeats.includes(seat)) 
            setSelectedSeats(selectedSeats.filter(function (s) {
                return s !== seat;
            }));
        
        else 
            setSelectedSeats([...selectedSeats, seat]);

        setBookingConfirmed(false);
    }

    async function handleBooking() 
    {
        setBookingConfirmed(false);
        setSeatError("");

        try 
        {
            if (!userId || !/^\d+$/.test(userId)) 
                throw new Error("User ID not found. Please log in again and reopen the movie.");

            const response = await fetch("http://localhost:5001/bookings", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    user_id: Number(userId),
                    movie_id: Number(movieId),
                    show_date: showDate,
                    show_time: showTime,
                    seats: selectedSeats
                })
            });

            const result = await response.json();

            if (!response.ok) 
                throw new Error(result.message || "Booking failed.");

            setBookingConfirmed(true);
            setSelectedSeats([]);

            // Refresh booked seats after a successful booking
            const seatsResponse = await fetch(
                "http://localhost:5001/booked-seats?movieId=" +
                    encodeURIComponent(movieId) +
                    "&showDate=" +
                    encodeURIComponent(showDate) +
                    "&showTime=" +
                    encodeURIComponent(showTime)
            );

            if (seatsResponse.ok) 
            {
                const seats = await seatsResponse.json();
                setBookedSeats(seats);
            }

            alert("Booking saved successfully!");
        } 
        catch (error) 
        {
            setSeatError(error.message);
            alert(error.message);
        }
    }

    // Keep userId when navigating back to the main website
    const homeUrl = "http://localhost:5500/index.html" + 
                    (userId ? "?userId=" + encodeURIComponent(userId) : "");

    const moviesUrl = "http://localhost:5500/movies.html" + 
                    (userId ? "?userId=" + encodeURIComponent(userId) : "");

    return (
        <div className="booking-page">
            <header className="booking-header">
                <div className="container d-flex justify-content-between align-items-center">
                    <h1 className="brand mb-0">
                        <span>CineBook</span>.
                    </h1>

                    <a href={homeUrl} className="home-link">Back to Home</a>
                </div>
            </header>

            <main className="container py-4">
                {/* Selected Movie */}
                <section className="movie-info card border-0 shadow-sm mb-4">
                    <div className="card-body d-flex align-items-center gap-3">
                        <img src={posterUrl}
                            alt={movie.title}
                            style={{width: "100px", borderRadius: "8px"}}
                        />

                        <div>
                            <p className="section-label">YOUR MOVIE</p>
                            <h2>{movie.title}</h2>

                            <p className="text-muted mb-1">
                                {movie.language} | {movie.genre} | {movie.duration}
                            </p>

                            <strong>Ticket Price: ₹{price}</strong>
                        </div>
                    </div>
                </section>
                    <>
                    {/* Select Date and Showtime */}
                    <section className="card border-0 shadow-sm booking-card mb-4">
                        <div className="card-body p-3 p-md-4">
                            <h3 className="section-title">Choose Your Show</h3>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label htmlFor="showDate" className="form-label">
                                        Show Date
                                    </label>

                                    <input type="date" id="showDate" className="form-control"
                                        value={showDate} min={getToday()} 
                                        onChange={function (event) {
                                            setShowDate(event.target.value);
                                        }}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="showTime" className="form-label">
                                        Show Time
                                    </label>

                                    <select id="showTime" className="form-select"
                                        value={showTime}
                                        onChange={function (event) {
                                            setShowTime(event.target.value);
                                        }}
                                    >
                                        {showtimes.map(function (time) {
                                            return (
                                                <option key={time} value={time}>
                                                    {time}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="row g-4">
                        {/* Seat Selection */}
                        <div className="col-lg-8">
                            <section className="card border-0 shadow-sm booking-card">
                                <div className="card-body p-3 p-md-4">
                                    <h3 className="section-title">
                                        Select Your Seats
                                    </h3>

                                    {loadingSeats && (
                                        <p className="text-muted">
                                            Loading seat availability...
                                        </p>
                                    )}

                                    {seatError && (
                                        <p className="text-danger">
                                            {seatError}
                                        </p>
                                    )}

                                    <div className="screen">SCREEN</div>

                                    <div className="seat-layout">
                                        {rows.map(function (row) {
                                            return (
                                                <div className="seat-row" key={row}>
                                                    <span className="row-label">
                                                        {row}
                                                    </span>

                                                    {Array.from(
                                                        { length: 8 },
                                                        function (_, i) {
                                                            const seat = row + (i + 1);

                                                            let seatClass = "seat";

                                                            if (bookedSeats.includes(seat)) 
                                                                seatClass += " booked";
                                                            else if (selectedSeats.includes(seat)) 
                                                                seatClass += " selected";

                                                            return (
                                                                <button type="button" key={seat}
                                                                        className={seatClass}
                                                                        disabled={
                                                                            bookedSeats.includes(seat) ||
                                                                            loadingSeats ||
                                                                            Boolean(seatError)
                                                                        }
                                                                        onClick={function () {
                                                                            handleSeatClick(seat);
                                                                        }}
                                                                    >
                                                                    {i + 1}
                                                                </button>
                                                            );
                                                        }
                                                    )}

                                                    <span className="row-label">{row}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="seat-legend">
                                        <span>
                                            <i className="legend-seat available"></i>
                                            Available
                                        </span>

                                        <span>
                                            <i className="legend-seat selected-seat"></i>
                                            Selected
                                        </span>

                                        <span>
                                            <i className="legend-seat booked-seat"></i>
                                            Booked
                                        </span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Booking Summary */}
                        <div className="col-lg-4">
                            <section className="card border-0 shadow-sm booking-card">
                                <div className="card-body p-4">
                                    <h3 className="section-title">
                                        Booking Summary
                                    </h3>

                                    <p className="summary-label">
                                        Selected Seats
                                    </p>

                                    <p className="selected-seat-list">
                                        {selectedSeats.length === 0
                                            ? "No seats selected"
                                            : selectedSeats.join(", ")}
                                    </p>

                                    <div className="summary-row">
                                        <span>Show Date</span>
                                        <strong>{showDate}</strong>
                                    </div>

                                    <div className="summary-row">
                                        <span>Show Time</span>
                                        <strong>{showTime}</strong>
                                    </div>

                                    <div className="summary-row">
                                        <span>Number of Tickets</span>
                                        <strong>{selectedSeats.length}</strong>
                                    </div>

                                    <div className="summary-row">
                                        <span>Price per Ticket</span>
                                        <strong>₹{price}</strong>
                                    </div>

                                    <hr />

                                    <div className="total-row">
                                        <span>Total Amount</span>
                                        <strong>₹{totalPrice}</strong>
                                    </div>

                                    <button type="button"
                                        className="btn confirm-button w-100 mt-4"
                                        disabled={
                                            selectedSeats.length === 0 ||
                                            loadingSeats ||
                                            Boolean(seatError)
                                        }
                                        onClick={handleBooking}
                                    >
                                        Confirm Booking
                                    </button>

                                    {bookingConfirmed && (
                                        <p className="text-success text-center mt-3">
                                            Booking confirmed successfully!
                                        </p>
                                    )}

                                    <p className="small text-muted text-center mt-3">
                                        Select your seats to continue.
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </>
            </main>
        </div>
    );
}

export default App;
