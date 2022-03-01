const express = require('express')
const app = express()
const PORT = 8080;
const api = require('./public/js/api.js')
const algos = require('./public/js/algos.js')
const mongoose = require('mongoose')
const session = require('express-session');
const User = require('./models/user.model.js');
const MongoDBSession = require('connect-mongodb-session')(session)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', 'views')
require('dotenv').config();

// Connect to MongoDB
const uri = process.env.URI;
mongoose.connect(uri, {useNewUrlParser: true})
const connection = mongoose.connection
connection.once('open', () => {
    console.log('Database connection established!');
})

// Session/Cookie stuff
const store = new MongoDBSession({
    uri: process.env.URI,
    collection: 'sessions',
})
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
}))

// Middleware to protect paths that require login/authentication
const isAuth = (req, res, next) => {
    if (req.session.isAuth) 
        next()
    else
        res.redirect('/')
}

// Start server
app.listen(
    PORT,
    () => {
        console.log(`Server started on port ${PORT}`)
    }
)

// Login screen
app.get('/',
    async (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        // Check if there's a user with this session ID
        var user = await User.findOne({_id: req.session.userID})
        // User exists, auto-login
        if (user)
            res.redirect('/dashboard')
        // User doesn't exist
        else
            res.render('login.ejs')
})

// User registration
app.post('/adduser',
    (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;
        // Add user to database
        api.addUser(username, password, email, res)
})

// Verifying email through POST
app.post('/verify',
    (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var email = req.body.email;
        var key = req.body.key;
        api.verifyUser(email, key, res);
})

// Optional part, verifies using email link
app.get('/verify',
    (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var email = req.query.email
        var key = req.query.key
        api.verifyUser(email, key, res)
})

app.post('/login',
    (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var username = req.body.username
        var password = req.body.password
        api.login(username, password, req, res)
})

app.post('/logout',
    (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        api.logout(req, res)
})

app.get('/dashboard', isAuth,
    (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        res.render('dashboard.ejs')
})

// For getting to tic-tac-toe game page
app.get('/ttt/play', isAuth,
    (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        res.set('user', req.session.userID);
        res.render('tictactoe.ejs')
})

// Used to submit move to 'bot'
app.post('/ttt/play', isAuth,
    async (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        // Get move from human
        var move = req.body.move;
        // Get this game from the database
        var game_id = req.get("gameid")
        var game = await api.getGameById(game_id)
        var grid = game.grid
        // "Making a request with { move:null } should return the current grid without making a move"
        if (move == null)
            res.send(JSON.stringify({'grid': grid, 'winner': game.winner}))
        // Make the human's move
        grid[move] = 'X'
        // Check if X won
        if (algos.checkWinner(grid, 'X')) {
            // Update database with gamedata
            await api.editGame(game_id, grid, 'X')
            res.send(JSON.stringify({'grid': grid, 'winner': 'X'}))
        }
        // If not, Check for tie
        else if (algos.checkTie(grid)) {
            await api.editGame(game_id, grid, 'T')
            res.send(JSON.stringify({'grid': grid, 'winner': 'T'}))
        }
        // If not, place an O
        else {
            grid = algos.botsMove(grid)
            // Check if bot won
            if (algos.checkWinner(grid, 'O')) {
                await api.editGame(game_id, grid, 'O')
                res.send(JSON.stringify({'grid': grid, 'winner': 'O'}))
            }
            // Otherwise, keep playing
            else {
                await api.editGame(game_id, grid, '')  
                res.send(JSON.stringify({'grid': grid, 'winner': ''}))
            }    
        }
})

// Used by browser to query database for an unfinished game, returns grid
app.get('/ttt/check_if_game_exists/:id',
    async (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var user_id = req.params.id
        const game = await api.checkIfGameExists(user_id)
        // Game exists, return grid and game_id
        if (game)
            res.json({grid: game.grid,
                      game_id: game._id.toString()
                    })
        // Game doesn't exist, create a new game in the database
        else {
            var new_game = await api.createNewGame(user_id);
            res.json({grid: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
                      game_id: new_game._id.toString()
                    })
        }
})

// Used by browser to create a new game when a previous game has finished
app.get('/ttt/create_new_game/:id', 
    async (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var user_id = req.params.id
        var new_game = await api.createNewGame(user_id)
        res.json({grid: new_game.grid,
                  game_id: new_game._id.toString()
                })
})

app.post('/listgames', isAuth,
    async (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var allGames = await api.getAllGames(req.session.userID);
        games = []
        allGames.forEach(game => games.push({'id': game._id.toString(),
                                             'start_date': game.start_date}))
        res.json({status: "OK", games: games})
})

app.post('/getgame', isAuth,
    async (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var id = req.body.id;
        var game = await api.getGameById(id)
        res.json({status: "OK", grid: game.grid, winner: game.winner})
})

app.post('/getscore', isAuth,
    async (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        var allGames = await api.getAllGames(req.session.userID);
        var stats = {"human": 0, "wopr": 0, "tie": 0}
        allGames.forEach(game => {
            if (game.winner == 'X')
                stats["human"] += 1
            else if (game.winner == 'O')
                stats["wopr"] += 1
            else if (game.winner == 'T')
                stats["tie"] += 1
        })
        res.json({status: "OK",
                  human: stats["human"],
                  wopr: stats["wopr"],
                  tie: stats["tie"]
                })
})