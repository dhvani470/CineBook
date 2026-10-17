const API_URL = "http://localhost:5000/login";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login failed.");
        }

        alert("Welcome, " + result.user.full_name + "!");

        // Redirect according to the user's role
        if (result.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href =
                "movies.html?userId=" + encodeURIComponent(result.user.user_id);
        }

    } catch (error) {
        alert(error.message || "Could not connect to the server.");
        console.error(error);
    }
});
