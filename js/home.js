const API_URL = "http://localhost:5001/movies";
const BOOKING_URL = "http://localhost:3000/";
const homeMovieList = document.getElementById("homeMovieList");

const pageParams = new URLSearchParams(window.location.search);
const currentUserId = pageParams.get("userId");

async function loadHomeMovies() 
{
    try 
    {
        const response = await fetch(API_URL);

        if (!response.ok)
            throw new Error("Could not fetch movies.");

        const movies = await response.json();

        homeMovieList.innerHTML = "";

        // Show only movies that are currently showing
        const showingMovies = movies.filter(function (movie) {
            return movie.status === "Now Showing";
        });

        if (showingMovies.length === 0) 
        {
            homeMovieList.innerHTML = `
                <div class="col-12 text-center">
                    <p>No movies are currently showing.</p>
                </div>`;
            return;
        }

        showingMovies.forEach(function (movie) 
        {
            const column = document.createElement("div");
            column.className = "col-md-6 col-lg-3";

            const card = document.createElement("div");
            card.className = "card movie-card";
            card.style.textAlign = "center";

            const posterContainer = document.createElement("div");
            posterContainer.className = "poster-container";

            const poster = document.createElement("img");
            poster.src = "images/" + movie.poster;
            poster.alt = movie.title;
            poster.loading = "lazy";

            const body = document.createElement("div");
            body.className = "card-body";

            const title = document.createElement("h5");
            title.className = "card-title";
            title.textContent = movie.title;

            const info = document.createElement("p");
            info.className = "card-text";
            info.textContent = movie.genre + " · " + movie.duration;

            const link = document.createElement("a");
            link.className = "btn btn-book";
            link.textContent = "Book Tickets";
            link.style.width = 100 + "%";

            // Pass the movie ID and user ID to the booking app
            const bookingParams = new URLSearchParams();
            bookingParams.set("movieId", movie.movie_id);

            if (currentUserId) 
                bookingParams.set("userId", currentUserId);

            link.href = BOOKING_URL + "?" + bookingParams.toString();

            posterContainer.appendChild(poster);
            body.appendChild(title);
            body.appendChild(info);
            body.appendChild(link);

            card.appendChild(posterContainer);
            card.appendChild(body);
            column.appendChild(card);

            homeMovieList.appendChild(column);
        });
    } 
    catch (error) 
    {
        console.error("Error loading Home page movies:", error);

        homeMovieList.innerHTML = `
            <div class="col-12 text-center">
                <p>Could not load movies. Please check the backend connection.</p>
            </div>`;
    }
}

loadHomeMovies();
