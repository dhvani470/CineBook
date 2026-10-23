const API_URL = "http://localhost:5001";
let movies = [];
let editingId = null;
let existingPoster = "";

const movieForm = document.getElementById("addMovieForm");
const movieTable = document.getElementById("movieTableBody");
const submitButton = document.getElementById("submitMovieBtn");
const cancelButton = document.getElementById("cancelEditBtn");
const posterInput = document.getElementById("poster");
const currentPosterText = document.getElementById("currentPosterText");

// Allowed image formats
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

// Load movies from MySQL
async function loadMovies()
{
    try
    {
        const response = await fetch(API_URL + "/movies");

        if (!response.ok)
            throw new Error("Could not load movies.");

        movies = await response.json();
        displayMovies();
        updateCounts();
    }
    catch (error)
    {
        console.error(error);
        alert("Could not load movies. Check that the backend is running.");
    }
}

// Displays Movies
function displayMovies()
{
    movieTable.innerHTML = "";

    movies.forEach(function (movie) {
        const row = document.createElement("tr");

        [   movie.title,
            movie.poster,
            movie.language,
            movie.genre,
            movie.duration
        ].forEach(function (value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Ticket price and Edit Price button
        const priceCell = document.createElement("td");
        priceCell.textContent = "₹" + Number(movie.ticket_price).toFixed(2) + " ";

        const editPriceButton = document.createElement("button");
        editPriceButton.type = "button";
        editPriceButton.className = "btn btn-sm btn-outline-primary";
        editPriceButton.textContent = "Edit Price";
        editPriceButton.onclick = function () {
            updateMoviePrice(movie.movie_id);
        };

        priceCell.appendChild(editPriceButton);
        row.appendChild(priceCell);

        // Display status without allowing direct changes
        const statusCell = document.createElement("td");
        const statusLabel = document.createElement("span");

        statusLabel.textContent = movie.status;
        statusLabel.className = movie.status === "Now Showing" ? "movie-status showing" : "movie-status upcoming";

        statusCell.appendChild(statusLabel);
        row.appendChild(statusCell);

        // Existing Edit and Delete buttons
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
function updateCounts()
{
    let showing = 0;
    let comingSoon = 0;

    movies.forEach(function (movie) {
        if (movie.status === "Now Showing")
            showing++;
        else
            comingSoon++;
    });

    document.getElementById("totalMoviesCount").textContent = movies.length;
    document.getElementById("showingCount").textContent = showing;
    document.getElementById("comingSoonCount").textContent = comingSoon;
}

// Update only the ticket price using PATCH
async function updateMoviePrice(id)
{
    const movie = movies.find(function (item) {
        return Number(item.movie_id) === Number(id);
    });

    if (!movie)
    {
        alert("Movie not found.");
        return;
    }

    const newPrice = prompt(
        "Enter the new ticket price:",
        movie.ticket_price
    );

    if (newPrice === null)
        return;

    if (newPrice.trim() === "")
    {
        alert("Ticket price cannot be empty.");
        return;
    }

    const price = Number(newPrice);

    if (!Number.isFinite(price) || price <= 0)
    {
        alert("Please enter a valid ticket price greater than zero.");
        return;
    }

    try
    {
        const response = await fetch(API_URL + "/movies/" + id, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                ticket_price: price
            })
        });

        const result = await response.json();

        if (!response.ok)
            throw new Error(result.message || "Failed to update ticket price.");

        alert("Ticket price updated successfully!");
        await loadMovies();
    }
    catch (error)
    {
        console.error("Error updating ticket price:", error);
        alert(error.message || "Failed to update ticket price.");
    }
}

// Add or update a movie
movieForm.addEventListener("submit", async function (event)
{
    event.preventDefault();

    const posterFile = posterInput.files[0];

    // A poster is required when adding a new movie
    if (editingId === null && !posterFile) {
        alert("Please select a movie poster.");
        return;
    }

    // Validate the selected image format
    if (posterFile && !allowedTypes.includes(posterFile.type)) {
        alert("Please select a JPG, PNG, WEBP, or GIF image.");
        posterInput.value = "";
        return;
    }

    const title = document.getElementById("movieTitle").value.trim();
    const language = document.getElementById("language").value.trim();
    const genre = document.getElementById("genre").value.trim();
    const duration = document.getElementById("duration").value.trim();
    const ticketPrice = Number(document.getElementById("ticketPrice").value);
    const status = document.getElementById("status").value;

    if (!title || !language || !genre || !duration ||
        !Number.isFinite(ticketPrice) || ticketPrice <= 0) {
        alert("Enter valid movie details and a price greater than zero.");
        return;
    }

    // FormData sends the movie details and image together
    const formData = new FormData();

    formData.append("title", title);
    formData.append("language", language);
    formData.append("genre", genre);
    formData.append("duration", duration);
    formData.append("ticket_price", ticketPrice);
    formData.append("status", status);

    if (posterFile) {
        formData.append("poster", posterFile);
    }

    try
    {
        const response = await fetch(
            API_URL + "/movies" + (editingId === null ? "" : "/" + editingId),
            {
                method: editingId === null ? "POST" : "PUT",
                body: formData,
                credentials: "include"
            }
        );

        const result = await response.json();

        if (!response.ok)
            throw new Error(result.message || "Could not save movie.");

        alert(editingId === null
            ? "Movie added successfully!"
            : "Movie updated successfully!");

        resetForm();
        await loadMovies();
    }
    catch (error)
    {
        alert(error.message || "Could not save movie.");
        console.error(error);
    }
});

// Fill the form when Edit is clicked
function editMovie(id)
{
    const movie = movies.find(function (item) {
        return Number(item.movie_id) === Number(id);
    });

    if (!movie) return;

    document.getElementById("movieTitle").value = movie.title;
    document.getElementById("language").value = movie.language;
    document.getElementById("genre").value = movie.genre;
    document.getElementById("duration").value = movie.duration;
    document.getElementById("ticketPrice").value = movie.ticket_price;
    document.getElementById("status").value = movie.status;

    editingId = id;
    existingPoster = movie.poster || "";

    // Browsers do not allow setting a file input to an existing filename
    posterInput.value = "";

    currentPosterText.textContent = existingPoster
        ? "Current poster: " + existingPoster +
          ". Choose a new image only if you want to replace it."
        : "Choose a JPG, PNG, WEBP, or GIF image from your computer.";

    submitButton.textContent = "Update Movie";
    cancelButton.hidden = false;

    document.getElementById("add-movie").scrollIntoView({
        behavior: "smooth"
    });
}

// Delete a movie
async function deleteMovie(id)
{
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try
    {
        const response = await fetch(API_URL + "/movies/" + id, {
            method: "DELETE",
            credentials: "include"
        });

        const result = await response.json();

        if (!response.ok)
            throw new Error(result.message || "Could not delete movie.");

        if (Number(editingId) === Number(id))
            resetForm();

        await loadMovies();
        alert("Movie deleted successfully!");
    }
    catch (error)
    {
        alert(error.message);
        console.error(error);
    }
}

// Reset the form
function resetForm()
{
    movieForm.reset();

    editingId = null;
    existingPoster = "";

    posterInput.value = "";

    currentPosterText.textContent =
        "Choose a JPG, PNG, WEBP, or GIF image from your computer.";

    submitButton.textContent = "Add Movie";
    cancelButton.hidden = true;
}

// Cancel editing
cancelButton.addEventListener("click", resetForm);

// Logout
const logoutButton = document.getElementById("adminLogoutBtn");

if (logoutButton)
{
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "index.html";
    });
}

loadMovies();
