var grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']

// Modifying front-end from user clicks
const clicked = (id) => {
    // Put an X in the box
    document.getElementById(id).innerHTML = 'X';
    // Disable the button
    document.getElementById(id).disabled = true;
    // Modify grid
    grid[id] = 'X';
    // Bot's turn
    send_move_to_server();
}

// Sending JSON to server
const send_move_to_server = () => {
    // Prepare JSON
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8080/ttt/play", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // POST to server
    var payload = JSON.stringify({'grid': grid});
    xhr.send(payload);
    // receive response from server
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            var bots_move = json['grid']
            var winner = json['winner']
            place_bots_move(bots_move);
            // Someone won/tie
            if (winner != ' ') {
                // Tie
                if (winner == 'T')
                    document.getElementById('display').innerHTML = 'Tie xdd';
                // Win
                else {
                    document.getElementById('display').innerHTML = `${winner} wins!!`
                }
                // Disable all buttons
                for (i = 0; i < 9; i++)
                    document.getElementById(i).disabled = true;
            }
            // Keep playing
            else {
                grid = bots_move;
            };
        }
    }
}

// Find the bots move, put O in the proper box for front-end
const place_bots_move = (bots_move) => {
    for (i = 0; i < 9; i++) {
        if (grid[i] != bots_move[i]) {
            document.getElementById(i).innerHTML = 'O';
            document.getElementById(i).disabled = true;
            break
        }
    }
}