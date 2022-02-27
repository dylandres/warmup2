// Client-side JS for login.ejs
// Load event-listener
window.addEventListener("load", function() {
    // Login button event-listener
    var loginForm = document.getElementById("login");
    loginForm.addEventListener("submit", function() {
        authenticateLogin(loginForm)
    });
    // Register button event-listener
    var registerForm = document.getElementById("register");
    registerForm.addEventListener("submit", function() {
        attemptRegistration(registerForm);
    });
});

function authenticateLogin(form) {
    // Get credentials
    var username = form.username.value;
    var password = form.password.value;
    // Send an AJAX POST to /login
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var payload = JSON.stringify({'username': username, 'password': password})
    xhr.send(payload)
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Read JSON response
            var json = JSON.parse(xhr.responseText);
            // Logged in, redirect to game page
            if (json['status'] == 'OK')
                window.location.assign(`http://localhost:8080/dashboard`);
            else
                document.getElementById("greeting").innerHTML = "Incorrect username or password"
        }
    }
}

function attemptRegistration(form) {
    // Get credentials
    var email = form.email.value;
    var username = form.username.value;
    var password = form.password.value;
    // Send an AJAX POST to /adduser
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/adduser", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var payload = JSON.stringify({'email': email, 'username': username, 'password': password})
    xhr.send(payload)
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // Read JSON response
            var json = JSON.parse(xhr.responseText);
            // Registration successful
            if (json['status'] == 'OK')
                document.getElementById("greeting").innerHTML = "Registration complete! Check your email to verify"
            else
                document.getElementById("greeting").innerHTML = "Username or email taken"
        }
    }
}
