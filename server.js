const express = require('express')
const app = express()
const PORT = 8080;

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', 'views')

app.listen(
    PORT,
    () => console.log(`we out here on port ${PORT}`)
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
        res.send(`
            username: ${username},
            password: ${password},
            email: ${email}
        `);
})