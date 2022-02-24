window.addEventListener("load", function() {
    var form = document.getElementById("login");
    form.addEventListener("submit", function() {
        login(form)
    });
});

function login(form) {
    var username = form.username.value;
    var password = form.password.value;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/login", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var json = JSON.parse(xhr.responseText);
            if (json['status'] == 'OK')
                window.location.assign(`http://localhost:8080/game/${username}`); 
            else
                document.getElementById("greeting").innerHTML = "Incorrect login"
        }
    }
    var payload = JSON.stringify({'username': username, 'password': password})
    xhr.send(payload)
}


