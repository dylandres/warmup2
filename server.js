const express = require('express')
const app = express()
const PORT = 8080;
const api = require('./api.js')
const mongoose = require('mongoose')

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', 'views')

app.listen(
    PORT,
    () => {
        console.log(`we out here on port ${PORT}`)
        require('dotenv').config();
        const uri = process.env.URI;
        // Establish connection with db when server starts
        mongoose.connect(uri, { useNewUrlParser: true })
        const connection = mongoose.connection
        connection.once('open', () => {
            console.log('database connection established');
        })
    }
)

app.get('/',
    (req, res) => {
        res.render('welcome.ejs')
})

// User registration
app.post('/adduser',
    (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;
        // Add user to database
        api.addUser(username, password, email, res)
})

// Verifying email through POST
app.post('/verify',
    (req, res) => {
        var email = req.body.email;
        var key = req.body.key;
        api.verifyUser(email, key, res);
})

// Optional part, verifies using email link
app.get('/verify',
    (req, res) => {
        var email = req.query.email
        var key = req.query.key
        api.verifyUser(email, key, res)
})

app.post('/login',
    (req, res) => {
        var username = req.body.username
        var password = req.body.password
        api.login(username, password, res)
})
