const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

const navbar = document.querySelector(".navbar");

if (navbar && userId) 
{
    const navLinks = navbar.querySelector(".navbar-nav");

    if (navLinks) 
    {
        // Hide Login and Register
        navLinks.querySelectorAll('a[href="login.html"], a[href="register.html"]')
        .forEach(function (link) {
            link.style.display = "none";
        });

        // Preserve userId in navigation links
        navbar.querySelectorAll("a").forEach(function (link) {
            const href = link.getAttribute("href");

            if (!href) return;

            const page = href.split("?")[0];

            if (page === "index.html" || page === "movies.html" || page === "my-bookings.html") 
                link.href = page + "?userId=" + encodeURIComponent(userId);

            else if (href === "#") 
                link.href = "index.html?userId=" + encodeURIComponent(userId);
        });

        // Remove existing My Bookings links to prevent duplicates
        navLinks.querySelectorAll('a[href*="my-bookings.html"], .my-bookings-link')
        .forEach(function (link) {
            link.remove();
        });

        // Add exactly one My Bookings link
        const bookingsLink = document.createElement("a");
        bookingsLink.href = "my-bookings.html?userId=" + encodeURIComponent(userId);
        bookingsLink.className = "nav-link my-bookings-link";
        bookingsLink.textContent = "My Bookings";

        navLinks.appendChild(bookingsLink);

        // Add Logout only once
        if (!navLinks.querySelector(".logout-link")) 
        {
            const logout = document.createElement("a");
            logout.href = "index.html";
            logout.className = "nav-link logout-link";
            logout.textContent = "Logout";

            logout.addEventListener("click", function (event) {
                event.preventDefault();
                window.location.href = "index.html";
            });

            navLinks.appendChild(logout);
        }
    }
}
