
const API_URL = "http://localhost:5001/my-bookings";
const bookingsList = document.getElementById("bookingsList");

async function loadBookings() 
{
    if (!bookingsList) return;

    const userId = new URLSearchParams(window.location.search).get("userId");

    try 
    {
        const response = await fetch(API_URL + "?userId=" + encodeURIComponent(userId));

        if (!response.ok) 
            throw new Error("Could not load bookings. Please try again.");

        const bookings = await response.json();

        if (!Array.isArray(bookings) || bookings.length === 0) 
        {
            bookingsList.innerHTML = `
                <div class="col-12">
                    <p>You have not booked any tickets yet.</p>
                    <a href="movies.html?userId=${encodeURIComponent(userId)}"
                       class="btn btn-book">Explore Movies</a>
                </div>`;
            return;
        }

        bookingsList.innerHTML = "";

        bookings.forEach(function (booking) 
        {
            const card = document.createElement("div");
            card.className = "booking-card";

            const header = document.createElement("div");
            header.className = "booking-header";

            const heading = document.createElement("div");

            const title = document.createElement("h5");
            title.className = "booking-title";
            title.textContent = booking.title || "Movie";

            const id = document.createElement("p");
            id.className = "booking-id";
            id.textContent = "Booking ID: #" + booking.booking_id;

            heading.append(title, id);

            const total = document.createElement("p");
            total.className = "booking-total";
            total.textContent = "₹" + Number(booking.total_price || 0).toFixed(2);

            header.append(heading, total);

            const divider = document.createElement("hr");
            divider.className = "booking-divider";

            const details = document.createElement("div");
            details.className = "booking-details";

            function addDetail(labelText, valueText) {
                const item = document.createElement("div");

                const label = document.createElement("p");
                label.className = "booking-label";
                label.textContent = labelText;

                const value = document.createElement("p");
                value.className = "booking-detail";
                value.textContent = valueText;

                item.append(label, value);
                details.appendChild(item);
            }

            const date = new Date(booking.show_date);
            const formattedDate = isNaN(date.getTime())
                ? booking.show_date
                : date.toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric"});

            addDetail("SHOW DATE", formattedDate);
            addDetail("SHOW TIME", booking.show_time || "N/A");
            addDetail("SEATS", booking.seats || "N/A");
            addDetail("TICKETS", String(booking.ticket_count ?? 0));

            card.append(header, divider, details);
            bookingsList.appendChild(card);
        });
    }
    catch (error) 
    {
        console.error("Error loading bookings:", error);

        bookingsList.innerHTML = "";

        const message = document.createElement("p");
        message.className = "text-danger";
        message.textContent = error.message;
        bookingsList.appendChild(message);
    }
}

loadBookings();
