// Client-side JS for game.ejs
// Load event-listener
window.addEventListener("load", function() {
    // Logout button event-listener
    var logoutForm = document.getElementById("logout");
    logoutForm.addEventListener("submit", function() {
        // Send an AJAX POST to /logout
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:8080/logout", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        var payload = JSON.stringify({})
        xhr.send(payload)
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                // Read JSON response
                // Redirect to login
                window.location.assign(`http://localhost:8080/`);
            }
        }
    });
});
