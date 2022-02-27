function checkTie(grid) {
    for (i = 0; i < 9; i++) {
        if (grid[i] == ' ')
            return false;
    }
    return true;
}

function checkWinner(grid, p) {
    if ( // Rows
        (grid[0] == p && grid[1] == p && grid[2] == p) ||
        (grid[3] == p && grid[4] == p && grid[5] == p) ||
        (grid[6] == p && grid[7] == p && grid[8] == p) ||
        // Columns
        (grid[0] == p && grid[3] == p && grid[6] == p) ||
        (grid[1] == p && grid[4] == p && grid[7] == p) ||
        (grid[2] == p && grid[5] == p && grid[8] == p) ||
        // Diagonals
        (grid[0] == p && grid[4] == p && grid[8] == p) ||
        (grid[6] == p && grid[4] == p && grid[2] == p)
        )
        return true
    return false
}

function botsMove(grid) {
    for (i = 0; i < 9; i++) {
        // Pick the first empty spot
        if (grid[i] == ' ') {
            grid[i] = 'O'
            return grid
        }
    }
}

module.exports = { checkWinner, checkTie, botsMove }
