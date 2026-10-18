const BOOKINGS_API_URL = "http://localhost:5001/admin/bookings";
const bookingsTable = document.getElementById("bookingsTableBody");

async function loadAdminBookings() {
    if (!bookingsTable) return;

    try {
        const response = await fetch(BOOKINGS_API_URL, {
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Could not load bookings. Check the backend.");
        }

        const bookings = await response.json();
        bookingsTable.innerHTML = "";

        if (bookings.length === 0) {
            bookingsTable.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        No bookings have been made yet.
                    </td>
                </tr>`;
            return;
        }

        bookings.forEach(function (booking) {
            const row = document.createElement("tr");

            const values = [
                "#" + booking.booking_id,
                booking.full_name || booking.username || "N/A",
                booking.movie_title || "N/A",
                formatBookingDate(booking.show_date),
                booking.show_time || "N/A",
                booking.seats || "N/A",
                booking.ticket_count ?? 0,
                "₹" + Number(booking.total_price || 0).toFixed(2)
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            bookingsTable.appendChild(row);
        });
    } catch (error) {
        console.error("Bookings error:", error);

        bookingsTable.innerHTML = "";

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 8;
        cell.className = "text-danger text-center py-4";
        cell.textContent = error.message;

        row.appendChild(cell);
        bookingsTable.appendChild(row);
    }
}

function formatBookingDate(value) {
    if (!value) return "N/A";

    // Extract the date without timezone conversion.
    const datePart = String(value).split("T")[0];
    const parts = datePart.split("-");

    if (parts.length !== 3) return datePart;

    const year = parts[0];
    const month = Number(parts[1]);
    const day = parts[2];

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    if (month < 1 || month > 12) return datePart;

    return `${day} ${months[month - 1]} ${year}`;
}

// Admin Logout
const logoutButton = document.getElementById("adminLogoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "index.html";
    });
}

loadAdminBookings();
