const API_URL = "http://localhost:5001/movies";
const BOOKING_URL = "http://localhost:3000/";

const movieList = document.getElementById("movieList");

// Get the user ID from the current URL
const currentParams = new URLSearchParams(window.location.search);
const currentUserId = currentParams.get("userId");

// Get the correct poster URL
function getPosterUrl(poster)
{
    if (!poster)
        return "";

    if (poster.startsWith("/uploads/"))
        return "http://localhost:5001" + poster;

    if (poster.startsWith("uploads/"))
        return "http://localhost:5001/" + poster;

    if (poster.startsWith("http://") || poster.startsWith("https://"))
        return poster;

    if (poster.startsWith("images/"))
        return poster;

    return "images/" + poster;
}

async function loadMovies()
{
    try
    {
        const response = await fetch(API_URL);

        if (!response.ok)
            throw new Error("Could not fetch movies.");

        const movies = await response.json();

        movieList.innerHTML = "";

        if (movies.length === 0)
        {
            movieList.innerHTML = `
                <div class="col-12 text-center">
                    <p>No movies available right now.</p>
                </div>`;
            return;
        }

        movies.forEach(function (movie) {
            const isShowing = movie.status === "Now Showing";

            const column = document.createElement("div");
            column.className = "col-12 col-md-6 col-lg-4";

            const card = document.createElement("div");
            card.className = "movie-card h-100";

            const poster = document.createElement("img");
            poster.className = "movie-poster";
            poster.src = getPosterUrl(movie.poster);
            poster.alt = movie.title;
            poster.loading = "lazy";

            const body = document.createElement("div");
            body.className = "movie-card-body";

            const badge = document.createElement("span");
            badge.className = "movie-badge " + (isShowing ? "showing-badge" : "upcoming-badge");
            badge.textContent = movie.status;

            const title = document.createElement("h5");
            title.textContent = movie.title;

            const info = document.createElement("p");
            info.className = "movie-info";
            info.textContent = movie.language + " · " + movie.genre;

            const duration = document.createElement("p");
            duration.className = "movie-duration";
            duration.textContent = "Duration: " + movie.duration;

            let bookButton;

            if (isShowing)
            {
                bookButton = document.createElement("a");
                bookButton.className = "btn btn-book w-100";

                const bookingParams = new URLSearchParams();
                bookingParams.set("movieId", movie.movie_id);

                if (currentUserId)
                    bookingParams.set("userId", currentUserId);

                bookButton.href = BOOKING_URL + "?" + bookingParams.toString();
                bookButton.textContent = "Book Tickets";
            }
            else
            {
                bookButton = document.createElement("button");
                bookButton.type = "button";
                bookButton.className = "btn btn-book w-100";
                bookButton.disabled = true;
                bookButton.textContent = "Coming Soon";
            }

            body.appendChild(badge);
            body.appendChild(title);
            body.appendChild(info);
            body.appendChild(duration);
            body.appendChild(bookButton);

            card.appendChild(poster);
            card.appendChild(body);
            column.appendChild(card);
            movieList.appendChild(column);
        });
    }
    catch (error)
    {
        console.error("Error loading movies:", error);

        movieList.innerHTML = `
            <div class="col-12 text-center">
                <p>Could not load movies. Please check the backend connection.</p>
            </div>`;
    }
}

loadMovies();