const API_URL = "http://localhost:5001";
let movies = [];
let editingId = null;

const movieForm = document.getElementById("addMovieForm");
const movieTable = document.getElementById("movieTableBody");
const submitButton = document.getElementById("submitMovieBtn");
const cancelButton = document.getElementById("cancelEditBtn");

// Load movies from MySQL
async function loadMovies() {
    try {
        const response = await fetch(API_URL + "/movies");

        if (!response.ok) {
            throw new Error("Could not load movies.");
        }

        movies = await response.json();
        displayMovies();
        updateCounts();
    } catch (error) {
        console.error(error);
        alert("Could not load movies. Check that the backend is running.");
    }
}

// Display movies in the admin table
function displayMovies() {
    movieTable.innerHTML = "";

    movies.forEach(function (movie) {
        const row = document.createElement("tr");

        [
            movie.title,
            movie.poster,
            movie.language,
            movie.genre,
            movie.duration,
            "₹" + Number(movie.ticket_price).toFixed(2)
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const statusLabel = document.createElement("span");

        statusLabel.textContent = movie.status;
        statusLabel.className = movie.status === "Now Showing"
            ? "movie-status showing"
            : "movie-status upcoming";

        statusCell.appendChild(statusLabel);
        row.appendChild(statusCell);

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-sm btn-outline-primary me-2";
        editButton.textContent = "Edit";
        editButton.onclick = function () {
            editMovie(movie.movie_id);
        };

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-sm btn-outline-danger";
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function () {
            deleteMovie(movie.movie_id);
        };

        actionsCell.append(editButton, deleteButton);
        row.appendChild(actionsCell);
        movieTable.appendChild(row);
    });
}

// Update movie counts
function updateCounts() {
    let showing = 0;
    let comingSoon = 0;

    movies.forEach(function (movie) {
        if (movie.status === "Now Showing") {
            showing++;
        } else {
            comingSoon++;
        }
    });

    document.getElementById("totalMoviesCount").textContent = movies.length;
    document.getElementById("showingCount").textContent = showing;
    document.getElementById("comingSoonCount").textContent = comingSoon;
}

// Add or update a movie
movieForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const movie = {
        title: document.getElementById("movieTitle").value.trim(),
        poster: document.getElementById("poster").value.trim(),
        language: document.getElementById("language").value.trim(),
        genre: document.getElementById("genre").value.trim(),
        duration: document.getElementById("duration").value.trim(),
        ticket_price: Number(document.getElementById("ticketPrice").value),
        status: document.getElementById("status").value
    };

    if (
        !movie.title || !movie.poster || !movie.language ||
        !movie.genre || !movie.duration ||
        !Number.isFinite(movie.ticket_price) || movie.ticket_price <= 0
    ) {
        alert("Enter valid movie details and a price greater than zero.");
        return;
    }

    try {
        const response = await fetch(
            API_URL + "/movies" +
            (editingId === null ? "" : "/" + editingId),
            {
                method: editingId === null ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movie),
                credentials: "include"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not save movie.");
        }

        alert(editingId === null
            ? "Movie added successfully!"
            : "Movie updated successfully!");

        resetForm();
        await loadMovies();
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

// Fill the form when Edit is clicked
function editMovie(id) {
    const movie = movies.find(function (item) {
        return Number(item.movie_id) === Number(id);
    });

    if (!movie) return;

    document.getElementById("movieTitle").value = movie.title;
    document.getElementById("poster").value = movie.poster;
    document.getElementById("language").value = movie.language;
    document.getElementById("genre").value = movie.genre;
    document.getElementById("duration").value = movie.duration;
    document.getElementById("ticketPrice").value = movie.ticket_price;
    document.getElementById("status").value = movie.status;

    editingId = id;
    submitButton.textContent = "Update Movie";
    cancelButton.hidden = false;

    document.getElementById("add-movie").scrollIntoView({
        behavior: "smooth"
    });
}

// Delete a movie
async function deleteMovie(id) {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
        const response = await fetch(API_URL + "/movies/" + id, {
            method: "DELETE",
            credentials: "include"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Could not delete movie.");
        }

        if (Number(editingId) === Number(id)) resetForm();

        await loadMovies();
        alert("Movie deleted successfully!");
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

// Reset the form
function resetForm() {
    movieForm.reset();
    editingId = null;
    submitButton.textContent = "Add Movie";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", resetForm);

// Logout
const logoutButton = document.getElementById("adminLogoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "index.html";
    });
}

loadMovies();
