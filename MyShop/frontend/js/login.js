// login.js
// This file handles the login form submission.
// Instead of a normal form POST (which reloads the page),
// we use fetch() to send data to Flask and get back a JSON response.
// This way we can show error messages without refreshing.

// Wait for the login form submit event
document.getElementById("loginForm").addEventListener("submit", async function(e) {

    // Stop the form from reloading the page normally
    e.preventDefault();

    // Get the values the user typed in the form
    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Send the email and password to Flask /login route using fetch
    const response = await fetch("/login", {
        method: "POST",                                         // POST request
        headers: {
            "Content-Type": "application/x-www-form-urlencoded" // Tell Flask it's form data
        },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}` // Form data as URL-encoded string
    });



    // Parse the JSON response Flask sends back
    // Flask returns: { status: "success" } or { status: "error", message: "..." }
    const data = await response.json();

    // If login was successful, go to the home page
    if (data.status === "success") {
        window.location.href = data.redirect;  // Redirect to home (page to be built later)
    }

    // If login failed, show the error message inside the page
    else {
        document.getElementById("error-message").innerText = data.message; // Show message from Flask
    }

});