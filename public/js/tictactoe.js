// Client-side JS for tictactoe.js
// Get the user_id of the user currently logged in
var xhr = new XMLHttpRequest();
xhr.open('GET', document.location, false);
xhr.send(null);
var user_id = xhr.getResponseHeader('user');

// Start by checking if an unfinished game for this user exists, if so resume
var grid;
var game_id;
xhr = new XMLHttpRequest();
xhr.open("GET", `http://hotpink.cse356.compas.cs.stonybrook.edu/ttt/check_if_game_exists/${user_id}`, true);
xhr.send(null);
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        grid = json['grid']
        // Game exists, fill in boxes and set game_id
        if (grid) {
            game_id = json['game_id']
            for (var i = 0; i < 9; i++) {
                if (grid[i] == 'X') {
                    document.getElementById(i).innerHTML = 'X';
                    document.getElementById(i).disabled = true;
                }
                else if (grid[i] == 'O') {
                    document.getElementById(i).innerHTML = 'O';
                    document.getElementById(i).disabled = true;
                }
            }
        }
        // Redundant but just to be explicit
        // Game doesn't exist, new game_id will have been created
        else {
            game_id = json['game_id']
            grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
        }
    }
}


// Fired when user clicks a box
const clicked = (square) => {
    // Send move to bot
    send_move_to_server(square);
}

// Sending JSON to server
const send_move_to_server = (move) => {
    // Prepare JSON
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://hotpink.cse356.compas.cs.stonybrook.edu/ttt/play", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    // POST to server
    var payload = JSON.stringify({'move': move});
    xhr.setRequestHeader("game_id", game_id)
    xhr.send(payload);
    // Receive response from server
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            grid = json['grid']
            // Update board with human and bot's moves
            for (var i = 0; i < 9; i++) {
                if (grid[i] == 'X') {
                    document.getElementById(i).innerHTML = 'X';
                    document.getElementById(i).disabled = true;
                }
                else if (grid[i] == 'O') {
                    document.getElementById(i).innerHTML = 'O';
                    document.getElementById(i).disabled = true;
                }
            }
            var winner = json['winner']
            // Someone won/tie
            if (winner != 'none') {
                // Tie
                if (winner == 'T')
                    document.getElementById('display').innerHTML = 'Tie!';
                // Win
                else {
                    document.getElementById('display').innerHTML = `${winner} wins!`
                }
                // Disable buttons
                for (var i = 0; i < 9; i++) {
                    document.getElementById(i).disabled = true;
                }
                // Wait 1 second to display winner
                setTimeout(function() {
                    // then reset
                    resetGame()
                }, 1000)
            }
        }
    }
}

const resetGame = () => {
    // Create a new game
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `http://hotpink.cse356.compas.cs.stonybrook.edu/ttt/create_new_game/${user_id}`, true);
    xhr.send(null);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            // New grid and game_id
            grid = json['grid']
            game_id = json['game_id']
            // Reset the board
            for (var i = 0; i < 9; i++) {
                document.getElementById(i).innerHTML = ''; 
                document.getElementById(i).disabled = false;
            }
            document.getElementById('display').innerHTML = 'Welcome to Tic-Tac-Toe!';
        }
    }
}
