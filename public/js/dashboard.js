// Client-side JS for dashboard.ejs
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
                var json = JSON.parse(xhr.responseText);
                // Registration successful
                if (json['status'] == 'OK')
                    window.location.assign(`http://hotpink.cse356.compas.cs.stonybrook.edu/`);
            }
        }
    });
});
