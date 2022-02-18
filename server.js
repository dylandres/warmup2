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

app.post('/adduser',
    (req, res) => {
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;
        api.addUser(username, password, email);
        res.send(`
        testing
            username: ${username},
            password: ${password},
            email: ${email}
        `);
})