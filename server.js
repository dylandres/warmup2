const express = require('express')
const app = express()
const PORT = 8080;
const api = require('./api.js')
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

// Middleware to protect /game path
// Must be logged in to access
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
            res.redirect('/game')
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

// Tic-Tac-Toe
app.get('/game', isAuth,
    (req, res) => {
        res.set('X-CSE356', '61fac4e6c3ba403a360580f3')
        res.render('game.ejs')
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